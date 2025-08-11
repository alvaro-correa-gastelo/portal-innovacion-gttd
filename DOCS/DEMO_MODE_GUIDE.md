# Demo Mode y Rate Limiting

Esta guía explica cómo habilitar un modo de demostración que evita gasto de créditos en el agente IA y limita el uso por IP/usuario. Se usa un proxy en Next.js y un pequeño limitador en memoria.

## Componentes
- `app/api/n8n-proxy/route.ts`: Proxy seguro hacia n8n. Inyecta `x-webhook-secret`, aplica límites y soporta `demo_mode`.
- `lib/rate-limit.ts`: Limitador simple en memoria (ventana + contador por clave).
- `lib/ip.ts`: Obtiene IP del cliente desde headers (`x-forwarded-for`, `x-real-ip`).
- `middleware.ts`: Mantiene no-cache (ya presente).

## Variables de entorno (.env.local / Vercel)
```
# Activa demo en frontend y backend
NEXT_PUBLIC_DEMO_MODE=true
DEMO_MODE=true

# Límite por IP (por hora) en el proxy
DEMO_MAX_REQUESTS_PER_IP=30

# URL del webhook de n8n (POST)
N8N_WEBHOOK_URL=https://tu-n8n.example.com/webhook/insightbot

# Secreto compartido con n8n (no exponer en cliente)
WEBHOOK_SECRET=tu-secreto
```

## Flujo de seguridad
1. El frontend llama a `POST /api/n8n-proxy` con el payload normal (no envía secretos).
2. El proxy aplica límites:
   - Global por IP (ventana 1 hora, `DEMO_MAX_REQUESTS_PER_IP`).
   - 1 finalización (`SUMMARY_CONFIRMED`) por IP cada 24h.
   - 1 finalización por usuario/email/session cada 24h.
3. Si `DEMO_MODE=true`, el proxy responde mocks sin llamar a n8n.
4. Si `DEMO_MODE=false`, reenvía a `N8N_WEBHOOK_URL` agregando `x-webhook-secret: WEBHOOK_SECRET`.

## Cambios en n8n
- En el webhook inicial, valida `x-webhook-secret` (Header) y rechaza si no coincide.
- Añade rama simple `IF demo_mode === true` para responder mock (opcional si confías en los mocks del proxy).
- Añade nodo `Rate Limit` adicional si quieres protección dentro de n8n.

## Llamadas desde el frontend
- Cambia el endpoint a `/api/n8n-proxy` en lugar de llamar directamente a n8n.
- Incluye `session_id` y `user.email` cuando estén disponibles para maximizar el control por usuario.

Ejemplo payload:
```json
{
  "event_type": "CHAT_MESSAGE",
  "session_id": "abc-123",
  "user": { "email": "test@utp.edu.pe" },
  "message": "Hola"
}
```

Para finalizar:
```json
{
  "event_type": "SUMMARY_CONFIRMED",
  "session_id": "abc-123",
  "user": { "email": "test@utp.edu.pe" },
  "summary": { "title": "Solicitud demo" }
}
```

## Notas importantes
- El limitador en memoria se reinicia al redeploy. Para producción distribuida, usa Redis/Upstash.
- Mantén `WEBHOOK_SECRET` sólo en el servidor; nunca en `NEXT_PUBLIC_*`.
- `DEMO_MODE=true` fuerza que el proxy responda mocks (no hay gasto de créditos).
- Si el login se recarga y genera nueva `session_id`, la regla por IP seguirá protegiendo la finalización diaria.
