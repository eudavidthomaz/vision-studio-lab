

# Estabilização Arquitetural — Implementação Final

## Resumo Executivo

5 arquivos modificados, 1 criado. Zero alteração no site público. Preview fiel com performance estável.

## Alterações

### 1. CRIAR `src/components/ui/static-grid-pattern.tsx`

SVG puro que replica visualmente o `AnimatedGridPattern` — mesmas linhas de grid, mesmos squares de fundo — sem `useState`, `ResizeObserver`, `motion.rect`, ou `onAnimationComplete`. Posições determinísticas calculadas por índice (sem randomness, sem re-render).

### 2. `src/components/church-site/ChurchSiteTemplate.tsx`

**Condicionais por `isPreview`:**
- `AnimatedGridPattern` → `StaticGridPattern` (mesmas classes CSS)
- `AnimatePresence + motion.div` → `<div>` com mesmas classes (`className="relative"`)
- Nav: `sticky` → `relative` (scroll confinado no painel)
- ThemeSwitch: `fixed` → `absolute` (posicionamento dentro do preview)
- Passa `isPreview` para `HeroSection`

**React.memo:** Exportação envolvida com comparação customizada:
```tsx
export default React.memo(ChurchSiteTemplateInner, (prev, next) =>
  prev.isPreview === next.isPreview &&
  JSON.stringify(prev.config) === JSON.stringify(next.config)
);
```

**Site público** (`isPreview=false`): zero alterações — AnimatedGridPattern, AnimatePresence, motion.div, sticky nav, fixed ThemeSwitch — tudo intacto.

### 3. `src/components/church-site/sections/HeroSection.tsx`

**Quando `isPreview=true`:**
- Substitui `ContainerScrollHero` por layout estático que **replica fielmente** o visual final:
  - Container: `py-16 md:py-24 flex items-center justify-center relative p-2 md:p-20`
  - Title wrapper: `max-w-5xl mx-auto text-center` (idêntico ao Header do ContainerScrollHero)
  - Card: `max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-border/30 p-2 md:p-6 bg-card rounded-[30px] shadow-2xl` (exatamente as mesmas classes do Card)
  - Inner: `h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl md:p-4`
- `AnimatedGridPattern` → `StaticGridPattern` (mesmas classes)

**Quando `isPreview=false`:** zero alterações — ContainerScrollHero + AnimatedGridPattern intactos.

Conteúdo (logo, título, subtítulo, botões, badge, iframe/imagem) é **idêntico** em ambos os caminhos — extraído em variáveis compartilhadas.

### 4. `src/pages/SiteEditor.tsx`

**State management:**
- Remover `useMemo(() => React.memo(ChurchSiteTemplate))` L220 — ineficaz (cria novo componente a cada render)
- Importar o `ChurchSiteTemplate` diretamente (memo agora está no export do componente)
- Criar `previewConfig = useDebounce(localConfig, 300)` — preview atualiza 300ms após última keystroke
- Passar `previewConfig` para o template (L752)

**Remover sync useEffect (L118-140):**
- Eliminar completamente o useEffect que sincroniza `site.ministries`/`site.events`
- Remover `prevMinistriesRef` e `prevEventsRef`

**Mutation callbacks — atualização local direta (ministérios L498-511):**
```tsx
onAdd={async (ministry) => {
  const result = await addMinistry.mutateAsync({ siteId: site.id, ministry });
  setLocalConfig(prev => prev ? {
    ...prev,
    ministries: [...prev.ministries, {
      id: result.id, title: result.title,
      description: result.description || [],
      icon: result.icon || 'Heart', sortOrder: result.sort_order || 0,
    }],
  } : prev);
}}
onUpdate={async (id, updates) => {
  await updateMinistry.mutateAsync({ id, updates });
  setLocalConfig(prev => prev ? {
    ...prev,
    ministries: prev.ministries.map(m => m.id === id ? { ...m, ...updates } : m),
  } : prev);
}}
onDelete={async (id) => {
  await deleteMinistry.mutateAsync(id);
  setLocalConfig(prev => prev ? {
    ...prev,
    ministries: prev.ministries.filter(m => m.id !== id),
  } : prev);
}}
```
Mesma lógica para eventos (L516-528).

**Auto-save silencioso:** Remover `toast.success` do `handleSave` — manter apenas `toast.error`.

### 5. `src/hooks/useChurchSite.tsx`

**Mutations retornam dados inseridos/atualizados:**
- `addMinistry`: adicionar `.select().single()` ao insert → `mutationFn` retorna `data`
- `updateMinistry`: adicionar `.select().single()` ao update → retorna `data`
- `addEvent`: `.select().single()` → retorna `data`
- `updateEvent`: `.select().single()` → retorna `data`

**Remover `invalidateQueries`** de:
- `addMinistry.onSuccess`, `updateMinistry.onSuccess`, `deleteMinistry.onSuccess`
- `addEvent.onSuccess`, `updateEvent.onSuccess`, `deleteEvent.onSuccess`
- `updateSite.onSuccess`

**Manter `invalidateQueries`** em: `createSite`, `togglePublish`, `updateSlug`, `deleteSite`.

## Garantias

| Requisito | Implementação |
|-----------|---------------|
| Preview fiel ao site público | Mesma hierarquia HTML, classes CSS, componentes — só efeitos caros (AnimatedGridPattern, ContainerScrollHero, AnimatePresence) trocados por equivalentes estáticos visuais |
| Hero fiel na primeira dobra | Card estático replica exatamente `rounded-[30px]`, `border-4 border-border/30`, `shadow-2xl`, `h-[30rem] md:h-[40rem]`, `bg-card` |
| Zero regressão no site público | Tudo condicionado a `isPreview` — site público intocado |
| Sem re-render a cada keystroke | `useDebounce(localConfig, 300)` + `React.memo` com deep compare |
| Mutations instantâneas sem travamento | Estado local atualizado direto, sem ciclo mutation→refetch→useEffect→setState |
| Auto-save silencioso | `toast.success` removido; `toast.error` mantido |

