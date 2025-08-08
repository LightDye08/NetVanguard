## ADVERTENCIA: ESTO ES UN PROYECTO UNIVERSITARIO NO ES UN PRODUCTO REAL


# NetVanguard - Plataforma de Creación de Sitios Web

![NetVanguard Logo](frontend/assets/logo.svg)

NetVanguard es una plataforma integral para creación de sitios web que combina un sistema de gestión de usuarios con un editor visual avanzado. Permite a los usuarios crear sitios web profesionales mediante plantillas personalizables y exportar el código resultante.

## Características principales

- ✅ **Gestión de usuarios segura**: Registro y autenticación con hash PBKDF2
- 💳 **Sistema de planes escalable**: Selección y pago de planes de servicio (Simulado)
- 🎨 **Editor visual avanzado**: Creación de sitios web con vista previa en tiempo real
- 📥 **Exportación de código**: Generación de HTML/CSS/JS listo para implementar
- 📱 **Previsualización responsive**: Adaptación a dispositivos móviles, tablets y escritorio
- 🔒 **Seguridad robusta**: Protección de rutas y validación de entrada

## Tecnologías utilizadas

### Backend
- **Python 3.10**
- **Flask 2.2.2**
- **Flask-SQLAlchemy 3.0.3**
- **Werkzeug 2.2.2** (utilidades de seguridad)
- **SQLite** (base de datos inicial)

### Frontend
- **HTML5, CSS3, JavaScript ES6+**
- **CodeMirror 5.65.2** (editor de código en navegador)
- **Fetch API** (comunicación con backend)

## Instalación y configuración

### Requisitos previos
- Python 3.8+
- pip (gestor de paquetes de Python)

### Pasos para la instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/netvanguard.git
   cd netvanguard
   ```

2. **Crear entorno virtual**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/MacOS
   venv\Scripts\activate    # Windows
   ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**:
   Crear un archivo `.env` en la raíz del proyecto con:
   ```env
   SECRET_KEY=tu_clave_secreta_aqui
   FLASK_ENV=development
   SQLALCHEMY_DATABASE_URI=sqlite:///app.db
   ```

5. **Inicializar la base de datos**:
   ```bash
   flask db upgrade
   ```

6. **Ejecutar la aplicación**:
   ```bash
   python app.py
   ```

7. **Acceder a la aplicación**:
   Abre tu navegador en: `http://localhost:5000`

## Uso básico

1. **Registro e inicio de sesión**:
   - Visita la página principal y regístrate como nuevo usuario
   - Inicia sesión con tus credenciales

2. **Selección de plan**:
   - Elige entre los planes disponibles (Básico, Profesional, Premium)
   - Completa el proceso de pago (simulado)

3. **Creación de sitio web**:
   - Selecciona una plantilla (Landing Page, E-commerce, Blog, Portfolio)
   - Personaliza el contenido y diseño
   - Utiliza el editor de código para ajustes avanzados

4. **Exportación**:
   - Guarda tu plantilla personalizada
   - Exporta el sitio web completo como archivo HTML

## Estructura del proyecto

```
netvanguard/
├── backend/
│   ├── app.py               # Aplicación principal Flask
│   ├── database.py          # Configuración de la base de datos
│   ├── models.py            # Modelos de datos (User, Plan)
│   ├── migrate_users.py     # Script para migración de usuarios
│   └── app.db               # Base de datos SQLite
├── frontend/
│   ├── index.html           # Editor principal
│   ├── landpage.html        # Página de marketing
│   ├── css/
│   │   ├── style.css        # Estilos del editor
│   │   └── style_landpage.css # Estilos landing page
│   ├── js/
│   │   ├── app.js           # Lógica del editor
│   │   └── javascript_landpage.js # Lógica landing page
│   └── assets/              # Imágenes y recursos
├── .env.example             # Ejemplo de variables de entorno
├── requirements.txt         # Dependencias de Python
└── README.md                # Este archivo
```

## Contribución

Las contribuciones son bienvenidas. Sigue estos pasos:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia


Este proyecto está bajo la Licencia MIT - hecho por Oscar Jesús Trejo Rocha 
Universidad Aútonoma de Chihuahua
