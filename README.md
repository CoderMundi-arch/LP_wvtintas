# WV Tintas — site institucional

Site da **WV Tintas** (Salvador/BA): tintas imobiliárias, automotivas e industriais, complementos, abrasivos e polimento.
HTML, CSS e JavaScript estáticos, sem build obrigatório e sem dependências externas (fontes, GSAP e Lenis estão no repositório).

Desenvolvido pela [Agência Coder Mundi](https://codermundi.com.br/).

## Publicar no GitHub Pages

1. Crie um repositório (ex.: `wv-tintas`) e envie **o conteúdo desta pasta** para a raiz da branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Site WV Tintas"
   git branch -M main
   git remote add origin https://github.com/<usuario>/wv-tintas.git
   git push -u origin main
   ```
   (Ou, pelo navegador: *Add file → Upload files* e arraste todos os arquivos e pastas.)
2. No repositório: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
3. Em 1–2 minutos o site fica em `https://<usuario>.github.io/wv-tintas/`.

O arquivo `.nojekyll` já está incluído para o GitHub servir os arquivos como estão. Todos os caminhos são relativos, então o site funciona tanto em `usuario.github.io/wv-tintas/` quanto num domínio próprio.

### Domínio próprio (opcional)

Para usar `wvtintas.com.br`: em *Settings → Pages → Custom domain* informe o domínio (o GitHub cria o arquivo `CNAME`) e, no DNS, aponte os registros conforme a [documentação do GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site). Marque *Enforce HTTPS*.

> `canonical`, `og:url`, `og:image` e o JSON-LD já apontam para `https://wvtintas.com.br/`. Enquanto o site estiver só no endereço `github.io`, a prévia de compartilhamento (WhatsApp/redes) pode não mostrar a imagem — ela passa a funcionar quando o domínio estiver apontado.

## Estrutura

```
index.html              página (gerada a partir de src/)
og-image.jpg            imagem de compartilhamento 1200×630
assets/
  css/style.css         estilos (tokens de cor/tipografia no :root)
  js/main.js            interações e animações
  js/vendor/            gsap, ScrollTrigger, lenis
  fonts/                Manrope, DM Sans, Playfair Display (woff2)
  logo/ hero/ empresa/ produtos/ servicos/ resultados/ clientes/ video/
src/
  index.template.html   template da página
  products.json         catálogo (categoria, nome, marca, imagem)
  build.py              gera index.html a partir do template + catálogo
```

### Editar o catálogo

Edite `src/products.json`, coloque a foto em `assets/produtos/<img>.webp` e rode:

```bash
python3 src/build.py
```

Textos e seções: edite `src/index.template.html` e rode o mesmo comando (não edite os cards de produto direto no `index.html`, eles são sobrescritos).

### Testar localmente

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

(Abrir o `index.html` direto pelo explorador de arquivos bloqueia as fontes.)

## Funcionalidades

- Menu fixo responsivo, rolagem suave, animações discretas (desligam com "reduzir movimento")
- Banner com a nova fachada, destaque de tinta automotiva à base d'água (Sikkens Autowave, AkzoNobel), catálogo em abas com modal de detalhes e orçamento por produto via WhatsApp
- Serviços, galeria de resultados com lightbox, logos de clientes
- Formulário de orçamento que abre o WhatsApp da loja escolhida com a mensagem pronta
- Duas lojas com mapa (carregado sob demanda), WhatsApp, ligação e "como chegar"
- Bolha de vídeo estilo iShorts com player vertical
- SEO: HTML semântico, Open Graph, JSON-LD (lojas em Salvador), imagens WebP com lazy loading

## Pendências

- Formulário: envio por e-mail exige integração externa (hoje envia pelo WhatsApp).
- Confirmar os canais oficiais exibidos na nova fachada — (71) 99904-1117, (71) 99716-1555, @wvtintasautomotivas e wvtintasautomotivas.com.br — e atualizar no site se for o caso.
- Horário de funcionamento das lojas (não informado).
