# Ritmo

Aplicação web de desenvolvimento pessoal em português, responsiva e compatível com GitHub Pages. Direção visual editorial inspirada no ritmo de navegação do [Mr. Pops](https://mrpops.ua/en/), com composição própria: tipografia ampla, superfícies abertas, listas e uma cor de destaque. Transições com GSAP 3.15.0 e respeito a `prefers-reduced-motion`.

## Funcionalidades

- Tarefas: criar, editar, concluir, excluir, buscar e filtrar por data/status.
- Agenda própria: visualizações mensal e semanal, criação e edição de compromissos, validação de horários. Não integra a API do Google Calendar.
- Hábitos diários: registro, últimos sete dias e sequência de dias consecutivos.
- Alimentação: planejamento por dia e refeição, registro de água e meta pessoal configurável. Sem prescrição de dietas.
- Leituras: resumos editoriais com links para Ministério da Saúde, NHS e Coursera. Curadoria manual; não há raspagem nem reprodução integral de artigos.
- Contas: cadastro, login, logout e recuperação de senha via Firebase Authentication.
- Sincronização: Firebase Realtime Database, listener por usuário e transações com controle de revisão.
- Exportação e restauração de backup JSON, com validação e confirmação antes de substituir dados.

## Ativação do Firebase — necessária antes do uso real

A configuração pública do projeto `foco-sylay` já está em `firebase-config.js`.

1. Abra o [Firebase Console](https://console.firebase.google.com/project/foco-sylay/overview).
2. Em **Authentication → Sign-in method**, habilite **E-mail/senha**.
3. Em **Realtime Database → Rules**, publique o conteúdo de `database.rules.json`.
4. Em **Authentication → Settings → Authorized domains**, adicione `SEU-USUARIO.github.io` ou o domínio próprio que será usado. Para a prévia local, use `localhost`.
5. Abra o site, escolha **Entrar ou criar conta**, crie uma conta e teste um registro em dois dispositivos.

As regras fornecidas negam acesso anônimo, isolam usuários por `auth.uid` e validam revisão, tamanho do payload e timestamp. Se esse banco for compartilhado com outros sistemas, integre o ramo `ritmo` às regras existentes, preservando as demais permissões necessárias. Não mantenha permissões abertas em um ancestral: uma permissão concedida na raiz não pode ser revogada em um filho.

Na verificação de 29/09/2026, uma leitura **sem autenticação** no caminho vazio `/ritmo/users/__ritmo_access_check__/workspace` retornou HTTP 200. Isso indica que a leitura anônima era permitida nesse caminho naquele momento. Nenhum dado real de usuário foi lido ou alterado. As regras deste pacote ainda dependem de publicação administrativa. A configuração web não permite administrar regras nem habilitar provedores de login.

O arquivo de configuração web contém identificadores públicos do aplicativo; não contém chave de serviço. A autorização dos dados fica nas regras e no Firebase Authentication.

## Executar localmente

Com Node.js instalado, na pasta do projeto:

```sh
npm start
```

Abra `http://localhost:4173`. Não é necessário `npm install` nem build. Os SDKs modulares do Firebase são carregados da CDN oficial do Google; a fonte tipográfica vem do Google Fonts, com fontes de sistema como fallback. O GSAP está incluído localmente em `vendor/`.

Alternativa com Python:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Use um servidor HTTP; abrir `index.html` com `file://` impede o carregamento normal dos módulos do Firebase.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie o **conteúdo desta pasta**, deixando `index.html` na raiz do repositório.
3. Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/(root)` e salve.
5. Adicione o domínio publicado aos domínios autorizados do Firebase.

O arquivo `.nojekyll` já está incluído. Os recursos usam caminhos relativos e a navegação usa hashes (`#agenda`, `#tarefas`), por isso o projeto funciona em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` sem configuração de rotas no servidor.

Fonte: [documentação oficial do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

Não foi criado nem publicado um repositório: o pacote está pronto para envio ao repositório escolhido por você.

## Dados e arquitetura

```text
GitHub Pages → HTML / CSS / JS / GSAP
                      ↓
              Firebase Authentication
                      ↓ auth.uid
          Realtime Database /ritmo/users/{uid}/workspace
```

O MVP guarda um documento por usuário com `payload`, `revision` e `updatedAt`. O payload é JSON serializado para preservar arrays e objetos vazios, que o Realtime Database normalmente remove. Ele reúne perfil, tarefas, eventos, hábitos, refeições e água. A revisão é comparada atomicamente em transação; um conflito não substitui silenciosamente os dados de outro dispositivo. Nesse caso, a alteração tentada é exportada e a versão atual é recarregada para revisão.

Essa modelagem favorece simplicidade e backup na primeira versão. Cada alteração envia o documento inteiro, limitado a 2 MB; para grande volume, relatórios entre usuários ou colaboração simultânea intensa, a evolução recomendada é separar as entidades em ramos e índices específicos.

O modo demonstração usa somente memória, com exemplos identificados na interface. Ao entrar, a conta começa vazia ou carrega seus dados salvos; exemplos não são enviados à conta. A sessão autenticada fica no armazenamento de sessão do navegador. Fechar a aba encerra essa persistência local. A senha é gerenciada pelo SDK do Firebase.

Não há edição offline persistente: se o banco estiver desconectado, o aplicativo informa que não salvou e preserva o formulário aberto. O usuário deve aguardar a conexão e tentar novamente. A aplicação não promete sincronização quando o banco não responde.

## Arquivos

- `index.html`: estrutura e metadados.
- `editorial.css`: visual e adaptação para celular.
- `app.js`: rotas, formulários, validação e dados da interface.
- `motion.js`: GSAP, animações de entrada e interações.
- `cloud.js`: Firebase Authentication, listeners e transações.
- `firebase-config.js`: configuração pública enviada pelo usuário.
- `database.rules.json`: regras do Realtime Database.
- `firebase.json` e `.firebaserc`: configuração opcional da CLI Firebase.
- `serve.mjs`: servidor HTTP local sem dependências.
- `tests/validation.test.cjs`: testes dos limites e formatos de dados.

## Verificação

```sh
npm test
```

Foram verificados os fluxos de criação de tarefas, eventos com validação de início/fim, hábitos, refeições, preferências, leitura de conteúdos e navegação por teclado. As telas principais foram conferidas em desktop e celular (390 px). A agenda mensal também funciona em subdiretórios do GitHub Pages.

Login real, isolamento entre duas contas e sincronização entre dispositivos ainda precisam ser testados após a ativação administrativa do Firebase. Nenhuma conta de teste foi criada no seu ambiente de produção. Os emuladores Firebase estão configurados, mas não foram executados neste ambiente.

## Referências e licenças

- [GSAP e licença](https://gsap.com/standard-license/) — distribuição 3.15.0 preservada em `vendor/gsap.min.js`.
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup).
- [Firebase Auth com e-mail/senha](https://firebase.google.com/docs/auth/web/password-auth).
- [Realtime Database: leitura, escrita e transações](https://firebase.google.com/docs/database/web/read-and-write).
- [Regras de acesso](https://firebase.google.com/docs/database/security).
- Textos de curadoria são resumos próprios; direitos sobre os conteúdos externos pertencem às respectivas fontes.

