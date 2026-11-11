# render-cv.py — ATS-friendly single-column CV, generated from the site's own
# author data (scripts/gen-cv.mjs dumps /tmp/cv-data.json). Follows the pdf
# skill resume brief: A4, 1.5cm margins, FreeSerif, name 24pt, sections 13pt,
# body 10pt (floor 9pt), HRFlowable separators, no photos/graphics.
# Palette values came from `pdf.py palette.cascade` (no manual hex picking).
import json

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

# ── palette.cascade output (Abu Md. Moniruzjaman — Curriculum Vitae, minimal) ──
ACCENT = colors.HexColor("#927520")
TEXT_PRIMARY = colors.HexColor("#1b1a18")
TEXT_MUTED = colors.HexColor("#89877f")

# ── fonts ──
pdfmetrics.registerFont(TTFont("FreeSerif", "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Bold", "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-Italic", "/usr/share/fonts/truetype/freefont/FreeSerifItalic.ttf"))
pdfmetrics.registerFont(TTFont("FreeSerif-BoldItalic", "/usr/share/fonts/truetype/freefont/FreeSerifBoldItalic.ttf"))
registerFontFamily(
    "FreeSerif", normal="FreeSerif", bold="FreeSerif-Bold", italic="FreeSerif-Italic", boldItalic="FreeSerif-BoldItalic"
)

data = json.load(open("/tmp/cv-data.json"))
a = data["author"]
fig = data["figures"]
stats = data["stats"]
c = data["contact"]

name_style = ParagraphStyle("Name", fontName="FreeSerif", fontSize=24, leading=28, alignment=TA_CENTER, spaceAfter=2, textColor=TEXT_PRIMARY)
contact_style = ParagraphStyle("Contact", fontName="FreeSerif", fontSize=10, leading=14, alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=8)
section_title_style = ParagraphStyle("SectionTitle", fontName="FreeSerif", fontSize=13, leading=16, spaceBefore=6, spaceAfter=4, textColor=ACCENT)
job_title_style = ParagraphStyle("JobTitle", fontName="FreeSerif", fontSize=11, leading=14, spaceAfter=1, textColor=TEXT_PRIMARY)
job_meta_style = ParagraphStyle("JobMeta", fontName="FreeSerif", fontSize=10, leading=12.5, textColor=TEXT_MUTED, spaceAfter=2)
bullet_style = ParagraphStyle("Bullet", fontName="FreeSerif", fontSize=10, leading=12.5, leftIndent=14, spaceBefore=1, spaceAfter=1, textColor=TEXT_PRIMARY)
body_style = ParagraphStyle("Body", fontName="FreeSerif", fontSize=10, leading=12.5, spaceAfter=2, textColor=TEXT_PRIMARY)


def section_header(title):
    return [
        Paragraph(f"<b>{title}</b>", section_title_style),
        HRFlowable(width="100%", thickness=0.8, color=ACCENT, spaceBefore=0, spaceAfter=4),
    ]


story = []

# ── header ──
story.append(Paragraph(f"<b>{a['name'].upper()}</b>", name_style))
story.append(
    Paragraph(
        f"{a['role']} · {a['org']}",
        ParagraphStyle("Tagline", parent=contact_style, textColor=TEXT_PRIMARY, spaceAfter=1),
    )
)
story.append(
    Paragraph(
        f"{c['email']}  |  {c['location']}  |  {c['github']}  |  {c['linkedin']}",
        contact_style,
    )
)

# ── summary ──
story.extend(section_header("PROFESSIONAL SUMMARY"))
story.append(
    Paragraph(
        f"Civil servant in Bangladesh's {a['cadre']} with {fig['yearsField']} years of field extension "
        f"across {fig['postings']} postings — haor wetlands, hill tracts and today's district leadership in Kurigram. "
        f"{a['vision']} Alongside the day job I build and ship public digital tools: {stats['publishedTools']} works "
        f"published to date, serving farmers and field officers without login, API key or cost.",
        body_style,
    )
)

# ── experience ──
story.extend(section_header("WORK EXPERIENCE"))
for job in a["career"]:
    dates = f"{job['from']} – {job['to']}" if job["from"] != job["to"] else job["from"]
    story.append(Paragraph(f"<b>{job['role']}</b>", job_title_style))
    story.append(Paragraph(f"{job['place']}  |  {dates}", job_meta_style))
    story.append(Paragraph(f"• {job['note']}", bullet_style))
    story.append(Spacer(1, 2))

# ── education ──
story.extend(section_header("EDUCATION"))
for e in a["education"]:
    story.append(Paragraph(f"<b>{e['degree']}, {e['field']}</b>", job_title_style))
    story.append(Paragraph(f"{e['org']}  |  {e['year']}  |  {e['detail']}", job_meta_style))
    story.append(Spacer(1, 2))

# ── skills ──
story.extend(section_header("COMPETENCIES"))
for group in a["competencies"]:
    story.append(Paragraph(f"<b>{group['group']}:</b>  {', '.join(group['items'])}", body_style))

doc = SimpleDocTemplate(
    "public/cv.pdf",
    pagesize=A4,
    leftMargin=1.5 * cm,
    rightMargin=1.5 * cm,
    topMargin=1.5 * cm,
    bottomMargin=1.5 * cm,
    title="Abu Md. Moniruzjaman — Curriculum Vitae",
    author=a["name"],
    subject="CV — Additional Deputy Director (Horticulture), DAE Bangladesh",
    creator="portfolio build",
)
doc.build(story)
print("public/cv.pdf written")
