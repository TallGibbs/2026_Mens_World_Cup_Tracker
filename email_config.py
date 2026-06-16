# Email distribution configuration for the World Cup 2026 tracker.
#
# These are plain, importable variables so a future standalone sender script
# (run on its own, e.g. from a cron job) can pick them up with:
#
#     from email_config import RECIPIENTS, SUBJECT, ATTACHMENT
#
# The daily Claude Code routine also reads RECIPIENTS from here when it emails
# the refreshed tracker, so this file is the single source of truth for who the
# update goes to. Edit this list to change the distribution.

# Who the daily tracker email goes to.
RECIPIENTS = [
    "cagibbs@mtu.edu",     # Chris (personal)
    "hkalaghe@gmail.com",  # Hilary
]

# Subject line for the daily email. A sender script may append the date.
SUBJECT = "World Cup 2026 Tracker - Daily Update"

# The file to send. It is self-contained HTML, so it can be attached as a file
# and/or inlined as the HTML body of the message.
ATTACHMENT = "world_cup_tracker.html"
