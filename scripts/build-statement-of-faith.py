import json
import re

raw_path = r'scripts/statement-of-faith-raw.txt'
out_path = r'lib/statementOfFaith.ts'

with open(raw_path, encoding='utf-8') as f:
    paras = [p.strip() for p in f.read().split('---PARA---') if p.strip()]

intro = {
    'churchName': paras[0],
    'title': paras[1],
    'adopted': paras[2],
}

KNOWN_TITLES = sorted(
    [
        'The Human Sexuality, Marriage, Gender Identity, And Christian Love',
        'The Jews and Gentiles United in Messiah',
        'Cooperation and Mutual Commitment',
        'The Christian and the Social Order',
        "Baptism and the Lord\u2019s Supper",
        "God\u2019s Purpose of Grace",
        'Evangelism and Missions',
        'Jews and Gentiles United in Messiah',
        'Religious Liberty',
        'The Scriptures',
        'The Lord\u2019s Day',
        'Last Things',
        'The Kingdom',
        'The Church',
        'Stewardship',
        'Salvation',
        'Education',
        'Peace and War',
        'The Family',
        'God',
        'Man',
    ],
    key=len,
    reverse=True,
)

GOD_SUBSECTION_TITLES = {
    'A.': 'God the Father',
    'B.': 'God the Son',
    'C.': 'God the Holy Spirit',
}


def is_scripture(p: str) -> bool:
    if p.startswith('We believe'):
        return False
    if p.startswith('Scripture:'):
        return True
    if ';' in p and re.search(r'\d:\d', p) and len(p) > 80:
        return True
    if re.match(
        r'^(Genesis|Exodus|Leviticus|Deuteronomy|Joshua|Judges|Job|Psalms?|Proverbs|'
        r'Ecclesiastes|Isaiah|Jeremiah|Ezekiel|Daniel|Joel|Amos|Micah|Zephaniah|Malachi|'
        r'Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|'
        r'Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation|I |1 |2 )',
        p,
    ):
        if re.search(r'\d:\d', p):
            return True
    return False


def extract_title_and_body(rest: str) -> tuple[str, str] | None:
    for title in KNOWN_TITLES:
        if rest == title:
            return title, ''
        if rest.startswith(title):
            return title, rest[len(title) :].lstrip()
    return None


def split_article_start(p: str):
    m = re.match(r'^\d+\.\s*(.+)$', p)
    if not m:
        return None
    return extract_title_and_body(m.group(1))


def split_letter_subsection(label: str, rest: str) -> tuple[str, str]:
    if label in GOD_SUBSECTION_TITLES:
        short = GOD_SUBSECTION_TITLES[label]
        if rest.startswith(short):
            return short, rest[len(short) :].lstrip()
    if ' - ' in rest:
        sub_title, sub_body = rest.split(' - ', 1)
        return sub_title.strip(), sub_body.strip()
    if label in {'A.', 'B.', 'C.', 'D.', 'E.'} and len(rest) > 60:
        return '', rest
    return rest, ''


def merge_continuations(paragraphs: list[str]) -> list[str]:
    merged: list[str] = []
    for para in paragraphs:
        if not para:
            continue
        if merged and (
            not merged[-1].rstrip().endswith(('.', '!', '?', ':'))
            or para[0].islower()
            or merged[-1].rstrip().endswith((' the', ' of the', ' in the', ' to the'))
        ):
            merged[-1] = merged[-1].rstrip() + ' ' + para.lstrip()
        else:
            merged.append(para)
    return merged


articles = []
current = None
article_counter = 0
i = 3
while i < len(paras):
    p = paras[i]
    art = split_article_start(p)
    if art:
        if current:
            articles.append(current)
        title, body = art
        article_counter += 1
        current = {
            'number': article_counter,
            'title': title,
            'paragraphs': [body] if body else [],
            'subsections': [],
            'scriptures': [],
        }
        i += 1
        continue

    if current is None:
        i += 1
        continue

    if p.startswith('The Fall and the First Promise'):
        title_part, body_part = p.split(' - ', 1)
        current['subsections'].append(
            {
                'label': '',
                'title': title_part.strip(),
                'paragraphs': [body_part.strip()],
                'scriptures': [],
            }
        )
    elif re.match(r'^[A-E]\.\s', p):
        m = re.match(r'^([A-E])\.\s*(.+)$', p)
        label = m.group(1) + '.'
        rest = m.group(2)
        sub_title, lead = split_letter_subsection(label, rest)
        paragraphs = [lead] if lead else []
        current['subsections'].append(
            {
                'label': label,
                'title': sub_title,
                'paragraphs': paragraphs,
                'scriptures': [],
            }
        )
    elif p.startswith('Of ') and p.endswith(':'):
        current['subsections'].append(
            {
                'label': '',
                'title': p.rstrip(':'),
                'paragraphs': [],
                'scriptures': [],
            }
        )
    elif is_scripture(p):
        scripture_text = p.replace('Scripture: ', '').replace('Scripture:', '').strip()
        if current['subsections']:
            current['subsections'][-1]['scriptures'].append(scripture_text)
        else:
            current['scriptures'].append(scripture_text)
    else:
        if current['subsections']:
            current['subsections'][-1]['paragraphs'].append(p)
        else:
            current['paragraphs'].append(p)
    i += 1

if current:
    articles.append(current)

for art in articles:
    art['paragraphs'] = merge_continuations(art['paragraphs'])
    for sub in art['subsections']:
        sub['paragraphs'] = merge_continuations(sub['paragraphs'])

for art in articles:
    if art['title'] == 'Salvation' and art['subsections']:
        last = art['subsections'][-1]
        if last['scriptures']:
            art['scriptures'].extend(last['scriptures'])
            last['scriptures'] = []

for art in articles:
    if art['title'] == 'The Human Sexuality, Marriage, Gender Identity, And Christian Love':
        last_sub = art['subsections'][-1] if art['subsections'] else None
        if last_sub and last_sub['title'] == 'Of Christian Love' and last_sub['scriptures']:
            art['scriptures'].extend(last_sub['scriptures'])
            last_sub['scriptures'] = []

for art in articles:
    for sub in art['subsections']:
        merged = []
        for para in sub['paragraphs']:
            if merged and merged[-1].endswith('(Psalm'):
                merged[-1] = merged[-1] + ' ' + para
            else:
                merged.append(para)
        sub['paragraphs'] = merged


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


lines = [
    'export interface FaithSubsection {',
    '  label: string;',
    '  title: string;',
    '  paragraphs: string[];',
    '  scriptures: string[];',
    '}',
    '',
    'export interface FaithArticle {',
    '  number: number;',
    '  title: string;',
    '  paragraphs: string[];',
    '  subsections: FaithSubsection[];',
    '  scriptures: string[];',
    '}',
    '',
    'export const STATEMENT_OF_FAITH_INTRO = {',
    f'  churchName: {ts_str(intro["churchName"])},',
    f'  title: {ts_str(intro["title"])},',
    f'  adopted: {ts_str(intro["adopted"])},',
    '} as const;',
    '',
    'export const STATEMENT_OF_FAITH_ARTICLES: FaithArticle[] = [',
]

for art in articles:
    lines.append('  {')
    lines.append(f'    number: {art["number"]},')
    lines.append(f'    title: {ts_str(art["title"])},')
    lines.append(
        f'    paragraphs: [{", ".join(ts_str(p) for p in art["paragraphs"])}],'
    )
    lines.append('    subsections: [')
    for sub in art['subsections']:
        lines.append('      {')
        lines.append(f'        label: {ts_str(sub["label"])},')
        lines.append(f'        title: {ts_str(sub["title"])},')
        lines.append(
            f'        paragraphs: [{", ".join(ts_str(p) for p in sub["paragraphs"])}],'
        )
        lines.append(
            f'        scriptures: [{", ".join(ts_str(s) for s in sub["scriptures"])}],'
        )
        lines.append('      },')
    lines.append('    ],')
    lines.append(
        f'    scriptures: [{", ".join(ts_str(s) for s in art["scriptures"])}],'
    )
    lines.append('  },')

lines.append('];')
lines.append('')

with open(out_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'Generated {len(articles)} articles')
for art in articles:
    print(f'  {art["number"]}. {art["title"]}')
