-- =====================================================
-- ESQUEMA DE BASE DE DATOS - PORTAL DE INNOVACIÓN GTTD
-- =====================================================
-- Este archivo contiene el esquema REAL extraído de la base de datos en producción
-- Ejecutar en PostgreSQL (Neon, Supabase, etc.)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: session_states (Estados de sesión N8N)
-- =====================================================
CREATE TABLE IF NOT EXISTS session_states (
    session_id UUID PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    current_stage VARCHAR,
    conversation_data JSONB,
    completeness_score INTEGER,
    status VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- =====================================================
-- TABLA: conversation_messages (Mensajes del chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    message_id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    role VARCHAR NOT NULL,
    message TEXT NOT NULL,
    agent_name VARCHAR,
    metadata JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    
    FOREIGN KEY (session_id) REFERENCES session_states(session_id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: requests (Solicitudes principales)
-- =====================================================
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id VARCHAR NOT NULL,
    titulo_solicitud VARCHAR,
    problema_principal TEXT,
    objetivo_esperado TEXT,
    beneficiarios TEXT,
    plataformas_involucradas JSONB,
    frecuencia_uso VARCHAR,
    plazo_deseado VARCHAR,
    departamento_solicitante VARCHAR,
    score_estimado INTEGER,
    clasificacion_sugerida VARCHAR,
    prioridad_sugerida VARCHAR,
    technical_analysis JSONB,
    status VARCHAR NOT NULL,
    leader_comments TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    clasificacion_final VARCHAR,
    prioridad_final VARCHAR,
    leader_override BOOLEAN,
    override_reason TEXT,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    
    FOREIGN KEY (session_id) REFERENCES session_states(session_id)
);

-- =====================================================
-- TABLA: requests_audit (Auditoría de solicitudes)
-- =====================================================
CREATE TABLE IF NOT EXISTS requests_audit (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL,
    action_type VARCHAR NOT NULL,
    previous_status VARCHAR,
    new_status VARCHAR,
    leader_id VARCHAR,
    comments TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: scoring_configurations (Configuraciones de scoring)
-- =====================================================
CREATE TABLE IF NOT EXISTS scoring_configurations (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    version VARCHAR NOT NULL,
    config_data JSONB NOT NULL,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN,
    description TEXT,
    
    UNIQUE(name, version)
);

-- =====================================================
-- TABLA: configuration_audit (Auditoría de configuraciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS configuration_audit (
    id UUID PRIMARY KEY,
    config_id UUID,
    action VARCHAR NOT NULL,
    changed_by VARCHAR NOT NULL,
    changes JSONB,
    previous_config JSONB,
    timestamp TIMESTAMP WITHOUT TIME ZONE,
    
    FOREIGN KEY (config_id) REFERENCES scoring_configurations(id)
);

-- =====================================================
-- TABLA: report_templates (Plantillas de reportes)
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    template_html TEXT NOT NULL,
    css_styles TEXT,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN,
    version VARCHAR NOT NULL
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para session_states
CREATE INDEX IF NOT EXISTS idx_session_states_user_id ON session_states (user_id);
CREATE INDEX IF NOT EXISTS idx_session_states_status ON session_states (status);
CREATE INDEX IF NOT EXISTS idx_session_states_updated_at ON session_states (updated_at DESC);

-- Índices para conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages (role);

-- Índices para requests
CREATE INDEX IF NOT EXISTS idx_requests_session_id ON requests (session_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests (user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_departamento ON requests (departamento_solicitante);

-- Índices para requests_audit
CREATE INDEX IF NOT EXISTS idx_requests_audit_request_id ON requests_audit (request_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_audit_action_type ON requests_audit (action_type);
CREATE INDEX IF NOT EXISTS idx_requests_audit_leader_id ON requests_audit (leader_id);

-- Índices para scoring_configurations
CREATE INDEX IF NOT EXISTS idx_scoring_config_active ON scoring_configurations (is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_config_name_version ON scoring_configurations (name, version);

-- Índices para configuration_audit
CREATE INDEX IF NOT EXISTS idx_config_audit_config_id ON configuration_audit (config_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_by ON configuration_audit (changed_by);

-- Índices para report_templates
CREATE INDEX IF NOT EXISTS idx_report_templates_type_active ON report_templates (type, is_active);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON report_templates (created_by);

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE session_states IS 'Estados de sesión para integración con N8N - contiene el contexto y progreso de cada conversación';
COMMENT ON TABLE conversation_messages IS 'Historial completo de mensajes del chat entre usuario y agente IA';
COMMENT ON TABLE requests IS 'Tabla principal de solicitudes tecnológicas generadas desde las conversaciones';
COMMENT ON TABLE requests_audit IS 'Registro de auditoría para seguimiento de cambios en solicitudes';
COMMENT ON TABLE scoring_configurations IS 'Configuraciones de fórmulas de scoring editables desde el dashboard';
COMMENT ON TABLE configuration_audit IS 'Auditoría de cambios en configuraciones de scoring';
COMMENT ON TABLE report_templates IS 'Plantillas HTML para generación de reportes';

COMMENT ON COLUMN requests.technical_analysis IS 'Análisis técnico estructurado generado por Gemini 2.5 Pro';
COMMENT ON COLUMN session_states.conversation_data IS 'Datos de contexto y análisis final para el agente IA';
COMMENT ON COLUMN conversation_messages.metadata IS 'Metadatos adicionales del mensaje (contexto, análisis, etc.)';
COMMENT ON COLUMN requests.plataformas_involucradas IS 'Array JSON de plataformas/sistemas involucrados en la solicitud';
