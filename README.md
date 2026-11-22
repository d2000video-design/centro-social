# centro-social

## Painel de conteúdos

O Decap CMS fica em `/admin/`. As páginas usam os modelos HTML existentes e
leem os conteúdos de `conteudo/` quando a Vercel gera o site. Para gerar os
ficheiros localmente, execute `node build.mjs` (Node.js 22 ou posterior).
O site gerado fica em `dist/`.

### Ativar o acesso

1. No GitHub, crie uma OAuth App para o endereço HTTPS oficial do site.
   A URL de retorno é `https://DOMÍNIO/api/cms-callback`.
2. Nas variáveis de produção da Vercel, defina `CMS_ORIGIN` com o endereço
   HTTPS oficial sem barra final, `CMS_GITHUB_CLIENT_ID`,
   `CMS_GITHUB_CLIENT_SECRET` e `CMS_GITHUB_EDITORS`. Esta última contém os
   nomes de utilizador do GitHub autorizados, separados por vírgulas.
3. Conceda acesso de escrita ao repositório a cada editora autorizada.
   A editora deve aceitar o convite e ativar a autenticação de dois fatores.
4. Volte a publicar o projeto na Vercel. Confirme o acesso com a conta da
   editora e teste uma alteração autorizada, desde a pré-visualização até ao
   site público. Verifique que a Vercel aceita as publicações dessa conta.

### Editar

Abra o painel, escolha a página e preencha os campos. Na página inicial,
as listas **Notícias e momentos** e **Newsletters** permitem acrescentar edições.
As páginas dos serviços têm listas de fotografias que podem ser reordenadas.
Use a pré-visualização para rever a página e depois clique em **Publicar**.

Use JPG, PNG ou WebP até 5 MB e PDFs até 15 MB. Carregue os ficheiros pelos
campos da edição. O repositório é público. Use apenas conteúdos autorizados
para publicação. A pré-visualização é feita no painel durante a edição, sem
guardar rascunhos entre sessões. Para verificar um PDF, abra o ficheiro
original antes de publicar.

Os momentos existentes continuam a vir da fonte anterior e aparecem após
os novos momentos do painel. A newsletter anterior fica acessível no arquivo
assim que for publicada a primeira edição pelo painel.
