# Marketing Automation for ResumeBuilder AI

Automated 30-day marketing system for LinkedIn, YouTube, Telegram, and Email.

## Quick Start

```bash
# 1. Install dependencies
cd marketing
pip install -r requirements.txt

# 2. Configure API keys
cp .env.example .env
# Edit .env with your OpenAI API key

# 3. Generate 30 days of content
python run.py generate

# 4. Start posting
python run.py
```

## What's Included

| Platform | Content | Automation Level |
|----------|---------|------------------|
| LinkedIn | 56 posts (2/day) | Manual (safe) |
| YouTube | 28 scripts (1/day) | Manual |
| Telegram | 84 posts (3/day) | Fully automated |
| Email | 3 sequences | Fully automated |

## Folder Structure

```
marketing/
├── run.py                      # Main entry point
├── requirements.txt            # Python dependencies
├── .env.example               # API key template
│
├── scripts/                    # Automation scripts
│   ├── content_generator.py   # AI content generation
│   ├── linkedin_automation.py # LinkedIn posting
│   ├── telegram_bot.py        # Telegram automation
│   ├── email_automation.py    # Email sequences
│   └── scheduler.py           # Task scheduler
│
├── content/                    # Generated content (after running generate)
│   ├── all_content.json       # Everything
│   ├── linkedin_posts.json    # LinkedIn posts
│   ├── youtube_scripts.json   # YouTube Short scripts
│   ├── telegram_posts.json    # Telegram posts
│   └── email_sequences.json   # Email templates
│
├── data/                       # Tracking data
│   ├── calendar.json          # 30-day schedule
│   ├── linkedin_posted.json   # Posted content tracking
│   ├── telegram_posted.json
│   └── subscribers.json       # Email subscribers
│
├── config/                     # Configuration
│   └── settings.py            # All settings
│
└── templates/                  # (Optional) Custom templates
```

## Commands

### Main Entry Point
```bash
python run.py              # Interactive menu
python run.py generate     # Generate all content
python run.py schedule     # View today's tasks
python run.py linkedin     # LinkedIn posting mode
python run.py telegram     # Telegram posting
python run.py email        # Email management
python run.py run          # Start automation daemon
python run.py setup        # Show setup guide
```

### Individual Scripts

**Content Generator:**
```bash
cd scripts
python content_generator.py                    # Generate all
python content_generator.py --platform linkedin --week 1
python content_generator.py --platform youtube --type tip --topic "ATS tips"
```

**LinkedIn:**
```bash
python linkedin_automation.py --manual     # Interactive posting mode
python linkedin_automation.py --schedule   # View schedule
python linkedin_automation.py --export-csv # Export for Buffer/Hootsuite
```

**Telegram:**
```bash
python telegram_bot.py --setup     # Setup instructions
python telegram_bot.py --test      # Send test message
python telegram_bot.py --post      # Post next content
python telegram_bot.py --batch 3   # Post 3 messages with delays
```

**Email:**
```bash
python email_automation.py --setup              # Setup instructions
python email_automation.py --add email@test.com # Add subscriber
python email_automation.py --process            # Process sequences
python email_automation.py --test email@test.com
```

**Scheduler:**
```bash
python scheduler.py --today      # Today's tasks
python scheduler.py --week 1     # Week overview
python scheduler.py --generate   # Generate new calendar
python scheduler.py --run        # Run daemon
```

## Setup Guide

### 1. OpenAI API Key (Required)

Get from: https://platform.openai.com/api-keys

```env
OPENAI_API_KEY=sk-your-key-here
```

Cost estimate: ~$2-5 to generate 30 days of content (using gpt-4o-mini)

### 2. Telegram Bot (For auto-posting)

1. Open Telegram, search for @BotFather
2. Send `/newbot` and follow prompts
3. Copy the token
4. Create a channel and add bot as admin

```env
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=@your_channel_name
```

### 3. Email - Resend (Free: 100 emails/day)

Get from: https://resend.com

```env
RESEND_API_KEY=re_your-key-here
FROM_EMAIL=hello@yourdomain.com
```

### 4. LinkedIn (Manual recommended)

LinkedIn heavily restricts automation. Options:

1. **Manual mode (recommended)**: Run `--manual`, copy-paste content
2. **Buffer/Hootsuite**: Export to CSV, upload to scheduling tool
3. **API (risky)**: Use unofficial library (may get banned)

## 30-Day Content Calendar

### Week 1: Foundation
- LinkedIn: 2 posts/day (tips, founder story)
- YouTube: 1 short/day (resume mistakes, hacks)
- Telegram: 3 posts/day (tips, motivation, facts)
- Email: Welcome sequence for new signups

### Week 2: Amplify
- LinkedIn: Carousels, case studies
- YouTube: ATS tutorials, myth busting
- Telegram: Resources, job market insights
- Email: Educational content

### Week 3: Scale
- LinkedIn: Hot takes, engagement polls
- YouTube: Before/after comparisons
- Telegram: User success stories
- Email: Soft pitch for paid features

### Week 4: Convert
- LinkedIn: Social proof, testimonials
- YouTube: Full tutorials
- Telegram: Limited offers, urgency
- Email: Win-back inactive users

## Content Types Generated

### LinkedIn
- **Carousel**: 10-slide educational posts
- **Tips**: Numbered actionable tips
- **Story**: Founder journey posts
- **Myth Buster**: Myth vs Reality format
- **Hot Take**: Opinionated discussions
- **Case Study**: User success stories

### YouTube Shorts
- **Mistake**: "X mistakes to avoid"
- **Tip**: Quick actionable tips
- **Hack**: 2-minute hacks
- **Myth**: Myth busting
- **Comparison**: Before vs After

### Telegram
- **Tip**: Quick resume tips
- **Motivation**: Job seeker encouragement
- **Fact**: Industry statistics
- **Resource**: Free tools and resources

### Email Sequences
- **Welcome**: 4-email onboarding (Days 1, 3, 5, 7)
- **Educational**: 3 deep-dive emails
- **Win-back**: 2 re-engagement emails

## Automation Schedule

| Time (IST) | Platform | Action |
|------------|----------|--------|
| 09:00 | LinkedIn | Post reminder |
| 10:00 | Telegram | Auto-post |
| 10:30 | Email | Process sequences |
| 15:00 | Telegram | Auto-post |
| 17:30 | YouTube | Post reminder |
| 18:00 | LinkedIn | Post reminder |
| 20:00 | Telegram | Auto-post |

## Tips for Success

1. **Quality over quantity**: Review AI content before posting
2. **Engage manually**: Reply to comments on LinkedIn
3. **Track metrics**: Note what content performs best
4. **Iterate**: Regenerate underperforming content types
5. **Be consistent**: Stick to the schedule for 30 days

## Troubleshooting

**"OpenAI API key not found"**
- Ensure `.env` file exists with `OPENAI_API_KEY=sk-...`
- Run from the `marketing` directory

**"No content found"**
- Run `python run.py generate` first

**"Telegram post failed"**
- Check bot token is correct
- Ensure bot is admin in channel
- Channel ID should start with @ or be numeric

**"Email not sent"**
- Verify Resend API key
- Check domain is verified in Resend dashboard

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| OpenAI | - | ~$2-5/month |
| Telegram | Unlimited | Free |
| Resend | 100 emails/day | $20/month for 50k |
| Buffer | 3 channels | $15/month |

**Total minimum cost: ~$5/month** (just OpenAI for content generation)

## License

Internal use only. Part of ResumeBuilder AI.
