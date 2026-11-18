"""Gera index.html a partir do template + products.json."""
import json, html, urllib.parse, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
tpl = (ROOT / 'src/index.template.html').read_text(encoding='utf-8')
prods = json.loads((ROOT / 'src/products.json').read_text(encoding='utf-8'))

CATS = {
    'imobiliaria': 'Tinta imobiliária',
    'automotiva': 'Tinta automotiva',
    'industrial': 'Tinta industrial',
}
VISIBLE = 8


def wa(num, name):
    msg = f'Olá, WV Tintas! Gostaria de um orçamento do produto: {name}'
    return f'https://wa.me/{num}?text={urllib.parse.quote(msg)}'


panels = []
for i, (cat, label) in enumerate(CATS.items()):
    items = [p for p in prods if p['cat'] == cat]
    cards = []
    for j, p in enumerate(items):
        name = html.escape(p['name'])
        brand = html.escape(p['brand'])
        extra = ' is-extra' if j >= VISIBLE else ''
        brand_html = f'<span class="pcard__brand">{brand}</span>' if brand else ''
        cards.append(f'''   <li class="pcard{extra}" data-name="{name}" data-brand="{brand}" data-cat="{label}" data-img="assets/produtos/{p['img']}.webp">
    <button class="pcard__open" type="button" aria-label="Ver detalhes: {name}">
     <span class="pcard__img"><img src="assets/produtos/{p['img']}.webp" width="640" height="640" loading="lazy" decoding="async" alt="{name}{' – ' + brand if brand else ''}"></span>
    </button>
    <div class="pcard__body">
     {brand_html}
     <h3>{name}</h3>
     <div class="pcard__ctas">
      <button class="pcard__more" type="button">Detalhes</button>
      <a class="pcard__wa" href="{html.escape(wa('5571996546695', p['name']))}" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg>Orçamento</a>
     </div>
    </div>
   </li>''')
    hidden = '' if i == 0 else ' hidden'
    more = ''
    if len(items) > VISIBLE:
        more = f'''  <div class="panel__more"><button class="btn btn--ghost-light" type="button" data-more aria-expanded="false"><span>Ver todos os {len(items)} produtos</span><svg class="ic"><use href="#i-arrow"/></svg></button></div>\n'''
    panels.append(f'''  <div class="panel" role="tabpanel" id="cat-{cat}" aria-labelledby="tab-{cat}"{hidden}>
   <ul class="pgrid{' pgrid--3' if len(items) % 4 and len(items) % 3 == 0 else ''}">
{chr(10).join(cards)}
   </ul>
{more}  </div>''')
    tpl = tpl.replace('{{N_' + cat + '}}', str(len(items)))

out = tpl.replace('{{PRODUCTS}}', '\n'.join(panels))
(ROOT / 'index.html').write_text(out, encoding='utf-8')
print('ok', len(prods), 'produtos')
