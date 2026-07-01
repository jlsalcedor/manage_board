# Sprint Board Kanban

Una aplicación web de gestión de tareas estilo Kanban moderna y rápida, construida con el ecosistema de **Next.js** y **React**.

> **🛑 NO REQUIERE BASE DE DATOS:**
> Este proyecto ha sido diseñado para ser **100% autónomo y fácil de ejecutar**. Toda la información y el almacenamiento de datos se manejan de manera local a través de un archivo JSON (`data/bd_board.json`). **No necesitas instalar, configurar, ni conectar ningún motor de base de datos** (como MySQL, PostgreSQL o MongoDB) para que la aplicación funcione en toda su capacidad.

## 🚀 Características

- **Gestión de Múltiples Tableros:** Crea, renombra, elimina y navega entre tableros independientes desde un Dashboard centralizado. Cada tablero aloja su propio progreso.
- **Tableros Kanban Interactivos:** Organiza tus tareas en columnas personalizadas de forma visual e independiente para cada tablero.
- **Panel de Administración:** Espacio exclusivo para el administrador maestro donde puede gestionar usuarios y revisar los registros del sistema.
- **Roles y Permisos:** Sistema de roles (Admin / Usuario). Los usuarios estándar solo tienen acceso a interactuar con las tareas de su tablero asignado y no pueden crear ni editar estructuras de columnas.
- **Bitácora de Auditoría:** Registro automático de las acciones realizadas por los usuarios (crear, editar, eliminar o mover historias) visible desde el panel de administración.
- **Drag & Drop:** Sistema fluido de arrastrar y soltar soportado por `@dnd-kit` permitiendo mover tareas entre columnas fácilmente.
- **Diseño Moderno y Accesible:** Componentes de interfaz de usuario de alta calidad gracias a **shadcn/ui** y **Radix UI**.
- **Responsive:** Diseño adaptable que funciona tanto en escritorio como en dispositivos móviles, impulsado por **Tailwind CSS**.
- **Edición de Historias de Usuario:** Modifica atributos y descripciones de las tareas creadas con un formulario enriquecido.
- **Soporte de Imágenes Multicarga:** Adjunta hasta 5 imágenes por historia, almacenadas y servidas de manera local.
- **Previsualización interactiva (Zoom):** Componente de _Lightbox_ nativo con controles de acercamiento, alejamiento y libre movimiento de las imágenes adjuntas.
- **Almacenamiento Local (Sin DB):** Toda la persistencia de datos (tableros, usuarios y logs) ocurre automáticamente en archivos locales dentro de la carpeta `data/` (`bd_board.json`, `bd_users.json`, `bd_logs.json`).

## 🛠️ Tecnologías Utilizadas

- **[Next.js](https://nextjs.org/)** (App Router)
- **[React 19](https://react.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[shadcn/ui](https://ui.shadcn.com/)** (Componentes UI basados en Radix UI)
- **[@dnd-kit](https://dndkit.com/)** (Para la funcionalidad de Drag & Drop)
- **[Lucide React](https://lucide.dev/)** (Iconos)

## 🏁 Empezando

### Prerrequisitos

Asegúrate de tener instalado en tu sistema:
- **Node.js** (versión 18 o superior recomendada)
- **pnpm** (el proyecto utiliza `pnpm` por defecto, aunque puedes usar `npm` o `yarn`)

Para instalar `pnpm` globalmente:
```bash
npm install -g pnpm
```

### Instalación

1. Clona el repositorio en tu máquina local.
2. Abre una terminal en el directorio raíz del proyecto.
3. Instala las dependencias:

```bash
pnpm install
```

### Ejecutar en Desarrollo

Inicia el servidor local de desarrollo:

```bash
pnpm run dev
```

Abre tu navegador y visita [http://localhost:3000](http://localhost:3000) para ver la aplicación en funcionamiento.

### 🔐 Autenticación (Credenciales de Acceso)

La aplicación maneja dos tipos de inicio de sesión: **Administrador Maestro** y **Usuarios Estándar**.

### Administrador Maestro

Para ingresar a la aplicación como administrador (quien puede crear más tableros y usuarios), debes utilizar las siguientes credenciales configuradas mediante variables de entorno:

- **Usuario:** `userBoard` (por defecto en el `.env.example`)
- **Contraseña:** `secureBoardPass2026` (por defecto en el `.env.example`)

> **Nota de Configuración:** Por seguridad, las credenciales no están incluidas en el repositorio. Para que la aplicación funcione en tu entorno local o en producción, **debes crear un archivo `.env`** en la raíz del proyecto basándote en el archivo de ejemplo proporcionado (`.env.example`).
> 
> Contenido del archivo `.env`:
> ```env
> ADMIN_USER="userBoard"
> ADMIN_PASSWORD="secureBoardPass2026"
> ```
> 
> **¿Necesitas cambiarlas?** 
> Si deseas modificar estas credenciales en el futuro (especialmente para entornos productivos en Linux), simplemente cambia los valores directamente en tu archivo `.env`. No necesitas recompilar el proyecto, los cambios se aplican al reiniciar el servidor.

### Usuarios Estándar

Una vez dentro como administrador, puedes acceder al **Panel de Administración** para crear usuarios adicionales. Estos usuarios:
- Reciben acceso exclusivamente a un tablero previamente configurado.
- Se autentican usando las credenciales que el administrador les asigne.
- Sus datos de acceso se almacenan localmente en el archivo `data/bd_users.json`.

## 📁 Estructura del Proyecto

- `/app`: Rutas principales de la aplicación usando el nuevo Next.js App Router.
- `/components`: Componentes reutilizables de React (UI, modales, tarjetas, etc.).
- `/data`: Archivos de almacenamiento local u orígenes de datos de prueba (`bd_board.json`).
- `/hooks`: Custom hooks de React para lógica de negocio y estados.
- `/lib`: Funciones de utilidad y configuración compartida.
- `/public`: Archivos estáticos como imágenes y fuentes.

## 📜 Comandos Disponibles

- `pnpm run dev` - Inicia el servidor de desarrollo.
- `pnpm run build` - Construye la aplicación para producción.
- `pnpm run start` - Inicia el servidor de producción (después del build).
- `pnpm run lint` - Ejecuta ESLint para buscar problemas en el código.

## 📄 Licencia

Este proyecto es de uso libre o bajo la licencia especificada en el repositorio.
