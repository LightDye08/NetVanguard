from flask import Flask, send_from_directory, abort
import os

app = Flask(__name__, static_folder=None)  # Desactivamos el static_folder por defecto

# Configuración
app.config['SECRET_KEY'] = 'tu_clave_secreta_aqui'
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Ruta principal - landpage.html
@app.route('/')
def home():
    return send_from_directory('.', 'landpage.html')

# Ruta para el editor - index.html (ambas versiones)
@app.route('/index')
@app.route('/index.html')
def editor():
    try:
        return send_from_directory('.', 'index.html')
    except FileNotFoundError:
        abort(404)

# Ruta para archivos CSS
@app.route('/css/<path:filename>')
def css_files(filename):
    try:
        return send_from_directory('css', filename)
    except FileNotFoundError:
        abort(404)

# Ruta para archivos JavaScript
@app.route('/js/<path:filename>')
def js_files(filename):
    try:
        return send_from_directory('js', filename)
    except FileNotFoundError:
        abort(404)

# Ruta para assets (imágenes, logos, etc.)
@app.route('/assets/<path:filename>')
def asset_files(filename):
    try:
        return send_from_directory('assets', filename)
    except FileNotFoundError:
        abort(404)

# Ruta para favicon.ico
@app.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory('assets', 'favicon.ico')
    except FileNotFoundError:
        abort(404)

# Ruta para cualquier archivo HTML adicional
@app.route('/<string:page>.html')
def html_pages(page):
    try:
        return send_from_directory('.', f'{page}.html')
    except FileNotFoundError:
        abort(404)

# Manejador de errores 404
@app.errorhandler(404)
def page_not_found(e):
    return "Página no encontrada", 404

if __name__ == '__main__':
    # Crear directorios si no existen
    os.makedirs('css', exist_ok=True)
    os.makedirs('js', exist_ok=True)
    os.makedirs('assets', exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
