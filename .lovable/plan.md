

# Marca d'água Ide.On no Footer — Site Público

## Escopo
Arquivo único: `src/components/church-site/sections/FooterSection.tsx`.

## Mudança
Inserir bloco condicional `{!isPreview && ...}` entre o conteúdo principal do footer e o copyright existente.

### Conteúdo inserido
- Logo `/logo.png` centralizado, `w-6 h-6`, `opacity-60`
- Texto "Criado com **Ide.On** — Crie o site da sua igreja"
- "Ide.On" usa `font-brother` (já registrada no Tailwind config como `'BROTHER'`), link para `https://midias.app`, com `hover:text-primary transition-colors`
- Posicionado com `mt-6` acima do copyright, `flex flex-col items-center gap-2`

### Código exato (inserir antes do `div` de copyright, ~L89)
```tsx
{!isPreview && (
  <div className="text-center mt-6 flex flex-col items-center gap-2">
    <img src="/logo.png" alt="Ide.On" className="w-6 h-6 object-contain opacity-60" />
    <p className="text-muted-foreground/50 text-[10px] sm:text-xs">
      Criado com{" "}
      <a
        href="https://midias.app"
        target="_blank"
        rel="noopener noreferrer"
        className="font-brother underline underline-offset-2 hover:text-primary transition-colors"
      >
        Ide.On
      </a>
      {" "}— Crie o site da sua igreja
    </p>
  </div>
)}
```

Zero mudanças no editor preview. Zero mudanças em outros arquivos.

