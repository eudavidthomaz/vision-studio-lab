
# Melhorar o Modo Overlay: Fontes, Gradientes e IA Mais Inteligente

## Problemas Atuais

1. **Modelo fraco**: Usa `gemini-2.5-flash` que gera textos genericos e sem contexto
2. **Sem fontes personalizadas**: Nao ha Google Fonts carregadas -- tudo usa a fonte sans-serif padrao do sistema
3. **Sem seletor de fonte**: A interface `TextOverlay` nao tem campo `font_family`
4. **Textos pequenos**: O prompt nao instrui a IA a usar tamanhos grandes e impactantes
5. **Sem gradientes**: Nenhuma opcao de gradiente de fundo para melhorar legibilidade
6. **Prompt generico**: A IA nao recebe contexto suficiente sobre o que deve escrever

## Mudancas

### 1. Carregar Google Fonts (index.html)

Adicionar link para Montserrat (titulos impactantes), Playfair Display (elegante/editorial), Bebas Neue (condensado/impacto), Dancing Script (decorativa/cursiva) e Inter (corpo limpo).

### 2. Configurar fontes no Tailwind (tailwind.config.ts)

Adicionar fontFamily customizadas:
- `overlay-impact`: Bebas Neue (titulos grandes)
- `overlay-elegant`: Playfair Display (subtitulos sofisticados)
- `overlay-modern`: Montserrat (texto moderno/limpo)
- `overlay-handwritten`: Dancing Script (estilo manuscrito)
- `overlay-clean`: Inter (corpo neutro)

### 3. Expandir tipos e opcoes (src/lib/overlayPositions.ts)

- Adicionar campo `font_family` ao `TextOverlay` (opcional, default `montserrat`)
- Adicionar campo `gradient_overlay` ao `OverlayData` para gradientes sobre a imagem
- Adicionar `fontFamilyClasses` e `fontFamilyOptions` para o seletor
- Adicionar `gradientOptions` com presets (bottom-dark, top-dark, radial-center, etc.)
- Expandir `fontSizeClasses` ate `6xl` e `7xl` para textos de impacto

### 4. Atualizar o editor (src/components/EditableOverlay.tsx)

- Adicionar seletor de fonte no painel de edicao de texto
- Aplicar a classe de fonte correta no render do texto

### 5. Adicionar gradientes ao editor (src/components/ImageOverlayEditor.tsx)

- Adicionar seletor de gradiente (ex: gradiente escuro de baixo, gradiente de topo, radial)
- Renderizar uma camada de gradiente CSS entre a imagem e os textos
- Adicionar seletor de gradiente nos controles

### 6. Upgrade do modelo e prompt (supabase/functions/generate-image-overlay/index.ts)

**Modelo**: Trocar de `google/gemini-2.5-flash` para `google/gemini-2.5-pro` para analise de imagem mais precisa e textos mais criativos.

**Prompt reformulado** com instrucoes especificas:

- Analisar a imagem em detalhe: o que mostra (pessoas, paisagem, culto, batismo, etc.)
- Gerar textos contextuais baseados no que a foto mostra + o tema fornecido
- Usar tamanhos grandes por padrao (`3xl` a `6xl` para titulos)
- Sugerir a fonte mais adequada entre as opcoes disponiveis
- Sugerir gradiente quando necessario para legibilidade
- Retornar JSON expandido incluindo `font_family` e `gradient_overlay`

Exemplo de novo JSON de resposta:
```text
{
  "layout_action": "overlay_original_image",
  "overlays": [
    {
      "type": "text",
      "content": "CULTO DE ADORACAO",
      "position": "bottom_center",
      "color_hex": "#FFFFFF",
      "font_weight": "extrabold",
      "font_size": "5xl",
      "font_family": "bebas_neue",
      "background_highlight": false
    },
    {
      "type": "text",
      "content": "Domingo 19h",
      "position": "bottom_right",
      "color_hex": "#E0E0E0",
      "font_weight": "medium",
      "font_size": "xl",
      "font_family": "montserrat",
      "background_highlight": false
    }
  ],
  "image_filter": "none",
  "gradient_overlay": "bottom_dark_strong",
  "analysis": {
    "dominant_color": "dark",
    "suggested_text_color": "light",
    "safe_zones": ["bottom_center", "bottom_right"],
    "image_description": "Foto de culto com luzes roxas e plateia"
  }
}
```

## Detalhes Tecnicos

### Fontes Google (index.html)
```text
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Dancing+Script:wght@400;700&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Gradientes CSS disponveis
| Preset | CSS |
|--------|-----|
| `bottom_dark_strong` | `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)` |
| `bottom_dark_subtle` | `linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)` |
| `top_dark` | `linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 50%)` |
| `full_dark` | `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))` |
| `radial_vignette` | `radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)` |
| `none` | nenhum |

### Arquivos editados

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | Adicionar link Google Fonts |
| `tailwind.config.ts` | Adicionar fontFamily overlay-* |
| `src/lib/overlayPositions.ts` | Adicionar font_family, gradient, tamanhos maiores |
| `src/components/EditableOverlay.tsx` | Seletor de fonte no painel |
| `src/components/ImageOverlayEditor.tsx` | Camada de gradiente + seletor |
| `supabase/functions/generate-image-overlay/index.ts` | Modelo Pro + prompt inteligente |

### Resultado esperado

- Textos grandes e impactantes com fontes profissionais
- Gradientes que garantem legibilidade sem escurecer a foto inteira
- IA analisa a foto com precisao e sugere textos contextuais
- Seletores de fonte e gradiente na interface de edicao
