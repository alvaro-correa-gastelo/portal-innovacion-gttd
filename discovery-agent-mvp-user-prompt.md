# DISCOVERY AGENT MVP - USER PROMPT

SOLICITUD DE SOPORTE TECNOLÓGICO UTP - PORTAL INNOVACIÓN GTTD

=== INFORMACIÓN DEL SOLICITANTE ===
Usuario: {{ $json.session_data.user_profile.name }}
Departamento: {{ $json.session_data.user_profile.department }}
Rol: {{ $json.session_data.user_profile.role }}
Email: {{ $json.session_data.user_profile.email }}

=== MENSAJE DE SOLICITUD ===
{{ $json.session_data.user_query }}

=== CONTEXTO DE SESIÓN ===
Session ID: {{ $json.session_id }}
Etapa actual: {{ $json.current_stage }}
Completitud actual: {{ $json.session_data.completeness_score }}%
Fecha: {{ $json.session_data.user_context.timestamp }}
Canal: Portal de Innovación GTTD

=== HISTORIAL DE CONVERSACIÓN ===
{{ $json.session_data.conversation_history }}

=== INSTRUCCIONES PARA EL AGENTE ===

1. **IDENTIFICA** el problema tecnológico específico que necesita resolver el solicitante
2. **DETECTA** qué plataformas UTP están involucradas (Canvas, SAP, PeopleSoft, Office 365, etc.)
3. **DETERMINA** el impacto y urgencia de la solicitud
4. **CLASIFICA** como proyecto vs requerimiento basado en complejidad
5. **ASIGNA** prioridad (P1-P4) según criterios GTTD

Si la información no está completa, haz preguntas específicas como:
- "¿Qué sistema específico está presentando el problema?" 
- "¿Cuántas personas se verían beneficiadas con esta solución?"
- "¿Con qué frecuencia necesitarías usar esta funcionalidad?"
- "¿Qué tan urgente es resolver esto para tu trabajo diario?"

Analiza esta solicitud y extrae la información estructurada usando la función extract_simple_discovery_info.
