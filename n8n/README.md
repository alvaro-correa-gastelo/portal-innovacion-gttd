# n8n Workflows

This folder stores the production workflow JSON(s) used by the Portal de Innovación GTTD.

- Expected file: `InsightBot AI v2.json` (production workflow, sanitized — without credentials)
- Optional sample: `InsightBot AI v2.sample.json` (minimal skeleton for reference)

Security note
- Do NOT commit credentials. n8n credentials live in your n8n instance, not inside the workflow JSON.
- If you need to share the production workflow, export it from n8n with credentials excluded.

How to import in n8n
1) n8n → Settings → Import from file
2) Select `InsightBot AI v2.json`
3) Create/set required Credentials in n8n:
   - Google Gemini API Key
   - PostgreSQL (connection to your DB)
   - HTTP Request/Webhook URL for the frontend (if applicable)

Required frontend env
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` must point to your n8n webhook that receives chat events and finalization events.

Branching/event guidance
- The initial request status must be `submitted` and audit should log `created` only in the finalization branch after `SUMMARY_CONFIRMED`.
- `session_id` must be provided by the client; do not generate a new one inside n8n in the finalization branch.

File policy
- Keep only the current production JSON here.
- Move any older/experimental JSONs to `DOCS/ARCHIVED/` or remove them from the repo.
