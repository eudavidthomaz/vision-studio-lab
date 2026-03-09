

# Auditoria Completa: Church Site Feature

## BUGS CONFIRMADOS

### BUG 1: `section_titles` NÃO incluído no `createSite`
**Arquivo**: `src/hooks/useChurchSite.tsx` L170-187
**Gravidade**: Media
**Impacto**: Ao criar um site novo, a coluna `section_titles` não é enviada no insert. O banco usa o DEFAULT, então funciona, mas se o default do banco estiver desalinhado do `DEFAULT_SECTION_TITLES` do TypeScript, haverá inconsistência silenciosa. Deveria ser explícito.

### BUG 2: Pages NÃO são lazy-loaded (contradiz memory de arquitetura)
**Arquivo**: `src/App.tsx` L25-27
**Gravidade**: Media
**Impacto**: `Sites`, `SiteEditor`, e `ChurchSite` são imports estáticos (`import Sites from "./pages/Sites"`). Segundo a memória `debugging/lazy-loading-suspense-error-handling`, todas as pages (exceto Landing) devem usar `React.lazy()` + Suspense. Isso aumenta o bundle inicial e contradiz o padrão do projeto.

### BUG 3: `youtubeChannelUrl` da Media nunca é editável
**Arquivo**: `src/pages/SiteEditor.tsx`
**Gravidade**: Baixa
**Impacto**: O campo `media.youtubeChannelUrl` existe no type `ChurchSiteMedia` e no banco, mas não há input no editor para preenchê-lo. O `MediaSection` usa `socialLinks.youtube` para os botões "Assistir ao vivo" e "YouTube", tornando `youtubeChannelUrl` dead data.

### BUG 4: Botão "Quero visitar" não faz nada
**Arquivo**: `src/components/church-site/sections/HeroSection.tsx` L72-76
**Gravidade**: Media
**Impacto**: O botão "Quero visitar" é um `<Button>` sem `onClick`, `href`, ou `asChild`. Clicar nele não faz nada. Deveria abrir WhatsApp ou scroll to contact.

### BUG 5: `Button variant="solid"` perde sparkles quando `asChild`
**Arquivo**: `src/components/ui/button.tsx` L52-59
**Gravidade**: Cosmetica
**Impacto**: Quando `asChild={true}`, o button renderiza via `Slot` e pula o bloco de sparkles. Todos os botões `variant="solid" asChild` nas seções (Prayer, Giving, FirstTime, etc.) não têm sparkles no hover. Comportamento inconsistente mas não é breaking.

### BUG 6: Preview no editor herda tema global
**Arquivo**: `src/components/church-site/ChurchSiteTemplate.tsx` L56-59
**Gravidade**: Media
**Impacto**: O template usa `bio-theme-dark`/`bio-theme-light` que sobrescreve CSS variables globais (`--background`, `--foreground`). No preview do editor, isso causa conflito visual: o painel do editor e o preview compartilham o mesmo DOM, então as variáveis CSS do preview podem "vazar" e afetar o editor.

### BUG 7: Cor hex vs HSL — cores customizadas incompatíveis
**Arquivo**: `ChurchSiteTemplate.tsx` + `index.css`
**Gravidade**: ALTA
**Impacto**: O banco armazena cores como HEX (`#8B5CF6`), mas o fallback no template é HSL (`hsl(263 70% 50%)`). O `color-mix(in srgb, ...)` funciona com ambos os formatos, então tecnicamente OK. **MAS** — o `input type="color"` retorna HEX, e as CSS variables recebem HEX diretamente. Funciona, mas o fallback deveria ser HEX também para consistência.

### BUG 8: Auto-save dispara com referência stale de `handleSave`
**Arquivo**: `src/pages/SiteEditor.tsx` L143-147
**Gravidade**: Media
**Impacto**: O `useEffect` para auto-save referencia `handleSave` sem incluí-lo no array de dependências. `handleSave` captura `localConfig` e `site` por closure. Se `debouncedConfig` muda, `handleSave` pode usar um `localConfig` stale. Resultado: possível perda de dados se múltiplas edições rápidas acontecem.

---

## TRUNCAMENTOS / DEAD CODE

| Item | Arquivo | Problema |
|------|---------|----------|
| `media.youtubeChannelUrl` | Type + DB | Campo existe mas nunca editado nem usado |
| `socialLinks.facebook` | Type + editor | Editável, mas nenhuma seção renderiza link do Facebook |
| `seo.ogImageUrl` | Type + DB | Existe no type/DB mas sem campo de upload no editor e sem uso no meta tags |
| Seção "Mídia" vazia no editor | `SiteEditor.tsx` L583 | Comentário `{/* Media Section - YouTube is now configured in Hero */}` sem conteúdo. Seção fantasma |

---

## PLANO DE CORREÇÃO (por prioridade)

### P0 — Crítico
1. **Fix auto-save stale closure** — Extrair handleSave para `useCallback` com deps corretas, ou usar ref
2. **Fix "Quero visitar" button** — Conectar ao WhatsApp ou scroll para seção de contato

### P1 — Importante
3. **Lazy-load pages** — Converter `Sites`, `SiteEditor`, `ChurchSite` para `React.lazy()` com Suspense
4. **Incluir `section_titles` no createSite** — Adicionar `section_titles: toJson(DEFAULT_SECTION_TITLES)` no insert
5. **Fix fallback HSL → HEX** — Mudar fallback para `'#8B5CF6'` e `'#6366F1'`
6. **Isolar preview do editor** — Adicionar `isolation: isolate` ou usar iframe para o preview

### P2 — Limpeza
7. **Remover `youtubeChannelUrl`** — Dead field (ou adicionar campo no editor)
8. **Adicionar input para `seo.ogImageUrl`** — Ou remover do type
9. **Adicionar Facebook ao FooterSection** — Ou remover do editor
10. **Remover comentário vazio da seção Mídia** no editor

---

## ARQUIVOS A MODIFICAR

| Arquivo | Alterações |
|---------|-----------|
| `src/App.tsx` | Lazy-load Sites, SiteEditor, ChurchSite |
| `src/pages/SiteEditor.tsx` | Fix auto-save closure; remover seção mídia vazia; add ogImage upload |
| `src/hooks/useChurchSite.tsx` | Add `section_titles` ao createSite insert |
| `src/components/church-site/sections/HeroSection.tsx` | Fix botão "Quero visitar" |
| `src/components/church-site/ChurchSiteTemplate.tsx` | Fix fallback HEX; isolar preview |
| `src/components/church-site/sections/FooterSection.tsx` | Add Facebook link |

