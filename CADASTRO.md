# Ativar cadastro e login na Vercel

O cadastro já está implementado. A mensagem do print indica falta de banco persistente na implantação. Alterar apenas a mensagem não permite salvar contas. A Vercel não fornece persistência compartilhada para um arquivo SQLite local.

## Configuração necessária

1. Acesse https://turso.tech e entre ou crie sua conta.
2. Crie um banco chamado `realbux` no painel do Turso.
3. Copie a URL do banco (`libsql://...`) e gere um token de acesso de leitura/escrita para ele. Guarde o token como segredo.
4. Na Vercel, abra o projeto da REALBUX → **Settings → Environment Variables**.
5. Adicione `TURSO_DATABASE_URL` com a URL e `TURSO_AUTH_TOKEN` com o token. Selecione **Production** e também **Preview** se utilizar implantações de prévia.
6. Salve e faça **Redeploy** da implantação. Variáveis novas só são utilizadas por implantações iniciadas depois da alteração.

Não substitua a URL por uma conexão PostgreSQL/Neon: este projeto utiliza Turso/libSQL. Não envie o token pelo chat nem o coloque no GitHub. Não é necessário enviar o arquivo `data/store.sqlite` para a Vercel.

As tabelas de usuários, sessões e pedidos são criadas automaticamente na primeira operação que acessa o banco. O banco local não é migrado automaticamente e contas existentes devem ser preservadas em uma migração separada, se necessário.

## Conferir

- Abra a implantação nova, crie uma conta e confira o redirecionamento para Minha conta.
- Saia e entre novamente com o mesmo e-mail e senha.
- Confira o acesso depois de uma nova implantação para comprovar que a conta persistiu no banco remoto.

Em um terminal que já tenha as duas variáveis configuradas de forma segura, execute `npm run db:check`. Ele verifica a conexão e as tabelas sem imprimir credenciais. Sem as variáveis, retorna erro; não confunde um banco local com o banco de produção.

## Estado deste ambiente

O usuário informou que o banco e as duas variáveis já foram configurados na Vercel. Essa configuração não é transferida automaticamente a este ambiente, que ainda não dispõe de autenticação Vercel ou conexão direta com o banco. O cadastro pode ser testado localmente, mas a ativação na implantação depende de criar e conectar o banco e fazer redeploy. Não foi confirmada uma conexão remota.

Configurar o banco libera a persistência de cadastro e login; não ativa pagamento ou envio de produtos por e-mail.

## Diagnóstico da configuração

Também são reconhecidos os pares LIBSQL_URL + LIBSQL_AUTH_TOKEN e LIBSQL_DATABASE_URL + LIBSQL_AUTH_TOKEN. Valores com espaços externos ou aspas pareadas são normalizados. Um par incompleto nunca é misturado a um token de outro par.

A resposta de erro da API e os logs retornam somente códigos sem credenciais: missing_database_url, missing_auth_token, invalid_database_url ou connection_failed. Estes distinguem ambiente sem variáveis, configuração parcial, formato incorreto e falha de conexão/autenticação.

O endereço público identificado no GitHub é https://roblox-one-livid.vercel.app. O acesso à API de gerenciamento Vercel requer autenticação separada do acesso GitHub. Neste ambiente, o login Vercel e as variáveis de banco ainda não estavam disponíveis na última verificação.
