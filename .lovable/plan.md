

# Isolar ThemeSwitch na Página /bio

## Problema
O `ThemeProvider` envolve todo o `App.tsx`, então quando o toggle na `/bio` altera o tema, afeta todas as páginas do projeto.

## Solução
Criar um sistema de tema isolado apenas para a página `/bio`, independente do resto da aplicação.

### Mudanças

**1. App.tsx** — Remover ThemeProvider global ou fixar em `dark`
- O resto do app permanece sempre em modo dark (padrão do projeto)

**2. src/pages/Bio.tsx** — Tema local com state
- Substituir `useTheme()` do next-themes por um `useState` local
- Aplicar classe `dark` ou `light` no container da página via className
- ThemeSwitch controlará apenas o container da Bio

### Implementação Técnica

```tsx
// Bio.tsx - Tema isolado
const [theme, setTheme] = useState<'light' | 'dark'>('light');

return (
  <div className={cn(theme, "min-h-screen")}>
    {/* ThemeSwitch recebe setTheme local */}
  </div>
);
```

```tsx
// ThemeSwitch - Aceitar props opcionais
interface Props {
  theme?: string;
  setTheme?: (theme: string) => void;
}
```

O App.tsx mantém ThemeProvider fixo em `dark` para garantir consistência nas outras páginas.

