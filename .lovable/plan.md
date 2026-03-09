

# Remover campo `tagline` — Eliminar duplicidade com `hero.subtitle`

## Problema
Dois campos competem pela mesma posição visual no Hero:
- `branding.tagline` (editor: "Slogan / Tagline")
- `hero.subtitle` (editor: "Subtítulo")

O Hero renderiza `hero.subtitle || branding.tagline`, criando confusão. O `hero.subtitle` é o campo correto — tagline é redundante.

## Alterações

### 1. `src/pages/SiteEditor.tsx`
Remover o bloco do input "Slogan / Tagline" (L320-326) da seção Marca & Identidade.

### 2. `src/components/church-site/sections/HeroSection.tsx`
Linha 53: trocar `{hero.subtitle || branding.tagline}` por `{hero.subtitle}`.

### 3. `src/types/churchSite.ts`
- Remover `tagline: string` de `ChurchSiteBranding` (L11)
- Remover `tagline: ''` de `DEFAULT_BRANDING` (L190)

### 4. `src/hooks/useChurchSite.tsx`
Verificar se `tagline` é referenciado no createSite/updateSite — ajustar se necessário.

> **Nota**: `src/pages/Bio.tsx` usa `CHURCH.tagline` em dados hardcoded locais — escopo diferente, não afetado.

