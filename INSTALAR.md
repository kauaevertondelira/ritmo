# Instalar o Ritmo

## Computador

1. Abra o site publicado no GitHub Pages usando Chrome ou Edge.
2. Entre em **Meu espaço → Ritmo como aplicativo → Instalar aplicativo**. Quando o navegador permitir, aparecerá a confirmação de instalação. Também é possível usar o ícone de instalação na barra de endereço ou o menu do navegador.
3. Abra o Ritmo pelo menu Iniciar. O navegador pode oferecer um atalho na área de trabalho; o aplicativo abre em uma janela própria.

A prévia em `http://127.0.0.1:4173` precisa do servidor local ligado. Para o uso diário, instale pelo endereço publicado em HTTPS. Não abra os arquivos diretamente com `file://`.

## Android

Você pode instalar pelo Chrome, usando **Instalar app** ou **Adicionar à tela inicial** no menu do site publicado.

Para instalar como APK, primeiro conclua a compilação. Neste computador, abra `outputs/Gerar-APK.cmd` com dois cliques e aguarde **APK criado**. O arquivo resultante será `outputs/ritmo-android.apk`. Envie-o ao celular, abra e siga a instalação do Android. O aparelho pode solicitar permissão para instalar arquivos dessa origem. Compatível com Android 7.0 ou mais recente.

Essa compilação é para testes e uso pessoal. Ainda precisa ser conferida em aparelho Android. Para gerar novamente em outro computador, siga a seção Android do README.

## Tema

Use o botão de lua/sol no topo ou **Meu espaço → Aparência**. As opções são **Sistema**, **Claro** e **Escuro**. A escolha fica salva no dispositivo.

## Sua conta

O modo demonstração usa dados de exemplo em memória. Para guardar seus planos entre dispositivos, entre na sua conta. O proprietário precisa habilitar E-mail/senha e publicar as regras do Firebase fornecidas no projeto antes do uso real; consulte o README.

A interface pode abrir sem internet após o primeiro carregamento da versão web ou pela instalação Android, mas entrar na conta, carregar e sincronizar planos exige conexão. Não há fila de alterações offline. Ao usar um dispositivo compartilhado, saia da conta quando terminar.

## Atualizações

Na versão instalada pelo navegador, feche todas as janelas e abas do Ritmo e abra novamente para receber uma atualização já baixada. Para o APK, instale a nova versão assinada com a mesma chave; exporte seu backup antes de qualquer desinstalação.
