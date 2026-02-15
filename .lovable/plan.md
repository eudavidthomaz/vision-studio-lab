
# Auditoria Completa de Responsividade Mobile - 6 Etapas

## Problemas Identificados

Apos analise completa de 40+ arquivos, identifiquei **32 problemas criticos** organizados em 6 etapas estrategicas.

---

## ETAPA 1: CSS Global e Infraestrutura Base

### Problemas:
1. **`index.css` - iOS auto-zoom forcado**: A regra `font-size: 16px !important` em `@supports (-webkit-touch-callout)` esta aplicada a TODOS inputs/textareas/selects globalmente, incluindo selects pequenos de 8px dentro de paineis de edicao do overlay. Isso distorce layouts.
2. **`index.css` - Falta `overflow-x: hidden` no body**: Nenhuma protecao global contra scroll horizontal.
3. **`tailwind.config.ts` - Falta breakpoint `xs`**: Dispositivos abaixo de 375px nao tem breakpoint dedicado.

### Correcoes:
- Remover `!important` do font-size global e aplicar seletivamente apenas onde necessario (inputs de formulario principal, nao componentes UI internos)
- Adicionar `html, body { overflow-x: hidden; }` no CSS base
- Considerar `overscroll-behavior-x: none` para prevenir bounce horizontal

---

## ETAPA 2: Navegacao e Header (HeroHeader, Dashboard)

### Problemas:
4. **`HeroHeader.tsx` - Botoes do header transbordam em telas < 360px**: 5 botoes em `flex` sem `flex-wrap` causam overflow horizontal quando todos estao visiveis.
5. **`HeroHeader.tsx` - Hero section ocupa muito espaco vertical no mobile**: `py-6 sm:py-8 md:py-10 lg:py-16` resulta em padding excessivo no mobile, empurrando conteudo para baixo.
6. **`Dashboard.tsx` - `container mx-auto px-4 py-8`**: `py-8` e excessivo no mobile, deveria ser `py-4 sm:py-8`.
7. **`AICreatorCard.tsx` - `p-8 md:p-12`**: Padding interno de 32px no mobile desperdiça espaco precioso.
8. **`AICreatorCard.tsx` - `text-2xl md:text-3xl`**: Titulo grande demais para telas de 320px.

### Correcoes:
- HeroHeader: Adicionar `flex-wrap` nos botoes e usar layout mais compacto no mobile (icones sem texto em < 640px ja existe, mas o container precisa wrap)
- Reduzir padding do hero no mobile
- Dashboard: `py-4 sm:py-6 md:py-8`
- AICreatorCard: `p-4 sm:p-6 md:p-8 lg:p-12`

---

## ETAPA 3: Modais e Sheets (AIPromptModal, ImageGenerationModal, UnifiedContentModal, UpgradeModal, YouTubeTranscriptModal)

### Problemas:
9. **`AIPromptModal.tsx` - Textarea com `min-h-[140px]`**: No mobile, quando o teclado sobe, esta altura minima + DialogHeader + dicas empurram botoes para fora da viewport. Nenhuma protecao contra `visualViewport`.
10. **`ImageGenerationModal.tsx` - `max-w-2xl max-h-[92vh]`**: O `max-h-[92vh]` nao considera a barra de URL do mobile (deveria usar `92dvh`).
11. **`ImageGenerationModal.tsx` - Tab "Editar Foto"**: O `ImageOverlayEditor` com canvas de 400px de largura fixa nao se adapta a telas menores que 400px.
12. **`UnifiedContentModal.tsx` - `w-[min(95vw,48rem)]`**: Correto para desktop, mas no mobile a combinacao de padding + width causa micro-overflow.
13. **`UpgradeModal.tsx` - `sm:max-w-2xl`**: Grid de 2 colunas (`md:grid-cols-2`) colapsa corretamente, mas os cards de plano com `text-2xl font-bold` para preco transbordam em telas < 360px.
14. **`EditableOverlay.tsx` - Painel de edicao com `min-w-[280px]`**: Este painel flutuante extravasa da tela no mobile. Nao tem protecao de posicionamento.
15. **`MobileContentSheet.tsx` - `h-[96dvh]`**: O SheetContent nao tem `pb-safe` para safe area do iPhone.

### Correcoes:
- AIPromptModal: Reduzir `min-h` da textarea no mobile, usar `max-h-[85dvh]` em vez de `92vh`, adicionar scroll interno
- ImageGenerationModal: Usar `dvh`, tornar canvas responsivo com `Math.min(containerWidth, 400)`
- EditableOverlay: Painel de edicao deve usar `fixed bottom-0` no mobile em vez de `absolute`
- MobileContentSheet: Adicionar `pb-safe`
- Todos modais: Usar `dvh` em vez de `vh`

---

## ETAPA 4: Bulk Actions, Content Library e Views de Lista/Galeria

### Problemas:
16. **`BulkActionsBar.tsx` - Botoes transbordam no mobile**: 6 botoes em `flex` horizontal sem `flex-wrap` nem scroll causam overflow. Nenhuma adaptacao mobile.
17. **`ContentLibrary.tsx` - Header sticky com muitos elementos**: O header fixo acumula BulkActionsBar + titulo + ViewSwitcher + filtros, ocupando > 50% da viewport no mobile.
18. **`ContentListView.tsx` - Tabela com 9 colunas**: Mesmo com `hidden sm:table-cell` em algumas, restam 6 colunas visiveis no mobile. Overflow horizontal garantido.
19. **`ContentGalleryView.tsx` - `grid-cols-2` no mobile**: Cards com checkbox + pin button + hover overlay funcionam mal em touch (hover nao existe).
20. **`ContentItemCard` (dentro de ContentLibrary.tsx) - `truncate` no titulo**: O titulo usa `truncate` (single line) quando deveria usar `line-clamp-2` para dar mais contexto ao usuario.

### Correcoes:
- BulkActionsBar: No mobile, usar um unico botao de menu com Sheet ou DropdownMenu que contem todas as acoes
- ContentListView: No mobile, substituir tabela por cards empilhados ou usar apenas 3-4 colunas essenciais
- ContentGalleryView: Substituir hover overlay por visibilidade permanente dos botoes no mobile
- Titulo: Usar `line-clamp-2` em vez de `truncate`

---

## ETAPA 5: Content Views (CarrosselView, PostSimplesView, DevocionalView, GenericContentView, etc.)

### Problemas:
21. **`CarrosselView.tsx` - Carousel com `px-8`**: O `px-8` interno dentro de `CarouselContent` reduz o espaco util drasticamente no mobile. Botoes Previous/Next (circular, 48px) ficam cortados.
22. **`CarrosselView.tsx` - Botoes CarouselPrevious/Next**: Estes sao `absolute -left-12 -right-12` por padrao do shadcn, transbordando fora do container.
23. **`GenericContentView.tsx` - `CardTitle` com `text-xl`**: Titulo grande demais em cards no mobile, quebrando layout do header quando combinado com botoes Copy + Regenerar.
24. **`StrategicIdeaCard.tsx` - Layout horizontal titulo + badge**: Em telas pequenas, titulo longo + `Badge` de formato prioritario causam overflow.
25. **`FundamentoBiblicoCard.tsx` - `CardTitle text-lg`**: Titulo e icone ocupam muito espaco vertical desnecessariamente.
26. **`PostSimplesView.tsx` - Botao "Gerar Imagem" com Badge PRO inline**: A Badge PRO + texto + icone transbordam em telas < 360px.

### Correcoes:
- CarrosselView: Reduzir `px-8` para `px-0` e reposicionar botoes Previous/Next abaixo do carousel (inline, nao absolute) no mobile
- GenericContentView: Titulo `text-base sm:text-xl`, botoes empilhados no mobile
- StrategicIdeaCard: `flex-wrap` no header, badge abaixo do titulo no mobile
- Todos os Cards: Revisar paddings para `p-2 sm:p-3 md:p-4`

---

## ETAPA 6: Paginas Secundarias e Formularios (Auth, Profile, Volunteers, Schedules)

### Problemas:
27. **`Auth.tsx` - Dialog de reset senha**: `sm:max-w-md` sem `max-h` pode transbordar no mobile com teclado aberto.
28. **`Profile.tsx` - `TabsList grid-cols-2 h-auto`**: Funcional, mas emojis no texto (`👤 Perfil`, `📊 Uso Mensal`) podem causar inconsistencias de altura.
29. **`Volunteers.tsx` - Table overflow**: `overflow-x-auto` esta presente, mas a tabela inteira com 7 colunas visiveis no mobile requer scroll horizontal significativo sem indicacao visual.
30. **`AudioInput.tsx` - Botao de gravacao `h-40 w-40`**: 160px de diametro e grande demais para telas de 320px, especialmente dentro de `max-w-2xl` com padding.
31. **`AudioInput.tsx` - Upload area `p-12`**: Padding de 48px no mobile desperdiça espaco.
32. **`RecentContentSection.tsx` - Link para rota legada**: Usa `navigate('/biblioteca/${content.id}')` (rota legada) em vez de `navigate('/biblioteca?content_id=${content.id}')` conforme o novo padrao documentado na memoria.

### Correcoes:
- Volunteers: No mobile, substituir tabela por cards empilhados (igual pattern de ContentListView)
- AudioInput: Botao `h-28 w-28 sm:h-40 sm:w-40`, upload area `p-6 sm:p-12`
- RecentContentSection: Corrigir navegacao para formato query param
- Auth/Profile: Garantir `dvh` e protecoes de teclado virtual

---

## Resumo de Impacto

| Etapa | Arquivos | Problemas | Prioridade |
|-------|----------|-----------|------------|
| 1 | 2 | 3 | Critica (afeta tudo) |
| 2 | 3 | 5 | Alta |
| 3 | 6 | 7 | Alta |
| 4 | 4 | 5 | Alta |
| 5 | 6 | 6 | Media |
| 6 | 5 | 6 | Media |
| **Total** | **~25 arquivos** | **32 problemas** | |

## Ordem de Execucao

Cada etapa sera implementada como uma mensagem separada, na ordem acima. A Etapa 1 (CSS global) deve ser feita primeiro pois afeta todos os componentes subsequentes.
