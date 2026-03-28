#!/usr/bin/env python3
"""
Marketing Automation - Main Entry Point
One command to rule them all!
"""

import os
import sys
from pathlib import Path

# Add scripts to path
sys.path.insert(0, str(Path(__file__).parent / "scripts"))

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


def show_banner():
    """Show welcome banner"""
    banner = """
    ╔═══════════════════════════════════════════════════════════╗
    ║         ResumeBuilder Marketing Automation                ║
    ║         ─────────────────────────────────────             ║
    ║         30 Days of Automated Content Marketing            ║
    ╚═══════════════════════════════════════════════════════════╝
    """
    console.print(banner, style="bold cyan")


def show_menu():
    """Show main menu"""
    table = Table(show_header=False, box=None)
    table.add_column("Option", style="cyan")
    table.add_column("Description")

    options = [
        ("1", "generate    ", "Generate 30 days of content (LinkedIn, YouTube, Telegram, Email)"),
        ("2", "schedule    ", "View today's posting schedule"),
        ("3", "linkedin    ", "LinkedIn posting mode (manual, safe)"),
        ("4", "telegram    ", "Telegram auto-posting"),
        ("5", "email       ", "Email automation"),
        ("6", "run         ", "Start automation daemon (runs 24/7)"),
        ("7", "setup       ", "Setup guide for API keys"),
        ("q", "quit        ", "Exit"),
    ]

    for num, cmd, desc in options:
        table.add_row(f"[{num}]", f"{cmd}", desc)

    console.print(table)


def run_generate():
    """Generate all content"""
    from content_generator import ContentGenerator

    try:
        generator = ContentGenerator()
        generator.generate_30_day_content()
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        console.print("\n[yellow]Make sure OPENAI_API_KEY is set in .env[/yellow]")


def run_schedule():
    """Show schedule"""
    from scheduler import MarketingScheduler
    scheduler = MarketingScheduler()
    scheduler.show_today()
    console.print()
    scheduler.show_week()


def run_linkedin():
    """LinkedIn mode"""
    from linkedin_automation import LinkedInAutomation
    automation = LinkedInAutomation()
    automation.manual_mode()


def run_telegram():
    """Telegram mode"""
    import asyncio
    from telegram_bot import TelegramAutomation
    automation = TelegramAutomation()

    if automation.setup():
        asyncio.run(automation.post_next())
    else:
        console.print("\n[yellow]Configure Telegram first:[/yellow]")
        console.print("  TELEGRAM_BOT_TOKEN=your-token")
        console.print("  TELEGRAM_CHANNEL_ID=@your_channel")


def run_email():
    """Email mode"""
    from email_automation import EmailAutomation
    automation = EmailAutomation()
    automation.show_sequences()
    automation.show_subscribers()


def run_daemon():
    """Run automation daemon"""
    from scheduler import MarketingScheduler
    scheduler = MarketingScheduler()
    scheduler.run_daemon()


def show_setup():
    """Show setup guide"""
    setup_text = """
[bold cyan]Setup Guide[/bold cyan]

[bold]Step 1: Install Dependencies[/bold]
cd marketing
pip install -r requirements.txt

[bold]Step 2: Configure API Keys[/bold]
cp .env.example .env
# Edit .env with your keys:

[yellow]Required:[/yellow]
OPENAI_API_KEY=sk-...           # For content generation
                                 # Get from: https://platform.openai.com

[yellow]For Telegram:[/yellow]
TELEGRAM_BOT_TOKEN=...          # Create via @BotFather
TELEGRAM_CHANNEL_ID=@channel    # Your channel username

[yellow]For Email:[/yellow]
RESEND_API_KEY=re_...           # Free: https://resend.com
FROM_EMAIL=hello@yourdomain.com

[bold]Step 3: Generate Content[/bold]
python run.py generate          # Creates 30 days of content

[bold]Step 4: Start Posting[/bold]
python run.py linkedin          # Manual LinkedIn posting
python run.py telegram          # Auto Telegram posting
python run.py run               # Run full automation

[bold cyan]Folder Structure:[/bold cyan]
marketing/
├── content/                    # Generated content
│   ├── linkedin_posts.json
│   ├── youtube_scripts.json
│   ├── telegram_posts.json
│   └── email_sequences.json
├── data/                       # Tracking data
├── scripts/                    # Automation scripts
└── run.py                      # This file
"""
    console.print(setup_text)


def load_env():
    """Load .env file"""
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value


def main():
    """Main entry point"""
    load_env()
    show_banner()

    # Check for command line args
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd in ['generate', 'gen', '1']:
            run_generate()
        elif cmd in ['schedule', 'sched', '2']:
            run_schedule()
        elif cmd in ['linkedin', 'li', '3']:
            run_linkedin()
        elif cmd in ['telegram', 'tg', '4']:
            run_telegram()
        elif cmd in ['email', '5']:
            run_email()
        elif cmd in ['run', 'daemon', '6']:
            run_daemon()
        elif cmd in ['setup', 'help', '7']:
            show_setup()
        else:
            console.print(f"[red]Unknown command: {cmd}[/red]")
            show_menu()
        return

    # Interactive mode
    show_menu()

    while True:
        choice = console.input("\n[cyan]Choose option (1-7, q to quit): [/cyan]").strip().lower()

        if choice in ['q', 'quit', 'exit']:
            console.print("[dim]Goodbye![/dim]")
            break
        elif choice == '1':
            run_generate()
        elif choice == '2':
            run_schedule()
        elif choice == '3':
            run_linkedin()
        elif choice == '4':
            run_telegram()
        elif choice == '5':
            run_email()
        elif choice == '6':
            run_daemon()
        elif choice == '7':
            show_setup()
        else:
            console.print("[yellow]Invalid option. Choose 1-7 or q.[/yellow]")


if __name__ == "__main__":
    main()
