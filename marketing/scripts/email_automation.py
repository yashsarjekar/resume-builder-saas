"""
Email Automation Script
Sends automated email sequences to users

Uses Resend (free tier: 100 emails/day)
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict

sys.path.append(str(Path(__file__).parent.parent))

from rich.console import Console
from rich.table import Table

console = Console()

# Check for resend library
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    console.print("[yellow]resend not installed. Run: pip install resend[/yellow]")


class EmailAutomation:
    def __init__(self):
        self.content_file = Path(__file__).parent.parent / "content" / "email_sequences.json"
        self.sent_file = Path(__file__).parent.parent / "data" / "emails_sent.json"
        self.subscribers_file = Path(__file__).parent.parent / "data" / "subscribers.json"

        # Ensure data directory exists
        self.sent_file.parent.mkdir(exist_ok=True)

    def setup(self, api_key: str = None):
        """Setup Resend API"""
        if not RESEND_AVAILABLE:
            console.print("[red]resend library not available[/red]")
            return False

        api_key = api_key or os.getenv("RESEND_API_KEY")

        if not api_key:
            console.print("[red]Resend API key not found. Set RESEND_API_KEY[/red]")
            return False

        resend.api_key = api_key
        console.print("[green]Resend API configured![/green]")
        return True

    def load_sequences(self) -> dict:
        """Load email sequences"""
        if not self.content_file.exists():
            console.print("[yellow]No email content found. Run content_generator.py first.[/yellow]")
            return {}

        with open(self.content_file) as f:
            return json.load(f)

    def load_subscribers(self) -> List[Dict]:
        """Load subscriber list"""
        if not self.subscribers_file.exists():
            return []
        with open(self.subscribers_file) as f:
            return json.load(f)

    def save_subscribers(self, subscribers: List[Dict]):
        """Save subscriber list"""
        with open(self.subscribers_file, "w") as f:
            json.dump(subscribers, f, indent=2)

    def add_subscriber(self, email: str, name: str = "", source: str = "manual"):
        """Add a new subscriber"""
        subscribers = self.load_subscribers()

        # Check if already exists
        if any(s['email'] == email for s in subscribers):
            console.print(f"[yellow]{email} already subscribed[/yellow]")
            return False

        subscribers.append({
            "email": email,
            "name": name,
            "source": source,
            "subscribed_at": datetime.now().isoformat(),
            "sequence_step": 0,
            "last_email_sent": None
        })

        self.save_subscribers(subscribers)
        console.print(f"[green]Added subscriber: {email}[/green]")
        return True

    def get_sent_emails(self) -> dict:
        """Get sent email tracking data"""
        if not self.sent_file.exists():
            return {}
        with open(self.sent_file) as f:
            return json.load(f)

    def mark_sent(self, email: str, sequence: str, step: int):
        """Mark an email as sent"""
        sent = self.get_sent_emails()
        key = f"{email}_{sequence}_{step}"
        sent[key] = datetime.now().isoformat()
        with open(self.sent_file, "w") as f:
            json.dump(sent, f, indent=2)

    def parse_email_content(self, content: str) -> tuple:
        """Parse email content into subject and body"""
        lines = content.strip().split('\n')
        subject = ""
        preview = ""
        body_lines = []
        in_body = False

        for line in lines:
            if line.startswith('Subject:'):
                subject = line.replace('Subject:', '').strip()
            elif line.startswith('Preview:'):
                preview = line.replace('Preview:', '').strip()
            elif line.strip() == '' and not in_body and subject:
                in_body = True
            elif in_body:
                body_lines.append(line)

        body = '\n'.join(body_lines).strip()

        # Convert to HTML
        html_body = body.replace('\n\n', '</p><p>').replace('\n', '<br>')
        html_body = f"<p>{html_body}</p>"

        return subject, preview, html_body

    def send_email(self, to_email: str, subject: str, html_body: str, from_email: str = None) -> bool:
        """Send an email using Resend"""
        if not self.setup():
            return False

        from_email = from_email or os.getenv("FROM_EMAIL", "hello@resumebuilder.pulsestack.in")

        try:
            params = {
                "from": f"Yash from ResumeBuilder <{from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_body
            }

            email = resend.Emails.send(params)
            console.print(f"[green]Email sent to {to_email}[/green]")
            return True

        except Exception as e:
            console.print(f"[red]Failed to send email: {e}[/red]")
            return False

    def send_sequence_email(self, subscriber: dict, sequence: str = "welcome") -> bool:
        """Send the next email in a sequence to a subscriber"""
        sequences = self.load_sequences()

        if sequence not in sequences:
            console.print(f"[red]Sequence '{sequence}' not found[/red]")
            return False

        step = subscriber.get("sequence_step", 0)
        sequence_emails = sequences[sequence]

        if step >= len(sequence_emails):
            console.print(f"[yellow]{subscriber['email']} has completed the {sequence} sequence[/yellow]")
            return False

        email_content = sequence_emails[step]
        subject, preview, html_body = self.parse_email_content(email_content['content'])

        if self.send_email(subscriber['email'], subject, html_body):
            self.mark_sent(subscriber['email'], sequence, step)

            # Update subscriber progress
            subscribers = self.load_subscribers()
            for s in subscribers:
                if s['email'] == subscriber['email']:
                    s['sequence_step'] = step + 1
                    s['last_email_sent'] = datetime.now().isoformat()
                    break
            self.save_subscribers(subscribers)

            return True

        return False

    def process_welcome_sequence(self):
        """Process welcome sequence for all subscribers"""
        subscribers = self.load_subscribers()
        sequences = self.load_sequences()
        welcome_length = len(sequences.get('welcome', []))

        console.print(f"\n[bold]Processing Welcome Sequence[/bold]")
        console.print(f"Subscribers: {len(subscribers)}")
        console.print(f"Sequence steps: {welcome_length}\n")

        for subscriber in subscribers:
            step = subscriber.get('sequence_step', 0)

            if step >= welcome_length:
                continue

            # Check if enough time has passed since last email
            last_sent = subscriber.get('last_email_sent')
            if last_sent:
                last_sent_dt = datetime.fromisoformat(last_sent)
                # Wait 2 days between emails
                if datetime.now() - last_sent_dt < timedelta(days=2):
                    console.print(f"[dim]{subscriber['email']}: Waiting (sent recently)[/dim]")
                    continue

            console.print(f"\n[cyan]Sending to: {subscriber['email']} (Step {step + 1})[/cyan]")
            self.send_sequence_email(subscriber, "welcome")

    def show_subscribers(self):
        """Show all subscribers"""
        subscribers = self.load_subscribers()

        table = Table(title="Subscribers")
        table.add_column("Email")
        table.add_column("Name")
        table.add_column("Source")
        table.add_column("Step")
        table.add_column("Subscribed")

        for s in subscribers:
            table.add_row(
                s['email'],
                s.get('name', '-'),
                s.get('source', '-'),
                str(s.get('sequence_step', 0)),
                s.get('subscribed_at', '-')[:10]
            )

        console.print(table)

    def show_sequences(self):
        """Show available email sequences"""
        sequences = self.load_sequences()

        for seq_name, emails in sequences.items():
            console.print(f"\n[bold cyan]{seq_name.upper()} Sequence ({len(emails)} emails)[/bold cyan]")
            for i, email in enumerate(emails):
                subject, _, _ = self.parse_email_content(email['content'])
                console.print(f"  {i+1}. {email.get('step', 'Email')}: {subject}")


def setup_instructions():
    """Show setup instructions"""
    console.print("""
[bold cyan]Email Automation Setup[/bold cyan]

[bold]Step 1: Get Resend API Key (Free: 100 emails/day)[/bold]
1. Go to https://resend.com
2. Sign up and verify your domain
3. Create an API key

[bold]Step 2: Configure[/bold]
Add to your .env file:
RESEND_API_KEY=re_your-key-here
FROM_EMAIL=hello@yourdomain.com

[bold]Step 3: Add Subscribers[/bold]
python email_automation.py --add email@example.com "John Doe"

[bold]Step 4: Process Sequences[/bold]
python email_automation.py --process

[bold]Tip: Integrate with Your App[/bold]
Add a webhook from your app to add new signups:
POST /api/add-subscriber with {"email": "...", "name": "..."}
""")


# ===========================================
# CLI Interface
# ===========================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Email Automation")
    parser.add_argument("--setup", action="store_true", help="Show setup instructions")
    parser.add_argument("--add", nargs='+', help="Add subscriber: email [name]")
    parser.add_argument("--subscribers", action="store_true", help="Show all subscribers")
    parser.add_argument("--sequences", action="store_true", help="Show email sequences")
    parser.add_argument("--process", action="store_true", help="Process welcome sequence")
    parser.add_argument("--test", help="Send test email to address")

    args = parser.parse_args()

    automation = EmailAutomation()

    if args.setup:
        setup_instructions()
    elif args.add:
        email = args.add[0]
        name = args.add[1] if len(args.add) > 1 else ""
        automation.add_subscriber(email, name)
    elif args.subscribers:
        automation.show_subscribers()
    elif args.sequences:
        automation.show_sequences()
    elif args.process:
        automation.process_welcome_sequence()
    elif args.test:
        if automation.setup():
            automation.send_email(args.test, "Test Email", "<p>This is a test email from ResumeBuilder Marketing Automation!</p>")
    else:
        setup_instructions()
