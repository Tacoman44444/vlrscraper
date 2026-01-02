import sqlalchemy
from sqlalchemy.orm import sessionmaker
from db.session import engine
from models import Base 

# Get a list of all table names from your models
table_names = list(Base.metadata.tables.keys())

with engine.connect() as connection:
    with connection.begin() as transaction:
        try:
            # Format table names with double quotes for PostgreSQL
            tables_str = ", ".join([f'"{name}"' for name in table_names])
            
            if tables_str:
                print(f"🚀 Fully clearing tables: {', '.join(table_names)}")
                
                # TRUNCATE is faster than DELETE. 
                # CASCADE handles foreign key dependencies automatically.
                # RESTART IDENTITY resets all ID counters to 1.
                connection.execute(sqlalchemy.text(
                    f"TRUNCATE TABLE {tables_str} RESTART IDENTITY CASCADE;"
                ))
            
            print("\n✅ All data deleted and ID counters reset to 1.")
            
        except Exception as e:
            # Rollback is still here just in case of a connection drop
            transaction.rollback()
            print(f"\n❌ An error occurred: {e}")