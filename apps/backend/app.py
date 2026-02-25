import os
import unittest

from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
from flask_migrate import Migrate

from app import create_app, db
from app.models import Chat, Complaint, Message, User

load_dotenv()

# Create the application instance
app = create_app(os.getenv("FLASK_CONFIG") or "default")
migrate = Migrate(app, db)


@app.shell_context_processor
def make_shell_context():
    return dict(db=db, User=User, Chat=Chat, Message=Message, Complaint=Complaint)


@app.cli.command()
def test():
    """Run the unit tests."""
    tests = unittest.TestLoader().discover("tests")
    unittest.TextTestRunner(verbosity=2).run(tests)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
