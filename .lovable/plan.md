

# Fix: Formas Geométricas Invisíveis

## Causa Raiz

Os keyframes `geo-float` e `geo-fade-in` estão definidos no `tailwind.config.ts`, mas **nenhuma classe `animate-*` correspondente foi criada** na seção `animation`. O Tailwind só gera `@keyframes` no CSS final quando uma utility class as referencia. O componente usa `style={{ animation: "geo-float..." }}` inline, mas os keyframes nunca foram emitidos no CSS.

## Correção

Duas opções (escolho a mais limpa):

**Mover os keyframes para `src/index.css`** como CSS puro, garantindo que existam independentemente do Tailwind. E trocar a abordagem no componente para usar classes CSS ao invés de inline styles.

### Arquivos

| Arquivo | Mudança |
|---|---|
| `src/index.css` | Adicionar `@keyframes geo-float` e `@keyframes geo-fade-in` diretamente |
| `src/components/GeometricBackground.tsx` | Remover `opacity-0` da classe (conflita com animation fill) e manter inline animation style |

A correção mais simples: adicionar os keyframes no CSS global e remover a classe `opacity-0` que compete com o `animation-fill-mode: forwards`.

