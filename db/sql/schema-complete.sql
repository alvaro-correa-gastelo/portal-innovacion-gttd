-- =====================================================
-- ESQUEMA DE BASE DE DATOS - PORTAL DE INNOVACIÓN GTTD
-- =====================================================
-- Esquema extraído automáticamente de la base de datos en producción
-- Ejecutar en PostgreSQL (Neon, Supabase, etc.)

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: configuration_audit
-- =====================================================
CREATE TABLE IF NOT EXISTS configuration_audit (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    config_id UUID PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100) NOT NULL,
    changes JSONB,
    previous_config JSONB,
    timestamp TIMESTAMP DEFAULT now()
);

-- =====================================================
-- TABLA: conversation_messages
-- =====================================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    message_id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    session_id UUID PRIMARY KEY NOT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    agent_name VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- TABLA: report_templates
-- =====================================================
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    template_html TEXT NOT NULL,
    css_styles TEXT,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    is_active BOOLEAN DEFAULT false,
    version VARCHAR(20) NOT NULL
);

-- =====================================================
-- TABLA: requests
-- =====================================================
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    session_id UUID PRIMARY KEY NOT NULL,
    user_id VARCHAR(255) PRIMARY KEY NOT NULL,
    titulo_solicitud VARCHAR(255),
    problema_principal TEXT,
    objetivo_esperado TEXT,
    beneficiarios TEXT,
    plataformas_involucradas JSONB,
    frecuencia_uso VARCHAR(50),
    plazo_deseado VARCHAR(50),
    departamento_solicitante VARCHAR(100),
    score_estimado INTEGER,
    clasificacion_sugerida VARCHAR(50),
    prioridad_sugerida VARCHAR(10),
    technical_analysis JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted'::character varying,
    leader_comments TEXT,
    created_at TIMESTAMP DEFAULT now(),
    clasificacion_final VARCHAR(50),
    prioridad_final VARCHAR(10),
    leader_override BOOLEAN DEFAULT false,
    override_reason TEXT,
    updated_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- TABLA: requests_audit
-- =====================================================
CREATE TABLE IF NOT EXISTS requests_audit (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    request_id UUID PRIMARY KEY NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    leader_id VARCHAR(255) PRIMARY KEY,
    comments TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- TABLA: scoring_configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS scoring_configurations (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    config_data JSONB NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    is_active BOOLEAN DEFAULT false,
    description TEXT
);

-- =====================================================
-- TABLA: session_states
-- =====================================================
CREATE TABLE IF NOT EXISTS session_states (
    session_id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) PRIMARY KEY NOT NULL,
    current_stage VARCHAR(50) DEFAULT 'start'::character varying,
    conversation_data JSONB DEFAULT '{}'::jsonb,
    completeness_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active'::character varying,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =====================================================
-- ÍNDICES BÁSICOS PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para session_states
CREATE INDEX IF NOT EXISTS idx_session_states_user_id ON session_states (user_id);
CREATE INDEX IF NOT EXISTS idx_session_states_updated_at ON session_states (updated_at);

-- Índices para conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages (session_id, created_at);

-- Índices para requests
CREATE INDEX IF NOT EXISTS idx_requests_session_id ON requests (session_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests (user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at);

-- Índices para requests_audit
CREATE INDEX IF NOT EXISTS idx_requests_audit_request_id ON requests_audit (request_id, created_at);

-- Índices para scoring_configurations
CREATE INDEX IF NOT EXISTS idx_scoring_config_active ON scoring_configurations (is_active);

-- =====================================================
-- DATOS INICIALES MÍNIMOS NECESARIOS
-- =====================================================

-- Configuración de scoring por defecto (ESENCIAL para que funcione la app)
INSERT INTO scoring_configurations (
    id,
    name, 
    version, 
    config_data, 
    created_by, 
    created_at,
    is_active, 
    description
) VALUES (
    gen_random_uuid(),
    'Configuración Default',
    '1.0',
    '{
        "impacto_organizacional": {
            "peso": 30,
            "descripcion": "Impacto en la organización y procesos"
        },
        "complejidad_tecnica": {
            "peso": 25,
            "descripcion": "Complejidad técnica del desarrollo"
        },
        "recursos_necesarios": {
            "peso": 20,
            "descripcion": "Recursos humanos y técnicos requeridos"
        },
        "tiempo_implementacion": {
            "peso": 15,
            "descripcion": "Tiempo estimado de implementación"
        },
        "alineacion_estrategica": {
            "peso": 10,
            "descripcion": "Alineación con objetivos estratégicos"
        }
    }'::jsonb,
    'Sistema',
    NOW(),
    true,
    'Configuración inicial de scoring para evaluación de solicitudes tecnológicas'
) ON CONFLICT (name, version) DO NOTHING;

-- Plantilla de reporte básica (OPCIONAL pero recomendada)
INSERT INTO report_templates (
    id,
    name,
    type,
    template_html,
    css_styles,
    created_by,
    created_at,
    is_active,
    version
) VALUES (
    gen_random_uuid(),
    'Reporte Básico',
    'solicitud',
    '<!DOCTYPE html>
<html>
<head>
    <title>Reporte de Solicitud - {{titulo}}</title>
    <style>{{css_styles}}</style>
</head>
<body>
    <div class="header">
        <h1>Portal de Innovación GTTD</h1>
        <h2>Reporte de Solicitud Tecnológica</h2>
    </div>
    <div class="content">
        <h3>{{titulo_solicitud}}</h3>
        <p><strong>Solicitante:</strong> {{solicitante}}</p>
        <p><strong>Departamento:</strong> {{departamento_solicitante}}</p>
        <p><strong>Estado:</strong> {{status}}</p>
        <p><strong>Prioridad:</strong> {{prioridad}}</p>
        
        <h4>Descripción del Problema:</h4>
        <p>{{problema_principal}}</p>
        
        <h4>Análisis Técnico:</h4>
        <div>{{technical_analysis}}</div>
        
        <h4>Scoring:</h4>
        <p><strong>Puntuación Total:</strong> {{scoring_total}}/100</p>
    </div>
</body>
</html>',
    'body { font-family: Arial, sans-serif; margin: 20px; }
.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
.content { margin-top: 20px; }
h3 { color: #0066cc; }
h4 { color: #333; margin-top: 20px; }',
    'Sistema',
    NOW(),
    true,
    '1.0'
);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================
-- Este esquema incluye:
-- ✅ Todas las tablas necesarias para el funcionamiento
-- ✅ Configuración de scoring inicial (ESENCIAL)
-- ✅ Plantilla de reporte básica
-- ✅ Índices para optimización
-- ✅ Extensiones PostgreSQL necesarias
--
-- Para usar este esquema:
-- 1. Crear base de datos PostgreSQL
-- 2. Ejecutar este archivo completo
-- 3. Configurar variables de entorno en la aplicación
-- 4. La app estará lista para funcionar
