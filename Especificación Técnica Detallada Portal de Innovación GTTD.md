Especificación Técnica Detallada: Portal de Innovación GTTD
Versión: 1.1 (Arquitectura RAG actualizada)
Fecha: 27 de julio de 2025
Objetivo: Servir como el documento técnico central para el desarrollo del "Portal de Innovación GTTD". Este documento detalla la arquitectura, el stack tecnológico, los flujos de datos, los endpoints de la API y los requerimientos funcionales a un nivel de detalle suficiente para guiar la implementación por parte de un desarrollador o una IA de desarrollo.

1. Contexto del Proyecto
Organización: Universidad Tecnológica del Perú (UTP).

Área Responsable: Gerencia de Tecnología y Transformación Digital (GTTD).

[cite_start]Problemática: La GTTD gestiona una alta demanda de proyectos y requerimientos sin un proceso de recepción y evaluación estandarizado[cite: 135]. [cite_start]Las solicitudes llegan por canales informales (correo, WhatsApp), son ambiguas y no existen criterios compartidos para su priorización[cite: 140, 143, 258, 259]. [cite_start]Esto genera cuellos de botella y retrabajo[cite: 260, 262].

Solución Propuesta: Desarrollar una aplicación web interna (SPA) llamada "Portal de Innovación GTTD" que centralice y automatice este flujo utilizando agentes de IA.

2. Arquitectura Técnica (Enfoque n8n-Nativo)
La solución se basa en una arquitectura desacoplada de 4 capas:

Frontend (Capa de Presentación):

Tecnología: Single-Page Application (SPA) desarrollada en React (con Vite) y estilizada con Tailwind CSS.

Responsabilidad: Gestionar toda la interfaz y experiencia de usuario para los diferentes roles. Se comunica exclusivamente con el Backend a través de una API REST.

Backend (Capa de Orquestación):

Tecnología: n8n auto-alojado en un contenedor Docker.

Responsabilidad: Actuar como API Gateway completo. Expone los endpoints para el frontend, orquesta los flujos de trabajo, ejecuta la lógica de negocio y se comunica con las bases de datos y los servicios de IA. Toda la lógica RAG se implementará aquí.

Inteligencia (Capa de Servicios de IA):

Tecnología: API de Google Gemini Pro.

Responsabilidad: Proveer los modelos de lenguaje para la generación de texto (Agente 1) y la creación de embeddings (Agente 2).

Persistencia (Capa de Datos):

Tecnología: Supabase (PostgreSQL con la extensión pgvector).

Responsabilidad:

Almacenar todos los datos estructurados (usuarios, solicitudes, informes, historial).

Almacenar los embeddings de los documentos históricos y permitir búsquedas por similitud vectorial.

3. Lógica Detallada de los Agentes de IA (Implementación en n8n)
Agente 1: "InsightBot" (Descubrimiento Conversacional)
Orquestación: Un único workflow en n8n.

Flujo Técnico:

El endpoint de n8n /chat recibe el userId y el userMessage.

n8n consulta la tabla de conversaciones en Supabase para recuperar el historial.

Construye el prompt y llama a la API de Gemini.

Recibe la respuesta, la guarda en Supabase y la devuelve al frontend.

Al finalizar, genera el "Informe Técnico para Líder" y lo guarda en la tabla solicitudes de Supabase.

Agente 2: "Planificador Experto" (Pipeline RAG Nativo en n8n)
El proceso se divide en dos workflows distintos dentro de n8n, eliminando la necesidad de scripts de Python externos.

Workflow 1: Ingestión y Creación de Embeddings (Se ejecuta una sola vez por documento)

Trigger: Manual.

Leer Documento: Usa el nodo Read Binary File.

Extraer Texto: Usa el nodo Extract Text from PDF/File.

Chunking: Usa el nodo Split Text.

Generar Embedding: En un bucle, para cada chunk, usa el nodo Google Vertex AI para generar su vector.

Guardar en Supabase: Usa el nodo Supabase para insertar el texto y su vector en una tabla con una columna de tipo vector.

Workflow 2: Consulta y Análisis (Se ejecuta a demanda)

El endpoint de n8n /analyze recibe el requestId y el archivo de la "Ficha Técnica".

El workflow procesa el archivo para generar su embedding.

Búsqueda por Similitud: Usa el nodo Supabase para ejecutar una función de base de datos (match_documents) que realiza la búsqueda por similitud.

Construcción del Prompt: Con los chunks recuperados, usa el nodo Prompt Template para construir el "mega-prompt".

Análisis Final: Llama a la API de Gemini con este prompt enriquecido.

Guarda el informe resultante en la tabla informes_planificacion de Supabase.

4. Especificación de la API (Endpoints en n8n)
El frontend interactuará con los siguientes endpoints expuestos por n8n:

POST /auth/login

POST /chat/send

GET /requests/my-requests

GET /requests/{id}

GET /requests/domain

GET /requests/all

POST /requests/{id}/status

POST /requests/{id}/escalate

POST /requests/{id}/analyze

5. Funcionalidades Detalladas por Portal
Portal del Solicitante
Autenticación:

RF-S01: El usuario debe poder iniciar sesión con credenciales.

RF-S02: El usuario debe poder ver y editar la información básica de su perfil.

RF-S03: El usuario debe poder configurar sus preferencias de notificación (email, push).

Registro de Solicitudes:

RF-S04: La vista principal debe ser una interfaz de chat a pantalla completa para interactuar con el Agente 1.

RF-S05: El chat debe soportar la renderización de componentes ricos (tarjetas de resumen, botones de validación, encuestas).

Seguimiento:

RF-S06: El usuario debe tener un dashboard (Mis Solicitudes) que muestre el estado de todas sus solicitudes en un formato de tarjetas.

RF-S07: Al hacer clic en una solicitud, se debe abrir un panel de detalle (Seguimiento Detallado).

RF-S08: El panel de detalle debe mostrar una línea de tiempo cronológica con cada cambio de estado, quién lo hizo y cuándo.

Comunicación:

RF-S09: El panel de detalle debe tener una pestaña de Mensajes para ver y responder a las comunicaciones iniciadas por un líder.

Portal del Líder
Autenticación y Roles:

RF-L01: El sistema debe soportar dos roles de líder: Líder de Dominio y Líder Gerencial.

RF-L02: La interfaz y los datos visibles deben adaptarse automáticamente según el rol del usuario logueado.

Dashboard Táctico (Líder de Dominio):

RF-L03: La vista por defecto debe ser un dashboard con KPIs y una tabla de solicitudes filtrada por su dominio.

RF-L04: Debe existir una sección secundaria para ver las solicitudes en las que ha sido invitado a colaborar.

Dashboard Estratégico (Líder Gerencial):

RF-L05: La vista por defecto debe ser un dashboard con KPIs globales y una tabla que muestre todas las solicitudes de todos los dominios.

RF-L06: Debe tener una vista de "Bandeja de Aprobaciones" para las solicitudes elevadas.

Vista de Detalle ("Modo Focus"):

RF-L07: Debe ser una vista modal con pestañas: Resumen IA, Planificación Asistida, Historial y Métricas, y Colaboración.

RF-L08: La pestaña Resumen IA debe mostrar botones de decisión condicionales (Aprobar vs. Elevar) para el Líder de Dominio.

RF-L09: El Líder Gerencial debe ver un modal de decisión diferente que incluya la justificación del Líder de Dominio.

RF-L10: La pestaña Planificación Asistida debe contener el flujo completo para activar al Agente 2.

RF-L11: La pestaña Historial y Métricas debe mostrar un log de auditoría completo y medidores de tiempo por estado.

Comunicación:

RF-L12: La pestaña Colaboración debe ser un chat interno entre líderes con funcionalidad de @mencionar para invitar a otros a la conversación.

RF-L13: Debe existir un modal para enviar mensajes directos al solicitante.