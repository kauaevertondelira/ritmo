# Ritmo

Aplicação web de desenvolvimento pessoal em português, responsiva e compatível com GitHub Pages. Direção visual editorial inspirada no ritmo de navegação do [Mr. Pops](https://mrpops.ua/en/), com composição própria: tipografia ampla, superfícies abertas, listas e uma cor de destaque. Transições com GSAP 3.15.0 e respeito a `prefers-reduced-motion`.

## Instalar no computador e celular

O Ritmo 1.1 oferece instalação pelo navegador (PWA) e um projeto Android nativo com Capacitor. Veja [INSTALAR.md](INSTALAR.md) para os passos de instalação. O ícone de lua/sol no cabeçalho alterna os temas; **Meu espaço → Aparência** também oferece a opção Sistema. A escolha é salva apenas no dispositivo.

## Funcionalidades

- Tarefas: criar, editar, concluir, excluir, buscar e filtrar por data/status.
- Agenda própria: visualizações mensal e semanal, criação e edição de compromissos, validação de horários. Não integra a API do Google Calendar.
- Hábitos diários: registro, últimos sete dias e sequência de dias consecutivos.
- Alimentação: planejamento por dia e refeição, registro de água e meta pessoal configurável. Sem prescrição de dietas.
- Leituras: resumos editoriais com links para Ministério da Saúde, NHS e Coursera. Curadoria manual; não há raspagem nem reprodução integral de artigos.
- Contas: cadastro, login, logout e recuperação de senha via Firebase Authentication.
- Sincronização: Firebase Realtime Database, listener por usuário e transações com controle de revisão.
- Exportação e restauração de backup JSON, com validação e confirmação antes de substituir dados. No Android, a exportação abre o painel de compartilhamento do sistema.
- Temas claro, escuro grafite e automático, sem animações intensas na troca.
- PWA com janela própria, ícones, atalhos para agenda/tarefas e recursos da interface disponíveis sem conexão após o primeiro carregamento.
- Projeto Android com botão Voltar, abertura com ícone próprio e integração de aparência com a barra de status.

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

Abra `http://127.0.0.1:4173`. Os arquivos prontos da raiz já funcionam sem instalar dependências. Firebase, Capacitor e GSAP estão incluídos localmente em `vendor/`; a fonte tipográfica vem do Google Fonts, com fontes de sistema como alternativa sem conexão.

Para desenvolver ou atualizar o aplicativo, use Node.js 22 ou superior:

```sh
npm ci
npm run build
npm test
```

O build cria `dist/`, recompila os módulos, gera ícones e atualiza a versão do service worker. Execute-o após qualquer mudança nos arquivos públicos, para atualizar também o cache offline. A instalação PWA exige HTTPS em produção ou localhost na prévia. Se uma versão antiga continuar aberta, feche todas as janelas e abas do Ritmo e abra novamente; uma atualização não interrompe formulários abertos.

Alternativa com Python:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Use um servidor HTTP; abrir `index.html` com `file://` impede o carregamento normal dos módulos do Firebase.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Extraia `ritmo-github-pages.zip` e envie seu conteúdo, deixando `index.html` na raiz do repositório. Ao publicar a partir do código-fonte, execute `npm run build` e envie o conteúdo de `dist/`. Não envie `node_modules`, ferramentas Android ou caches de compilação.
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

O modo demonstração usa somente memória, com exemplos identificados na interface. Ao entrar, a conta começa vazia ou carrega seus dados salvos; exemplos não são enviados à conta. Em uma aba comum, a sessão autenticada usa o armazenamento de sessão. No aplicativo instalado (PWA ou Android), o SDK usa persistência local para manter a conta conectada entre aberturas; use **Sair da conta** para encerrar. A senha é gerenciada pelo SDK do Firebase. A preferência de tema é independente da conta.

O service worker guarda somente arquivos públicos da interface: respostas do Firebase, tokens e dados de contas não entram nesse cache. O Android inclui esses recursos no APK. Não há edição offline persistente: se o banco estiver desconectado, o aplicativo informa que não salvou e preserva o formulário aberto. O usuário deve aguardar a conexão e tentar novamente. A aplicação não promete sincronização quando o banco não responde.

## Compilar o Android

O projeto usa Capacitor 8, Java 21, Android SDK 36 e Gradle Wrapper 8.14.3 com checksum. O APK suporta Android 7.0 (API 24) ou superior.

```sh
npm ci
npm run android:apk
```

Configure `JAVA_HOME` e `ANDROID_HOME` ou abra `npm run android:open` no Android Studio com SDK 36 instalado. O comando gera `releases/ritmo-android.apk`, assinado com a chave de depuração local para testes e uso pessoal. Um lançamento para a Play Store exige assinatura de produção e preparação específica para a loja. Preserve a chave usada ao atualizar instalações existentes; outra assinatura pode exigir desinstalação. Exporte os dados antes de desinstalar.

Neste computador, as ferramentas oficiais foram baixadas para `../../work/android-tools/`, com verificação SHA-256. A licença do SDK foi aceita com autorização expressa do usuário. O atalho `../Gerar-APK.cmd` usa essas ferramentas já instaladas e os recursos Android sincronizados, e copia o resultado para `../ritmo-android.apk`. Ele é específico deste ambiente; o código-fonte distribuído usa os comandos acima.

Não há testes em dispositivo Android físico ou emulador nesta entrega. Login e sincronização reais também dependem da ativação do Firebase descrita acima.

## Arquivos

- `index.html`: estrutura e metadados.
- `editorial.css`: visual e adaptação para celular.
- `dark.css` e `theme.js`: aparência e preferência por dispositivo.
- `manifest.webmanifest`, `install.js`, `sw.js`: instalação e cache da interface.
- `src/` e `scripts/`: fontes dos módulos e geração dos recursos.
- `android/` e `capacitor.config.json`: projeto Android.
- `dist/`: arquivos públicos gerados para publicação.
- `app.js`: rotas, formulários, validação e dados da interface.
- `motion.js`: GSAP, animações de entrada e interações.
- `cloud.js`: Firebase Authentication, listeners e transações.
- `firebase-config.js`: configuração pública enviada pelo usuário.
- `database.rules.json`: regras do Realtime Database.
- `firebase.json` e `.firebaserc`: configuração opcional da CLI Firebase.
- `serve.mjs`: servidor HTTP local sem dependências.
- `tests/`: validação de dados, temas, instalação, caminhos relativos e cache offline.

## Verificação

```sh
npm test
```

Os 12 testes automatizados passaram. Foram verificados os fluxos de criação de tarefas, eventos com validação de início/fim, hábitos, refeições, preferências, leitura de conteúdos e navegação por teclado. O modo escuro, a persistência após recarregar, o formulário da agenda e as instruções de instalação foram conferidos no navegador; não foram registrados erros de console nessa verificação. As telas principais foram conferidas em desktop e celular (390 px). A agenda mensal também funciona em subdiretórios do GitHub Pages.

Login real, isolamento entre duas contas e sincronização entre dispositivos ainda precisam ser testados após a ativação administrativa do Firebase. Nenhuma conta de teste foi criada no seu ambiente de produção. Os emuladores Firebase estão configurados, mas não foram executados neste ambiente.

## Referências e licenças

- [GSAP e licença](https://gsap.com/standard-license/) — distribuição 3.15.0 preservada em `vendor/gsap.min.js`.
- [Capacitor: ambiente Android](https://capacitorjs.com/docs/getting-started/environment-setup).
- [Instalação de PWA](https://web.dev/learn/pwa/installation).
- [Firebase Web SDK](https://firebase.google.com/docs/web/setup).
- [Firebase Auth com e-mail/senha](https://firebase.google.com/docs/auth/web/password-auth).
- [Realtime Database: leitura, escrita e transações](https://firebase.google.com/docs/database/web/read-and-write).
- [Regras de acesso](https://firebase.google.com/docs/database/security).
- Textos de curadoria são resumos próprios; direitos sobre os conteúdos externos pertencem às respectivas fontes.

