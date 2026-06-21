import re
import json

raw_path = r'scripts/statement-of-faith-raw.txt'
out_path = r'lib/statementOfFaith.ts'

with open(raw_path, encoding='utf-8') as f:
    paras = [p.strip() for p in f.read().split('---PARA---') if p.strip()]

intro = {
    'churchName': paras[0],
    'title': paras[1],
    'draftLabel': paras[2],
    'adopted': paras[3],
}

ARTICLE_TITLES = {
    1: 'The Scriptures',
    2: 'God',
    3: 'Man',
    4: 'Salvation',
    5: 'God\u2019s Purpose of Grace',
    6: 'The Church',
    7: 'Baptism and the Lord\u2019s Supper',
    8: 'The Lord\u2019s Day',
    9: 'Jews and Gentiles United in Messiah',
    10: 'The Kingdom',
    11: 'Last Things',
    12: 'Evangelism and Missions',
    13: 'Education',
    14: 'Stewardship',
    15: 'Cooperation and Mutual Commitment',
    16: 'The Christian and the Social Order',
    17: 'Peace and War',
    18: 'Religious Liberty',
    19: 'The Family',
    20: 'The Human Sexuality, Marriage, Gender Identity, And Christian Love',
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


GOD_SUBSECTION_TITLES = {
    'A.': 'God the Father',
    'B.': 'God the Son',
    'C.': 'God the Holy Spirit',
}


def split_article_start(p: str):
    m = re.match(r'^(\d+)\.\s*(.+)$', p)
    if not m:
        return None
    num = int(m.group(1))
    rest = m.group(2)
    title = ARTICLE_TITLES.get(num)
    if not title:
        return None
    if rest.startswith(title):
        body = rest[len(title) :].lstrip()
    else:
        # title may be concatenated without space (e.g. "GraceElection")
        body = rest
        for i in range(len(title), 0, -1):
            prefix = title[:i]
            if rest.startswith(prefix) and len(rest) > len(prefix):
                body = rest[len(prefix) :].lstrip()
                break
    return num, title, body


def split_letter_subsection(label: str, rest: str) -> tuple[str, str, list[str]]:
    """Return (title, body-as-paragraph-or-empty, paragraphs list)."""
    if label in GOD_SUBSECTION_TITLES:
        short = GOD_SUBSECTION_TITLES[label]
        if rest.startswith(short):
            return short, rest[len(short) :].lstrip(), []
    if ' - ' in rest:
        sub_title, sub_body = rest.split(' - ', 1)
        return sub_title.strip(), sub_body.strip(), []
    # Salvation-style: entire block is paragraph content
    if label in {'A.', 'B.', 'C.', 'D.'} and len(rest) > 60:
        return '', rest, []
    return rest, '', []


articles = []
current = None
i = 4
while i < len(paras):
    p = paras[i]
    art = split_article_start(p)
    if art:
        if current:
            articles.append(current)
        num, title, body = art
        current = {
            'number': num,
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
    elif re.match(r'^[A-D]\.\s', p):
        m = re.match(r'^([A-D])\.\s*(.+)$', p)
        label = m.group(1) + '.'
        rest = m.group(2)
        sub_title, lead, _ = split_letter_subsection(label, rest)
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

# Salvation: scripture block after D belongs to the article, not subsection D
for art in articles:
    if art['number'] == 4 and art['subsections']:
        last = art['subsections'][-1]
        if last['scriptures']:
            art['scriptures'].extend(last['scriptures'])
            last['scriptures'] = []

# Article 20: final scripture block belongs at article level
for art in articles:
    if art['number'] == 20:
        last_sub = art['subsections'][-1]
        if last_sub['title'] == 'Of Christian Love' and last_sub['paragraphs']:
            last_para = last_sub['paragraphs'][-1]
            if last_para.startswith('Genesis '):
                art['scriptures'].append(last_sub['paragraphs'].pop())

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
    f'  draftLabel: {ts_str(intro["draftLabel"])},',
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
