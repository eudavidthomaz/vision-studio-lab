

# Remover Instruções que o Modelo Renderiza como Texto Literal

## Problemas Encontrados

### 1. Prompt principal (linha 179) - "Subtitle/signature"
A instrução `Subtitle/signature (optional): following lines from input (handwritten/brush fine style)` usa a palavra **"signature"**, que o modelo traduz e renderiza como "Assinatura" na imagem. Esta e provavelmente a causa principal do problema em todos os estilos.

### 2. Estilo `minimalista` (linha 121)
A instrucao `subtitulo pequeno "handwritten" sutil` contem a palavra "handwritten" entre aspas, que o modelo pode renderizar literalmente.

### 3. Estilo `fotografico` (linha 123)
A instrucao `grade tipo Kodak Portra` menciona uma marca comercial que o modelo pode renderizar como texto na imagem.

## Correcoes

### Arquivo: `supabase/functions/generate-post-image/index.ts`

**Mudanca 1** - Estilo `minimalista` (linha 121):
```
Antes:  'fundo liso ou leve gradiente escuro; foco total no titulo grande; poucos elementos graficos; subtitulo pequeno "handwritten" sutil.'
Depois: 'fundo liso ou leve gradiente escuro; foco total no titulo grande; poucos elementos graficos; subtitulo em fonte cursiva fina e discreta.'
```

**Mudanca 2** - Estilo `fotografico` (linha 123):
```
Antes:  'cena cinematografica com luz dramatica (...). Profundidade de campo realista; grade tipo Kodak Portra; texto ocupando terco esquerdo/baixo com fundo limpo.'
Depois: 'cena cinematografica com luz dramatica (...). Profundidade de campo realista; tonalidade quente analogica com leve dessaturacao; texto ocupando terco esquerdo/baixo com fundo limpo.'
```

**Mudanca 3** - Prompt principal para posters (linha ~179):
```
Antes:  '* Subtitle/signature (optional): following lines from input (handwritten/brush fine style).'
Depois: '* Subtitle (optional): following lines from input (cursive brush fine style).'
```

Remover a palavra "signature" do prompt principal e a causa mais impactante -- ela afeta todos os estilos, nao apenas o tipografico.

## Resultado Esperado

- Nenhum estilo tera palavras que o modelo interpreta e renderiza como texto literal
- A palavra "Assinatura" deixara de aparecer em imagens de qualquer estilo
- Os efeitos visuais desejados serao mantidos com descricoes alternativas
