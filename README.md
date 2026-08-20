# 🥖 Painel de Ofertas — Panificadora

Sistema para cadastrar ofertas e promoções e exibi-las automaticamente em uma Smart TV
dentro da loja, com atualização em tempo real.

- **`/admin`** — painel para cadastrar, editar, ativar/desativar e excluir ofertas (exige login)
- **`/tv`** — tela pública em tela cheia para abrir na Smart TV (não exige login)

**Stack:** React + Vite, Tailwind CSS, Supabase (Postgres + Auth + Storage + Realtime), hospedagem gratuita na Vercel ou Netlify.

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. Clique em **New Project**. Escolha um nome, uma senha para o banco (guarde-a) e a região mais próxima (ex: São Paulo/`sa-east-1`).
3. Aguarde alguns minutos até o projeto ficar pronto.

## Passo 2 — Rodar o script SQL

1. No menu lateral do Supabase, abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste projeto, copie **todo o conteúdo** e cole no editor.
4. Clique em **Run**. Ele cria as tabelas `ofertas` e `configuracoes`, as regras de segurança (RLS), as permissões necessárias, o bucket de imagens e **9 ofertas de exemplo** para você já testar o sistema.

> Se aparecer algum aviso sobre "policy already exists" ou similar, pode ignorar — o script foi feito para poder ser rodado mais de uma vez com segurança.

## Passo 3 — Criar seu usuário de administrador

Por segurança, o sistema não tem tela pública de cadastro — só quem você autorizar consegue entrar no `/admin`.

1. No Supabase, vá em **Authentication > Users**.
2. Clique em **Add user > Create new user**.
3. Preencha seu e-mail e uma senha. Marque **Auto Confirm User**.
4. Pronto — esse será o seu login do painel.

## Passo 4 — Pegar as chaves da API

1. No Supabase, vá em **Project Settings > API** (ou **Data API**, dependendo da versão do painel).
2. Copie a **Project URL** e a chave **anon public**.

## Passo 5 — Configurar o projeto localmente

Você vai precisar do [Node.js](https://nodejs.org) instalado (versão 22 ou superior).

```bash
# entre na pasta do projeto
cd panificadora-tv

# instale as dependências
npm install

# copie o arquivo de variáveis de ambiente
cp .env.example .env
```

Abra o arquivo `.env` e preencha com os dados do Passo 4:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## Passo 6 — Rodar localmente para testar

```bash
npm run dev
```

Abra `http://localhost:5173` — você será redirecionado para o login. Entre com o
usuário criado no Passo 3. Depois, abra `http://localhost:5173/tv` em outra aba
para ver a tela da TV com as 9 ofertas de exemplo já cadastradas.

## Passo 7 — Publicar gratuitamente (Vercel)

1. Suba este projeto para um repositório no GitHub (crie um repositório novo e faça `git push`).
2. Acesse [vercel.com](https://vercel.com), crie uma conta gratuita e clique em **Add New > Project**.
3. Selecione o repositório. A Vercel detecta automaticamente que é um projeto Vite.
4. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**. Em cerca de 1 minuto seu site estará no ar em um endereço como `https://seu-projeto.vercel.app`.

### Alternativa: Netlify

1. Em [netlify.com](https://netlify.com), **Add new site > Import an existing project**.
2. Selecione o repositório. Build command: `npm run build`. Publish directory: `dist`.
3. Em **Site settings > Environment variables**, adicione as mesmas duas variáveis do passo anterior.
4. Deploy. (O arquivo `public/_redirects` já está incluído para as rotas funcionarem corretamente.)

## Passo 8 — Abrir na Smart TV

1. No navegador da Smart TV, acesse `https://seu-projeto.vercel.app/tv`.
2. Toque no botão de tela cheia no canto superior direito (ícone de expandir).
3. Deixe a TV aberta nessa página durante o horário de funcionamento — as ofertas trocam sozinhas e a tela se atualiza automaticamente sempre que você mexer no painel administrativo, sem precisar recarregar.

> Dica: a maioria das Smart TVs tem uma opção de "abrir sempre neste site" ou permite fixar a aba do navegador — assim você não precisa digitar o endereço todo dia.

---

## Uso do dia a dia

Depois de configurado, cadastrar uma nova promoção é assim:

1. Entrar no painel (`/admin`)
2. Clicar em **Nova oferta**
3. Escolher a foto
4. Digitar o nome, descrição (opcional) e preço
5. Escolher as datas de início e fim
6. Clicar em **Salvar**

A oferta aparece na TV automaticamente, dentro do período de datas escolhido. Quando o
período termina (ou você desativa/exclui a oferta), ela some da TV sozinha.

## Estrutura do projeto

```
panificadora-tv/
├── src/
│   ├── components/
│   │   ├── admin/       # componentes do painel (formulário, upload, cards...)
│   │   ├── tv/           # componentes da tela da TV (slide, carrossel...)
│   │   └── ui/           # componentes genéricos (botão, badge, modal de confirmação)
│   ├── context/          # autenticação e notificações (toast)
│   ├── hooks/            # useOfertas / useConfiguracoes (dados + Realtime)
│   ├── lib/              # cliente do Supabase
│   ├── pages/            # páginas (Login, Dashboard, Ofertas, Configurações, TV)
│   ├── routes/           # proteção de rotas administrativas
│   └── utils/            # formatação de moeda/data e cálculo de status da oferta
├── supabase/
│   └── schema.sql        # script completo do banco (tabelas, RLS, storage, exemplos)
└── public/
```

## Perguntas comuns

**A TV precisa ficar ligada 24h?** Não — basta abrir a página `/tv` sempre que a loja abrir. Se a internet cair, a tela mantém as últimas ofertas carregadas e volta a atualizar sozinha quando a conexão retornar.

**Posso ter mais de um administrador?** Sim — repita o Passo 3 para cada pessoa (Authentication > Users > Add user).

**Esqueci a senha do painel.** No Supabase, vá em Authentication > Users, clique nos três pontinhos ao lado do usuário e escolha para redefinir a senha.

**Quero mudar as cores/tema.** As cores estão centralizadas em `src/index.css`, no bloco `@theme` (procure por `--color-bakery-*`).
