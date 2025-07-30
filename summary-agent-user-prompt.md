# SUMMARY AGENT - User Prompt

## INFORMACIÓN COMPLETA DE LA SESIÓN
**Usuario:** {{ $json.user.auth_token }} ({{ $json.session.session_id }})
**Completeness:** {{ $json.session.completeness_score }}% (≥75% requerido)

## CONVERSACIÓN COMPLETA
{{ $json.session.conversation_history }}

## INFORMACIÓN EXTRAÍDA
{{ $json.session.extracted_info }}

## TU TAREA
Genera un **resumen ejecutivo profesional** basado en toda la información recopilada.

## ESTRUCTURA DEL RESUMEN

### 1. INFORMACIÓN GENERAL
```html
<div class="section">
<h3>📋 INFORMACIÓN GENERAL</h3>
<ul>
<li><strong>Solicitante:</strong> [Nombre y rol del usuario]</li>
<li><strong>Departamento:</strong> [Departamento del usuario]</li>
<li><strong>Fecha:</strong> [Fecha actual]</li>
<li><strong>Tipo de Solicitud:</strong> [Automatización/Reporte/Integración/etc.]</li>
</ul>
</div>
```

### 2. DESCRIPCIÓN DEL PROBLEMA/NECESIDAD
```html
<div class="section">
<h3>🎯 DESCRIPCIÓN DEL PROBLEMA</h3>
<p><strong>Situación Actual:</strong> [Descripción del problema actual]</p>
<p><strong>Impacto:</strong> [Cómo afecta a la organización]</p>
<p><strong>Urgencia:</strong> [Nivel de prioridad]</p>
</div>
```

### 3. ANÁLISIS TÉCNICO
```html
<div class="section">
<h3>🔧 ANÁLISIS TÉCNICO</h3>
<ul>
<li><strong>Sistemas Involucrados:</strong> [Herramientas/sistemas mencionados]</li>
<li><strong>Stakeholders:</strong> [Personas/departamentos afectados]</li>
<li><strong>Frecuencia:</strong> [Qué tan seguido ocurre]</li>
<li><strong>Volumen:</strong> [Cantidad de datos/personas afectadas]</li>
</ul>
</div>
```

### 4. RECOMENDACIONES
```html
<div class="section">
<h3>💡 RECOMENDACIONES</h3>
<p><strong>Solución Propuesta:</strong> [Recomendación específica]</p>
<p><strong>Beneficios Esperados:</strong> [Mejoras que se obtendrían]</p>
<p><strong>Recursos Necesarios:</strong> [Personal/tiempo/herramientas]</p>
<p><strong>Timeline Estimado:</strong> [Tiempo aproximado de implementación]</p>
</div>
```

### 5. PRÓXIMOS PASOS
```html
<div class="section">
<h3>📅 PRÓXIMOS PASOS</h3>
<ol>
<li><strong>Inmediato:</strong> [Acción inmediata requerida]</li>
<li><strong>Corto Plazo:</strong> [Acciones en 1-2 semanas]</li>
<li><strong>Mediano Plazo:</strong> [Acciones en 1-2 meses]</li>
</ol>
<p><strong>Responsable de Seguimiento:</strong> [Equipo GTTD/TI]</p>
</div>
```

## ANÁLISIS DE PRIORIDAD
Basándote en la información, determina:
- **Priority Level:** high/medium/low
- **Estimated Effort:** small/medium/large
- **Word Count:** cuenta las palabras del resumen

## CRITERIOS DE PRIORIDAD
### HIGH:
- Afecta a muchas personas
- Impacto en procesos críticos
- Urgencia alta mencionada
- Problemas de seguridad/compliance

### MEDIUM:
- Afecta a departamento específico
- Mejora de eficiencia
- Automatización de procesos manuales

### LOW:
- Mejoras menores
- Funcionalidades adicionales
- Sin urgencia específica

## CRITERIOS DE ESFUERZO
### SMALL (1-4 semanas):
- Configuraciones simples
- Reportes básicos
- Integraciones estándar

### MEDIUM (1-3 meses):
- Desarrollos personalizados
- Integraciones complejas
- Automatizaciones avanzadas

### LARGE (3+ meses):
- Sistemas nuevos
- Migraciones grandes
- Proyectos multi-departamento

## MENSAJE AL USUARIO
Crea un mensaje confirmando que el resumen está listo:
"Perfecto! He generado un resumen ejecutivo completo basado en toda la información que me proporcionaste. El documento incluye el análisis de tu necesidad, recomendaciones específicas y próximos pasos. ¿Te gustaría revisar algún aspecto en particular o proceder con el envío?"

## RESPONDE ÚNICAMENTE CON JSON
Usa el formato exacto del schema, incluyendo todo el HTML del resumen en los campos correspondientes.
