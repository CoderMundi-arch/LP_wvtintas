"""Gera index.html a partir do template + products.json."""
import json, html, urllib.parse, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'index.html'
tpl = (ROOT / 'src/index.template.html').read_text(encoding='utf-8')
prods = json.loads((ROOT / 'src/products.json').read_text(encoding='utf-8'))

# categorias com painel gerado; "complementos" tem painel próprio no template
CATS = {
    'imobiliaria': 'Tinta imobiliária',
    'automotiva': 'Tinta automotiva',
    'industrial': 'Tinta industrial',
}
COMPLEMENTOS = 'Complementos e acessórios'
VISIBLE = 8


def wa(num, name):
    msg = f'Olá, WV Tintas! Gostaria de um orçamento do produto: {name}'
    return f'https://wa.me/{num}?text={urllib.parse.quote(msg)}'


def card(p, label, extra=False):
    name = html.escape(p['name'])
    brand = html.escape(p['brand'])
    tag = html.escape(p.get('tag', ''))
    chips = ''
    if brand or tag:
        chips = '<div class="pcard__chips">' + (f'<span class="pcard__brand">{brand}</span>' if brand else '') + \
                (f'<span class="pcard__tag"><svg class="ic"><use href="#i-drop"/></svg>{tag}</span>' if tag else '') + '</div>'
    return f'''   <li class="pcard{' is-extra' if extra else ''}" data-name="{name}" data-brand="{brand}" data-cat="{label}" data-tag="{tag}" data-img="assets/produtos/{p['img']}.webp">
    <button class="pcard__open" type="button" aria-label="Ver detalhes: {name}">
     <span class="pcard__img"><img src="assets/produtos/{p['img']}.webp" width="640" height="640" loading="lazy" decoding="async" alt="{name}{' – ' + brand if brand else ''}"></span>
    </button>
    <div class="pcard__body">
     {chips}
     <h3>{name}</h3>
     <div class="pcard__ctas">
      <button class="pcard__more" type="button">Detalhes</button>
      <a class="pcard__wa" href="{html.escape(wa('5571996546695', p['name']))}" target="_blank" rel="noopener"><svg class="ic"><use href="#i-wa"/></svg>Orçamento</a>
     </div>
    </div>
   </li>'''


def grid_class(n):
    return 'pgrid' + (' pgrid--3' if n % 4 and n % 3 == 0 else '')


panels = []
for i, (cat, label) in enumerate(CATS.items()):
    items = [p for p in prods if p['cat'] == cat]
    cards = [card(p, label, j >= VISIBLE) for j, p in enumerate(items)]
    hidden = '' if i == 0 else ' hidden'
    more = ''
    if len(items) > VISIBLE:
        more = f'''  <div class="panel__more"><button class="btn btn--ghost-light" type="button" data-more aria-expanded="false"><span>Ver todos os {len(items)} produtos</span><svg class="ic"><use href="#i-arrow"/></svg></button></div>\n'''
    panels.append(f'''  <div class="panel" role="tabpanel" id="cat-{cat}" aria-labelledby="tab-{cat}"{hidden}>
   <ul class="{grid_class(len(items))}">
{chr(10).join(cards)}
   </ul>
{more}  </div>''')
    tpl = tpl.replace('{{N_' + cat + '}}', str(len(items)))

comp = [p for p in prods if p['cat'] == 'complementos']
comp_html = ''
if comp:
    comp_html = f'''   <ul class="{grid_class(len(comp))} pgrid--comp">
{chr(10).join(card(p, COMPLEMENTOS) for p in comp)}
   </ul>'''
tpl = tpl.replace('{{N_complementos}}', f' <span>{len(comp)}</span>' if comp else '')
tpl = tpl.replace('{{PRODUCTS_complementos}}', comp_html)

out = tpl.replace('{{PRODUCTS}}', '\n'.join(panels))
OUT.write_text(out, encoding='utf-8')
print('ok', len(prods), 'produtos')
