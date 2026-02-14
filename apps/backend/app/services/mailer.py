import threading
from flask import current_app, render_template
from flask_mail import Message
from .. import mail

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_email(to, subject, template, **kwargs):
    app = current_app._get_current_object()

    msg = Message(
        subject=f"{app.config.get('MAIL_SUBJECT_PREFIX', '[UniPal]')} {subject}",
        sender=app.config.get('MAIL_DEFAULT_SENDER'),
        recipients=[to]
    )

    msg.body = render_template(f"{template}.txt", **kwargs)
    msg.html = render_template(f"{template}.html", **kwargs)
    
    thr = threading.Thread(target=send_async_email, args=[app, msg])
    thr.start()
    return thr