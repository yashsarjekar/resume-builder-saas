"""
AI Content Generator for Marketing Automation
Generates LinkedIn posts, YouTube scripts, Email templates, Telegram posts
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent to path
sys.path.append(str(Path(__file__).parent.parent))

from openai import OpenAI
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()

# ===========================================
# Content Generation Prompts
# ===========================================

LINKEDIN_SYSTEM_PROMPT = """You are a LinkedIn content expert specializing in career advice for Indian job seekers.

TARGET AUDIENCE:
- Indian students, freshers, and young professionals (18-30 years)
- People preparing for campus placements at TCS, Infosys, Wipro, Cognizant, Accenture
- Tier 1 and Tier 2 city job seekers
- People who struggle with resume writing and ATS systems

WRITING STYLE:
- Use simple English (mix Hindi words occasionally for relatability)
- Be authentic and founder-led (speak as Yash, solo founder)
- Use emojis sparingly (2-3 per post max)
- Include actionable tips, not just motivation
- Reference Indian context (placement season, service companies, salary expectations)

PRODUCT TO PROMOTE (subtle, not salesy):
- ResumeBuilder AI: https://resumebuilder.pulsestack.in
- Free ATS Score Checker
- AI-powered resume optimization
- Pricing: Free tier, Starter ₹299, Pro ₹999/month

RULES:
- Never be salesy or pushy
- Provide genuine value first
- Mention product only in 1 out of 3 posts (as a helpful tool, not ad)
- Use line breaks for readability
- End with engagement hook (question or CTA)
"""

YOUTUBE_SYSTEM_PROMPT = """You are a YouTube Shorts script writer for an Indian career advice channel.

TARGET: Indian freshers and students preparing for jobs

FORMAT:
- 60 seconds max (about 150 words)
- Hook in first 3 seconds
- One clear tip/insight
- Visual cues in [brackets]
- End with CTA

STYLE:
- Casual, energetic
- Hinglish acceptable
- Relatable examples (TCS interview, placement season)
- Quick cuts, high energy

PRODUCT: ResumeBuilder AI (mention only if relevant, not forced)
"""

TELEGRAM_SYSTEM_PROMPT = """You are writing short, valuable posts for a Telegram channel about resume tips for Indian job seekers.

FORMAT:
- 50-150 words
- Use emojis for visual breaks
- One clear takeaway
- Include link when relevant

STYLE:
- Friendly, helpful
- Like a friend giving advice
- Mix of tips, job alerts style content, motivation
"""

EMAIL_SYSTEM_PROMPT = """You are writing email sequences for ResumeBuilder AI targeting Indian job seekers.

GOAL: Nurture free users to become paying customers

STYLE:
- Personal, from founder (Yash)
- Short paragraphs
- Clear CTA
- Mobile-friendly formatting

TYPES:
- Welcome sequence (Days 1, 3, 5, 7)
- Educational tips
- Soft pitch for paid features
- Win-back for inactive users
"""


class ContentGenerator:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY env var.")
        self.client = OpenAI(api_key=self.api_key)
        self.content_dir = Path(__file__).parent.parent / "content"
        self.content_dir.mkdir(exist_ok=True)

    def _generate(self, system_prompt: str, user_prompt: str, max_tokens: int = 1000) -> str:
        """Generate content using OpenAI"""
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-effective for content generation
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.8
        )
        return response.choices[0].message.content

    # ===========================================
    # LinkedIn Content
    # ===========================================

    def generate_linkedin_post(self, post_type: str, topic: str = None) -> dict:
        """Generate a single LinkedIn post"""
        prompts = {
            "carousel": f"""Create a LinkedIn carousel post (10 slides) about: {topic or 'resume tips for freshers'}

Format:
Slide 1: Hook/Title (catchy, curiosity-inducing)
Slides 2-9: One tip per slide with brief explanation
Slide 10: Summary + CTA

Return as JSON:
{{"title": "...", "slides": ["slide1", "slide2", ...], "caption": "post caption with hashtags"}}""",

            "tips": f"""Create a LinkedIn tips post about: {topic or 'resume mistakes freshers make'}

Format:
- Hook line
- 5-7 numbered tips
- Closing thought
- Hashtags

Return as plain text, ready to post.""",

            "story": """Create a founder story post about building ResumeBuilder AI.

Include:
- Why I built this (personal struggle or observation)
- One specific insight about Indian job market
- What I learned
- Subtle mention of the tool

Return as plain text, ready to post.""",

            "myth_buster": f"""Create a "Myth vs Reality" LinkedIn post about: {topic or 'ATS systems'}

Format:
❌ Myth: [common misconception]
✅ Reality: [truth with explanation]

Include 3-4 myths. End with actionable advice.
Return as plain text.""",

            "hot_take": f"""Create a slightly controversial/hot take LinkedIn post about: {topic or 'Indian placement process'}

Rules:
- Be opinionated but not offensive
- Back it up with reasoning
- Invite discussion
- Keep it professional

Return as plain text.""",

            "case_study": """Create a fictional but realistic case study post about a fresher who improved their resume.

Format:
- Situation (struggling to get callbacks)
- What they changed (specific resume improvements)
- Result (got interviews at X companies)
- Key takeaways

Don't mention specific real companies as the success. Return as plain text.""",
        }

        prompt = prompts.get(post_type, prompts["tips"])
        content = self._generate(LINKEDIN_SYSTEM_PROMPT, prompt)

        return {
            "type": post_type,
            "content": content,
            "topic": topic,
            "generated_at": datetime.now().isoformat(),
            "platform": "linkedin"
        }

    def generate_linkedin_week(self, week_num: int = 1) -> list:
        """Generate a week's worth of LinkedIn posts (14 posts for 2x daily)"""
        topics = [
            ("tips", "5 resume mistakes that get you rejected by ATS"),
            ("carousel", "How to write a professional summary that stands out"),
            ("story", None),
            ("myth_buster", "common resume myths freshers believe"),
            ("tips", "Keywords to include for IT/software jobs"),
            ("hot_take", "Why most resume templates are useless"),
            ("case_study", None),
            ("tips", "How to show projects on resume without work experience"),
            ("carousel", "Resume vs CV vs Biodata - What Indian companies want"),
            ("myth_buster", "LinkedIn profile myths"),
            ("tips", "How to tailor resume for TCS/Infosys/Wipro"),
            ("story", None),
            ("tips", "Cover letter tips for freshers"),
            ("carousel", "Complete resume checklist before applying"),
        ]

        posts = []
        start_idx = (week_num - 1) * 14
        week_topics = topics[start_idx:start_idx + 14] if start_idx < len(topics) else topics[:14]

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Generating Week {week_num} LinkedIn posts...", total=len(week_topics))

            for post_type, topic in week_topics:
                post = self.generate_linkedin_post(post_type, topic)
                post["week"] = week_num
                posts.append(post)
                progress.update(task, advance=1)

        return posts

    # ===========================================
    # YouTube Shorts Scripts
    # ===========================================

    def generate_youtube_short(self, short_type: str, topic: str = None) -> dict:
        """Generate a YouTube Shorts script"""
        prompts = {
            "mistake": f"""Write a 60-second YouTube Short script about: {topic or '3 resume mistakes freshers make'}

Format:
[HOOK - 3 sec] Attention-grabbing opening
[CONTENT - 50 sec] Main points with visual cues
[CTA - 7 sec] Subscribe + link to tool

Include [VISUAL] cues for b-roll/text overlay.
Keep it punchy, quick cuts style.""",

            "tip": f"""Write a 60-second YouTube Short about: {topic or 'One resume tip that gets more interviews'}

Format:
[HOOK] Start with result/benefit
[TIP] Explain the technique
[EXAMPLE] Quick example
[CTA] Try it yourself

Include [VISUAL] cues.""",

            "myth": f"""Write a 60-second myth-busting YouTube Short about: {topic or 'ATS myths'}

Format:
[HOOK] "Everyone says X, but..."
[MYTH] What people believe
[TRUTH] What actually works
[CTA]

Make it snappy and surprising.""",

            "hack": f"""Write a 60-second YouTube Short about a quick hack: {topic or 'Resume hack that takes 2 minutes'}

Format:
[HOOK] Promise quick result
[HACK] Step-by-step (max 3 steps)
[RESULT] What happens
[CTA]""",
        }

        prompt = prompts.get(short_type, prompts["tip"])
        content = self._generate(YOUTUBE_SYSTEM_PROMPT, prompt, max_tokens=500)

        return {
            "type": short_type,
            "script": content,
            "topic": topic,
            "generated_at": datetime.now().isoformat(),
            "platform": "youtube_shorts",
            "duration": "60 seconds"
        }

    def generate_youtube_week(self, week_num: int = 1) -> list:
        """Generate a week's worth of YouTube Shorts (7 videos)"""
        topics = [
            ("mistake", "3 resume mistakes freshers make"),
            ("tip", "How to beat ATS in 60 seconds"),
            ("hack", "One-line resume hack for more callbacks"),
            ("myth", "Myth: You need a one-page resume"),
            ("tip", "How to show skills without experience"),
            ("mistake", "Why your resume gets rejected in 6 seconds"),
            ("hack", "Free tool to check your resume score"),
        ]

        shorts = []
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Generating Week {week_num} YouTube Shorts...", total=len(topics))

            for short_type, topic in topics:
                short = self.generate_youtube_short(short_type, topic)
                short["week"] = week_num
                short["day"] = len(shorts) + 1
                shorts.append(short)
                progress.update(task, advance=1)

        return shorts

    # ===========================================
    # Telegram Posts
    # ===========================================

    def generate_telegram_post(self, post_type: str = "tip") -> dict:
        """Generate a Telegram channel post"""
        prompts = {
            "tip": "Write a quick resume tip (100 words) for a Telegram channel. Include 1-2 relevant emojis. End with the ATS checker link.",
            "motivation": "Write a short motivational post (80 words) for job seekers facing rejection. Be empathetic, not preachy.",
            "fact": "Share an interesting fact about Indian job market or resume statistics. Keep it under 100 words.",
            "resource": "Share a helpful free resource tip (like using Google Docs for resume, or free courses). 100 words max.",
        }

        content = self._generate(TELEGRAM_SYSTEM_PROMPT, prompts.get(post_type, prompts["tip"]), max_tokens=300)

        return {
            "type": post_type,
            "content": content,
            "generated_at": datetime.now().isoformat(),
            "platform": "telegram"
        }

    def generate_telegram_week(self, week_num: int = 1) -> list:
        """Generate a week's worth of Telegram posts (21 posts for 3x daily)"""
        post_types = ["tip", "motivation", "fact", "tip", "resource", "tip", "motivation"] * 3
        posts = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Generating Week {week_num} Telegram posts...", total=len(post_types))

            for post_type in post_types:
                post = self.generate_telegram_post(post_type)
                post["week"] = week_num
                posts.append(post)
                progress.update(task, advance=1)

        return posts

    # ===========================================
    # Email Sequences
    # ===========================================

    def generate_email_sequence(self, sequence_type: str = "welcome") -> list:
        """Generate an email sequence"""
        sequences = {
            "welcome": [
                ("Day 1 - Welcome", "Write a welcome email for new signup. Thank them, tell them what to expect, give one quick win tip."),
                ("Day 3 - First Tip", "Write a follow-up with best resume tip. Ask if they've tried the ATS checker."),
                ("Day 5 - Success Story", "Share a brief success story. Mention premium features casually."),
                ("Day 7 - Soft Pitch", "Offer help, mention Starter plan benefits for serious job seekers."),
            ],
            "inactive": [
                ("Win-back", "Write an email for users inactive for 7 days. Be helpful, not pushy. Offer to help."),
                ("Last chance", "Write a final re-engagement email. Share new feature or tip."),
            ],
            "educational": [
                ("ATS Deep Dive", "Detailed email about how ATS works and how to optimize."),
                ("Interview Prep", "Email about preparing for interviews after resume is ready."),
                ("LinkedIn Tips", "Email about optimizing LinkedIn alongside resume."),
            ]
        }

        emails = []
        sequence = sequences.get(sequence_type, sequences["welcome"])

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task(f"Generating {sequence_type} email sequence...", total=len(sequence))

            for subject_hint, prompt in sequence:
                full_prompt = f"""Write an email for: {subject_hint}

Instructions: {prompt}

Format:
Subject: [compelling subject line]
Preview: [preview text, 50 chars]

[Email body - short paragraphs, mobile-friendly]

[CTA button text if applicable]

Signature:
Yash
Founder, ResumeBuilder AI
"""
                content = self._generate(EMAIL_SYSTEM_PROMPT, full_prompt, max_tokens=600)
                emails.append({
                    "sequence": sequence_type,
                    "step": subject_hint,
                    "content": content,
                    "generated_at": datetime.now().isoformat()
                })
                progress.update(task, advance=1)

        return emails

    # ===========================================
    # Full 30-Day Content Generation
    # ===========================================

    def generate_30_day_content(self) -> dict:
        """Generate all content for 30 days"""
        console.print("\n[bold green]Generating 30 Days of Marketing Content[/bold green]\n")

        all_content = {
            "generated_at": datetime.now().isoformat(),
            "linkedin": [],
            "youtube": [],
            "telegram": [],
            "emails": []
        }

        # Generate 4 weeks of content
        for week in range(1, 5):
            console.print(f"\n[bold cyan]Week {week}[/bold cyan]")

            # LinkedIn (14 posts/week)
            linkedin_posts = self.generate_linkedin_week(week)
            all_content["linkedin"].extend(linkedin_posts)

            # YouTube (7 shorts/week)
            youtube_shorts = self.generate_youtube_week(week)
            all_content["youtube"].extend(youtube_shorts)

            # Telegram (21 posts/week)
            telegram_posts = self.generate_telegram_week(week)
            all_content["telegram"].extend(telegram_posts)

        # Email sequences (one-time generation)
        console.print("\n[bold cyan]Email Sequences[/bold cyan]")
        all_content["emails"] = {
            "welcome": self.generate_email_sequence("welcome"),
            "inactive": self.generate_email_sequence("inactive"),
            "educational": self.generate_email_sequence("educational")
        }

        # Save to files
        self._save_content(all_content)

        console.print("\n[bold green]Content generation complete![/bold green]")
        console.print(f"  LinkedIn posts: {len(all_content['linkedin'])}")
        console.print(f"  YouTube scripts: {len(all_content['youtube'])}")
        console.print(f"  Telegram posts: {len(all_content['telegram'])}")
        console.print(f"  Email sequences: 3")

        return all_content

    def _save_content(self, content: dict):
        """Save generated content to JSON files"""
        # Save all content
        with open(self.content_dir / "all_content.json", "w") as f:
            json.dump(content, f, indent=2, ensure_ascii=False)

        # Save platform-specific files
        with open(self.content_dir / "linkedin_posts.json", "w") as f:
            json.dump(content["linkedin"], f, indent=2, ensure_ascii=False)

        with open(self.content_dir / "youtube_scripts.json", "w") as f:
            json.dump(content["youtube"], f, indent=2, ensure_ascii=False)

        with open(self.content_dir / "telegram_posts.json", "w") as f:
            json.dump(content["telegram"], f, indent=2, ensure_ascii=False)

        with open(self.content_dir / "email_sequences.json", "w") as f:
            json.dump(content["emails"], f, indent=2, ensure_ascii=False)

        console.print(f"\n[dim]Content saved to: {self.content_dir}[/dim]")


# ===========================================
# CLI Interface
# ===========================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Generate marketing content")
    parser.add_argument("--platform", choices=["linkedin", "youtube", "telegram", "email", "all"], default="all")
    parser.add_argument("--week", type=int, default=1, help="Week number (1-4)")
    parser.add_argument("--type", help="Content type (e.g., tips, carousel, myth)")
    parser.add_argument("--topic", help="Specific topic to generate about")

    args = parser.parse_args()

    try:
        generator = ContentGenerator()

        if args.platform == "all":
            generator.generate_30_day_content()
        elif args.platform == "linkedin":
            if args.type:
                post = generator.generate_linkedin_post(args.type, args.topic)
                console.print(post["content"])
            else:
                posts = generator.generate_linkedin_week(args.week)
                console.print(f"Generated {len(posts)} LinkedIn posts")
        elif args.platform == "youtube":
            if args.type:
                short = generator.generate_youtube_short(args.type, args.topic)
                console.print(short["script"])
            else:
                shorts = generator.generate_youtube_week(args.week)
                console.print(f"Generated {len(shorts)} YouTube scripts")
        elif args.platform == "telegram":
            posts = generator.generate_telegram_week(args.week)
            console.print(f"Generated {len(posts)} Telegram posts")
        elif args.platform == "email":
            emails = generator.generate_email_sequence("welcome")
            console.print(f"Generated {len(emails)} emails")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        raise
