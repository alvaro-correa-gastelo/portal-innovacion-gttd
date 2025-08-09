import { NextRequest, NextResponse } from 'next/server';

// Importar el algoritmo de scoring basado en plataformas
// import { calculatePlatformBasedScore } from '@/lib/platform-scoring';

// POST /api/analysis/calculate - Calcular scoring usando configuración activa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_data, config_id } = body;

    if (!session_data) {
      return NextResponse.json(
        { error: 'session_data requerido', success: false },
        { status: 400 }
      );
    }

    // Obtener configuración activa o específica
    let config;
    if (config_id) {
      // Obtener configuración específica
      /*
      const { data } = await supabase
        .from('scoring_configurations')
        .select('config_data')
        .eq('id', config_id)
        .single();
      config = data?.config_data;
      */
    } else {
      // Obtener configuración activa
      /*
      const { data } = await supabase
        .from('scoring_configurations')
        .select('config_data')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      config = data?.config_data;
      */
    }

    // Mock configuración activa
    const mockConfig = {
      scoring_weights: {
        problem_identified: 15,
        description_detailed: 15,
        impact_defined: 10,
        frequency_specified: 8,
        volume_quantified: 8,
        tools_current: 12,
        stakeholders_identified: 10,
        urgency_defined: 7,
        platforms_complexity: 15
      },
      platform_complexity_matrix: {
        'Canvas': { complexity: 3, integration_effort: 2, user_impact: 8 },
        'SAP': { complexity: 9, integration_effort: 9, user_impact: 9 },
        'PeopleSoft': { complexity: 8, integration_effort: 8, user_impact: 7 },
        'Power BI': { complexity: 6, integration_effort: 5, user_impact: 7 }
      },
      effort_calculation: {
        base_hours_per_complexity: 8,
        integration_multiplier: 1.5,
        user_impact_multiplier: 1.2,
        multiple_platforms_penalty: 1.3
      },
      priority_matrix: {
        critical: { total_score_min: 85, platform_complexity_min: 7, user_impact_min: 8 },
        high: { total_score_min: 70, platform_complexity_min: 5, user_impact_min: 6 },
        medium: { total_score_min: 50, platform_complexity_min: 3, user_impact_min: 4 },
        low: { total_score_max: 49, platform_complexity_max: 2, user_impact_max: 3 }
      },
      classification_rules: {
        effort_thresholds: {
          small: { max_hours: 40, max_people: 1 },
          medium: { max_hours: 160, max_people: 3 },
          large: { min_hours: 160, min_people: 2 }
        }
      }
    };

    // Calcular scoring usando el algoritmo mejorado
    const result = calculatePlatformBasedScoring(session_data, mockConfig);

    return NextResponse.json({
      ...result,
      config_version: 'v2.0',
      calculated_at: new Date().toISOString(),
      success: true
    });

  } catch (error) {
    console.error('Error calculating scoring:', error);
    return NextResponse.json(
      { error: 'Error al calcular scoring', success: false },
      { status: 500 }
    );
  }
}

// Función simplificada del algoritmo de scoring
function calculatePlatformBasedScoring(sessionData: any, config: any) {
  const extractedInfo = sessionData.extracted_info || {};
  
  // 1. Identificar plataformas
  const platforms = extractPlatforms(extractedInfo, config.platform_complexity_matrix);
  
  // 2. Calcular scoring básico
  const basicScore = calculateBasicScore(extractedInfo, config.scoring_weights);
  
  // 3. Calcular complejidad de plataformas
  const platformScore = calculatePlatformComplexity(platforms, config);
  
  // 4. Estimar esfuerzo
  const effortEstimation = estimateEffort(platforms, config.effort_calculation);
  
  // 5. Determinar prioridad
  const priority = calculatePriority(basicScore + platformScore, platforms, config.priority_matrix);
  
  // 6. Clasificar
  const classification = classifyRequest(effortEstimation, config.classification_rules);

  return {
    priority_level: priority.level,
    priority_score: basicScore + platformScore,
    estimated_effort: effortEstimation.level,
    effort_hours: effortEstimation.hours,
    effort_people: effortEstimation.people,
    classification: classification.type,
    classification_reason: classification.reason,
    platforms_identified: platforms,
    calculation_details: {
      basic_score: basicScore,
      platform_score: platformScore,
      total_score: basicScore + platformScore,
      platforms_analyzed: platforms.length
    }
  };
}

function extractPlatforms(extractedInfo: any, platformMatrix: any) {
  const text = `${extractedInfo.tools || ''} ${extractedInfo.description || ''}`.toLowerCase();
  const platforms = [];
  
  for (const [platform, config] of Object.entries(platformMatrix)) {
    if (text.includes(platform.toLowerCase())) {
      platforms.push({ name: platform, ...config });
    }
  }
  
  return platforms.length > 0 ? platforms : [{ name: 'Sistema Interno', complexity: 5, integration_effort: 6, user_impact: 6 }];
}

function calculateBasicScore(extractedInfo: any, weights: any) {
  let score = 0;
  if (extractedInfo.problem_type) score += weights.problem_identified;
  if (extractedInfo.description) score += weights.description_detailed;
  if (extractedInfo.impact) score += weights.impact_defined;
  if (extractedInfo.tools) score += weights.tools_current;
  return score;
}

function calculatePlatformComplexity(platforms: any[], config: any) {
  if (platforms.length === 0) return 0;
  
  const avgComplexity = platforms.reduce((sum, p) => sum + p.complexity, 0) / platforms.length;
  const multiplier = platforms.length > 1 ? config.effort_calculation?.multiple_platforms_penalty || 1.3 : 1;
  
  return Math.round(avgComplexity * 2 * multiplier);
}

function estimateEffort(platforms: any[], effortConfig: any) {
  const totalComplexity = platforms.reduce((sum, p) => sum + p.complexity, 0);
  const hours = totalComplexity * (effortConfig?.base_hours_per_complexity || 8);
  const people = Math.ceil(hours / 160);
  
  let level = 'small';
  if (hours > 160) level = 'large';
  else if (hours > 40) level = 'medium';
  
  return { level, hours, people };
}

function calculatePriority(totalScore: number, platforms: any[], priorityMatrix: any) {
  const avgComplexity = platforms.reduce((sum, p) => sum + p.complexity, 0) / platforms.length;
  
  if (totalScore >= priorityMatrix.critical.total_score_min && avgComplexity >= priorityMatrix.critical.platform_complexity_min) {
    return { level: 'critical', score: totalScore };
  } else if (totalScore >= priorityMatrix.high.total_score_min && avgComplexity >= priorityMatrix.high.platform_complexity_min) {
    return { level: 'high', score: totalScore };
  } else if (totalScore >= priorityMatrix.medium.total_score_min) {
    return { level: 'medium', score: totalScore };
  } else {
    return { level: 'low', score: totalScore };
  }
}

function classifyRequest(effortEstimation: any, classificationRules: any) {
  const thresholds = classificationRules.effort_thresholds;
  
  if (effortEstimation.hours <= thresholds.small.max_hours && effortEstimation.people <= thresholds.small.max_people) {
    return { type: 'requirement', reason: `Esfuerzo estimado: ${effortEstimation.hours}h, ${effortEstimation.people} persona(s)` };
  } else {
    return { type: 'project', reason: `Esfuerzo estimado: ${effortEstimation.hours}h, ${effortEstimation.people} persona(s)` };
  }
}
