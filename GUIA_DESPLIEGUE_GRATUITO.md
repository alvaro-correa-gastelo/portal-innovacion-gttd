# Guía de Despliegue Gratuito - Portal de Innovación GTTD

## 🚀 **OPCIONES RECOMENDADAS PARA DESPLIEGUE GRATUITO**

### **🥇 OPCIÓN 1: VERCEL (RECOMENDADA)**

#### **✅ Ventajas:**
- **Gratis** para proyectos personales y equipos pequeños
- **Despliegue automático** desde GitHub
- **Dominio personalizado** incluido
- **SSL automático**
- **Optimizado para Next.js**
- **CDN global**

#### **📋 Pasos para Desplegar:**

1. **Subir a GitHub:**
   ```bash
   # En tu directorio del proyecto
   git init
   git add .
   git commit -m "Initial commit - Portal Innovación GTTD"
   
   # Crear repositorio en GitHub y conectar
   git remote add origin https://github.com/tu-usuario/portal-innovacion-gttd.git
   git push -u origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con tu cuenta de GitHub
   - Click "New Project"
   - Selecciona tu repositorio
   - Click "Deploy"

3. **Configuración Automática:**
   - Vercel detecta automáticamente que es Next.js
   - Configura build automáticamente
   - Genera URL: `https://tu-proyecto.vercel.app`

#### **🔗 URL Final:**
```
https://portal-innovacion-gttd.vercel.app
```

---

### **🥈 OPCIÓN 2: NETLIFY**

#### **✅ Ventajas:**
- **Gratis** con límites generosos
- **Despliegue desde GitHub**
- **Formularios** incluidos
- **Funciones serverless**

#### **📋 Pasos:**
1. Conecta GitHub a [netlify.com](https://netlify.com)
2. Selecciona repositorio
3. Configura build: `npm run build`
4. Deploy automático

---

### **🥉 OPCIÓN 3: GITHUB PAGES + NEXT.JS STATIC**

#### **⚙️ Configuración:**

1. **Modificar `next.config.mjs`:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     },
     basePath: '/portal-innovacion-gttd',
     assetPrefix: '/portal-innovacion-gttd/'
   }

   export default nextConfig
   ```

2. **Crear `.github/workflows/deploy.yml`:**
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

3. **Habilitar GitHub Pages:**
   - Ve a Settings > Pages
   - Source: GitHub Actions
   - URL: `https://tu-usuario.github.io/portal-innovacion-gttd`

---

## 🎯 **RECOMENDACIÓN: USAR VERCEL**

### **🚀 Despliegue Rápido en Vercel:**

#### **Paso 1: Preparar el Proyecto**
```bash
# Asegúrate de que todo funcione localmente
npm run dev

# Crear build de producción
npm run build
```

#### **Paso 2: Subir a GitHub**
```bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .
git commit -m "Portal de Innovación GTTD - Listo para despliegue"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/TU-USUARIO/portal-innovacion-gttd.git
git branch -M main
git push -u origin main
```

#### **Paso 3: Desplegar en Vercel**
1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con GitHub
3. Click "New Project"
4. Importa tu repositorio
5. Click "Deploy"

#### **🎉 Resultado:**
- **URL automática**: `https://portal-innovacion-gttd.vercel.app`
- **Despliegue automático** en cada push
- **Preview deployments** para branches
- **Analytics** incluidos

---

## 📝 **PREPARACIÓN DEL PROYECTO**

### **Archivos a Crear/Verificar:**

#### **1. `.gitignore`** (ya existe)
```
node_modules/
.next/
out/
.env.local
.env.development.local
.env.test.local
.env.production.local
.vercel
```

#### **2. `README.md`**
```markdown
# Portal de Innovación GTTD

Portal web para gestión de solicitudes tecnológicas con agente IA conversacional.

## 🚀 Demo en Vivo
[Ver Demo](https://portal-innovacion-gttd.vercel.app)

## 🛠️ Tecnologías
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- Lucide Icons

## 📋 Características
- Dashboard de solicitudes (Kanban)
- Chat con agente IA (InsightBot)
- Sistema de seguimiento
- Gestión de documentos
- Analytics y reportes

## 🏃‍♂️ Ejecutar Localmente
\`\`\`bash
npm install
npm run dev
\`\`\`

## 📧 Contacto
Equipo GTTD - Universidad Tecnológica del Perú
```

#### **3. `package.json`** (verificar scripts)
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🔗 **COMPARTIR CON EL EQUIPO**

### **📧 Mensaje para Enviar:**

```
¡Hola equipo! 👋

He desplegado el Portal de Innovación GTTD para que puedan revisarlo y dar feedback:

🌐 **URL del Demo:** https://portal-innovacion-gttd.vercel.app

📋 **Qué pueden revisar:**
✅ Dashboard con tablero Kanban
✅ Chat con InsightBot (simulado)
✅ Sistema de seguimiento
✅ Gestión de documentos
✅ Reportes y analytics

📝 **Para tomar notas y sugerencias:**
- Naveguen por todas las secciones
- Prueben la interfaz en móvil y desktop
- Anoten mejoras en funcionalidad
- Sugieran cambios en diseño/UX

📂 **Código fuente:** https://github.com/TU-USUARIO/portal-innovacion-gttd

¡Espero sus comentarios para seguir mejorando! 🚀
```

---

## 🔄 **ACTUALIZACIONES AUTOMÁTICAS**

### **Flujo de Trabajo:**
1. **Haces cambios** en tu código local
2. **Push a GitHub**: `git push origin main`
3. **Vercel detecta** el cambio automáticamente
4. **Redespliega** en 1-2 minutos
5. **Equipo ve** los cambios inmediatamente

### **Branches para Colaboración:**
```bash
# Crear branch para nuevas features
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y push
git push origin feature/nueva-funcionalidad

# Vercel crea preview URL automáticamente
# https://portal-innovacion-gttd-git-feature-nueva-funcionalidad.vercel.app
```

---

## 💡 **CONSEJOS ADICIONALES**

### **🎨 Personalización de Dominio:**
- En Vercel: Settings > Domains
- Agregar dominio personalizado gratis
- Ejemplo: `innovacion-gttd.com`

### **📊 Analytics:**
- Vercel incluye analytics básicos gratis
- Ver visitantes, páginas más vistas, etc.

### **🔒 Protección:**
- Agregar password protection si necesario
- Configurar en Vercel > Settings > Password Protection

### **👥 Colaboradores:**
- Invitar al equipo en Vercel
- Acceso a deployments y configuración

---

## ✅ **CHECKLIST DE DESPLIEGUE**

- [ ] Código funcionando localmente
- [ ] Repositorio en GitHub creado
- [ ] Cuenta en Vercel creada
- [ ] Proyecto conectado y desplegado
- [ ] URL funcionando correctamente
- [ ] README.md actualizado
- [ ] Equipo notificado con URL

**¡Con Vercel tendrás tu proyecto online en menos de 5 minutos!** 🚀
