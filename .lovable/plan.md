
# Card de Escalas no Dashboard

## Objetivo
Criar um card elegante para a funcao de escalas de voluntarios, seguindo o padrao estetico do YouTubeCreatorCard (card secundario com icone, titulo, descricao e micro-animacoes de hover).

## Novo Componente: `src/components/ScheduleCreatorCard.tsx`

Card com o mesmo padrao visual do YouTubeCreatorCard, adaptado para escalas:

- **Icone**: `CalendarCheck` do lucide-react dentro de um container com fundo gradiente azul/indigo
- **Titulo**: "Escalas de Voluntarios"
- **Descricao**: "Organize e gerencie as escalas da sua equipe ministerial. Gere escalas inteligentes com IA."
- **Micro-animacoes**:
  - Hover: borda muda para indigo, fundo ganha tint sutil, sombra cresce
  - Icone container: transicao de cor no hover
  - Shimmer effect sutil no gradiente do icone (keyframe dedicado)
  - Tres mini-stats animados (total voluntarios, proxima escala, confirmacoes pendentes) que fazem fade-in escalonado ao entrar na viewport via `animate-fade-in` com delays

## Integracao no Dashboard (`src/pages/Dashboard.tsx`)

- Importar `ScheduleCreatorCard`
- Inserir como nova `<section>` entre o YouTubeCreatorCard e o RecentContentSection
- onClick navega para `/escalas`

## Detalhe Tecnico

```text
+---------------------------------------------------+
| [CalendarCheck icon]  Escalas de Voluntarios       |
|                       Organize e gerencie as       |
|                       escalas da sua equipe...     |
|                                                    |
|  [3 voluntarios]  [Prox: Dom 16/02]  [2 pendentes] |
+---------------------------------------------------+
```

- Os mini-stats usam dados reais via queries Supabase (count de voluntarios, proxima escala, confirmacoes pendentes)
- Se nao houver dados, os stats ficam ocultos e o card funciona como link simples
- Mobile-first: padding `p-4 sm:p-5 sm:p-6`, stats empilham em coluna no xs

## Arquivos Modificados

1. **Criar** `src/components/ScheduleCreatorCard.tsx` -- componente completo
2. **Editar** `src/pages/Dashboard.tsx` -- importar e inserir o card
