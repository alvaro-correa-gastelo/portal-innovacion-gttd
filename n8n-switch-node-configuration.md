# CONFIGURACIÓN DEL NODO SWITCH EN N8N

## Nodo: "Evaluar Estado Discovery"
**Tipo**: Switch
**Posición**: Después del Discovery Agent

## Configuración del Switch:

### Modo: Rules

### Regla 1: "Continuar Descubriendo"
```
Condition: {{ $json.session_state }} equals "discovering"
Output: 0 (Continuar Discovery)
```

### Regla 2: "Listo para Análisis"  
```
Condition: {{ $json.session_state }} equals "ready_for_analysis"
Output: 1 (Ir a Calculate Score)
```

### Regla 3: "Completado"
```
Condition: {{ $json.session_state }} equals "completed"
Output: 2 (Ir a Summary Agent)
```

## Conexiones:

```
Discovery Agent → Switch Node → [3 salidas]
├── Output 0: Webhook Response (continuar conversación)
├── Output 1: Calculate Simple Score
└── Output 2: Summary Agent
```

## Configuración de Outputs:

### Output 0: Webhook Response (Continuar Discovery)
**Nodo**: HTTP Response
**Status Code**: 200
**Body**:
```json
{
  "response": "{{ $('Discovery Agent').item.json.response_message }}",
  "session_state": "discovering",
  "completeness_score": {{ $('Discovery Agent').item.json.completeness_score }},
  "next_question": "{{ $('Discovery Agent').item.json.next_question }}",
  "extracted_info": {{ $('Discovery Agent').item.json.extracted_info }},
  "continue_conversation": true
}
```

### Output 1: Calculate Simple Score
**Nodo**: HTTP Request
**URL**: http://localhost:3000/api/analysis/simple-calculate
**Method**: POST
**Body**:
```json
{
  "request": {
    "problema_principal": "{{ $('Discovery Agent').item.json.extracted_info.problema_principal }}",
    "objetivo_esperado": "{{ $('Discovery Agent').item.json.extracted_info.objetivo_esperado }}",
    "plataformas_involucradas": {{ $('Discovery Agent').item.json.extracted_info.plataformas_involucradas }},
    "beneficiarios": "{{ $('Discovery Agent').item.json.extracted_info.beneficiarios }}",
    "frecuencia_uso": "{{ $('Discovery Agent').item.json.extracted_info.frecuencia_uso }}",
    "urgencia": "{{ $('Discovery Agent').item.json.extracted_info.urgencia }}",
    "departamento_solicitante": "{{ $('Discovery Agent').item.json.extracted_info.departamento_solicitante }}"
  }
}
```

### Output 2: Summary Agent
**Nodo**: Summary Agent (existente)
**Input**: Información completa del Discovery Agent

## Flujo Completo:

```
Webhook → Discovery Agent → Switch Node
                              ├── [discovering] → Webhook Response → Usuario continúa
                              ├── [ready_for_analysis] → Calculate Score → Summary Agent → BD → Response Final
                              └── [completed] → Summary Agent → BD → Response Final
```

## Configuración de Persistencia de Sesión:

Para mantener el contexto entre mensajes, agregar nodo "Set" antes del Discovery Agent:

**Nodo**: Set
**Nombre**: "Preparar Contexto"
**Configuración**:
```json
{
  "session_id": "{{ $json.session_id || $json.headers['x-session-id'] || 'session_' + $now }}",
  "conversation_history": "{{ $json.conversation_history || [] }}",
  "extracted_info": "{{ $json.extracted_info || {} }}",
  "user_message": "{{ $json.message || $json.body.message }}",
  "user_profile": {
    "name": "{{ $json.user_name || 'Usuario' }}",
    "department": "{{ $json.department || 'No especificado' }}",
    "email": "{{ $json.email || '' }}"
  }
}
```

## Manejo de Errores:

Agregar nodo "Error Trigger" conectado a todos los nodos principales:

**Nodo**: Error Trigger
**Response**:
```json
{
  "error": true,
  "message": "Ha ocurrido un error en el procesamiento. Por favor, intenta nuevamente.",
  "session_state": "error",
  "continue_conversation": true
}
```
