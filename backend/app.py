from flask import Flask, request, jsonify, session, redirect, url_for, send_from_directory
from database import db, init_db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
import os
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['FRONTEND_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../frontend')

# Inicializar la base de datos
init_db(app)

# Crear tablas si no existen
with app.app_context():
    db.create_all()

# Decorador para verificar autenticación
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('landpage'))
        return f(*args, **kwargs)
    return decorated_function

# Decorador para verificar plan adquirido (actualizado)
def plan_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Usar db.session.get() para evitar warnings
        user = db.session.get(User, session.get('user_id'))
        if not user or not user.plan:
            # Devolver error en lugar de redirigir
            return jsonify({'error': 'Plan required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Rutas de páginas
@app.route('/')
def landpage():
    # Solo servir el archivo sin redirecciones
    return send_from_directory(app.config['FRONTEND_FOLDER'], 'landpage.html')

@app.route('/pricing')
def pricing():
    # Servir landpage.html pero con parámetro para mostrar precios
    response = send_from_directory(app.config['FRONTEND_FOLDER'], 'landpage.html')
    return response


# Asegurar que la ruta /app requiere autenticación
@app.route('/app')
@login_required
@plan_required
def main_app():
    return send_from_directory(app.config['FRONTEND_FOLDER'], 'index.html')

# Ruta para archivos estáticos (css, js, assets, etc)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.config['FRONTEND_FOLDER'], path)

# API: Registro de usuario (modificado)
@app.route('/api/register', methods=['POST'])
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        app.logger.debug(f"Register request received: {data}")
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        app.logger.debug(f"Parsed fields - Name: {name}, Email: {email}, Password: {password}")
        
        if not name or not email or not password:
            app.logger.warning("Missing fields in registration")
            return jsonify({'error': 'Missing fields'}), 400
            
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            app.logger.warning(f"Email already registered: {email}")
            return jsonify({'error': 'Email already registered'}), 400
        
        hashed_password = generate_password_hash(password)
        new_user = User(name=name, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        app.logger.info(f"User created successfully: ID={new_user.id}, Email={new_user.email}")
        
        # Iniciar sesión para el usuario
        session['user_id'] = new_user.id
        
        # Crear respuesta
        user_data = {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'plan': new_user.plan  # None por defecto
        }
        
        response_data = {
            'success': True,
            'user': user_data,
            'redirect': '/pricing?show=pricing'  # Redirigir a pricing
        }
        
        app.logger.debug(f"Registration successful. Response: {response_data}")
        
        return jsonify(response_data), 201
        
    except Exception as e:
        app.logger.error(f"Error during registration: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


# API: Inicio de sesión
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    session['user_id'] = user.id
    
    # Crear objeto de usuario para la respuesta
    user_data = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'plan': user.plan
    }
    
    # Redirigir con datos de usuario
    if user.plan:
        return jsonify({
            'success': True,
            'redirect': '/app',
            'user': user_data  # Incluir datos del usuario
        })
    else:
        return jsonify({
            'success': True,
            'redirect': '/pricing',
            'user': user_data  # Incluir datos del usuario
        })

# API: Cerrar sesión
@app.route('/api/logout')
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True})


# API: Procesar pago y asignar plan
@app.route('/api/process-payment', methods=['POST'])
@login_required
def process_payment():
    data = request.get_json()
    plan_name = data.get('plan')
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.plan = plan_name
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'plan': plan_name,
        'redirect': '/app'  # Redirigir a la aplicación principal
    })

# API: Verificar estado de usuario
@app.route('/api/user-status')
def user_status():
    if 'user_id' in session:
        user = db.session.get(User, session['user_id'])
        if user:
            return jsonify({
                'logged_in': True,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'plan': user.plan
                }
            })
    return jsonify({'logged_in': False})

if __name__ == '__main__':
    app.run(debug=True, port=5000)