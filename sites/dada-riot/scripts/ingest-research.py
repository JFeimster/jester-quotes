"""Normalize the three supplied markdown files without copying their prose or images.

Usage: python scripts/ingest-research.py <source-directory>
"""
import json
import re
import sys
from pathlib import Path

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / 'src' / 'data'
for document in ('Archetypes.md', 'Examples of Jesters in Media.md', 'Examples of Jester Brands.md'):
    if not (source / document).is_file():
        raise SystemExit(f'Missing source document: {source / document}')
SOURCE_URLS = {
    'Archetypes.md': 'https://stottilien.com/2013/04/03/crazy-wisdom-the-archetype-of-the-fool-the-clown-the-jester-and-the-trickster/',
    'Examples of Jesters in Media.md': 'https://arielhudnall.com/2015/09/06/archetypes-jester/',
    'Examples of Jester Brands.md': 'https://astute.co/resource/brand-archetypes-the-jester/',
}

def base(slug, name, document, summary, tags):
    return dict(id=slug, slug=slug, name=name, summary=summary, description=summary,
                tags=tags, source_document=document, sources=[SOURCE_URLS[document]],
                verification_status='source_interpretation', publication_status='published',
                related_quote_ids=[], related_trickster_ids=[], related_collection_slugs=[])

archetype_notes = [
    ('clown', 'Clown', 'The source frames the clown as a performer whose comic failures expose shared vulnerability and the masks of daily life.', ['performance','humor','vulnerability'], ['Visible failure invites empathy','Mime can carry criticism without words','The mask exposes ordinary social masks'], 'Jester', 'The author points to Charlie Chaplin’s wordless performance as a way comedy can show the awkwardness of modern life. In this account the clown also carries sorrow: laughter and failure make private feelings visible. This is the author’s reading of a flexible performance tradition.'),
    ('jester', 'Jester', 'The source frames the jester as a verbal performer who uses wit to challenge powerful people from within their circle.', ['wit','court','power'], ['Words and timing do the work','Access to authority creates opportunity','The performer remains dependent on the court'], 'Fool', 'The article places the jester in the setting of medieval courts and describes a performer who could entertain while speaking uncomfortable truths. It also stresses a tension: a jester’s access and livelihood depended on the same power being criticized. The court setting is a historical frame in the source, not a claim that all jesters held the same freedom.'),
    ('fool', 'Fool', 'The source describes the fool as an outsider who can unsettle accepted rules through paradox, play, and difficult truths.', ['paradox','play','outsider'], ['Paradox unsettles certainty','Play makes difficult ideas approachable','The outsider role permits sharp questions'], 'Clown', 'The author uses the wise or sacred fool to discuss rule breaking and change. Religious figures and traditions appear as the author’s analogies, not as a universal classification of those figures. In this framework, the fool’s apparently unserious position can make a serious challenge easier to hear.'),
    ('trickster', 'Trickster', 'The source presents the trickster as an ambiguous agent of mischief and change whose actions can help and harm.', ['mischief','change','ambiguity'], ['Deception disrupts expectations','Change has mixed consequences','Stories differ by culture and teller'], 'Jester', 'The article names Coyote and Raven among examples from different storytelling traditions. It treats transformation as central, but its broad comparisons should not erase the distinct origins and meanings of those stories. The related Trickster profiles below give more specific cultural context and their own sources.'),
]
archetypes = []
archetype_text = (source / 'Archetypes.md').read_text(encoding='utf-8')
for slug, name, summary, tags, characteristics, compare, context in archetype_notes:
    if not re.search(r'^#{5}\s+(?:The\s+)?' + re.escape(name) + r'\s*$', archetype_text, re.I | re.M):
        raise SystemExit(f'Archetype absent from supplied source: {name}')
    item = base(slug, name, 'Archetypes.md', summary, tags)
    item.update(characteristics=characteristics, adjacent_archetype=compare.lower(), context=context)
    item['related_collection_slugs'] = {'fool':['wise-fools'], 'jester':['truth-to-power','art-of-the-jester']}.get(slug, [])
    item['related_trickster_ids'] = ['trickster-coyote','trickster-raven-tlingit'] if slug == 'trickster' else []
    archetypes.append(item)

media_rows = [
    ('Fat Amy','Pitch Perfect','Film','Humor challenges expectations about confidence and protects her from intimacy.'),
    ('Kamala Khan','Ms. Marvel','Comics','Wisecracks help her navigate family tension, friendship, and new powers.'),
    ('Beetlejuice','Beetlejuice','Film','The source reads his unruly pursuit of life as an extreme jester portrayal.'),
    ('Austin Powers','Austin Powers','Film','A self-serious spy whose comic mismatch with reality drives the satire.'),
    ('Leslie Chow','The Hangover','Film','A chaotic ally whose appetite for the moment disrupts the group.'),
    ('Genie','Aladdin','Film','Comic invention and guidance accompany his desire for freedom.'),
    ('Dusty','Twister','Film','Enthusiasm and jokes lighten the tornado-chasing crew’s dangerous work.'),
    ('TARS','Interstellar','Film','A robot whose adjustable humor offers relief during a difficult mission.'),
    ('Harley Quinn','DC Comics','Comics','The source interprets her jokes as a defense in painful relationships.'),
    ('Weasley Twins','Harry Potter','Literature','Fred and George use pranks to create joy and resist routine.'),
    ('C-3PO','Star Wars','Film','The source classifies the protocol droid as closer to a fool than a jester.'),
    ('Merry and Pippin','The Lord of the Rings','Literature','The source highlights the hobbits’ lighthearted companionship.'),
    ('Random','The Great Book of Amber','Literature','The source reads a playful contender for power as a jester who becomes a ruler.'),
    ('Gambit','X-Men','Comics','The source interprets humor as a shield around a troubled past.'),
    ('Skeleton','The Last Unicorn','Film','A riddle-loving former king is read as a jester guarding a passage.'),
    ('Puck','A Midsummer Night’s Dream','Literature',None),
    ('Dory','Finding Nemo','Film',None),
    ('Edith Bunker','All in the Family','Television',None),
    ('Buddy','Elf','Film',None),
    ('Megan','Bridesmaids','Film',None),
    ('Kramer','Seinfeld','Television',None),
    ('Joey','Friends','Television',None),
    ('The Iguana','Tangled','Film',None),
    ('The Carpet','Aladdin','Film',None),
]
media = []
media_text = (source / 'Examples of Jesters in Media.md').read_text(encoding='utf-8')
for name, work, medium, summary in media_rows:
    source_alias = {'C-3PO':'C3P0', 'Dory':'Dori', 'The Iguana':'The Iguana', 'The Carpet':'The Carpet'}.get(name, name)
    if source_alias.lower() not in media_text.lower():
        raise SystemExit(f'Media character absent from supplied source: {name}')
    slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    item = base(slug, name, 'Examples of Jesters in Media.md', summary or f'{name} is named in the supplied research as a possible jester example. Further editorial research is needed.', [medium.lower()])
    item.update(character=name, originating_work=work, medium=medium,
                character_type='fool' if name == 'C-3PO' else 'jester interpretation',
                publication_status='published' if summary else 'draft',
                verification_status='source_interpretation' if summary else 'needs_enrichment')
    media.append(item)

brand_rows = [
    ('m-and-ms', 'M&M’s', 'Character-led situational humor makes ordinary candy advertising playful.', 'The source discusses the Red and Yellow characters and an older slogan.'),
    ('geico', 'GEICO', 'Comic changes of perspective make insurance advertising entertaining.', 'The source points to humorous treatments of ordinary situations.'),
    ('old-spice', 'Old Spice', 'Absurd scenes and rapid shifts of reality are the source’s central examples.', 'The source refers to centaurs, comedians, and surreal campaigns without dates.'),
    ('taco-bell', 'Taco Bell', 'Small humorous touches are read as a consistent playful brand voice.', 'The source mentions sauce packets and party packs.'),
]
brands = []
brand_text = (source / 'Examples of Jester Brands.md').read_text(encoding='utf-8')
for slug, name, summary, example in brand_rows:
    if name.lower().replace('’','').replace('&','').replace('’','')[:3] not in brand_text.lower().replace('\\','').replace('’','').replace('&',''):
        raise SystemExit(f'Brand absent from supplied source: {name}')
    item = base(slug, name, 'Examples of Jester Brands.md', summary, ['brand','humor'])
    item.update(jester_characteristics=[summary], historical_examples=[example],
                attribution='Supplied research, citing Astute; historical examples are not verified current strategy.')
    brands.append(item)

for filename, rows in [('archetypes.json',archetypes),('jesters-in-media.json',media),('jester-brands.json',brands)]:
    (target / filename).write_text(json.dumps(rows, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
notes = [{'id':'actor-wide-claim', 'source_document':'Examples of Jesters in Media.md', 'source_url':SOURCE_URLS['Examples of Jesters in Media.md'], 'kind':'editorial_note', 'publication_status':'draft', 'note':'The source broadly suggests that roles played by several comic actors fit the archetype. This is not a single character identity and needs title-by-title review.'}]
(target / 'jesters-in-media-notes.json').write_text(json.dumps(notes, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Wrote {len(archetypes)} archetypes, {len(media)} media characters ({sum(x["publication_status"] == "draft" for x in media)} drafts), {len(brands)} brands.')
