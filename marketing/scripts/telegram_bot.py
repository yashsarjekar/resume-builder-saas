"""
Telegram Bot for Auto-Posting
Posts content to your Telegram channel automatically
"""

import json
import os
import sys
import asyncio
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from rich.console import Console
from rich.table import Table

console = Console()

# Check for telegram library
try:
    from telegram import Bot
    from telegram.error import TelegramError
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False
    console.print("[yellow]python-telegram-bot not installed. Run: pip install python-telegram-bot[/yellow]")


class TelegramAutomation:
    def __init__(self):
        self.content_file = Path(__file__).parent.parent / "content" / "telegram_posts.json"
        self.posted_file = Path(__file__).parent.parent / "data" / "telegram_posted.json"
        self.bot = None
        self.channel_id = None

        # Ensure data directory exists
        self.posted_file.parent.mkdir(exist_ok=True)

    def setup(self, token: str = None, channel_id: str = None):
        """Setup Telegram bot"""
        if not TELEGRAM_AVAILABLE:
            console.print("[red]telegram library not available[/red]")
            return False

        token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.channel_id = channel_id or os.getenv("TELEGRAM_CHANNEL_ID")

        if not token:
            console.print("[red]Telegram bot token not found. Set TELEGRAM_BOT_TOKEN[/red]")
            return False

        if not self.channel_id:
            console.print("[red]Telegram channel ID not found. Set TELEGRAM_CHANNEL_ID[/red]")
            return False

        try:
            self.bot = Bot(token=token)
            console.print("[green]Telegram bot initialized![/green]")
            return True
        except Exception as e:
            console.print(f"[red]Telegram setup failed: {e}[/red]")
            return False

    def load_content(self) -> list:
        """Load generated Telegram content"""
        if not self.content_file.exists():
            console.print("[yellow]No content found. Run content_generator.py first.[/yellow]")
            return []

        with open(self.content_file) as f:
            return json.load(f)

    def get_posted_ids(self) -> set:
        """Get IDs of already posted content"""
        if not self.posted_file.exists():
            return set()
        with open(self.posted_file) as f:
            data = json.load(f)
            return set(data.get("posted", []))

    def save_posted(self, post_id: str):
        """Mark a post as posted"""
        posted = list(self.get_posted_ids())
        posted.append(post_id)
        with open(self.posted_file, "w") as f:
            json.dump({"posted": posted, "last_updated": datetime.now().isoformat()}, f)

    def get_next_post(self) -> dict:
        """Get the next unposted content"""
        content = self.load_content()
        posted = self.get_posted_ids()

        for i, post in enumerate(content):
            post_id = f"telegram_{i}"
            if post_id not in posted:
                return {"id": post_id, "index": i, **post}

        return None

    async def send_message(self, text: str, post_id: str = None) -> bool:
        """Send message to Telegram channel"""
        if not self.bot:
            if not self.setup():
                return False

        try:
            await self.bot.send_message(
                chat_id=self.channel_id,
                text=text,
                parse_mode='HTML'
            )
            console.print("[green]Posted to Telegram successfully![/green]")

            if post_id:
                self.save_posted(post_id)

            return True

        except TelegramError as e:
            console.print(f"[red]Failed to post: {e}[/red]")
            return False

    async def post_next(self) -> bool:
        """Post the next scheduled content"""
        post = self.get_next_post()

        if not post:
            console.print("[yellow]No more content to post. Generate more content.[/yellow]")
            return False

        console.print(f"\n[bold]Posting Telegram content #{post['index'] + 1}[/bold]")
        console.print(f"Type: {post.get('type', 'unknown')}")
        console.print("\n[dim]Preview:[/dim]")
        console.print(post['content'][:300] + "..." if len(post['content']) > 300 else post['content'])

        return await self.send_message(post['content'], post['id'])

    def show_schedule(self):
        """Show upcoming posts schedule"""
        content = self.load_content()
        posted = self.get_posted_ids()

        table = Table(title="Telegram Content Schedule")
        table.add_column("#", style="dim")
        table.add_column("Type")
        table.add_column("Status")
        table.add_column("Preview")

        for i, post in enumerate(content[:30]):  # Show first 30
            post_id = f"telegram_{i}"
            status = "[green]Posted[/green]" if post_id in posted else "[yellow]Pending[/yellow]"
            preview = post['content'][:60] + "..." if len(post['content']) > 60 else post['content']
            preview = preview.replace('\n', ' ')

            table.add_row(
                str(i + 1),
                post.get('type', 'unknown'),
                status,
                preview
            )

        console.print(table)

    async def post_batch(self, count: int = 3, delay_minutes: int = 60):
        """Post multiple messages with delay between them"""
        for i in range(count):
            post = self.get_next_post()
            if not post:
                console.print("[yellow]No more content to post.[/yellow]")
                break

            await self.send_message(post['content'], post['id'])

            if i < count - 1:
                console.print(f"[dim]Waiting {delay_minutes} minutes before next post...[/dim]")
                await asyncio.sleep(delay_minutes * 60)


def setup_bot_instructions():
    """Show instructions for setting up Telegram bot"""
    console.print("""
[bold cyan]Setting Up Telegram Bot[/bold cyan]

[bold]Step 1: Create a Bot[/bold]
1. Open Telegram and search for @BotFather
2. Send /newbot
3. Follow prompts to name your bot
4. Copy the API token

[bold]Step 2: Create a Channel[/bold]
1. Create a new Telegram channel (e.g., @resumetips_india)
2. Add your bot as admin (with post permissions)
3. Get channel ID (use @username or numeric ID)

[bold]Step 3: Configure[/bold]
Add to your .env file:
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=@your_channel_name

[bold]Step 4: Test[/bold]
Run: python telegram_bot.py --test

[bold]Step 5: Schedule Posts[/bold]
Run: python scheduler.py --telegram
""")


# ===========================================
# CLI Interface
# ===========================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Telegram Automation")
    parser.add_argument("--setup", action="store_true", help="Show setup instructions")
    parser.add_argument("--test", action="store_true", help="Send test message")
    parser.add_argument("--post", action="store_true", help="Post next content")
    parser.add_argument("--batch", type=int, help="Post N messages with delay")
    parser.add_argument("--schedule", action="store_true", help="Show posting schedule")

    args = parser.parse_args()

    automation = TelegramAutomation()

    if args.setup:
        setup_bot_instructions()
    elif args.test:
        async def test():
            if automation.setup():
                await automation.send_message("Test message from ResumeBuilder Marketing Bot!")
        asyncio.run(test())
    elif args.post:
        async def post():
            if automation.setup():
                await automation.post_next()
        asyncio.run(post())
    elif args.batch:
        async def batch():
            if automation.setup():
                await automation.post_batch(args.batch)
        asyncio.run(batch())
    elif args.schedule:
        automation.show_schedule()
    else:
        automation.show_schedule()
        console.print("\n[dim]Run with --setup for configuration instructions[/dim]")
