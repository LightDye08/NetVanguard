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
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'error': 'Missing fields'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    session['user_id'] = new_user.id
    
    # Cambio clave: No redirigir a /app, sino devolver éxito
    return jsonify({
        'success': True,
        'redirect': '/pricing'  # Redirigir a la sección de precios
    }), 201

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
    
    # Redirigir según si tiene plan o no
    if user.plan:
        return jsonify({
            'success': True,
            'redirect': '/app'
        })
    else:
        return jsonify({
            'success': True,
            'redirect': '/pricing'
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