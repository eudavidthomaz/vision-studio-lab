

# Melhorar fechamento do modal de conteúdo no mobile

## Problema
O `MobileContentSheet` ocupa `96dvh` (96% da tela), deixando apenas ~4% de area externa para toque. O botao X do `SheetContent` fica no canto superior direito mas compete com o header denso. Precisa de um botao de fechar mais visivel e reduzir a altura.

## Mudancas

### Arquivo: `src/components/MobileContentSheet.tsx`

1. **Reduzir altura** de `h-[96dvh]` para `h-[90dvh]` — libera ~10% de area externa para toque
2. **Adicionar botao fechar explicito** no header, visivel e acessivel — um `X` ou chevron-down com `onClose`
3. **Adicionar handle visual** (barra de arrastar) no topo do sheet, indicando que pode ser arrastado para fechar

### Arquivo: `src/components/content-feed/ContentFeedModal.tsx`

Mesmo problema no Dialog de feed — ocupa quase toda a tela no mobile. Adicionar botao X visivel no header com padding adequado.

### Codigo esperado (MobileContentSheet)

```tsx
<SheetContent 
  side="bottom" 
  className="h-[88dvh] w-screen max-w-full p-0 rounded-t-2xl ..."
>
  {/* Handle de arrastar */}
  <div className="flex justify-center pt-3 pb-1">
    <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
  </div>
  
  <div className="flex flex-col h-full w-full">
    <SheetHeader className="...">
      {/* Botao fechar explicito */}
      <button onClick={onClose} className="absolute right-3 top-3 ...">
        <X className="h-5 w-5" />
      </button>
      ...
    </SheetHeader>
    ...
  </div>
</SheetContent>
```

### ContentFeedModal
Adicionar botao X no topo do `DialogContent` com posicionamento fixo visivel.

