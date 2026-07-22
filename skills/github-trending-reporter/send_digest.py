import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import sys
from dotenv import load_dotenv

# Load .env from the same directory as the script
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')
load_dotenv(env_path)

def send_email():
    smtp_server = os.getenv('SMTP_SERVER')
    try:
        smtp_port = int(os.getenv('SMTP_PORT', 587))
    except:
        smtp_port = 587
    sender_email = os.getenv('EMAIL_USER')
    password = os.getenv('EMAIL_PASSWORD')
    receiver_email = os.getenv('TO_EMAIL')

    if not all([smtp_server, sender_email, password, receiver_email]):
        print("Error: Missing email configuration in .env")
        print(f"Checked .env at: {env_path}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"GitHub Trending Digest"
    msg["From"] = sender_email
    msg["To"] = receiver_email

    report_path = os.path.join(current_dir, 'report.html')
    try:
        with open(report_path, 'r', encoding='utf-8') as f:
            html = f.read()
    except FileNotFoundError:
        print(f"Error: report.html not found at {report_path}")
        return

    part = MIMEText(html, "html")
    msg.attach(part)

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.quit()
        print("Email sent successfully!")
    except Exception as e:
        print(f"Error sending email: {e}")

if __name__ == "__main__":
    send_email()
