import sqlalchemy
from sqlalchemy.orm import sessionmaker

# --- IMPORTANT ---
# Import your engine and Base from your application's models/database setup
from db.session import engine
from models import Base 
# -----------------

# Get a list of all table names from your models' metadata
table_names = Base.metadata.tables.keys()

# Create a connection
with engine.connect() as connection:
    # Begin a transaction
    with connection.begin() as transaction:
        try:
            # Disable foreign key checks (specific to dialect)
            if engine.dialect.name == 'postgresql':
                connection.execute(sqlalchemy.text("SET session_replication_role = 'replica';"))
            elif engine.dialect.name == 'mysql':
                connection.execute(sqlalchemy.text("SET FOREIGN_KEY_CHECKS = 0;"))
            
            # Delete data from all tables
            for table_name in table_names:
                print(f"Clearing table: {table_name}")
                connection.execute(sqlalchemy.text(f'DELETE FROM "{table_name}"'))
            
            # Re-enable foreign key checks
            if engine.dialect.name == 'postgresql':
                connection.execute(sqlalchemy.text("SET session_replication_role = 'origin';"))
            elif engine.dialect.name == 'mysql':
                connection.execute(sqlalchemy.text("SET FOREIGN_KEY_CHECKS = 1;"))
            
            # Commit the transaction
            transaction.commit()
            print("\n✅ All data has been deleted from all tables.")
        except Exception as e:
            # Rollback in case of error
            transaction.rollback()
            print(f"\n❌ An error occurred: {e}")