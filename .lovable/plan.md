
# Plano: Atualizar para o Melhor Modelo de Geração de Imagens

## Objetivo

Atualizar o modelo de geração de imagens de `google/gemini-2.5-flash-image-preview` para `google/gemini-3-pro-image-preview` para obter imagens de maior qualidade.

---

## Alteração Necessária

### Arquivo: `supabase/functions/generate-post-image/index.ts`

**Linha 138** - Alterar o modelo:

| Antes | Depois |
|-------|--------|
| `model: 'google/gemini-2.5-flash-image-preview'` | `model: 'google/gemini-3-pro-image-preview'` |

---

## Código da Alteração

```typescript
// Linha 138 - Atualizar modelo
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${lovableApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-3-pro-image-preview',  // ALTERADO
    messages: messages,
    modalities: ['image', 'text']
  }),
});
```

---

## Benefícios Esperados

| Aspecto | Melhoria |
|---------|----------|
| **Qualidade Visual** | Imagens mais detalhadas e realistas |
| **Renderização de Texto** | Textos mais legíveis e bem posicionados |
| **Composição** | Layouts mais sofisticados e profissionais |
| **Fidelidade ao Prompt** | Maior aderência às instruções fornecidas |

---

## Considerações

- **Latência**: O modelo Pro é mais lento que o Flash (~2-3x)
- **Custo**: Ligeiramente maior por imagem
- **Disponibilidade**: Sujeito aos mesmos rate limits do Lovable AI

---

## Resumo

| Item | Detalhe |
|------|---------|
| Arquivo modificado | `supabase/functions/generate-post-image/index.ts` |
| Linha alterada | 138 |
| Modelo anterior | `google/gemini-2.5-flash-image-preview` |
| Modelo novo | `google/gemini-3-pro-image-preview` |
