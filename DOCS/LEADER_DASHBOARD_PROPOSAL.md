# Propuesta de MVP: Panel de Aprobaciones para Líderes

## 1. Objetivo

Crear una vista centralizada y sencilla dentro del portal donde los líderes de dominio puedan ver, evaluar y gestionar las nuevas solicitudes de innovación que han sido enviadas por los usuarios a través de InsightBot.

---

## 2. Componentes Clave de la Solución

Esta propuesta se basa en crear una nueva página y las APIs necesarias, reutilizando componentes existentes para un desarrollo rápido.

### A. Nueva Página: El Panel del Líder (`/dashboard`)

-   **Ruta:** Crearemos una nueva página accesible en `http://localhost:3000/dashboard`.
-   **Componente Principal:** Usaremos y adaptaremos el componente que ya existe: `components/leader-dashboard.tsx`.
-   **Funcionalidad:** Esta página será el punto de entrada. Mostrará una lista o tabla con todas las solicitudes que tienen el estado `pending_approval`.

**Mockup Visual del Dashboard:**
```
------------------------------------------------------------------
| Mi Espacio de Innovación - Panel de Líder                      |
------------------------------------------------------------------
|                                                                |
|  **Bandeja de Entrada de Solicitudes**                         |
|                                                                |
|  [Filtros: Todas | Proyectos | Requerimientos ]                |
|                                                                |
|  ------------------------------------------------------------  |
|  | TÍTULO                | SOLICITANTE      | FECHA      |   |  |
|  |-----------------------|------------------|------------|---|  |
|  | App Móvil UTP+ Class  | Ana Torres       | 07/08/2025 | > |  |
|  |-----------------------|------------------|------------|---|  |
|  | Optimizar Reporte SAP | Carlos Mendoza   | 06/08/2025 | > |  |
|  |-----------------------|------------------|------------|---|  |
|  | ...                   | ...              | ...        | > |  |
|  ------------------------------------------------------------  |
|                                                                |
------------------------------------------------------------------
```

### B. Nueva API: Endpoint para Obtener Solicitudes

-   **Ruta:** Crearemos un nuevo endpoint en `app/api/requests/route.ts`.
-   **Funcionalidad:** Este endpoint se conectará a la base de datos y consultará la tabla `requests`. Permitirá filtrar por estado.
    -   `GET /api/requests?status=pending_approval` devolverá todas las solicitudes pendientes.
    -   `GET /api/requests` devolverá todas las solicitudes.

### C. Vista de Detalle: El Modal de Solicitud

-   **Componente:** Reutilizaremos y adaptaremos el componente existente `components/request-detail-modal.tsx`.
-   **Activación:** Cuando un líder haga clic en una solicitud de la tabla del dashboard, se abrirá este modal.
-   **Contenido:** El modal mostrará **toda la información** que se guardó desde n8n: problema, objetivo, beneficiarios, plataformas, plazo, etc.
-   **Acciones (MVP):** El modal tendrá dos botones:
    1.  **Aprobar:** Cambia el estado de la solicitud en la BD a `approved`.
    2.  **Rechazar:** Cambia el estado a `rejected`.

**Mockup Visual del Modal:**
```
----------------------------------------------------
|                                                  |
|  **Detalle de la Solicitud #123**                |
|  ----------------------------------------------  |
|                                                  |
|  **Título:** App Móvil UTP+ Class                |
|  **Solicitante:** Ana Torres (Académico)         |
|                                                  |
|  **Problema:**                                   |
|  > Dificultad para acceder a cursos y recursos   |
|    desde el móvil.                               |
|                                                  |
|  **Objetivo:**                                   |
|  > Desarrollar una app móvil para visualizar     |
|    cursos, recursos y recibir notificaciones.    |
|                                                  |
|  **Plataformas:** Canvas, Sistema Interno        |
|  **Plazo Deseado:** Menos de 1 mes               |
|                                                  |
|  [ Botón: Aprobar ]   [ Botón: Rechazar ]        |
|                                                  |
----------------------------------------------------
```

### D. Actualización del Flujo de n8n

El cambio en n8n es mínimo y muy sencillo:

-   En la **Rama de Finalización**, el nodo "Notificar al Líder" ya no necesita enviar un email detallado.
-   Ahora, puede enviar una notificación mucho más simple (a Teams, Slack o Email) que solo diga:
    > "Hay una nueva solicitud en el Panel de Aprobaciones. Haz clic aquí para revisarla: http://localhost:3000/dashboard"

---

## 3. Plan de Implementación Sugerido

1.  **Backend:** Crear el endpoint `GET /api/requests` para leer las solicitudes de la base de datos.
2.  **Frontend (Dashboard):** Modificar `leader-dashboard.tsx` para que llame a la nueva API y muestre la lista de solicitudes.
3.  **Frontend (Modal):** Adaptar `request-detail-modal.tsx` para mostrar los datos completos y añadir los botones de acción.
4.  **Integración:** Conectar el dashboard y el modal.
5.  **n8n:** Actualizar el nodo de notificación.

Esta propuesta nos da un camino claro para construir una funcionalidad de gran valor de forma rápida y escalable. ¿Qué te parece este plan para empezar?
