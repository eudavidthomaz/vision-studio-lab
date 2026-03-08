

# Rebranding CarrosselView — Galeria 3D Circular com Drag/Swipe

## Objetivo
Substituir o carousel flat (embla-carousel) por uma galeria 3D circular com rotação via drag/swipe, cards escuros com gradiente e glow, mantendo toda funcionalidade existente (copiar, gerar imagem, legenda, hashtags).

## Arquivos

### 1. `src/components/ui/circular-carousel.tsx` (novo)
Componente reutilizável de carousel 3D circular adaptado para contexto de modal:
- Rotação via **drag horizontal** (mouse + touch) ao invés de scroll da página
- `perspective: 2000px`, `preserve-3d`, `rotateY` por item
- Props: `items`, `radius` (default ~280 para caber no modal), `onItemClick`
- Cada item renderizado como card escuro com:
  - Fundo `#0e131f` + gradiente roxo/cyan na base (estilo GlassCard)
  - Noise texture overlay
  - Borda luminosa bottom + laterais
  - Opacidade dinâmica baseada no ângulo (frente = 1, trás = 0.3)
- Drag state via `useRef` para posição inicial, delta, e inércia
- Auto-rotação lenta quando idle (para após drag)

### 2. `src/components/content-views/CarrosselView.tsx` (refatorar)
Substituir o bloco `<Carousel>` de embla por `<CircularCarousel3D>`:
- Mapear `slides[]` para items do carousel 3D
- Cada card 3D mostra: número do slide, título, conteúdo (truncado), CTA
- Click/tap num card expande para ver conteúdo completo + botões (copiar, gerar imagem)
- Card expandido: overlay escuro + card ampliado com animação `framer-motion`
- Manter seções abaixo intactas: legenda, hashtags, dicas, fundamento, estratégia, copiar tudo

### 3. `src/index.css`
Adicionar animação `@keyframes carousel-glow-pulse` para o glow pulsante nos cards 3D.

## Fluxo UX
```text
Modal abre → Galeria 3D com slides girando lentamente
                ↓
Usuário arrasta/swipa → rotação segue o dedo/mouse
                ↓
Toca num card → card expande (overlay) com conteúdo completo
                ↓
Dentro do card expandido: [Copiar] [Gerar Imagem]
                ↓
Fecha card → volta para galeria 3D
```

## Detalhes técnicos
- Drag handler: `onPointerDown` → registra x inicial, `onPointerMove` → calcula delta e atualiza rotação, `onPointerUp` → aplica inércia com `requestAnimationFrame`
- Cards 3D: `transform: rotateY(${angle}deg) translateZ(${radius}px)` — posicionamento circular
- Card expandido: `AnimatePresence` + `motion.div` com `layoutId` para transição suave
- Raio adaptativo: 280px desktop, 180px mobile (via `useIsMobile`)
- Tamanho dos cards: 220x300px mobile, 280x380px desktop

## Não alterado
- `ContentViewer.tsx` — continua mapeando `carrossel` → `CarrosselView`
- `normalizeContentData.ts` — normalização dos dados intacta
- Modais de imagem, upgrade, fundamento, estratégia — intactos
- Outros 33 content types — sem mudança

