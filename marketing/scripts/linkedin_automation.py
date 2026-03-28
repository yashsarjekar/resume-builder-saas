"""
LinkedIn Automation Script
Posts content to LinkedIn automatically

NOTE: LinkedIn's official API requires company page access.
This script uses the unofficial linkedin-api library for personal profiles.
Use responsibly - don't spam!
"""

import json
import os
import sys
import time
import random
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from rich.console import Console
from rich.table import Table

console = Console()

# Check for linkedin-api
try:
    from linkedin_api import Linkedin
    LINKEDIN_AVAILABLE = True
except ImportError:
    LINKEDIN_AVAILABLE = False
    console.print("[yellow]linkedin-api not installed. Run: pip install linkedin-api[/yellow]")


class LinkedInAutomation:
    def __init__(self):
        self.content_file = Path(__file__).parent.parent / "content" / "linkedin_posts.json"
        self.posted_file = Path(__file__).parent.parent / "data" / "linkedin_posted.json"
        self.api = None

        # Ensure data directory exists
        self.posted_file.parent.mkdir(exist_ok=True)

    def authenticate(self, email: str = None, password: str = None):
        """Authenticate with LinkedIn"""
        if not LINKEDIN_AVAILABLE:
            console.print("[red]linkedin-api library not available[/red]")
            return False

        email = email or os.getenv("LINKEDIN_EMAIL")
        password = password or os.getenv("LINKEDIN_PASSWORD")

        if not email or not password:
            console.print("[red]LinkedIn credentials not found. Set LINKEDIN_EMAIL and LINKEDIN_PASSWORD[/red]")
            return False

        try:
            self.api = Linkedin(email, password)
            console.print("[green]LinkedIn authentication successful![/green]")
            return True
        except Exception as e:
            console.print(f"[red]LinkedIn auth failed: {e}[/red]")
            return False

    def load_content(self) -> list:
        """Load generated LinkedIn content"""
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
            post_id = f"linkedin_{i}"
            if post_id not in posted:
                return {"id": post_id, "index": i, **post}

        return None

    def post_to_linkedin(self, content: str, post_id: str = None) -> bool:
        """Post content to LinkedIn"""
        if not self.api:
            if not self.authenticate():
                return False

        try:
            # Add random delay to seem more human
            delay = random.randint(2, 5)
            console.print(f"[dim]Waiting {delay}s before posting...[/dim]")
            time.sleep(delay)

            # Post the content
            self.api.post(content)

            console.print("[green]Posted to LinkedIn successfully![/green]")

            if post_id:
                self.save_posted(post_id)

            return True

        except Exception as e:
            console.print(f"[red]Failed to post: {e}[/red]")
            return False

    def post_next(self) -> bool:
        """Post the next scheduled content"""
        post = self.get_next_post()

        if not post:
            console.print("[yellow]No more content to post. Generate more content.[/yellow]")
            return False

        console.print(f"\n[bold]Posting LinkedIn content #{post['index'] + 1}[/bold]")
        console.print(f"Type: {post.get('type', 'unknown')}")
        console.print(f"Topic: {post.get('topic', 'N/A')}")
        console.print("\n[dim]Preview:[/dim]")
        console.print(post['content'][:500] + "..." if len(post['content']) > 500 else post['content'])

        return self.post_to_linkedin(post['content'], post['id'])

    def show_schedule(self):
        """Show upcoming posts schedule"""
        content = self.load_content()
        posted = self.get_posted_ids()

        table = Table(title="LinkedIn Content Schedule")
        table.add_column("#", style="dim")
        table.add_column("Type")
        table.add_column("Topic")
        table.add_column("Status")
        table.add_column("Preview")

        for i, post in enumerate(content[:20]):  # Show first 20
            post_id = f"linkedin_{i}"
            status = "[green]Posted[/green]" if post_id in posted else "[yellow]Pending[/yellow]"
            preview = post['content'][:50] + "..." if len(post['content']) > 50 else post['content']
            preview = preview.replace('\n', ' ')

            table.add_row(
                str(i + 1),
                post.get('type', 'unknown'),
                post.get('topic', 'N/A')[:30] if post.get('topic') else '-',
                status,
                preview
            )

        console.print(table)

    def manual_mode(self):
        """Interactive mode - shows content and waits for manual posting"""
        console.print("\n[bold cyan]LinkedIn Manual Posting Mode[/bold cyan]")
        console.print("This mode shows you content to copy-paste to LinkedIn.\n")

        content = self.load_content()
        posted = self.get_posted_ids()

        for i, post in enumerate(content):
            post_id = f"linkedin_{i}"
            if post_id in posted:
                continue

            console.print(f"\n{'='*60}")
            console.print(f"[bold]Post #{i + 1}[/bold] - Type: {post.get('type', 'unknown')}")
            console.print(f"Topic: {post.get('topic', 'N/A')}")
            console.print(f"{'='*60}\n")

            # Handle carousel posts (JSON format)
            if post.get('type') == 'carousel' and post['content'].startswith('{'):
                try:
                    carousel = json.loads(post['content'])
                    console.print("[bold]Carousel Slides:[/bold]")
                    for j, slide in enumerate(carousel.get('slides', [])):
                        console.print(f"\n[cyan]Slide {j+1}:[/cyan] {slide}")
                    console.print(f"\n[bold]Caption:[/bold]\n{carousel.get('caption', '')}")
                except:
                    console.print(post['content'])
            else:
                console.print(post['content'])

            console.print(f"\n{'='*60}")
            response = console.input("\n[yellow]Mark as posted? (y/n/q to quit): [/yellow]")

            if response.lower() == 'y':
                self.save_posted(post_id)
                console.print("[green]Marked as posted![/green]")
            elif response.lower() == 'q':
                break

        console.print("\n[bold]Done![/bold]")


# ===========================================
# Alternative: Browser-based Automation
# ===========================================

class LinkedInBrowserAutomation:
    """
    Alternative approach using browser automation (Playwright/Selenium)
    More reliable but requires browser to be installed
    """

    def __init__(self):
        self.content_file = Path(__file__).parent.parent / "content" / "linkedin_posts.json"

    def setup_instructions(self):
        """Show instructions for browser-based posting"""
        console.print("""
[bold cyan]Browser-Based LinkedIn Posting[/bold cyan]

Since LinkedIn's API is restricted, here are your options:

[bold]Option 1: Manual Posting (Safest)[/bold]
Run: python linkedin_automation.py --manual
- Displays each post content
- You copy-paste to LinkedIn
- Mark as posted when done

[bold]Option 2: Scheduled Reminders[/bold]
Run: python scheduler.py --linkedin
- Sends you notification when it's time to post
- Opens LinkedIn in browser
- Shows content to paste

[bold]Option 3: Buffer/Hootsuite (Recommended)[/bold]
- Export posts to CSV
- Upload to Buffer (free tier: 3 channels)
- Schedule posts automatically

Run: python linkedin_automation.py --export-csv
""")


# ===========================================
# CLI Interface
# ===========================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="LinkedIn Automation")
    parser.add_argument("--manual", action="store_true", help="Manual posting mode")
    parser.add_argument("--schedule", action="store_true", help="Show posting schedule")
    parser.add_argument("--post", action="store_true", help="Post next content (auto)")
    parser.add_argument("--export-csv", action="store_true", help="Export to CSV for Buffer/Hootsuite")
    parser.add_argument("--help-options", action="store_true", help="Show automation options")

    args = parser.parse_args()

    automation = LinkedInAutomation()

    if args.manual:
        automation.manual_mode()
    elif args.schedule:
        automation.show_schedule()
    elif args.post:
        automation.post_next()
    elif args.export_csv:
        # Export to CSV
        import csv
        content = automation.load_content()
        csv_path = Path(__file__).parent.parent / "content" / "linkedin_export.csv"
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Content', 'Type', 'Topic'])
            for post in content:
                # Clean content for CSV
                clean_content = post['content'].replace('\n', '\\n')
                writer.writerow([clean_content, post.get('type', ''), post.get('topic', '')])
        console.print(f"[green]Exported to: {csv_path}[/green]")
    elif args.help_options:
        LinkedInBrowserAutomation().setup_instructions()
    else:
        # Default: show schedule
        automation.show_schedule()
        console.print("\n[dim]Run with --manual for interactive posting mode[/dim]")
