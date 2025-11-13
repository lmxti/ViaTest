# 🚗 VíaTest

`VíaTest` es una aplicación web full-stack diseñada para ayudar a los usuarios a prepararse para el examen teórico de conducción en Chile. La plataforma permite a los usuarios registrarse, estudiar el material, practicar con tests ilimitados por clase de licencia y rastrear su progreso detallado.

Este proyecto ha sido desarrollado utilizando el stack **Angular** (frontend), **Node.js/Express** (backend) y **PostgreSQL** (base de datos).

---

## ✨ Características Principales

### Para Estudiantes (Usuarios Logueados)
* **Autenticación de Usuarios:** Sistema completo de registro (`/register`) e inicio de sesión (`/login`) usando tokens JWT para la gestión de sesiones.
* **Paneles de Control por Clase:** Rutas dinámicas (ej. `/clase/b`) que muestran un panel de control específico para cada licencia.
* **Métricas de Progreso:** El panel de control muestra estadísticas en tiempo real, incluyendo "Tests Realizados", "Tests Aprobados" y "% de Aprobación" para esa clase.
* **Generador de Tests Aleatorios:** Un test (`/test/:classType`) que obtiene preguntas aleatorias de la base de datos, filtradas por la clase de licencia seleccionada.
* **Historial Detallado:** Los usuarios pueden revisar su historial de tests (`/historial/:classType`) y ver el desglose completo de cada test realizado (`/historial/details/:id`), incluyendo qué respondieron y cuál era la respuesta correcta.

### Funcionalidades Públicas
* **Guía de Estudio (Solucionario):** Una página pública (`/answer-guide/:classType`) donde cualquiera puede explorar, leer y filtrar todas las preguntas, respuestas y explicaciones del banco de datos.

### Para Administradores (Protegido)
* **Gestión de Preguntas (CRUD):** Un panel de administración (`/admin/list-questions`) para listar, crear, ver y **editar** preguntas.
* **Formulario Avanzado:** Un único formulario (`/admin/add-question` y `/admin/edit-question/:id`) para crear y editar, con lógica de validación dinámica para respuestas únicas/múltiples.
* **Editor de Texto Enriquecido:** El campo de "Explicación" permite guardar formato HTML (negritas, listas) para un mejor repaso.
* **Protección de Rutas:** Uso de Guardias de Ruta (`authGuard`, `licenseClassGuard`) para proteger rutas de administración y validar parámetros de URL.

---

## 🛠️ Stack Tecnológico

* **Frontend:** Angular (v17+) con Componentes Standalone y TypeScript.
* **Backend:** Node.js con Express.js.
* **Base de Datos:** PostgreSQL.
* **Autenticación:** JSON Web Tokens (JWT) y `bcrypt` para el hashing de contraseñas.
* **Manejo de Peticiones:** Interceptor HTTP de Angular para adjuntar tokens automáticamente.

---

## 🚀 Instalación y Puesta en Marcha Local

Sigue estos pasos para levantar el proyecto en tu máquina local.

### 1. Prerrequisitos

* Node.js (v18 o superior)
* npm (v9 o superior)
* Angular CLI (`npm install -g @angular/cli`)
* Servidor de PostgreSQL

### 2. Configuración del Backend

1.  **Navegar a la carpeta del backend:**
    ```bash
    cd [CARPETA-DEL-PROYECTO]/backend
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar Base de Datos:**
    * Conéctate a PostgreSQL y crea una nueva base de datos (ej. `conduccionapp_db`).
    * Ejecuta los scripts SQL necesarios para crear las tablas: `users`, `categories`, `questions`, `options`, `test_history`, `test_history_details`.
4.  **Variables de Entorno:**
    * Crea un archivo `.env` en la raíz de la carpeta `/backend`.
    * Añade tus credenciales de base de datos y un secreto para JWT:
        ```env
        # Configuración de PostgreSQL
        DB_USER=postgres
        DB_HOST=localhost
        DB_DATABASE=conduccionapp_db
        DB_PASSWORD=tu_contraseña_de_postgres
        DB_PORT=5432
        
        # Secreto para JWT
        JWT_SECRET="tu_llave_secreta_aqui"
        ```
5.  **Ejecutar el servidor:**
    ```bash
    npm run dev
    ```
    * El backend estará corriendo en `http://localhost:3000`.

### 3. Configuración del Frontend

1.  **Abrir una nueva terminal.**
2.  **Navegar a la carpeta del frontend:**
    ```bash
    cd [CARPETA-DEL-PROYECTO]/frontend
    ```
3.  **Instalar dependencias:**
    ```bash
    npm install
    ```
4.  **Ejecutar la aplicación:**
    ```bash
    ng serve -o
    ```
    * La aplicación se abrirá automáticamente en `http://localhost:4200` y se conectará al backend en el puerto 3000.

---

## 🗺️ Roadmap (Funcionalidades Futuras)

* [ ] **Test por Tema:** Permitir al usuario elegir una categoría específica (ej. "Señales de tránsito") para un test.
* [ ] **Implementar Clase C:** Activar la tarjeta "Clase C" y añadir contenido específico para motocicletas.
* [ ] **Eliminar Preguntas:** Añadir funcionalidad de "Borrar" en el panel de administración.
* [ ] **Perfil de Usuario:** Una página donde el usuario pueda ver sus estadísticas generales.