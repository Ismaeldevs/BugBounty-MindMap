# 🎯 Bug Bounty MindMap Platform

Una plataforma web completa diseñada específicamente para Bug Bounty Hunters y Pentesters, que permite visualizar y organizar información de reconocimiento de forma interactiva mediante mapas mentales con drag & drop.

## 🌟 Características Principales

### ✅ Funcionalidades Core Implementadas

- **Sistema de Autenticación JWT Completo**
  - Registro de usuarios con validación de contraseñas seguras
  - Login con tokens JWT
  - Protección de rutas privadas
  - Gestión de sesiones

- **Gestión de Proyectos**
  - CRUD completo de proyectos/programas de Bug Bounty
  - Dashboard con vista de todos los proyectos
  - Export/Import de proyectos en formato JSON
  - Estados: Active, Archived, Completed
  - Tags y categorización

- **Mapas Mentales Interactivos (ReactFlow)**
  - Nodos personalizables con metadata rica
  - Drag & drop completo
  - Tipos de nodos: Root, Subdomain, Endpoint, IP Address, Technology, Vulnerability, Note
  - Estados con colores: In Scope, Out of Scope, Reconnaissance, Testing, Vulnerable, Patched, Reported
  - Información técnica detallada por nodo:
    - IPs, puertos, tecnologías
    - WAF/CDN detection
    - Status codes, headers
    - Notas y tags personalizables
  - Conexiones entre nodos
  - MiniMap y controles de zoom

- **Export/Import de Datos**
  - Exportación completa de proyectos con todos sus nodos
  - Formato JSON estructurado
  - Backup y restauración

## 📦 Instalación y Configuración

### Prerequisitos

- Python 3.10 o superior
- Node.js 18 o superior
- PostgreSQL 14 o superior
- Git

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd Bug-Bounty-Project
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

**Configurar PostgreSQL:**

```bash
# Crear base de datos
createdb bugbounty_db

# Ejecutar migraciones
alembic upgrade head
```

**Iniciar servidor de desarrollo:**

```bash
uvicorn app.main:app --reload
```

El backend estará disponible en: `http://localhost:8000`
- Documentación API: `http://localhost:8000/api/v1/docs`
- Documentación alternativa: `http://localhost:8000/api/v1/redoc`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## 💡 Uso

### 1. Registro e Inicio de Sesión

1. Accede a `http://localhost:3000/register`
2. Crea tu cuenta con email, usuario y contraseña segura
3. Inicia sesión en `http://localhost:3000/login`

### 2. Crear un Proyecto

1. En el Dashboard, haz clic en "New Project"
2. Completa la información:
   - Nombre del programa
   - Descripción
   - Scope (dominios/IPs en alcance)
   - URL del programa (HackerOne, Bugcrowd, etc.)
   - Tags para categorización

### 3. Trabajar con MindMaps

1. Abre un proyecto y haz clic en "Open MindMap"
2. Agrega nodos con el botón "+"
3. Configura cada nodo:
   - **Label**: Nombre del nodo (ej: api.example.com)
   - **Type**: Tipo de nodo (subdomain, endpoint, vulnerability, etc.)
   - **Status**: Estado actual (reconnaissance, testing, vulnerable, etc.)
   - **Data**: Metadata técnica (IPs, puertos, tecnologías, WAF, CDN)
   - **Notes**: Notas personales
   - **Tags**: Etiquetas personalizadas
4. Arrastra los nodos para organizarlos visualmente
5. Conecta nodos relacionados
6. Guarda con el botón "Save"

### 4. Export/Import

- **Exportar**: Desde la vista de proyecto, haz clic en "Export" para descargar un JSON con toda la información
- **Importar**: (Funcionalidad lista para implementar)

## 🎨 Tipos de Nodos y Estados

### Tipos de Nodos
- **Root**: Dominio principal
- **Subdomain**: Subdominios descubiertos
- **Endpoint**: Endpoints/rutas específicas
- **IP Address**: Direcciones IP
- **Technology**: Tecnologías detectadas
- **Vulnerability**: Vulnerabilidades encontradas
- **Note**: Notas generales

### Estados con Código de Colores
- 🟢 **In Scope**: Verde - En alcance del programa
- ⚫ **Out of Scope**: Gris - Fuera de alcance
- 🔵 **Reconnaissance**: Azul - En fase de reconocimiento
- 🟡 **Testing**: Amarillo - En testing activo
- 🔴 **Vulnerable**: Rojo - Vulnerabilidad confirmada
- 🟣 **Patched**: Púrpura - Parcheado
- 🟦 **Reported**: Índigo - Reportado


## 🔄 Features Futuras Planeadas

- [ ] Integración con herramientas de pentesting:
  - subfinder (enumeración de subdominios)
  - httpx (análisis HTTP)
  - nuclei (detección de vulnerabilidades)
  - nmap (escaneo de puertos)
- [ ] Import de proyectos exportados
- [ ] Colaboración en tiempo real (múltiples usuarios)
- [ ] Generación automática de reportes
- [ ] Templates de proyectos
- [ ] Búsqueda y filtrado avanzado de nodos
- [ ] Historial de cambios
- [ ] Notificaciones push
- [ ] Dark mode
- [ ] Mobile responsive mejorado


## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado por @Ismaeldevs 
- Take over the world (ethically, of course) 

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor abre un issue en GitHub con:
- Descripción detallada del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es aplicable
- Información del entorno (OS, versiones de Python/Node)

---

**Happy Bug Hunting! 🎯🐛**
