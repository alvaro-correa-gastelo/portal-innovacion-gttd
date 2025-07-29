# Contexto del Proyecto: Portal de Innovación GTTD

## 1. Visión General
Somos la Gerencia de Tecnología y Transformación Digital (GTTD) de la UTP. Estamos construyendo una aplicación web interna para reemplazar nuestro proceso manual y caótico de gestión de la demanda de nuevos proyectos. La aplicación tendrá dos interfaces: una para **Solicitantes** y otra para **Líderes**.

## 2. Arquitectura
- **Frontend:** React (o Vue) con Vite y Tailwind CSS.
- **Backend:** n8n auto-alojado en Docker. Actúa como nuestro API Gateway completo.
- **Base de Datos:** PostgreSQL para datos estructurados, ChromaDB para datos vectoriales.
- **IA:** Usamos la API de Google Gemini para dos agentes:
    - **Agente 1 (InsightBot):** Un chatbot conversacional para registrar y analizar nuevas solicitudes.
    - **Agente 2 (Planificador Experto):** Un sistema RAG para estimar tiempos y riesgos de proyectos.

## 3. Roles de Usuario
- **Solicitante:** Cualquier usuario de UTP. Registra solicitudes y ve el estado de las mismas.
- **Líder de Dominio:** Un líder táctico. Gestiona las solicitudes de su área, aprueba requerimientos y eleva proyectos.
- **Líder Gerencial:** Un líder estratégico. Supervisa toda la demanda, aprueba proyectos grandes y gestiona presupuestos.
