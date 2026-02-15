
# Remover Estilo Fotografico e Refinar Overlay

## Mudancas

### 1. Remover estilo "fotografico"

**Backend** (`supabase/functions/generate-post-image/index.ts`):
- Remover `'fotografico'` do array `ALLOWED_ESTILOS` (linha 20)
- Remover a entrada `'fotografico'` do objeto `estiloAdaptacoes` (linha 123)

**Frontend** (`src/components/ImageGenerationModal.tsx`):
- Remover o `<SelectItem value="fotografico">` da lista de estilos (linha 386)

### 2. Manter e melhorar o modo Overlay existente

O sistema atual de overlay ja faz exatamente o que voce descreveu: a imagem original do usuario fica intacta como camada de fundo, e texto e gerado via HTML/CSS (fontes reais, nitidez perfeita, fundo transparente). A IA (Gemini Flash) apenas analisa a foto e sugere posicoes, cores e conteudo de texto -- nao gera pixels de tipografia.

Nenhuma mudanca adicional e necessaria no modo overlay, pois ele ja segue a abordagem correta:
- Imagem original preservada
- Tipografia renderizada via HTML com Google Fonts (Montserrat, Playfair Display)
- Filtro de brilho CSS sobre a imagem de fundo
- Exportacao via html2canvas em PNG alta resolucao (escala 2x)
- Drag-and-drop para reposicionar textos
- Edicao de texto em tempo real

### Arquivos editados

| Arquivo | Mudanca |
|---------|---------|
| `supabase/functions/generate-post-image/index.ts` | Remover "fotografico" de ALLOWED_ESTILOS e estiloAdaptacoes |
| `src/components/ImageGenerationModal.tsx` | Remover SelectItem "fotografico" |

### Resultado

- Estilo fotografico removido de todas as interfaces e do backend
- Modo overlay continua funcionando como a solucao para editar fotos do usuario com tipografia profissional
- 3 estilos restantes para geracao de imagem nova: Minimalista, Tipografico, Ilustrativo
