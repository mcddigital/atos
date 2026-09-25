# Nova arquitetura — Gestão de Atos

## Objetivos
- Sistema 100% online e responsivo.
- Banco de dados persistente no Supabase/PostgreSQL.
- PDFs e anexos no Supabase Storage.
- Login por usuário e trilha de auditoria.
- Assistente IA para transformar um pedido em minuta estruturada.
- Revisão humana obrigatória antes do salvamento do ato.
- Relatórios com filtros por tipo, ano, período, servidor/destinatário e assunto.
- Arquivo digital com busca e download futuro.

## Fluxo da IA
1. Usuário descreve o ato no chat.
2. Endpoint server-side envia o pedido à OpenAI.
3. A resposta retorna em JSON estruturado.
4. O sistema abre o formulário já preenchido.
5. Usuário revisa/corrige.
6. Ao salvar, dados vão para o banco e o PDF final é armazenado no Storage.

## Produção
Sugestão: Vercel (front-end + função /api/generate-ato) + Supabase (Auth, PostgreSQL e Storage).
Nunca colocar OPENAI_API_KEY em variáveis que começam com VITE_.
