Título: Flujograma de n8n — user profile SIEMPRE por HTTP + caché opcional por sesión

Resumen
Se ajusta el flujo para que SIEMPRE se haga la llamada HTTP de user profile por turno (flujo individual). Se mantiene una caché opcional por sesión (en DB) por si en algún momento decides activarla, pero el camino por defecto invoca el endpoint en cada request. Se preserva la optimización de tokens usando solo un perfil minimal.

1) Diagrama Mermaid (parseable) con llamada HTTP obligatoria

```mermaid
flowchart TD
  %% ENTRADA
  A([Webhook: POST /insightbot]) --> A1[Extract session_id, message, context, user.id]
  A1 --> Uhttp[HTTP GET/POST user profile (siempre)]
  Uhttp --> U2[Normalize minimal user profile]
  U2 --> U3[DB Upsert user into session_data (opcional)]
  U3 --> S{session_id exists?}

  %% BRANCH: NO EXISTE session_id
  S -->|No| Bnew[DB Create New Session (stage: discovery, score:0)]
  Bnew --> Cnew[DB Get Conversation History (empty)]
  Cnew --> Dnew{Intent Router}

  %% BRANCH: SI EXISTE session_id
  S -->|Si| B[DB Get Session by id]
  B --> C[DB Get Conversation History]
  C --> D{Intent Router}

  %% ROUTER en ambos casos
  Dnew -->|auto| F{Completeness >= 75?}
  Dnew -->|clarify| E[Summary Agent refine]
  Dnew -->|validate_and_finish| M[Report Sender (Next /api/reports/generate)]
  D -->|auto| F
  D -->|clarify| E
  D -->|validate_and_finish| M

  %% AUTO
  F -->|No| G[Discovery Agent LLM]
  G --> G1[Discovery output build]
  G1 --> H[DB Update Session State (stage: discovery)]
  H --> I[DB Save Messages (user + assistant)]
  I --> J([Respond envelope discovery])

  F -->|Si| K[Summary Agent preview]
  K --> L[HTTP POST /api/analysis/simple-calculate]
  L --> H2[DB Update Session State (stage: summary_preview)]
  H2 --> I2[DB Save Messages (user + assistant)]
  I2 --> J2([Respond envelope summary_preview])

  %% CLARIFY
  E --> E1[Refine output build]
  E1 --> L2[HTTP POST /api/analysis/simple-calculate]
  L2 --> H3[DB Update Session State (stage: summary_refine)]
  H3 --> I3[DB Save Messages (user + assistant)]
  I3 --> J3([Respond envelope summary_refine])

  %% VALIDATE_AND_FINISH
  M --> N[DB Persist Report URLs]
  N --> O[DB Update Stage completed (100)]
  O --> P[DB Save Final Messages]
  P --> Q([Respond envelope completed])

  %% Notas
  Uhttp -. origen .- X01[[/api/user/profile o sistema externo]]
  U2 -. minimal .- X02[[usar {id,name,department,role}]]
  U3 -. opcional .- X03[[guardar en session_states.conversation_data.user]]

  G -. prompt .- X5[[incluir user minimal en contexto]]
  K -. prompt .- X6[[incluir user minimal en resumen]]
  E -. prompt .- X7[[incluir user minimal en refine]]
```

2) Decisión: ¿por qué llamar SIEMPRE al endpoint de perfil?
- Cada ejecución en n8n es aislada; aunque se puede leer de DB, la fuente de verdad de perfil suele ser un servicio externo o el endpoint Next.
- El perfil puede cambiar entre turnos (rol, unidad, permisos). Llamar siempre garantiza frescura.
- Aún así, se deja un upsert en DB (opcional) por si en el futuro quieres reducir fallos ante caídas de la API (fallback lectura de DB).

3) Implementación de la llamada HTTP (recomendada)
- Nodo Uhttp: HTTP Request
  - Método: GET (o POST si requieres body)
  - URL ejemplo GET:
    http://localhost:3000/api/user/profile?id={{$json.user.id}}
  - Timeouts: 3–5s. Retries: 1 con backoff leve.
  - Manejo de error:
    - Si 404 o error de red, construir user minimal de fallback con lo que vino en el Webhook user (id,name,department,role si están).
- Nodo U2: Set / Code
  - Normalizar a:
    {
      "id": string,
      "name": string,
      "department": string,
      "role": string
    }
  - Elimina PII (email/phone) antes de llegar al LLM.

4) Uso en prompts (minimizando tokens)
- Discovery/Preview/Refine:
  - Incluir solo: role y department (name opcional).
  - Prefijo de contexto: “User role: {{role}}, dept: {{department}}.”
  - No enviar JSON completo del perfil al LLM; basta una línea compacta.

5) Upsert opcional a DB (para diagnóstico o futura caché)
- Si decides mantener rastro en conversación:
  UPDATE session_states
  SET conversation_data = jsonb_set(
    COALESCE(conversation_data, '{}'::jsonb),
    '{user}',
    to_jsonb(json_build_object(
      'id', {{ user.id }},
      'name', {{ user.name }},
      'department', {{ user.department }},
      'role', {{ user.role }}
    )),
    true
  ),
  updated_at = now()
  WHERE id = {{ session_id }}
  RETURNING id;
- Beneficio:
  - Permite auditar qué perfil se usó en ese turno.
  - Si la API cae, podrías degradar y usar el último perfil conocido de DB.

6) Optimización de velocidad y costo con llamada siempre activa
- Mantén el endpoint de perfil ligero (DB indexado, solo campos mínimos).
- Evita serializar campos grandes.
- Habilita HTTP Keep-Alive en tu stack (Next/Node lo maneja).
- Evita más de 1 llamada externa por turno para datos de perfil; las demás ramas usan ese resultado.
- Prompts con máximo 2–3 líneas de contexto del user.

7) Contrato JSON de entrada (sin cambios)
- Se consume todo lo que envías (session_id, message, context, user).
- Solo se filtra hacia el LLM lo necesario para bajar tokens. No se elimina nada funcional del request.

8) Variante sin caché (si quieres eliminar DB upsert)
- Puedes cortar el nodo U3 y conectar U2 directamente con el switch S. El flujo sigue siendo válido y más simple. En el diagrama U3 está marcado como “opcional”.

Con esto, el flujo queda configurado para que el user profile se obtenga SIEMPRE por HTTP en cada ejecución, manteniendo el uso mínimo necesario en los prompts para optimizar velocidad y consumo de tokens, y dejando la opción de caché en DB solo como mejora futura o mecanismo de resiliencia.
