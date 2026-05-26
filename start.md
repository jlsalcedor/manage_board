# Sprint Board Kanban - Guía de Inicio

Este proyecto es una aplicación web tipo Kanban (similar a Trello) construida con **Next.js**, **React**, **Tailwind CSS** y componentes de **shadcn/ui**.

A continuación, se detalla el paso a paso para levantar este proyecto en tu entorno local.

## 🛠 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu sistema:
- **Node.js** (Se recomienda la versión 18 o superior).
- Un gestor de paquetes. El proyecto utiliza `pnpm` por defecto (cuenta con un archivo `pnpm-lock.yaml`), pero también puedes usar `npm` o `yarn`.

Para instalar `pnpm` globalmente (si no lo tienes):
```bash
npm install -g pnpm
```

## 🚀 Paso a Paso para Ejecutar el Proyecto

### 1. Clonar o abrir el proyecto
Asegúrate de estar en el directorio raíz del proyecto (`trello_board`) en tu terminal.

### 2. Instalar las dependencias
Ejecuta el siguiente comando para descargar e instalar todas las librerías necesarias definidas en el `package.json`:

```bash
pnpm install
```
*(Si prefieres usar otro gestor, puedes ejecutar `npm install` o `yarn install`)*.

### 3. Iniciar el servidor de desarrollo
Una vez que las dependencias se hayan instalado correctamente, levanta el servidor local en modo desarrollo:

```bash
pnpm run dev
```
*(O `npm run dev` / `yarn dev`)*.

### 4. Abrir la aplicación
El servidor debería iniciar por defecto en el puerto `3000`. Abre tu navegador web y visita:

👉 **[http://localhost:3000](http://localhost:3000)**

## 📦 Estructura Principal y Tecnologías

- **Framework:** Next.js (utilizando el moderno `App Router` en la carpeta `/app`).
- **Estilos:** Tailwind CSS con variables globales en `app/globals.css`.
- **Componentes:** shadcn/ui y Radix UI v1.0 (accesibles e independientes).
- **Autenticación:** Cuenta con un sistema interno (simulado o ruteado vía `/api/auth`).
- **Almacenamiento de Datos:** El proyecto parece utilizar el archivo `data/bd_board.json` para gestionar el estado/datos localmente.

## 🛠 Otros Comandos Útiles

- **Para generar una versión de producción:**
  ```bash
  pnpm run build
  ```
- **Para iniciar la versión de producción (luego del build):**
  ```bash
  pnpm run start
  ```
- **Para revisar problemas de código (Linting):**
  ```bash
  pnpm run lint
  ```
