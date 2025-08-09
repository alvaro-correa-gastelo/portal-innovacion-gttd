import { Pool } from 'pg';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función para ejecutar queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para obtener configuración activa
export async function getActiveConfig() {
  try {
    const result = await query(`
      SELECT config_data 
      FROM scoring_configurations 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    return result.rows[0]?.config_data || null;
  } catch (error) {
    console.error('Error getting active config:', error);
    return null;
  }
}

// Función para obtener sesión activa
export async function getActiveSession(userId: string) {
  try {
    const result = await query(`
      SELECT session_id, user_id, current_stage, conversation_data, completeness_score, status
      FROM session_states 
      WHERE user_id = $1 AND status = 'active' 
      ORDER BY updated_at DESC 
      LIMIT 1
    `, [userId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
}

// Función para obtener historial de conversación
export async function getConversationHistory(sessionId: string) {
  try {
    const result = await query(`
      SELECT role, message, agent_name, created_at, metadata
      FROM conversation_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [sessionId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

// Función para crear nueva configuración
export async function createConfiguration(config: {
  name: string;
  version: string;
  config_data: any;
  description?: string;
  created_by: string;
}) {
  try {
    const result = await query(`
      INSERT INTO scoring_configurations (name, version, config_data, description, created_by, is_active)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `, [config.name, config.version, JSON.stringify(config.config_data), config.description, config.created_by]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating configuration:', error);
    throw error;
  }
}

// Función para activar configuración
export async function activateConfiguration(configId: string, changedBy: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Desactivar todas las configuraciones
    await client.query('UPDATE scoring_configurations SET is_active = false');
    
    // Activar la configuración específica
    const result = await client.query(`
      UPDATE scoring_configurations 
      SET is_active = true 
      WHERE id = $1 
      RETURNING *
    `, [configId]);
    
    // Log audit trail
    await client.query(`
      INSERT INTO configuration_audit (config_id, action, changed_by, timestamp)
      VALUES ($1, 'activated', $2, NOW())
    `, [configId, changedBy]);
    
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error activating configuration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Función para obtener audit trail
export async function getAuditTrail(filters: {
  configId?: string;
  changedBy?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
} = {}) {
  try {
    let queryText = `
      SELECT ca.*, sc.name as config_name, sc.version as config_version
      FROM configuration_audit ca
      LEFT JOIN scoring_configurations sc ON ca.config_id = sc.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters.configId) {
      queryText += ` AND ca.config_id = $${++paramCount}`;
      params.push(filters.configId);
    }
    
    if (filters.changedBy) {
      queryText += ` AND ca.changed_by ILIKE $${++paramCount}`;
      params.push(`%${filters.changedBy}%`);
    }
    
    if (filters.fromDate) {
      queryText += ` AND ca.timestamp >= $${++paramCount}`;
      params.push(filters.fromDate);
    }
    
    if (filters.toDate) {
      queryText += ` AND ca.timestamp <= $${++paramCount}`;
      params.push(filters.toDate);
    }
    
    queryText += ` ORDER BY ca.timestamp DESC LIMIT $${++paramCount}`;
    params.push(filters.limit || 50);
    
    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting audit trail:', error);
    return [];
  }
}

// Función para verificar conexión
export async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return { success: true, time: result.rows[0].current_time };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error: error.message };
  }
}

// Función para obtener una solicitud por ID
export async function getRequestById(requestId: string) {
  try {
    const result = await query(`
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email
      FROM requests r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.id = $1
    `, [requestId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting request by ID:', error);
    return null;
  }
}

// Función para obtener todas las solicitudes con paginación
export async function getAllRequests(filters: {
  status?: string;
  priority?: string;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    let queryText = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email
      FROM requests r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters.status) {
      queryText += ` AND r.status = $${++paramCount}`;
      params.push(filters.status);
    }
    
    if (filters.priority) {
      queryText += ` AND r.prioridad_final = $${++paramCount}`;
      params.push(filters.priority);
    }
    
    queryText += ` ORDER BY r.created_at DESC`;
    
    if (filters.limit) {
      queryText += ` LIMIT $${++paramCount}`;
      params.push(filters.limit);
    }
    
    if (filters.offset) {
      queryText += ` OFFSET $${++paramCount}`;
      params.push(filters.offset);
    }
    
    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error getting all requests:', error);
    return [];
  }
}

// Función para crear una nueva solicitud
export async function createRequest(requestData: {
  user_id: string;
  titulo: string;
  descripcion: string;
  tipo_solicitud: string;
  urgencia: string;
  justificacion_negocio: string;
  clasificacion_ia?: string;
  prioridad_ia?: string;
  confidence_score?: number;
}) {
  try {
    const result = await query(`
      INSERT INTO requests (
        user_id, titulo, descripcion, tipo_solicitud, urgencia, 
        justificacion_negocio, clasificacion_ia, prioridad_ia, 
        confidence_score, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_technical_analysis', NOW(), NOW())
      RETURNING *
    `, [
      requestData.user_id,
      requestData.titulo,
      requestData.descripcion,
      requestData.tipo_solicitud,
      requestData.urgencia,
      requestData.justificacion_negocio,
      requestData.clasificacion_ia,
      requestData.prioridad_ia,
      requestData.confidence_score
    ]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
}

export default pool;
