# Correção do login

O ZIP anterior não incluía vendor/firebase.js, importado por cloud.js. Também faltavam vendor/native.js e os ícones da instalação. Esses recursos foram recuperados do ritmo.zip original, e a versão do service worker foi atualizada.

## Publicar

1. Extraia este ZIP.
2. Abra a pasta ritmo-main. Envie seu conteúdo para a raiz do repositório ritmo, substituindo os arquivos existentes. Preserve as pastas vendor e icons; index.html deve ficar na raiz.
3. Aguarde o GitHub Pages concluir a publicação.
4. Feche todas as abas e janelas instaladas do Ritmo e abra https://kauaevertondelira.github.io/ritmo/ novamente. Se ainda aparecer a mensagem antiga, limpe os dados do site no navegador e recarregue (isso encerra a sessão local).
5. Teste o login com sua conta.

A prévia local abriu o formulário de e-mail/senha sem o erro de carregamento. Os 8 testes automatizados passaram, incluindo a presença dos módulos e de todos os arquivos do cache offline. Nenhuma conta foi criada e nenhuma senha foi utilizada nos testes.

Caso o formulário abra, mas o Firebase recuse o login, confira no projeto foco-sylay: Authentication → Sign-in method → E-mail/senha habilitado; Authentication → Settings → Authorized domains → kauaevertondelira.github.io. As regras do banco devem ser conferidas separadamente para a sincronização. Não foram alteradas configurações no console Firebase nem publicado o site.
