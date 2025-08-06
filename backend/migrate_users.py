from database import init_db, db_session
from models import User
from werkzeug.security import generate_password_hash
import json

def migrate_users():
    # Obtener usuarios del localStorage (simulado)
    try:
        with open('frontend/js/users_backup.json', 'r') as f:
            old_users = json.load(f)
    except FileNotFoundError:
        print("No se encontraron usuarios para migrar")
        return
    
    # Migrar cada usuario
    for user in old_users:
        hashed_password = generate_password_hash(user['password'])
        new_user = User(
            name=user['name'],
            email=user['email'],
            password=hashed_password
        )
        db_session.add(new_user)
    
    db_session.commit()
    print(f"Migrados {len(old_users)} usuarios")

if __name__ == '__main__':
    init_db()
    migrate_users()