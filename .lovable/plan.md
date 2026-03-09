

# Auditoria Completa: SiteEditor — Todas as Seções

## BUG CRÍTICO: Sistema Trava ao Criar Ministério

### Root Cause: useEffect L119-127 cria loop de re-renders

```text
addMinistry.mutateAsync()
  → onSuccess → queryClient.invalidateQueries
  → site refetches → site.ministries = NEW array (sempre nova referência)
  → useEffect [site?.ministries, site?.events] dispara
  → setLocalConfig(novo objeto)
  → componente re-renderiza
  → ChurchSiteTemplate re-renderiza (4x AnimatedGridPattern + framer-motion)
  → ResizablePanelGroup dispara setState interno
  → sonner (toast) usa flushSync durante render
  → "Maximum update depth exceeded" → FREEZE
```

O array `site.ministries` é **sempre** uma nova referência (construído por `.map()` no `fetchUserSite`). Então cada refetch dispara o useEffect, mesmo que os dados sejam idênticos. Combinado com componentes pesados no preview (AnimatedGridPattern x4, framer-motion AnimatePresence x4, ContainerScrollHero), o re-render cascata causa o crash.

**Correção**: Comparar arrays por conteúdo antes de atualizar `localConfig`. Usar `JSON.stringify` shallow ou comparação por ID.

---

## TODOS OS BUGS IDENTIFICADOS

### Camada 1: State Management (SiteEditor.tsx)

| # | Bug | Gravidade | Linha |
|---|-----|-----------|-------|
| 1 | **useEffect de sync ministries/events** dispara em toda refetch por referência de array | CRÍTICA | L119-127 |
| 2 | **Preview re-renderiza inteiro** a cada keystroke (debounce é no save, não no preview) — 4x AnimatedGridPattern + framer-motion em cada render | ALTA | L737 |
| 3 | **toast.success("Alterações salvas")** no auto-save dispara sonner flushSync que conflita com ResizablePanelGroup | MEDIA | L160 |

### Camada 2: Editors (sub-componentes)

| # | Bug | Gravidade | Arquivo |
|---|-----|-----------|---------|
| 4 | **ValuesEditor** ainda usa emojis genéricos (📖 ❤️ ✨) em vez de Lucide icons — mesmo bug que foi corrigido no MinistriesEditor | ALTA | ValuesEditor.tsx L10-21 |
| 5 | **ValuesEditor** usa `Select` com emoji labels. Ao renderizar na AboutSection, usa `valueIcons` map com `Cross: Church` fallback — `Cross` não existe em Lucide, import silenciosamente falha | MEDIA | AboutSection.tsx L43 |
| 6 | **FaqEditor** usa `index` como key — reordenação causa bugs de estado | BAIXA | FaqEditor.tsx L37 |
| 7 | **ScheduleEditor** usa `index` como key — mesmo problema | BAIXA | ScheduleEditor.tsx L54 |
| 8 | **FaqEditor** mostra `GripVertical` icon sugerindo drag-and-drop, mas não implementa reordenação | COSMÉTICA | FaqEditor.tsx L39 |

### Camada 3: Seções Renderizadas (Template)

| # | Bug | Gravidade | Arquivo |
|---|-----|-----------|---------|
| 9 | **AboutSection** mostra `about.description` como subtítulo quando preenchido, sobrescrevendo o `sectionTitles.about.subtitle` — se o usuário preenche ambos, o subtitle some | MEDIA | AboutSection.tsx L73 |
| 10 | **MediaSection** duplica o YouTube embed — já aparece no Hero E na aba Mídia. Usuário vê o mesmo vídeo 2x | MEDIA | HeroSection.tsx L126 + MediaSection.tsx L47 |
| 11 | **PrayerSection** faz split da subtitle por ". " para separar em 2 parágrafos — se o texto customizado não tem ".", quebra o layout | BAIXA | PrayerSection.tsx L32-34 |
| 12 | **ScheduleSection** não usa `sectionTitles.schedule` — título hardcoded "Horários dos cultos" | MEDIA | ScheduleSection.tsx L47 |
| 13 | **ScheduleSection** não tem `sectionTitles` no tipo — falta definição no `ChurchSiteSectionTitles` | MEDIA | types/churchSite.ts |

### Camada 4: Dados / Backend

| # | Bug | Gravidade | Detalhes |
|---|-----|-----------|---------|
| 14 | **DB default de branding** ainda inclui `tagline` — `'{"name": "", "logoUrl": null, "tagline": "", ...}'` — campo foi removido do TypeScript mas persiste no banco | BAIXA | church_sites.branding column default |
| 15 | **DB default de media** ainda inclui `youtubeChannelUrl` — campo removido do TS mas default no banco mantém | BAIXA | church_sites.media column default |
| 16 | **socialLinks.facebook** é editável mas nenhuma seção usa (exceto Footer que adicionamos) — ContactSection ignora Facebook | BAIXA | ContactSection.tsx |

---

## PLANO DE CORREÇÃO

### P0 — Fix do Freeze

**Arquivo: `src/pages/SiteEditor.tsx`**
- Substituir useEffect L119-127 por comparação profunda: só chamar `setLocalConfig` se IDs dos ministries/events realmente mudaram
- Memoizar o `ChurchSiteTemplate` com `React.memo` para evitar re-render do preview a cada keystroke
- Remover `toast.success` do auto-save (silencioso) — manter apenas no save manual

### P1 — Fix dos Editors

**Arquivo: `src/components/church-site/editor/ValuesEditor.tsx`**
- Rebuild do seletor de ícones com Lucide icons reais (mesmo padrão do MinistriesEditor recém-corrigido)
- Remover emojis genéricos

**Arquivo: `src/components/church-site/editor/FaqEditor.tsx`**
- Remover ícone `GripVertical` que sugere drag sem implementar

### P2 — Fix das Seções

**Arquivo: `src/components/church-site/sections/AboutSection.tsx`**
- Separar descrição do subtítulo — description em parágrafo próprio, subtitle como subtitle do heading

**Arquivo: `src/components/church-site/sections/ScheduleSection.tsx`**
- Usar `sectionTitles` em vez de texto hardcoded

**Arquivo: `src/types/churchSite.ts`**
- Adicionar `schedule` ao `ChurchSiteSectionTitles` com default "Horários dos cultos"

**Arquivo: `src/components/church-site/sections/PrayerSection.tsx`**
- Remover split por ". " — renderizar subtitle inteiro em um parágrafo

### P3 — DB Cleanup

- Migration para atualizar defaults de `branding` (remover tagline) e `media` (remover youtubeChannelUrl) nas columns do banco

---

## ARQUIVOS A MODIFICAR

| Arquivo | Alterações |
|---------|-----------|
| `src/pages/SiteEditor.tsx` | Fix useEffect sync; memo preview; silenciar auto-save toast |
| `src/components/church-site/editor/ValuesEditor.tsx` | Rebuild seletor com Lucide icons |
| `src/components/church-site/editor/FaqEditor.tsx` | Remover GripVertical |
| `src/components/church-site/sections/AboutSection.tsx` | Separar description de subtitle |
| `src/components/church-site/sections/ScheduleSection.tsx` | Usar sectionTitles |
| `src/components/church-site/sections/PrayerSection.tsx` | Remover split ". " |
| `src/types/churchSite.ts` | Adicionar schedule a SectionTitles |
| DB Migration | Atualizar defaults de branding e media |

