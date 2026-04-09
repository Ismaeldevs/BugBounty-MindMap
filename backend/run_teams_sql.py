"""Run the teams SQL migration against the database."""
from sqlalchemy import create_engine, text
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)

with open("add_teams_functionality.sql", "r") as f:
    sql = f.read()

with engine.connect() as conn:
    conn.execute(text(sql))
    conn.commit()
    print("Teams SQL ejecutado correctamente!")

    result = conn.execute(text(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema='public' ORDER BY table_name"
    ))
    print("\nTablas en la BD:")
    for row in result:
        print(f"  - {row[0]}")
