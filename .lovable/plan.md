

# Rebranding Landing Page — Primeira Dobra + Modal de Vídeo

## Conceito

Dividir o hero atual em duas camadas inspiradas no padrão Apple/Stripe:

1. **Primeira dobra (hero)**: Headline cinematic com `font-gunterz`, subtítulo, badge, CTA e um **poster/thumbnail** clicável do vídeo (imagem estática com botão play overlay)
2. **Click no poster** → abre um **Dialog modal fullscreen** com o YouTube embed (nocookie, sem branding)
3. **Segunda seção**: O bloco "Como Funciona" permanece logo abaixo

## Mudanças

### `src/pages/Landing.tsx`

**Hero Section (linhas 97-161)** — Rewrite:
- Remover o iframe YouTube inline
- Redesenhar o hero com tipografia `font-gunterz` no título principal
- Adicionar thumbnail do YouTube como poster image (usar `https://img.youtube.com/vi/SGRIma5ElbY/maxresdefault.jpg`)
- Overlay de play button (ícone `Play` do lucide dentro de um círculo glass com backdrop-blur)
- Click no poster → `setVideoOpen(true)` (state local)
- Social proof e CTA permanecem abaixo do poster

**Video Modal** — Novo bloco:
- Usar `Dialog` do shadcn/ui (já instalado)
- Conteúdo: iframe YouTube nocookie com params `?autoplay=1&mute=0&loop=1&controls=0&modestbranding=1&showinfo=0&rel=0&playlist=SGRIma5ElbY`
- Container `aspect-video` dentro do dialog
- Fundo escuro (`bg-black/90`) com backdrop-blur
- Fechar com X ou click fora

**Estilo do hero redesenhado:**
- Título em `font-gunterz` com gradient text (`from-white via-white to-primary`)
- Layout mais espaçoso, `min-h-[90vh]` para ocupar a tela toda
- Poster com `rounded-2xl`, sombra forte, borda sutil `border-white/10`
- Hover no poster: scale sutil + glow no botão play
- Badge e social proof mantidos

### Nenhuma migration SQL necessária
YouTube embed não requer alterações no storage.

