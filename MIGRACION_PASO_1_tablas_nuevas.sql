-- MIGRACIÓN INTELIGENTE - PASO 1: AGREGAR SOLO TABLAS NUEVAS
-- Mantiene las tablas existentes y agrega funcionalidad inter-áreas
-- Ejecutar en PostgreSQL después de verificar tablas existentes

-- =====================================================
-- 1. ÁREAS UTP (NUEVA - CONTEXTO ORGANIZACIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS areas_utp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  peso_estrategico DECIMAL(3,2) DEFAULT 1.0 CHECK (peso_estrategico BETWEEN 0.5 AND 2.0),
  responsable_email VARCHAR(100),
  presupuesto_anual_usd DECIMAL(12,2),
  criticidad_operativa VARCHAR(20) DEFAULT 'media' CHECK (criticidad_operativa IN ('baja', 'media', 'alta', 'critica')),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 2. PLATAFORMAS CONFIGURABLES (NUEVA - REEMPLAZA HARDCODING)
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name VARCHAR(100) NOT NULL UNIQUE,
  complexity_score INTEGER CHECK (complexity_score BETWEEN 1 AND 10),
  integration_effort INTEGER CHECK (integration_effort BETWEEN 1 AND 10),
  user_impact INTEGER CHECK (user_impact BETWEEN 1 AND 10),
  strategic_importance INTEGER CHECK (strategic_importance BETWEEN 1 AND 10),
  maintenance_cost INTEGER CHECK (maintenance_cost BETWEEN 1 AND 10) DEFAULT 5,
  description TEXT,
  aliases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 3. REGLAS DE SCORING MODULARES (NUEVA)
-- =====================================================

CREATE TABLE IF NOT EXISTS scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL,
  rule_category VARCHAR(50) CHECK (rule_category IN ('weight', 'threshold', 'multiplier', 'bonus')),
  rule_type VARCHAR(50),
  value DECIMAL(10,4),
  area_id UUID REFERENCES areas_utp(id),
  condition_json JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 4. USO DE PLATAFORMAS POR ÁREA (NUEVA)
-- =====================================================

CREATE TABLE IF NOT EXISTS area_platform_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID REFERENCES areas_utp(id),
  platform_id UUID REFERENCES platform_configurations(id),
  usage_frequency VARCHAR(20) CHECK (usage_frequency IN ('diario', 'semanal', 'mensual', 'esporadico')),
  criticality_level INTEGER CHECK (criticality_level BETWEEN 1 AND 10),
  user_count INTEGER DEFAULT 0,
  business_processes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(area_id, platform_id)
);

-- =====================================================
-- 5. DEPENDENCIAS INTER-ÁREAS (NUEVA)
-- =====================================================

CREATE TABLE IF NOT EXISTS inter_area_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_origen_id UUID REFERENCES areas_utp(id),
  area_destino_id UUID REFERENCES areas_utp(id),
  tipo_dependencia VARCHAR(50) CHECK (tipo_dependencia IN ('proceso', 'datos', 'sistema', 'recurso')),
  nivel_impacto INTEGER CHECK (nivel_impacto BETWEEN 1 AND 10),
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_areas_utp_active ON areas_utp (is_active, peso_estrategico DESC);
CREATE INDEX IF NOT EXISTS idx_platform_configs_active ON platform_configurations (is_active, strategic_importance DESC);
CREATE INDEX IF NOT EXISTS idx_area_platform_usage_area ON area_platform_usage (area_id, criticality_level DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_rules_active ON scoring_rules (is_active, rule_category, area_id);
CREATE INDEX IF NOT EXISTS idx_inter_dependencies ON inter_area_dependencies (area_origen_id, nivel_impacto DESC);

-- =====================================================
-- 7. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener peso estratégico de un área
CREATE OR REPLACE FUNCTION get_area_strategic_weight(area_name VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
  weight DECIMAL;
BEGIN
  SELECT peso_estrategico INTO weight
  FROM areas_utp
  WHERE nombre = area_name AND is_active = true;
  
  RETURN COALESCE(weight, 1.0);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener configuración de plataforma
CREATE OR REPLACE FUNCTION get_platform_config(platform_name VARCHAR)
RETURNS JSONB AS $$
DECLARE
  config JSONB;
BEGIN
  SELECT jsonb_build_object(
    'complexity_score', complexity_score,
    'integration_effort', integration_effort,
    'user_impact', user_impact,
    'strategic_importance', strategic_importance
  ) INTO config
  FROM platform_configurations
  WHERE LOWER(platform_name) = LOWER($1) AND is_active = true;
  
  RETURN COALESCE(config, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VERIFICACIÓN DE CREACIÓN
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE 'Verificando tablas creadas...';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'areas_utp') THEN
    RAISE NOTICE '✅ Tabla areas_utp creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla areas_utp no se creó';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_configurations') THEN
    RAISE NOTICE '✅ Tabla platform_configurations creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla platform_configurations no se creó';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scoring_rules') THEN
    RAISE NOTICE '✅ Tabla scoring_rules creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla scoring_rules no se creó';
  END IF;
  
  RAISE NOTICE '🎉 Migración Paso 1 completada exitosamente';
END $$;
