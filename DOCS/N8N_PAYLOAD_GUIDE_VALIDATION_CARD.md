# Guía de Payload para la Tarjeta de Validación (n8n)

## 1. Objetivo

Este documento describe la estructura JSON exacta que el workflow de n8n debe enviar al frontend para renderizar la nueva **Tarjeta de Validación de Resumen** (`SummaryValidationCard`).

Para que la nueva tarjeta aparezca, el objeto JSON final que se envía al webhook del chat debe tener `response_type` configurado como `validation_summary`.

## 2. Estructura del Payload

El workflow de n8n (probablemente en el último nodo "Set" o "Code" antes de responder al webhook) debe construir un objeto con la siguiente estructura.

```json
{
  "response_type": "validation_summary",
  "text": "He recopilado la siguiente información. Por favor, confirma si es correcta para poder continuar.",
  "session_id": "{{ $json.session_id }}",
  "summary": {
    "problema_principal": "{{ $json.extracted_data.complete_info.problema_principal }}",
    "objetivo_esperado": "{{ $json.extracted_data.complete_info.objetivo_esperado }}",
    "beneficiarios": "{{ $json.extracted_data.complete_info.beneficiarios }}",
    "departamento_solicitante": "{{ $json.extracted_data.complete_info.departamento_solicitante }}",
    "plataformas_involucradas": "{{ $json.extracted_data.complete_info.plataformas_involucradas }}",
    "plazo_deseado": "{{ $json.extracted_data.complete_info.plazo_deseado }}"
  },
  "user": {
    "auth_token": "{{ $json.user.auth_token }}",
    "user_id": "{{ $json.user.user_id }}"
  }
}
```

### 3. Detalles de los Campos del Objeto `summary`

-   **`problema_principal` (string):** El problema central que el usuario describió.
    -   *Fuente en n8n:* `{{ $json.extracted_data.complete_info.problema_principal }}`

-   **`objetivo_esperado` (string):** El resultado que el usuario quiere alcanzar.
    -   *Fuente en n8n:* `{{ $json.extracted_data.complete_info.objetivo_esperado }}`

-   **`beneficiarios` (string):** Descripción de quiénes son los afectados o beneficiados.
    -   *Fuente en n8n:* `{{ $json.extracted_data.complete_info.beneficiarios }}`

-   **`departamento_solicitante` (string):** El área o departamento que hace la solicitud.
    -   *Fuente en n8n:* `{{ $json.extracted_data.complete_info.departamento_solicitante }}`

-   **`plataformas_involucradas` (array de strings):** Lista de los sistemas o plataformas involucradas.
    -   *Fuente en n8n:* `{{ $json.extracted_data.complete_info.plataformas_involucradas }}`

-   **`plazo_deseado` (string enum):** El plazo esperado para los resultados. Debe ser uno de los valores del enum.
    -   *Valores posibles:* `"menos_1_mes"`, `"1_a_3_meses"`, `"3_a_6_meses"`, `"sin_definir"`
    -   *Fuente en n8n:* `{{ $json.extracted_data.complete_info.plazo_deseado }}`

**Importante:** El componente del frontend se encargará de traducir el `enum` de `plazo_deseado` a un formato amigable (ej. `"menos_1_mes"` se convierte en `"Menos de 1 mes"`). Solo necesitas asegurarte de que n8n envíe el valor del enum correctamente.

## 4. Ejemplo de Payload Completo

Aquí tienes un ejemplo completo de lo que n8n debería enviar. Puedes usar esto para probar el webhook directamente con Postman o una herramienta similar.

```json
{
  "response_type": "validation_summary",
  "text": "He recopilado la siguiente información. Por favor, confirma si es correcta para poder continuar.",
  "session_id": "sess_12345abc",
  "summary": {
    "problema_principal": "El formulario para adjuntar documentos en el Sistema Interno tarda demasiado en cargar (10-15 segundos).",
    "objetivo_esperado": "Reducir el tiempo de carga a menos de 5 segundos para agilizar el trámite.",
    "beneficiarios": "Equipo de Trámites Internos (2-3 personas)",
    "departamento_solicitante": "Administrativo",
    "plataformas_involucradas": [
      "Sistema Interno"
    ],
    "plazo_deseado": "1_a_3_meses"
  },
  "user": {
    "auth_token": "mock-auth-token-for-testing",
    "user_id": "u-qa-prof-01"
  }
}
```

Siguiendo esta guía, el frontend mostrará la nueva tarjeta de validación visual y amigable, lista para que el usuario confirme la información.
