from flask import Flask, request, jsonify, render_template, send_from_directory
import os
import uuid
from datetime import datetime
from pathlib import Path  # ✅ Añadido

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / 'frontend'
GENERATED_PAGES_DIR = BASE_DIR / 'generated_pages'
TEMPLATES_DIR = BASE_DIR / 'templates'

os.makedirs(GENERATED_PAGES_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)


# Plantillas predefinidas
PREDEFINED_TEMPLATES = {
    'landing': {
        'startup': {
            'html': 'landing_startup.html',
            'css': 'landing_startup.css',
            'js': 'landing_startup.js'
        },
        'saas': {
            'html': 'landing_saas.html',
            'css': 'landing_saas.css',
            'js': 'landing_saas.js'
        },
        'product': {
            'html': 'landing_product.html',
            'css': 'landing_product.css',
            'js': 'landing_product.js'
        }
    },
    'ecommerce': {
        'fashion': {
            'html': 'ecommerce_fashion.html',
            'css': 'ecommerce_fashion.css',
            'js': 'ecommerce_fashion.js'
        },
        'electronics': {
            'html': 'ecommerce_electronics.html',
            'css': 'ecommerce_electronics.css',
            'js': 'ecommerce_electronics.js'
        },
        'handmade': {
            'html': 'ecommerce_handmade.html',
            'css': 'ecommerce_handmade.css',
            'js': 'ecommerce_handmade.js'
        }
    },
    'blog': {
        'minimalist': {
            'html': 'blog_minimalist.html',
            'css': 'blog_minimalist.css',
            'js': 'blog_minimalist.js'
        },
        'magazine': {
            'html': 'blog_magazine.html',
            'css': 'blog_magazine.css',
            'js': 'blog_magazine.js'
        },
        'personal': {
            'html': 'blog_personal.html',
            'css': 'blog_personal.css',
            'js': 'blog_personal.js'
        }
    },
    'portfolio': {
        'creative': {
            'html': 'portfolio_creative.html',
            'css': 'portfolio_creative.css',
            'js': 'portfolio_creative.js'
        },
        'grid': {
            'html': 'portfolio_grid.html',
            'css': 'portfolio_grid.css',
            'js': 'portfolio_grid.js'
        },
        'masonry': {
            'html': 'portfolio_masonry.html',
            'css': 'portfolio_masonry.css',
            'js': 'portfolio_masonry.js'
        }
    }
}

@app.route('/generate', methods=['POST'])
def generate_website():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON body provided'}), 400

        template_type = data.get('type')
        style = data.get('style')
        title = data.get('title', 'My Website')
        tagline = data.get('tagline', 'Created with Netvanguard')
        color = data.get('color', '#6366f1')

        if template_type not in PREDEFINED_TEMPLATES or style not in PREDEFINED_TEMPLATES[template_type]:
            return jsonify({'error': 'Template or style not found'}), 404

        template_files = PREDEFINED_TEMPLATES[template_type][style]

        try:
            with open(TEMPLATES_DIR / template_files['html'], 'r') as f:
                html_content = f.read()
            with open(TEMPLATES_DIR / template_files['css'], 'r') as f:
                css_content = f.read()
            with open(TEMPLATES_DIR / template_files['js'], 'r') as f:
                js_content = f.read()
        except FileNotFoundError as e:
            return jsonify({'error': f'Template file not found: {str(e)}'}), 500

        html_content = html_content.replace('{{title}}', title).replace('{{tagline}}', tagline).replace('{{primary_color}}', color)
        css_content = css_content.replace('{{primary_color}}', color)

        page_id = str(uuid.uuid4())
        page_dir = GENERATED_PAGES_DIR / page_id
        os.makedirs(page_dir, exist_ok=True)

        with open(page_dir / 'index.html', 'w') as f:
            f.write(html_content)
        with open(page_dir / 'styles.css', 'w') as f:
            f.write(css_content)
        with open(page_dir / 'script.js', 'w') as f:
            f.write(js_content)

        return jsonify({
            'html': html_content,
            'css': css_content,
            'js': js_content,
            'page_id': page_id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<page_id>')
def download_website(page_id):
    try:
        page_dir = os.path.join(GENERATED_PAGES_DIR, page_id)
        if not os.path.exists(page_dir):
            return jsonify({'error': 'Page not found'}), 404

        # Crear un archivo ZIP con los contenidos (opcional)
        # Por simplicidad, aquí solo enviamos el HTML
        return send_from_directory(page_dir, 'index.html', as_attachment=True)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save_template', methods=['POST'])
def save_template():
    try:
        data = request.json
        template_name = data.get('name')
        html = data.get('html')
        css = data.get('css')
        js = data.get('js')
        template_type = data.get('type')
        style = data.get('style')

        if not all([template_name, html, css, js, template_type, style]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Crear nombre de archivo seguro
        safe_name = ''.join(c if c.isalnum() else '_' for c in template_name.lower())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"user_{template_type}_{safe_name}_{timestamp}"

        # Guardar los archivos
        with open(os.path.join(TEMPLATES_DIR, f"{filename}.html"), 'w') as f:
            f.write(html)
        with open(os.path.join(TEMPLATES_DIR, f"{filename}.css"), 'w') as f:
            f.write(css)
        with open(os.path.join(TEMPLATES_DIR, f"{filename}.js"), 'w') as f:
            f.write(js)

        return jsonify({'success': True, 'message': 'Template saved successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/list_templates')
def list_templates():
    try:
        templates = []
        for filename in os.listdir(TEMPLATES_DIR):
            if filename.endswith(('.html', '.css', '.js')):
                templates.append(filename)
        
        return jsonify({
            'templates_dir': str(TEMPLATES_DIR),
            'files': templates,
            'exists': os.path.exists(TEMPLATES_DIR)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Servir archivos estáticos del frontend
@app.route('/')
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return send_from_directory(FRONTEND_DIR, path)
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)
