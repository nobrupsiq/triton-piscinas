# Triton Piscinas

Primeira versão do novo site em **Next.js, JavaScript/JSX e Tailwind CSS**, com Bogue nos títulos e Lexend no corpo. As fontes são locais; não há chamadas ao Google Fonts.

## Rodar o projeto

### Efeitos da home

`src/components/water-experience.jsx` carrega Three.js e GSAP sob demanda. A hero usa refração da própria fotografia, limitada à piscina por uma máscara nas coordenadas da imagem. O movimento usa amostragem de mapa de normais inspirada no addon oficial `Water.js`; o cursor produz ondulações locais, e GSAP faz a entrada gradual da camada. Não é uma simulação física 3D. A textura oficial e sua licença estão em `public/effects/`. Ao trocar a foto da hero, recalibrar `poolMask` no shader. O canvas usa resolução limitada e no máximo 30 quadros por segundo, pausa fora da tela ou com a aba oculta e libera seus recursos ao sair da página. A preferência de movimento reduzido desativa a camada. Sem WebGL ou se uma textura falhar, a foto original continua visível. A foto hospedada externamente precisa permitir CORS para o WebGL.

Requer Node.js 20.9 ou mais recente. Desenvolvimento e validação realizados com Node.js 24.

```powershell
cd 'Site novo'
npm install
npm run dev
```

Acesse **http://localhost:3000**. Em PowerShell com restrições para scripts npm, use `npm.cmd` no lugar de `npm`.

```powershell
npm run build
npm run start
```

`package-lock.json` fixa as versões usadas. Em CI, use `npm ci`. O projeto não utiliza TypeScript; a etapa interna de verificação do Next pode ainda exibir esse nome no log.

## O que está funcionando

- Página inicial responsiva com a paleta fornecida e as fotografias do acervo.
- Vitrine com 12 produtos selecionados, cards exclusivos e carrossel com setas, teclado, deslize nativo no celular, contador e progresso. A seleção é feita no painel, pelo campo “Posição na vitrine da página inicial”.
- Painel de edição de produtos em `/keystatic` (veja “Catálogo e painel de edição”).
- Catálogo com busca por nome, marca, referência e categoria; filtros, ordenação e paginação no servidor.
- 401 produtos publicados. O registro em rascunho está preservado nos dados e não é exibido.
- Páginas individuais pré-renderizadas, galeria, ficha técnica e seleção de variação.
- Orçamento com produto, referência, configuração, SKU da variação e link, direcionado ao WhatsApp. O visitante confirma o envio no aplicativo.
- Páginas de serviços, empresa, contato, projetos e galerias de Vasco da Gama e Solares Clube.
- Formulário de contato que prepara a mensagem para WhatsApp. Não grava dados em banco nem envia e-mail.
- Sitemap, robots, metadados, páginas 404 e de erro, e redirecionamentos 308 de todas as URLs do WordPress: páginas, 401 produtos e 106 categorias.
- Preços preservados nos dados, sem exibição nesta primeira versão. Não há carrinho nem checkout.

## Animações e transições

As entradas da hero, as interações de botões/cards, o menu móvel e a troca de imagens usam CSS. As seções abaixo da primeira tela entram uma vez, com pequenos intervalos entre cards, através de `IntersectionObserver` e da API de animações do navegador. Não foi adicionada biblioteca de animação.

O conteúdo continua renderizado no servidor e legível sem JavaScript. A imagem principal e o título da hero ficam visíveis desde o início. A preferência de movimento reduzido desativa os efeitos, inclusive quando é alterada durante a navegação; o foco de teclado mostra os elementos imediatamente.

Para ajustar a intensidade, edite `--motion-fast`, `--motion-smooth`, `--ease-out` e os keyframes em `src/app/globals.css`. Os alvos, a duração de 620ms e o intervalo de 65ms das entradas ao rolar estão em `src/components/motion-controller.jsx`. O controlador não executa cálculos a cada evento de scroll nem anima blocos longos de descrição de produtos.

## Configurações

Copie `.env.example` para `.env.local` se precisar alterar os valores. As variáveis públicas precisam ser definidas antes do build.

| Variável                              | Padrão / finalidade                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`                | `https://tritonpiscinas.com.br`; URLs canônicas, sitemap e links de produto nas mensagens. **Defina com o domínio novo antes de publicar** |
| `NEXT_PUBLIC_WHATSAPP`                | `5521991215101`; número encontrado no site atual                                                                                           |
| `NEXT_PUBLIC_ASSET_BASE_URL`          | Vazio; imagens servidas localmente em `/midia/`                                                                                            |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`   | Vazio; `usuario/repositorio` liga o painel ao GitHub. Vazio, o painel só funciona com `npm run dev`                                        |
| `KEYSTATIC_GITHUB_CLIENT_ID` e demais | Gerados pelo Keystatic ao criar o GitHub App; veja “Publicação”                                                                            |

Quando `NEXT_PUBLIC_SITE_URL` aponta para um domínio diferente de `tritonpiscinas.com.br`, qualquer acesso ao domínio antigo é redirecionado para o mesmo caminho no novo, e de lá os redirecionamentos do WordPress levam à página certa. Para isso, o domínio antigo precisa continuar registrado e apontado para a mesma hospedagem.

O número, endereço e horário foram consultados em `https://tritonpiscinas.com.br/contato-triton-piscinas/`. Telefone, endereço, link do mapa e horários ficam todos em `src/lib/site.js`; a página de contato e o rodapé leem desse arquivo.

### Cabeçalhos de segurança

`next.config.mjs` envia Content-Security-Policy, HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy` em todas as rotas. A CSP não usa nonce, para manter as páginas estáticas. Ao adicionar um serviço externo (analytics, mapa incorporado, chat), inclua o domínio na diretiva correspondente; o teste `cabeçalhos de segurança` em `tests/site.spec.js` falha se o navegador registrar um bloqueio. Os cabeçalhos valem quando o site roda com `next start` ou numa hospedagem com suporte a Next.js; em uma exportação estática, configure-os no servidor.

## Catálogo e painel de edição

O catálogo fica em `content/produtos/`, um arquivo `.mdoc` por produto, e as fotos em `public/midia/produtos/<produto>/`. Os dados são editados pelo painel **Keystatic** em `/keystatic`: nome, marca, categoria, fotos, descrição com editor visual, ficha técnica, configurações para orçamento, publicação e posição na vitrine. Nada depende do WordPress ou de outro serviço; o conteúdo é parte do repositório.

- **No computador:** `npm run dev` e acesse `http://127.0.0.1:3000/keystatic`. O painel grava direto nos arquivos; depois, faça commit e envie ao GitHub.
- **No site publicado:** com o GitHub configurado (veja “Publicação”), cada “Save” no painel vira um commit, e a Vercel publica a nova versão em 1 a 2 minutos.

Regras que o painel não verifica sozinho, mas que fazem o build falhar (a versão anterior continua no ar): referências de produto e de configuração repetidas e categoria inexistente. `npm run validate` confere também se cada foto existe e avisa sobre fotos acima de 1 MB e produtos sem foto. Envie fotos já reduzidas (até 1600 px, WebP ou JPG): o painel não comprime as imagens.

Não mude o “Endereço da página” de um produto já publicado; links salvos e redirecionamentos apontam para ele. Para incluir uma marca nova, acrescente-a em `brands` de `keystatic.config.js`.

Preços das configurações, itens inclusos e categorias detalhadas do WordPress continuam nos arquivos. Estoque, frete e relacionamentos de venda não foram levados ao painel; estão completos em `migration/catalogo-triton-migrado.json`.

### Migração do WordPress (histórico)

Feita uma única vez, a partir dos arquivos em `../produtos` e `../Imagens extraidas`. Os scripts estão em `scripts/migracao/` só como registro e não devem ser rodados de novo: `migrate.mjs` recusa a execução porque o catálogo já está em `content/produtos`.

| Arquivo                                  | Conteúdo                                                                           |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `public/midia/acervo/`                   | Imagens de projetos, marcas e páginas institucionais                               |
| `src/data/assets.json`                   | Referências das imagens usadas nas páginas institucionais                          |
| `migration/catalogo-site.json`           | Catálogo no formato intermediário, antes da conversão para o painel                |
| `migration/catalogo-triton-migrado.json` | Exportação completa com a estrutura original e referências de imagens substituídas |
| `migration/mapa-imagens.json`            | Mapa de cada URL antiga para o arquivo da primeira migração                        |
| `migration/relatorio.json`               | Contagens, hash da fonte, tamanhos e exceções tratadas                             |

`scripts/migracao/catalogo-para-conteudo.mjs` converteu o catálogo para o formato do painel e comparou cada descrição antes e depois; todas ficaram iguais. Espaços não separáveis (`&nbsp;`) viraram espaços comuns e negritos em sinais isolados, como “|”, foram removidos.

## Redirecionamentos do site antigo

`src/data/redirecionamentos.json` leva cada produto e categoria do WordPress para a página nova. O script consulta a API pública do WordPress (`/wp-json/wp/v2/product` e `product_cat`) e associa os produtos pelo ID, então funciona mesmo quando o nome mudou; ele falha se algum produto do WordPress não existir no catálogo novo. Categorias vão para o filtro equivalente em `/produtos` (categoria, marca ou ambos); categorias vazias ou que misturam linhas e marcas vão para o catálogo completo. Páginas institucionais, loja, carrinho e conta estão escritas em `next.config.mjs`.

Rode novamente antes de desligar o WordPress, se o catálogo dele tiver mudado. Depois que o WordPress sair do ar, o script deixa de funcionar e o arquivo gerado fica como versão final. Produtos criados só no painel não precisam de redirecionamento.

```powershell
npm run redirects
```

O teste `URLs antigas do WordPress` percorre todos os endereços com a barra final, como o Google os conhece. Cada um faz dois saltos 308 (o Next remove a barra e depois redireciona), o que os buscadores seguem normalmente.

## Publicação (GitHub + Vercel)

1. Crie um repositório **privado** no GitHub e envie este projeto (o `.gitignore` já exclui `node_modules`, `.next` e arquivos `.env`).
2. Na Vercel, importe o repositório. Em _Environment Variables_, defina `NEXT_PUBLIC_SITE_URL` com o domínio novo e `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` como `usuario/repositorio`. Publique.
3. No computador, crie `.env.local` com a mesma `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`, rode `npm run dev` e abra `/keystatic`. O Keystatic oferece criar um **GitHub App**: informe a URL do site publicado, crie o app e dê acesso a este repositório. Ele grava `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` e `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` no `.env` local.
4. Copie essas quatro variáveis para a Vercel e publique de novo. Nas configurações do GitHub App, confira se existe a _Callback URL_ `https://<domínio>/api/keystatic/github/oauth/callback`.
5. Quem for editar precisa de uma conta no GitHub com permissão de escrita no repositório (_Settings → Collaborators_).
6. Adicione à Vercel o domínio novo e, quando desligar o WordPress, também `tritonpiscinas.com.br` e `www.tritonpiscinas.com.br`, para os links antigos continuarem funcionando.

Sem `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO`, o painel e sua API respondem 404 em produção: o modo local grava arquivos sem autenticação e só é liberado em `npm run dev`. O painel tem uma CSP própria, que permite a API do GitHub e a fonte Inter do Google Fonts; o resto do site continua com a política restrita.

## Repositório separado para imagens

Com o painel, as fotos novas são gravadas no próprio repositório, em `public/midia/produtos`. Um servidor de imagens separado (`NEXT_PUBLIC_ASSET_BASE_URL`) só receberia as fotos novas se fosse sincronizado a cada alteração, por isso deixe essa variável vazia. Se um dia ela for usada, copie a pasta `public/midia` inteira para a raiz do servidor de imagens, mantendo o nome `midia`.

## Validação

```powershell
npm run validate
npm run build
npm run test:e2e
```

O validador confere o catálogo do painel (referências repetidas, categorias, fotos ausentes, fotos grandes e produtos sem foto). Os testes de navegador usam Chrome instalado, em modo invisível, com telas desktop e mobile. Não enviam mensagens: apenas verificam o link de orçamento e interceptam a saída do formulário. Também conferem os cabeçalhos de segurança, todos os redirecionamentos do WordPress e que o painel fica fechado em produção sem o GitHub configurado.

As capturas para revisão visual ficam em `preview/`. Para outra máquina sem Chrome, instale-o ou adapte `channel` em `playwright.config.js` ao navegador disponível.

## Pendências antes de substituir o WordPress

- Revisar a apresentação e os textos com o cliente, especialmente conteúdos antigos do catálogo com instruções de compra ou campos obsoletos.
- Confirmar a opção de não exibir preços e os dados comerciais de atendimento.
- As políticas de privacidade, entrega e termos estão em páginas locais, com conteúdo sanitizado em `src/data/politicas.json`. O script `scripts/migracao/import-pages.mjs` usou Chrome quando o WordPress responde HTTP 406. Os textos originais foram preservados: revisar com o cliente as referências a cadastro, carrinho, pagamentos e newsletter antes de publicar a versão de orçamento pelo WhatsApp.
- Definir o destino do cadastro de ofertas/newsletter do site anterior. Não foi criado um formulário que simule inscrição sem um serviço de recebimento.
- O login de clientes do antigo comércio não foi recriado nesta versão de catálogo; verificar se existe alguma função de conta a preservar além das compras.
- Publicar na Vercel com o domínio novo e configurar o painel no GitHub (veja “Publicação”); validar o site na URL final.
- Manter o domínio `tritonpiscinas.com.br` registrado e apontado para o site novo depois de desligar o WordPress.
