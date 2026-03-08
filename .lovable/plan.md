

# Fix: Dupla Barra de Scroll nos Modais de Conteúdo

## Causa Raiz

Existem **duas camadas de scroll sobrepostas**:

1. **`UnifiedContentModal`** → `<ScrollArea className="max-h-[calc(90dvh-110px)]">` (Radix ScrollArea com scrollbar customizada)
2. **`DialogContent`** (base) → `overflow-hidden` no container, mas o conteúdo interno (ex: `CarrosselView`) pode ter `overflow-y-auto` adicional

No mobile (`MobileContentSheet`), o mesmo problema: `<div className="flex-1 overflow-y-auto">` + o conteúdo interno com seus próprios scrolls.

O `ContentViewer` wrapper também força `overflow-x-hidden`, criando contextos de scroll adicionais.

```text
DialogContent (overflow-hidden)
  └─ ScrollArea (scroll #1 - scrollbar visível)
       └─ div wrapper (overflow-x-hidden)
            └─ ContentViewer
                 └─ CarrosselView (overflow-x-clip + cards com overflow-y-auto)
                      → scroll #2 aparece aqui
```

## Solução

### 1. `src/components/UnifiedContentModal.tsx`
- Substituir `<ScrollArea>` por uma `div` com `overflow-y-auto` simples — elimina a scrollbar duplicada do Radix
- A div herda o estilo de scrollbar customizado global (já definido no `index.css`)

### 2. `src/components/MobileContentSheet.tsx`
- Garantir que o wrapper de scroll (`flex-1 overflow-y-auto`) seja o **único** ponto de scroll
- Sem mudança estrutural necessária (mobile já usa div nativa)

### 3. `src/components/ContentViewer.tsx`
- Remover `overflow-x-hidden` do wrapper — o modal pai já controla overflow

Resultado: **uma única scrollbar** controlada pelo container do modal.

