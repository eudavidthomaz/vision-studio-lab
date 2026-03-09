

# Marca d'água — Logo dinâmico por tema + tamanho maior

## Escopo
- Copiar os 2 logos para `public/`
- Editar `src/components/church-site/sections/FooterSection.tsx`

## Mudanças

### 1. Assets
- `user-uploads://Black_and_Beige_..._1.png` → `public/logo-ideon-dark.png` (logo escuro, visível no modo claro)
- `user-uploads://Black_and_Beige_..._3-2.png` → `public/logo-ideon-light.png` (logo claro/prata, visível no modo escuro)

### 2. Footer watermark (L89-104)
Substituir o `<img>` único por dois `<img>` com classes Tailwind para swap por tema:

```tsx
<img src="/logo-ideon-dark.png" className="dark:hidden w-10 h-10 object-contain opacity-50" />
<img src="/logo-ideon-light.png" className="hidden dark:block w-10 h-10 object-contain opacity-50" />
```

- Logo: `w-10 h-10` (antes `w-6 h-6`)
- Texto: `text-xs sm:text-sm` (antes `text-[10px] sm:text-xs`)
- Gap aumentado para `gap-3`

O site Church usa a classe `dark` no wrapper, então `dark:` funciona nativamente.

