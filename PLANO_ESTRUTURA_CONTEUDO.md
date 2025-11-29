# Plano Resolutivo para Estruturar Entregas de Conteúdo por IA

## 1) Objetivo e Problema
- **Problema atual:** o output dos fluxos de IA chega como "legenda + hashtags", sem blocos claros por formato, faltam CTAs e metadados ficam misturados ao corpo. Isso degrada a experiência no **Content Library** (página `src/pages/ContentLibrary.tsx`) e no fluxo de geração via **content-engine** (Supabase Edge Function em `supabase/functions/content-engine/index.ts`).
- **Objetivo:** entregar conteúdos completos, coerentes e multimodais (blog, carrossel, e-mail, roteiro de vídeo, post curto) com UI limpa e responsiva, permitindo salvar, revisar e publicar sem retrabalho.

## 2) Diagnóstico Rápido (estado atual)
- **Front:**
  - Roteamento em `src/App.tsx` já inclui `/biblioteca` e `/biblioteca/:id`, mas falta um criador de conteúdo com templates multimodais e pré-visualização organizada.
  - Componentes existentes (`UnifiedContentModal`, `ContentListView`, `ContentGalleryView`) não impõem estrutura obrigatória de blocos (titulo/resumo/corpo/CTA/metadados) e não exibem múltiplos formatos simultâneos.
- **Backend (Edge Functions):**
  - `content-engine` detecta tipo pelo prompt, mas usa um **system prompt genérico** e não garante JSON completo (apenas parseia o retorno). Não há validação de esquema ou fallback por tipo.
  - Falta padronizar campos obrigatórios (titulo, resumo, corpo, CTA, metadados) e variantes por formato (blog, carrossel, e-mail, roteiro de vídeo, post social).
- **Banco:** tabela `content_library` aceita `content: jsonb`, mas não há validação de subcampos por formato, nem field `modalidades` para acomodar multiplos formatos gerados juntos.

## 3) Estratégia de Solução (visão macro)
1. **Templates rígidos por formato** (blog/carrossel/e-mail/roteiro/post curto) com slots: Estratégia, Título/Headline, Resumo, Corpo (H2/H3 ou slides), CTAs x3, Metadados, Suposições.
2. **Entrega multimodal numa única geração**: payload padrão com `modalidades: { blog, carrossel, email, roteiro, post_curto }` para permitir pré-visualização por aba.
3. **Validação forte** no backend: schemas por formato + fallback para campos ausentes + sanitização.
4. **UI fluida e responsiva**: modais em grid/abas, skeletons, autosave, preview tipo slide, download/cópia rápida; manter design shadcn/Tailwind já usado.
5. **Remoção de caminhos legados** que conflitem (prompts soltos sem schema, displays antigos de conteúdo único, chamadas de IA sem `modalidades`).

## 4) Plano de Frontend
### 4.1 Rotas
- **Nova rota `/creator`** com layout de tela cheia e tabs para cada formato gerado.
- **Atalho em Content Library**: botão "Criar conteúdo estruturado" abre `/creator` ou modal dedicado.

### 4.2 Estados/Hooks
- Criar **`useContentTemplates`** em `src/hooks` para expor templates por formato (campos obrigatórios, limites de palavras, exemplos). Integra com o prompt builder.
- Criar **`useContentGeneration`** para orquestrar a chamada à função `content-engine` com payload multimodal e gerenciar estados (loading, erro, progresso). Usa React Query para cachear última geração.
- Atualizar **`useContentLibrary`** para aceitar filtro por `modalidades` (se o conteúdo foi gerado com bundle multimodal) e campo de status `is_structured` (novo field boolean opcional).

### 4.3 Componentes/Modais
- **`StructuredContentModal`** (novo em `src/components`):
  - Tabs: Blog, Carrossel, E-mail, Roteiro, Post Curto.
  - Cada aba mostra os blocos `[Estratégia]`, `[Título]`, `[Resumo]`, `[Corpo]` (H2/H3 ou slides numerados), `[CTA x3]`, `[Metadados]`, `[Suposições]`.
  - Ações: copiar bloco, copiar tudo, salvar em biblioteca, duplicar formato, exportar `.md`.
  - Responsividade: layout em colunas >1024px, pilha vertical <1024px; sliders de carrossel com swipe.
- **`PromptBuilder`** (novo): combinador de inputs (tema, público, tom, objetivo, canal-alvo, persona) + seleção de formatos desejados; usa templates do hook `useContentTemplates`.
- **`QualityChecklist`** (novo): checklist embutida (problema/solução/benefício/CTA/metadados separados) para o usuário confirmar antes de salvar.
- **Atualizar `UnifiedContentModal`** para suportar leitura de `modalidades` e renderizar o `StructuredContentModal` quando o conteúdo vier da nova geração.

### 4.4 UI/UX e Acessibilidade
- Manter design shadcn: cards, tabs, badges para pilar e status; toasts (Sonner) para feedback.
- Loading states: skeletons em grid/list (`ContentGalleryView` e `ContentListView`).
- Ações rápidas (hover) para copiar bloco e gerar variação.
- Responsivo: tailwind `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` nos cards; tabs colapsam em acordeão em mobile.

### 4.5 Items a remover/aposentar (Front)
- Qualquer modal/flow que apresente apenas legenda+hashtags sem blocos (ver buscas por "hashtags" em `src/components` e `src/pages`).
- Chamadas diretas ao endpoint de IA que não passem pelo novo payload `modalidades` (ex.: integrações antigas em `src/integrations` que enviem apenas `prompt`).

## 5) Plano de Backend (Supabase Edge Functions)
### 5.1 Schemas e validação
- Adicionar **schemas Zod** (ou validação manual) por formato dentro de `content-engine`:
  - `blog`: titulo, resumo (<=120 palavras), corpo estruturado (array de seções com h2/h3 + parágrafos), CTA list, metadados (hashtags/keywords), suposições.
  - `carrossel`: slides numerados (6-8) com titulo curto + copy, CTA no slide final, metadados.
  - `email`: assunto, preheader, blocos de corpo (parágrafos e bullet list), CTA com rótulo e link.
  - `roteiro_video`: gancho, apresentacao, 3-4 pontos-chave, fechamento, CTA, sugestão de cenas/B-roll.
  - `post_curto`: headline, corpo 80-120 palavras, CTA curto, metadados.
- Validar presença de cada bloco; se faltar, preencher com fallback claro (`"[PENDING]"`).

### 5.2 Payload unificado e prompts
- Ajustar `content-engine` para aceitar `formats: string[]` (ex.: `["blog","carrossel","email","roteiro_video","post_curto"]`).
- System prompt passa a exigir **JSON com campo `modalidades`** contendo objetos por formato, cada um seguindo o schema acima, e checklist de qualidade.
- Registrar `prompt_original` e `formats` na `content_library`.

### 5.3 Persistência e modelo de dados
- Tabela `content_library`:
  - Novo campo `modalidades jsonb` (bundle multimodal).
  - Campo `is_structured boolean` default true para novas gerações.
  - Campo `formats text[]` para rastrear quais formatos foram pedidos.
- Migração em `supabase/migrations`: criar colunas e índices parciais para consulta por `is_structured` e `formats`.

### 5.4 APIs adicionais (opcional)
- **`/api/preview`** (Edge Function simples) para reformatar conteúdo legado em estrutura parcial e marcar `is_structured=false`.
- **`/api/validate-content`** para revalidar conteúdos existentes com schema e sinalizar itens faltantes.

### 5.5 Itens a remover/aposentar (Backend)
- Prompts genéricos do `content-engine` que retornam JSON sem blocos; substituir pelo prompt com `modalidades` e schemas.
- Funções redundantes que gerem apenas um formato sem estrutura (ver `generate-quick-post`, `generate-photo-idea`) se forem mantidas, obrigar a responder via novo schema ou marcar como legado.

## 6) Integração Front ↔ Backend
1. `PromptBuilder` → `useContentGeneration` → chamada ao `content-engine` com `{ prompt, formats, options }`.
2. Resposta `{ modalides: { blog: {...}, carrossel: {...}, ...}, checklist: {...} }` é persistida e exibida pelo `StructuredContentModal`.
3. Ações de salvar/duplicar usam `content_library` com novos campos `modalidades`, `formats`, `is_structured`.
4. Conteúdos legados continuam a funcionar, mas entram em modo de "visualização simples" sem abas; banner sugere "Gerar versão estruturada".

## 7) Governança e QA
- **Checklist de entrega**: todos os blocos preenchidos, CTAs separados, metadados no final, suposições explícitas se dados faltarem.
- **Teste automatizado**: mock da Edge Function gerando payload e validação de schemas; testes de UI com render de `StructuredContentModal` em formatos múltiplos.
- **Métricas**: medir taxa de preenchimento de blocos, tempo médio de geração e NPS interno (capturar feedback após salvar conteúdo).

## 8) Roadmap de implementação (alto nível)
1. Criar hooks (`useContentTemplates`, `useContentGeneration`) e novos componentes de UI (PromptBuilder, StructuredContentModal, QualityChecklist).
2. Ajustar `content-engine` com schemas, prompt multimodal e campos novos; criar migração `content_library`.
3. Integrar rota `/creator` e botão na biblioteca; conectar a persistência com novos campos.
4. Refatorar fluxos legados e remover/ajustar endpoints sem schema.
5. QA e testes (UI + função edge) + manual checklist em staging.
