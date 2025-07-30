# SESSION MANAGER - User Prompt

## DATOS DE ENTRADA
Analiza esta información del usuario:

**Mensaje:** {{ $json.message }}
**Usuario:** {{ $json.user.auth_token }} (ID: {{ $json.user.user_id }})
**Timestamp:** {{ $json.context.timestamp }}
**Fuente:** {{ $json.context.source }}

## INSTRUCCIONES
1. **Identifica al usuario** usando el auth_token de la lista predefinida
2. **Busca o crea sesión** para este user_id
3. **Analiza el mensaje** para extraer información relevante
4. **Calcula completeness** basado en información disponible
5. **Determina el agente** apropiado según las reglas de routing
6. **Prepara el input** para el siguiente agente

## USUARIOS DISPONIBLES
- `demo_token_user_001` → María González (RRHH, Coordinadora)
- `demo_token_user_002` → Carlos Rodríguez (TI, Analista)  
- `demo_token_user_003` → Ana Martínez (Académico, Directora)

## REGLAS DE ROUTING
- **Primera vez o completeness 0-74%** → `discovery_agent`
- **Completeness 75-100%** → `summary_agent`
- **Summary completo** → `report_sender`

## EXTRAE DEL MENSAJE
- **Tipo de problema:** automatización, reporte, integración, nueva funcionalidad, etc.
- **Urgencia:** palabras como "urgente", "inmediato", "cuando sea posible"
- **Departamento afectado:** RRHH, TI, Académico, Administrativo, etc.
- **Descripción:** resumen del problema/necesidad
- **Impacto:** cuántas personas afecta, frecuencia, etc.
- **Stakeholders:** nombres o roles mencionados

## CÁLCULO DE COMPLETENESS
Asigna puntos por cada elemento identificado:
- Problema identificado: 20%
- Descripción detallada: 15%
- Impacto definido: 15%
- Departamento conocido: 10%
- Stakeholders identificados: 10%
- Urgencia especificada: 10%
- Frecuencia/volumen: 10%
- Herramientas actuales: 10%

**Total:** Suma los porcentajes de elementos presentes

## GENERA SESSION_ID
Si es nueva sesión, usa este formato: `session_{{ $json.user.user_id }}_{{ new Date().getTime() }}`

## RESPONDE ÚNICAMENTE CON EL JSON
Usa el formato exacto del schema sin texto adicional.
