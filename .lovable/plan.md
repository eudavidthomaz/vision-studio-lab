

# Reposicionar Texto da Hero: Título Acima e Abaixo do Vídeo

## Layout Desejado

```text
        A CÂMERA DESLIGA.
    ┌─────────────────────┐
    │                     │
    │       VÍDEO         │
    │                     │
    └─────────────────────┘
        A MISSÃO CONTINUA.
```

## Alterações em `src/components/HeroScrollVideo.tsx`

### Mudança de layout do título (linhas 245-259)

Atualmente as duas linhas estão em um `flex-col` centralizado com `gap-3`, sobrepostas ao vídeo via `mix-blend-difference`.

**Novo comportamento:**
- Remover o container `flex-col` que agrupa as duas linhas juntas.
- Posicionar `firstLine` como `absolute` acima do vídeo (ex: `top-[15%]` / `top-[12%]` mobile) com `left-1/2 -translate-x-1/2`.
- Posicionar `secondLine` como `absolute` abaixo do vídeo (ex: `bottom-[15%]` / `bottom-[12%]` mobile).
- Ambas mantêm o efeito de `translateX` baseado em `scrollProgress` para o slide-out lateral.
- Manter `mix-blend-difference` e `z-10` em cada linha individualmente.
- O vídeo continua centralizado (`top-1/2 left-1/2 -translate-x/y-1/2`) — sem mudança no media box.

### Ajuste do split do título (linhas 140-142)

Atualmente divide por metade de palavras. O título "A câmera desliga. A missão continua." tem 6 palavras → split no meio (3+3):
- `firstLine` = "A câmera desliga."
- `secondLine` = "A missão continua."

Isso já funciona corretamente. Sem mudança necessária aqui.

### Nenhuma mudança em `Landing.tsx`

O `title` prop já está correto.

