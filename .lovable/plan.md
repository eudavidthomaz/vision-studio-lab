

# Plano de Correção: Hero Section do Church Site

## Problemas Identificados

### 1. "Bem-vindo" Hardcoded (L38-40 do HeroSection.tsx)
```typescript
// ATUAL - Não editável
<span className="text-xs sm:text-sm...">
  Bem-vindo  // ← HARDCODED
</span>
```
O Bio.tsx original também tem hardcoded, mas para um template editável, isso deve ser configurável.

### 2. Schema do Hero Incompleto
`ChurchSiteHero` não possui campo para o label "Bem-vindo":
```typescript
export interface ChurchSiteHero {
  title: string;          // ← Existe
  subtitle: string;       // ← Existe
  // welcomeLabel: string ← FALTA
}
```

### 3. Editor não expõe o campo
`SiteEditor.tsx` não tem input para editar esse texto.

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/types/churchSite.ts` | Adicionar `welcomeLabel` ao `ChurchSiteHero` e `DEFAULT_HERO` |
| `src/components/church-site/sections/HeroSection.tsx` | Usar `hero.welcomeLabel` ao invés de hardcoded |
| `src/pages/SiteEditor.tsx` | Adicionar input para editar `hero.welcomeLabel` |

---

## Implementação

### 1. Schema (churchSite.ts)
```typescript
export interface ChurchSiteHero {
  welcomeLabel: string;  // NOVO
  title: string;
  subtitle: string;
  // ...
}

export const DEFAULT_HERO: ChurchSiteHero = {
  welcomeLabel: 'Bem-vindo',  // NOVO
  // ...
};
```

### 2. HeroSection.tsx
```typescript
<span className="text-xs sm:text-sm...">
  {hero.welcomeLabel || 'Bem-vindo'}
</span>
```

### 3. SiteEditor.tsx (seção Hero)
```typescript
<div>
  <Label>Label de Boas-vindas</Label>
  <Input
    value={localConfig.hero.welcomeLabel}
    onChange={(e) => updateNestedConfig("hero", "welcomeLabel", e.target.value)}
    placeholder="Bem-vindo"
  />
</div>
```

---

## Resultado Esperado
- Campo "Bem-vindo" editável no painel do editor
- Preview reflete alterações em tempo real
- Paridade visual com Bio.tsx mantida

