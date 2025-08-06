from flask_sqlalchemy import SQLAlchemy
import os

# Creamos la instancia de SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    # Configuramos la URI de la base de datos
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "app.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Inicializamos la app con la base de datos
    db.init_app(app)
    
    # Creamos las tablas dentro del contexto de la aplicación
    with app.app_context():
        db.create_all()
