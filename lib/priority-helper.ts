// Helper de prioridad con etiquetas descriptivas y clases para badges
// Uso: getPriorityLabel('P1') -> 'P1 - Crítica'
//      getPriorityBadgeClass('P1') -> 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'

export type PriorityCode = 'P1' | 'P2' | 'P3' | 'P4' | string

const LABELS: Record<string, string> = {
  P1: 'P1 - Crítica',
  P2: 'P2 - Alta',
  P3: 'P3 - Media',
  P4: 'P4 - Baja',
  Alta: 'P2 - Alta',
  Media: 'P3 - Media',
  Baja: 'P4 - Baja',
}

const BADGE_CLASSES: Record<string, string> = {
  P1: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  P2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  P3: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  P4: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
}

export function normalizePriority(code?: PriorityCode): 'P1' | 'P2' | 'P3' | 'P4' {
  if (!code) return 'P3'
  const c = String(code).toUpperCase()
  if (c.startsWith('P1') || c === 'ALTA' || c === 'HIGH') return 'P1'
  if (c.startsWith('P2')) return 'P2'
  if (c.startsWith('P3') || c === 'MEDIA' || c === 'MEDIUM') return 'P3'
  if (c.startsWith('P4') || c === 'BAJA' || c === 'LOW') return 'P4'
  // fallback
  return ('P3')
}

export function getPriorityLabel(code?: PriorityCode): string {
  const norm = normalizePriority(code)
  return LABELS[norm] || LABELS['P3']
}

export function getPriorityBadgeClass(code?: PriorityCode): string {
  const norm = normalizePriority(code)
  return BADGE_CLASSES[norm] || BADGE_CLASSES['P3']
}

export function getEffectivePriorityFromRequest(req: any): 'P1' | 'P2' | 'P3' | 'P4' {
  // Respeta la lógica ya usada en RealisticLeaderModal
  const value = req?.prioridad_final || req?.final_priority || req?.prioridad_sugerida || req?.priority || 'P2'
  return normalizePriority(value)
}
