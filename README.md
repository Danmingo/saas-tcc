# ThesisTrack

Gestão inteligente de TCCs.

## Sobre

O ThesisTrack é uma plataforma SaaS acadêmica para centralizar o acompanhamento de Trabalhos de Conclusão de Curso. A proposta é reunir turmas, alunos, projetos, entregas, versões, devolutivas, pendências e notificações em um único ambiente.

O público principal são professores orientadores, coordenadores e instituições de ensino. Alunos participam quando estão vinculados a turmas e projetos autorizados.

## Motivação

A ideia surgiu da observação e de conversas com professores sobre as dificuldades de acompanhar arquivos, mensagens, prazos e devolutivas durante a orientação de TCCs.

Embora existam plataformas acadêmicas amplas, o ThesisTrack busca oferecer uma experiência focada especificamente no acompanhamento de TCCs.

## Funcionalidades

### Implementado

- Login com Supabase Auth.
- Seleção de perfil validada contra o papel persistido do usuário.
- Áreas protegidas para professores e alunos.
- Turmas, códigos de convite e entrada de alunos.
- Projetos, integrantes e contexto acadêmico.
- Entregas, prazos, versões e devolutivas.
- Upload de PDF e DOCX de até 20 MB.
- Pendências, notificações e dashboards.
- Download por URL assinada do Supabase Storage.
- Chat da Tess com histórico e contexto acadêmico.

### Em desenvolvimento

- Recuperação de senha: o link existe na tela de login, mas a rota ainda não está implementada.
- Cadastro de usuários: o acesso depende de usuários já existentes no Supabase Auth e na tabela de perfis.
- RLS e policies do Supabase: não estão versionadas neste repositório e não puderam ser auditadas localmente.

### Planejado

- Comparação entre versões de documentos.
- Análise automática de arquivos PDF e DOCX.
- Fluxos adicionais de administração institucional.

## Experiência do professor

O professor pode acessar seu dashboard, administrar turmas, compartilhar códigos de convite, acompanhar projetos e alunos, cadastrar entregas, consultar versões, alterar status, registrar devolutivas, criar pendências e utilizar a Tess.

## Experiência do aluno

O aluno pode entrar em turmas por código, criar ou atualizar seu projeto, informar o contexto acadêmico, consultar entregas, enviar versões em PDF ou DOCX, acompanhar o histórico, consultar devolutivas, visualizar pendências e utilizar a Tess.

Não existe cadastro público implementado. O acesso depende de autenticação e dos vínculos autorizados no sistema.

## Inteligência Artificial

A Tess é uma assistente acadêmica integrada ao Gemini, com conversas persistidas no Supabase. Ela trabalha com contexto de projetos, pendências, versões e devolutivas, além de aplicar validações de entrada, saída e escopo.

A Tess não realiza análise automática dos arquivos enviados nem comparação de versões. Ela não deve atribuir nota, aprovar ou reprovar trabalhos, publicar devolutivas, inventar referências ou substituir decisões acadêmicas.

A IA atua como assistente e não substitui a avaliação do professor.

## Tecnologias

### Frontend

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Componentes próprios

### Backend

- Next.js Server Components
- Server Actions
- Route Handlers
- Camada de domínio em `lib/`

### Banco

- Supabase Database via `@supabase/supabase-js`
- Funções RPC para operações que exigem validação transacional

### Autenticação

- Supabase Auth
- `@supabase/ssr`
- Proxy e validação server-side de usuário e papel

### IA

- Google Gemini via `@google/genai`
- Modelo configurado: `gemini-3.8-flash`

### Infraestrutura

- Supabase Storage para arquivos enviados
- Bucket utilizado: `tcc-arquivos`
- URLs assinadas para download

### Ferramentas

- npm
- ESLint 9
- TypeScript 5
- Node.js

## Arquitetura

```text
Next.js App Router
        |
        +--> Server Components / Server Actions / Route Handlers
        |             |
        |             +--> Supabase Auth
        |             +--> Supabase Database
        |             +--> Supabase Storage
        |
        +--> Tess no servidor
                      |
                      +--> API do Google Gemini
```

As verificações de acesso usam a sessão autenticada e o papel armazenado em `usuarios`. O repositório não contém migrations ou policies SQL suficientes para confirmar localmente a configuração de RLS e Storage.

## Rotas principais

### Professor

- `/professor/inicio`
- `/professor/dashboard`
- `/professor/turmas`
- `/professor/projetos`
- `/professor/entregas`
- `/professor/devolutivas`
- `/professor/notificacoes`
- `/professor/tess`

### Aluno

- `/aluno/inicio`
- `/aluno/dashboard`
- `/aluno/meu-projeto`
- `/aluno/tarefas`
- `/aluno/versoes`
- `/aluno/devolutivas`
- `/aluno/notificacoes`
- `/aluno/tess`

### API

- `/api/versoes/[versaoId]/arquivo`
- `/professor/projetos/alunos`

## Estrutura de pastas

```text
app/
  aluno/
  professor/
  api/
  components/
lib/
  ai/
  supabase/
  arquivos.ts
  auth.ts
  dashboards.ts
  envios.ts
  pendencias.ts
  projetos.ts
  turmas.ts
public/
tests/
```

## Como rodar localmente

```bash
git clone <url-do-repositorio>
cd saas-tcc
npm install
```

Crie `.env.local` na raiz com as variáveis necessárias, sem adicionar valores reais ao repositório. Depois, inicie o ambiente:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

## Scripts

```text
npm run dev      Inicia o servidor de desenvolvimento
npm run build    Gera o build de produção
npm run start    Inicia o servidor de produção
npm run lint     Executa o ESLint
```

Os testes existentes podem ser executados diretamente com:

```bash
node --test tests/*.test.cjs
```

## Segurança

O código valida a sessão e o papel do usuário no servidor, protege as áreas de professor e aluno pelo Proxy e verifica o acesso a turmas, projetos, entregas, versões e pendências antes das operações sensíveis.

Arquivos são enviados para o Supabase Storage e baixados por URLs assinadas com validade limitada. A chave do Gemini é utilizada somente no servidor.

Alguns controles de autorização, RLS e policies do Supabase continuam não verificáveis neste repositório porque o schema e as migrations não estão versionados aqui. Revise essas configurações diretamente no projeto Supabase antes de publicar ou utilizar em produção.

## Status

🚧 Em desenvolvimento

## Roadmap

- [x] Autenticação e áreas por papel
- [x] Turmas e códigos de convite
- [x] Projetos e integrantes
- [x] Entregas, versões e devolutivas
- [x] Pendências e notificações
- [x] Chat contextual da Tess
- [ ] Recuperação de senha
- [ ] Comparação de versões
- [ ] Análise automática de documentos
- [ ] Versionamento das migrations e policies do Supabase

## Aprendizados

O projeto reúne aprendizados práticos em TypeScript, Next.js, Node.js, APIs, banco de dados, autenticação, integração com IA, arquitetura server-side e UI/UX acadêmica.

Também reforçou que “é só adicionar essa funcionalidade” normalmente significa algumas outras tarefas no caminho. 😅

## Screenshots

Espaço reservado para imagens reais do sistema:

- `docs/screenshots/dashboard-professor.png`
- `docs/screenshots/turmas.png`
- `docs/screenshots/projeto.png`
- `docs/screenshots/ia-chat.png`
- `docs/screenshots/aluno.png`

As imagens ainda não fazem parte deste repositório.

## Aviso

Este projeto está em desenvolvimento e algumas funcionalidades podem sofrer alterações.

Credenciais e configurações privadas não fazem parte deste repositório.

## Licença

Nenhum arquivo `LICENSE` foi encontrado no repositório. A licença ainda não foi definida.
