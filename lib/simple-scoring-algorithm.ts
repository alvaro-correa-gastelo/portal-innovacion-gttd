/**
 * ALGORITMO DE SCORING SIMPLE MVP
 * Portal de Innovación GTTD - UTP
 * 
 * Características:
 * - Configurable desde base de datos
 * - Lógica simple y comprensible
 * - Enfocado en resolver el problema real
 */

import { query } from './database';

export interface SimpleRequest {
  problema_principal: string;
  objetivo_esperado: string;
  plataformas_involucradas: string[];
  beneficiarios: string;
  frecuencia_uso: 'diario' | 'semanal' | 'mensual' | 'esporadico';
  plazo_deseado: 'menos_1_mes' | '1_a_3_meses' | '3_a_6_meses' | 'sin_definir';
  departamento_solicitante: string;
}

interface SimpleConfig {
  scoring_weights: {
    problem_identified: number;
    description_detailed: number;
    impact_defined: number;
    platforms_mentioned: number;
    stakeholders_identified: number;
  };
  timeframe_points: {
    menos_1_mes: number;
    '1_a_3_meses': number;
    '3_a_6_meses': number;
    sin_definir: number;
  };
  classification_thresholds: {
    project_min_score: number;
    priority_p1_min: number;
    priority_p2_min: number;
    priority_p3_min: number;
  };
  platform_bonus: Record<string, number>;
  department_weights: Record<string, number>;
}

interface SimpleScoringResult {
  total_score: number;
  classification: 'proyecto' | 'requerimiento';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  score_breakdown: {
    base_score: number;
    platform_bonus: number;
    timeframe_bonus: number;
    department_multiplier: number;
  };
  reasoning: string;
}

export class SimpleScoringAlgorithm {
  private config: SimpleConfig | null = null;

  /**
   * Carga configuración activa desde base de datos
   */
  async loadConfiguration(): Promise<void> {
    try {
      const result = await query('SELECT get_simple_scoring_config() as config');
      this.config = result.rows[0]?.config || this.getDefaultConfig();
    } catch (error) {
      console.error('Error loading configuration:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Calcula scoring simple de una solicitud
   */
  async calculateScore(request: SimpleRequest): Promise<SimpleScoringResult> {
    if (!this.config) {
      await this.loadConfiguration();
    }

    const config = this.config!;
    
    // 1. Score base
    const baseScore = this.calculateBaseScore(request, config);
    
    // 2. Bonus por plataformas
    const platformBonus = this.calculatePlatformBonus(request.plataformas_involucradas, config);
    
    // 3. Bonus por plazo deseado
    const timeframeBonus = this.calculateTimeframeBonus(request.plazo_deseado, config);
    
    // 4. Multiplicador por departamento
    const departmentMultiplier = config.department_weights[request.departamento_solicitante] || 1.0;
    
    // 5. Score total
    const totalScore = Math.round((baseScore + platformBonus + timeframeBonus) * departmentMultiplier);
    
    // 6. Clasificación
    const classification = this.classifyRequest(totalScore, config);
    
    // 7. Prioridad
    const priority = this.calculatePriority(totalScore, config);
    
    // 8. Reasoning
    const reasoning = this.generateReasoning(request, totalScore, classification, priority);

    return {
      total_score: Math.min(totalScore, 100), // Cap at 100
      classification,
      priority,
      score_breakdown: {
        base_score: baseScore,
        platform_bonus: platformBonus,
        timeframe_bonus: timeframeBonus,
        department_multiplier: departmentMultiplier
      },
      reasoning
    };
  }

  /**
   * Calcula score base según información recopilada
   */
  private calculateBaseScore(request: SimpleRequest, config: SimpleConfig): number {
    let score = 0;
    const weights = config.scoring_weights;

    // Problema identificado
    if (request.problema_principal && request.problema_principal.length > 10) {
      score += weights.problem_identified;
    }

    // Descripción detallada
    if (request.objetivo_esperado && request.objetivo_esperado.length > 20) {
      score += weights.description_detailed;
    }

    // Impacto definido (basado en beneficiarios)
    if (request.beneficiarios && request.beneficiarios.length > 5) {
      score += weights.impact_defined;
    }

    // Plataformas mencionadas
    if (request.plataformas_involucradas.length > 0) {
      score += weights.platforms_mentioned;
    }

    // Stakeholders identificados (extraído de beneficiarios)
    if (this.hasSpecificBeneficiaries(request.beneficiarios)) {
      score += weights.stakeholders_identified;
    }

    return score;
  }

  /**
   * Calcula bonus por plataformas involucradas
   */
  private calculatePlatformBonus(platforms: string[], config: SimpleConfig): number {
    let bonus = 0;
    
    platforms.forEach(platform => {
      const platformBonus = config.platform_bonus[platform];
      if (platformBonus) {
        bonus += platformBonus;
      }
    });

    // Bonus adicional por múltiples plataformas
    if (platforms.length > 1) {
      bonus += 5;
    }

    return bonus;
  }

  /**
   * Calcula bonus por sensibilidad al tiempo
   */
  private calculateTimeframeBonus(plazo: string, config: SimpleConfig): number {
    const timeframePoints = config.timeframe_points;
    return timeframePoints[plazo as keyof typeof timeframePoints] || 0;
  }

  /**
   * Clasifica como proyecto vs requerimiento
   */
  private classifyRequest(totalScore: number, config: SimpleConfig): 'proyecto' | 'requerimiento' {
    return totalScore >= config.classification_thresholds.project_min_score ? 'proyecto' : 'requerimiento';
  }

  /**
   * Calcula prioridad P1-P4
   */
  private calculatePriority(totalScore: number, config: SimpleConfig): 'P1' | 'P2' | 'P3' | 'P4' {
    const thresholds = config.classification_thresholds;
    
    // P1 si score muy alto
    if (totalScore >= thresholds.priority_p1_min) {
      return 'P1';
    }
    
    // P2 si score alto
    if (totalScore >= thresholds.priority_p2_min) {
      return 'P2';
    }
    
    // P3 si score medio
    if (totalScore >= thresholds.priority_p3_min) {
      return 'P3';
    }
    
    // P4 para el resto
    return 'P4';
  }

  /**
   * Genera explicación del scoring
   */
  private generateReasoning(
    request: SimpleRequest, 
    totalScore: number, 
    classification: string, 
    priority: string
  ): string {
    const platformsText = request.plataformas_involucradas.length > 0 
      ? `Involucra ${request.plataformas_involucradas.join(', ')}`
      : 'Sin plataformas específicas identificadas';
    
    const timeframeText = {
      'menos_1_mes': 'Plazo deseado: < 1 mes',
      '1_a_3_meses': 'Plazo deseado: 1-3 meses',
      '3_a_6_meses': 'Plazo deseado: 3-6 meses',
      'sin_definir': 'Plazo deseado: sin definir'
    }[request.plazo_deseado];

    return `Score: ${totalScore}/100. ${platformsText}. ${timeframeText}. ` +
           `Clasificado como ${classification} con prioridad ${priority}. ` +
           `Departamento: ${request.departamento_solicitante}.`;
  }

  /**
   * Verifica si hay beneficiarios específicos mencionados
   */
  private hasSpecificBeneficiaries(beneficiarios: string): boolean {
    const specificIndicators = ['profesores', 'estudiantes', 'administrativos', 'usuarios', 'personas', 'empleados'];
    return specificIndicators.some(indicator => 
      beneficiarios.toLowerCase().includes(indicator)
    );
  }

  /**
   * Configuración por defecto si no hay en BD
   */
  private getDefaultConfig(): SimpleConfig {
    return {
      scoring_weights: {
        problem_identified: 15,
        description_detailed: 15,
        impact_defined: 10,
        platforms_mentioned: 10,
        stakeholders_identified: 10,
      },
      timeframe_points: {
        'menos_1_mes': 25,
        '1_a_3_meses': 15,
        '3_a_6_meses': 10,
        'sin_definir': 5
      },
      classification_thresholds: {
        project_min_score: 70,
        priority_p1_min: 85,
        priority_p2_min: 70,
        priority_p3_min: 50
      },
      platform_bonus: {
        'Canvas': 10,
        'SAP': 15,
        'PeopleSoft': 12,
        'Office 365': 5,
        'Teams': 5,
        'Power BI': 8,
        'SharePoint': 6,
        'Moodle': 8,
        'Zoom': 3,
        'Sistema Interno': 7
      },
      department_weights: {
        'Académico': 1.2,
        'Administrativo': 1.0,
        'Financiero': 1.1,
        'RRHH': 1.0,
        'Investigación': 1.3,
        'Extensión': 0.9,
        'GTTD': 1.4
      }
    };
  }
}

// Función de utilidad para usar en APIs
export async function calculateSimpleScore(request: SimpleRequest): Promise<SimpleScoringResult> {
  const scorer = new SimpleScoringAlgorithm();
  return await scorer.calculateScore(request);
}
