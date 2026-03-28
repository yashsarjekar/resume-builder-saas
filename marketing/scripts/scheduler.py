"""
Marketing Automation Scheduler
Runs all automation tasks on schedule
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
import signal

sys.path.append(str(Path(__file__).parent.parent))

from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich.panel import Panel

console = Console()

# Check for schedule library
try:
    import schedule
    import time
    SCHEDULE_AVAILABLE = True
except ImportError:
    SCHEDULE_AVAILABLE = False
    console.print("[yellow]schedule not installed. Run: pip install schedule[/yellow]")

# Import automation modules
from content_generator import ContentGenerator
from telegram_bot import TelegramAutomation
from linkedin_automation import LinkedInAutomation
from email_automation import EmailAutomation


class MarketingScheduler:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent / "data"
        self.data_dir.mkdir(exist_ok=True)
        self.calendar_file = self.data_dir / "calendar.json"
        self.running = True

        # Initialize automation modules
        self.telegram = TelegramAutomation()
        self.linkedin = LinkedInAutomation()
        self.email = EmailAutomation()

    def generate_calendar(self, start_date: datetime = None, days: int = 30) -> dict:
        """Generate a 30-day content calendar"""
        start_date = start_date or datetime.now()
        calendar = {"days": [], "generated_at": datetime.now().isoformat()}

        for day in range(days):
            current_date = start_date + timedelta(days=day)
            day_schedule = {
                "date": current_date.strftime("%Y-%m-%d"),
                "day_of_week": current_date.strftime("%A"),
                "week": (day // 7) + 1,
                "tasks": []
            }

            # LinkedIn: 2 posts per day at 9 AM and 6 PM
            day_schedule["tasks"].extend([
                {"time": "09:00", "platform": "linkedin", "type": "post", "status": "pending"},
                {"time": "18:00", "platform": "linkedin", "type": "post", "status": "pending"},
            ])

            # YouTube: 1 short per day at 6 PM
            day_schedule["tasks"].append(
                {"time": "18:00", "platform": "youtube", "type": "short", "status": "pending"}
            )

            # Telegram: 3 posts per day
            day_schedule["tasks"].extend([
                {"time": "10:00", "platform": "telegram", "type": "post", "status": "pending"},
                {"time": "15:00", "platform": "telegram", "type": "post", "status": "pending"},
                {"time": "20:00", "platform": "telegram", "type": "post", "status": "pending"},
            ])

            # Email: Process sequences at 10 AM
            day_schedule["tasks"].append(
                {"time": "10:00", "platform": "email", "type": "sequence", "status": "pending"}
            )

            # Weekly tasks on Sundays
            if current_date.weekday() == 6:  # Sunday
                day_schedule["tasks"].append(
                    {"time": "11:00", "platform": "analytics", "type": "review", "status": "pending"}
                )

            calendar["days"].append(day_schedule)

        # Save calendar
        with open(self.calendar_file, "w") as f:
            json.dump(calendar, f, indent=2)

        console.print(f"[green]Generated {days}-day calendar[/green]")
        return calendar

    def load_calendar(self) -> dict:
        """Load existing calendar"""
        if not self.calendar_file.exists():
            return self.generate_calendar()
        with open(self.calendar_file) as f:
            return json.load(f)

    def show_today(self):
        """Show today's tasks"""
        calendar = self.load_calendar()
        today = datetime.now().strftime("%Y-%m-%d")

        table = Table(title=f"Today's Tasks ({today})")
        table.add_column("Time", style="cyan")
        table.add_column("Platform")
        table.add_column("Task")
        table.add_column("Status")

        for day in calendar["days"]:
            if day["date"] == today:
                for task in day["tasks"]:
                    status_color = "green" if task["status"] == "completed" else "yellow"
                    table.add_row(
                        task["time"],
                        task["platform"],
                        task["type"],
                        f"[{status_color}]{task['status']}[/{status_color}]"
                    )
                break
        else:
            console.print("[yellow]No tasks found for today. Generate a new calendar.[/yellow]")
            return

        console.print(table)

    def show_week(self, week_num: int = None):
        """Show this week's tasks"""
        calendar = self.load_calendar()
        if week_num is None:
            week_num = (datetime.now() - datetime.fromisoformat(calendar["days"][0]["date"])).days // 7 + 1

        table = Table(title=f"Week {week_num} Overview")
        table.add_column("Date")
        table.add_column("Day")
        table.add_column("LinkedIn")
        table.add_column("YouTube")
        table.add_column("Telegram")
        table.add_column("Email")

        for day in calendar["days"]:
            if day["week"] == week_num:
                linkedin = sum(1 for t in day["tasks"] if t["platform"] == "linkedin")
                youtube = sum(1 for t in day["tasks"] if t["platform"] == "youtube")
                telegram = sum(1 for t in day["tasks"] if t["platform"] == "telegram")
                email = sum(1 for t in day["tasks"] if t["platform"] == "email")

                table.add_row(
                    day["date"],
                    day["day_of_week"][:3],
                    str(linkedin),
                    str(youtube),
                    str(telegram),
                    str(email)
                )

        console.print(table)

    async def run_telegram_task(self):
        """Run scheduled Telegram post"""
        console.print(f"\n[cyan][{datetime.now().strftime('%H:%M')}] Running Telegram task...[/cyan]")
        if self.telegram.setup():
            await self.telegram.post_next()

    def run_linkedin_reminder(self):
        """Show LinkedIn post reminder (manual posting)"""
        console.print(f"\n[cyan][{datetime.now().strftime('%H:%M')}] LinkedIn posting time![/cyan]")
        console.print("Run: python linkedin_automation.py --manual")
        post = self.linkedin.get_next_post()
        if post:
            console.print(f"\nNext post type: {post.get('type', 'unknown')}")
            console.print(f"Preview: {post['content'][:100]}...")

    def run_email_sequence(self):
        """Process email sequences"""
        console.print(f"\n[cyan][{datetime.now().strftime('%H:%M')}] Processing email sequences...[/cyan]")
        self.email.process_welcome_sequence()

    def run_youtube_reminder(self):
        """Show YouTube Shorts reminder"""
        console.print(f"\n[cyan][{datetime.now().strftime('%H:%M')}] Time to post YouTube Short![/cyan]")
        console.print("Check: marketing/content/youtube_scripts.json for today's script")

    def setup_schedule(self):
        """Setup the automated schedule"""
        if not SCHEDULE_AVAILABLE:
            console.print("[red]Schedule library not available[/red]")
            return

        # LinkedIn reminders (manual posting recommended)
        schedule.every().day.at("09:00").do(self.run_linkedin_reminder)
        schedule.every().day.at("18:00").do(self.run_linkedin_reminder)

        # Telegram (can be automated)
        schedule.every().day.at("10:00").do(lambda: asyncio.run(self.run_telegram_task()))
        schedule.every().day.at("15:00").do(lambda: asyncio.run(self.run_telegram_task()))
        schedule.every().day.at("20:00").do(lambda: asyncio.run(self.run_telegram_task()))

        # Email sequences
        schedule.every().day.at("10:30").do(self.run_email_sequence)

        # YouTube reminder
        schedule.every().day.at("17:30").do(self.run_youtube_reminder)

        console.print("[green]Schedule configured![/green]")
        self.show_schedule()

    def show_schedule(self):
        """Show configured schedule"""
        if not SCHEDULE_AVAILABLE:
            return

        table = Table(title="Configured Schedule")
        table.add_column("Time")
        table.add_column("Task")

        scheduled_tasks = [
            ("09:00", "LinkedIn post reminder"),
            ("10:00", "Telegram post (auto)"),
            ("10:30", "Email sequence processing"),
            ("15:00", "Telegram post (auto)"),
            ("17:30", "YouTube Short reminder"),
            ("18:00", "LinkedIn post reminder"),
            ("20:00", "Telegram post (auto)"),
        ]

        for time, task in scheduled_tasks:
            table.add_row(time, task)

        console.print(table)

    def run_daemon(self):
        """Run scheduler as daemon"""
        if not SCHEDULE_AVAILABLE:
            console.print("[red]Schedule library not available. Install: pip install schedule[/red]")
            return

        self.setup_schedule()

        console.print("\n[bold green]Marketing Automation Running![/bold green]")
        console.print("Press Ctrl+C to stop\n")

        def signal_handler(sig, frame):
            self.running = False
            console.print("\n[yellow]Shutting down...[/yellow]")
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)

        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

    def run_once(self, platform: str = None):
        """Run tasks once for testing"""
        if platform == "telegram":
            asyncio.run(self.run_telegram_task())
        elif platform == "linkedin":
            self.run_linkedin_reminder()
        elif platform == "email":
            self.run_email_sequence()
        elif platform == "youtube":
            self.run_youtube_reminder()
        else:
            console.print("Running all tasks once...")
            self.run_linkedin_reminder()
            asyncio.run(self.run_telegram_task())
            self.run_email_sequence()
            self.run_youtube_reminder()


# ===========================================
# CLI Interface
# ===========================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Marketing Automation Scheduler")
    parser.add_argument("--generate", action="store_true", help="Generate new 30-day calendar")
    parser.add_argument("--today", action="store_true", help="Show today's tasks")
    parser.add_argument("--week", type=int, nargs='?', const=1, help="Show week overview")
    parser.add_argument("--run", action="store_true", help="Run scheduler daemon")
    parser.add_argument("--once", nargs='?', const='all', help="Run once: telegram, linkedin, email, youtube, or all")
    parser.add_argument("--schedule", action="store_true", help="Show configured schedule")

    args = parser.parse_args()

    scheduler = MarketingScheduler()

    if args.generate:
        scheduler.generate_calendar()
    elif args.today:
        scheduler.show_today()
    elif args.week is not None:
        scheduler.show_week(args.week)
    elif args.run:
        scheduler.run_daemon()
    elif args.once:
        scheduler.run_once(args.once if args.once != 'all' else None)
    elif args.schedule:
        scheduler.show_schedule()
    else:
        console.print("[bold]Marketing Scheduler[/bold]\n")
        scheduler.show_today()
        console.print("\n[dim]Commands:[/dim]")
        console.print("  --generate  Generate new 30-day calendar")
        console.print("  --today     Show today's tasks")
        console.print("  --week N    Show week N overview")
        console.print("  --run       Run scheduler daemon")
        console.print("  --once      Run all tasks once (for testing)")
