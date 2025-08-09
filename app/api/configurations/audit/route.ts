import { NextRequest, NextResponse } from 'next/server';

// GET /api/configurations/audit - Obtener historial de cambios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('config_id');
    const changedBy = searchParams.get('changed_by');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Aquí ejecutarías la query SQL real:
    /*
    let query = supabase
      .from('configuration_audit')
      .select(`
        id,
        config_id,
        action,
        changed_by,
        changes,
        previous_config,
        timestamp,
        scoring_configurations!inner(name, version)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (configId) query = query.eq('config_id', configId);
    if (changedBy) query = query.eq('changed_by', changedBy);
    if (fromDate) query = query.gte('timestamp', fromDate);
    if (toDate) query = query.lte('timestamp', toDate);

    const { data, error } = await query;
    */

    // Mock audit entries
    const mockAuditEntries = [
      {
        id: '1',
        config_id: '123e4567-e89b-12d3-a456-426614174000',
        action: 'activated',
        changed_by: 'mapi.salas@utp.edu.pe',
        changes: null,
        previous_config: null,
        timestamp: '2024-01-15T10:30:00Z',
        config_name: 'Platform-Based Scoring Rules',
        config_version: 'v2.0'
      },
      {
        id: '2',
        config_id: '123e4567-e89b-12d3-a456-426614174000',
        action: 'created',
        changed_by: 'system',
        changes: {
          scoring_weights: {
            platforms_complexity: 15
          }
        },
        previous_config: null,
        timestamp: '2024-01-15T10:00:00Z',
        config_name: 'Platform-Based Scoring Rules',
        config_version: 'v2.0'
      }
    ];

    // Filtrar por parámetros si se proporcionan
    let filteredEntries = mockAuditEntries;
    
    if (configId) {
      filteredEntries = filteredEntries.filter(entry => entry.config_id === configId);
    }
    
    if (changedBy) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.changed_by.toLowerCase().includes(changedBy.toLowerCase())
      );
    }

    return NextResponse.json({
      audit_entries: filteredEntries.slice(0, limit),
      total: filteredEntries.length,
      success: true
    });

  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de cambios', success: false },
      { status: 500 }
    );
  }
}
