

# Escalas: Drag-and-Drop, Visao Mensal e UI/UX Completa

## Escopo

1. **Drag-and-drop** na grade semanal para reatribuir voluntarios entre dias/funcoes
2. **Visao mensal (calendario)** como alternativa a visao semanal
3. **Elementos UI/UX faltantes** (empty states, filtros, exportar, toggle de visao)

---

## 1. Drag-and-Drop na Grade Semanal

O projeto ja tem `@dnd-kit/core`, `@dnd-kit/sortable` e `@dnd-kit/utilities` instalados.

### Componentes novos

- **`src/components/schedules/DraggableScheduleCard.tsx`** -- Card individual de voluntario escalado, envolvido com `useSortable` do dnd-kit. Exibe nome, funcao, badge de status. Visual: borda tracejada e opacidade reduzida durante drag, sombra elevada no overlay.
- **`src/components/schedules/DroppableDayColumn.tsx`** -- Coluna de dia que aceita drops via `useDroppable`. Highlight visual (borda primary pulsante) quando um item esta sendo arrastado sobre ela.

### Logica no Schedules.tsx

- Envolver o grid semanal com `<DndContext>` e `<SensorManager>` (pointer + touch sensors)
- `onDragEnd`: se o voluntario foi solto em um dia diferente, chamar mutation que atualiza `service_date` do schedule via Supabase
- Feedback visual: toast de confirmacao ao mover, animacao de entrada no novo dia

### Hook: `useVolunteerSchedules` (edicao)

- Adicionar mutation `updateSchedule` que permite alterar `service_date` e/ou `role` de um schedule existente (UPDATE na tabela `volunteer_schedules`)

---

## 2. Visao Mensal (Calendario)

### Componente novo: `src/components/schedules/MonthlyCalendarView.tsx`

- Grid CSS de 7 colunas (Dom-Sab) com 5-6 linhas conforme o mes
- Cada celula mostra o numero do dia e mini-badges com contagem de escalas (ex: "3 escalados")
- Clique em um dia expande um popover/sheet com a lista completa de escalas daquele dia
- Dia atual com borda `primary`, dias com escalas com dot indicator
- Navegacao mes anterior/proximo com botoes ChevronLeft/ChevronRight e botao "Hoje"

### Integracao no Schedules.tsx

- Toggle de visao (semanal/mensal) usando `Tabs` ou `ToggleGroup` no header da pagina
- Estado `viewMode: 'week' | 'month'` controla qual componente renderizar
- Na visao mensal, buscar todas as escalas do mes (dateRange: primeiro dia ao ultimo dia do mes)

### Hook: useVolunteerSchedules (edicao)

- O `useListByDateRange` ja existe e sera reutilizado para o range mensal

---

## 3. Elementos UI/UX Faltantes

### 3a. Filtro por funcao/status no header

- Adicionar `Select` para filtrar por funcao (camera, som, etc.) e por status (agendado, confirmado, ausente)
- Filtro aplicado localmente via `useMemo` sobre os dados ja carregados

### 3b. Empty state aprimorado

- Quando nao ha nenhuma escala na semana/mes, exibir ilustracao (icone grande de calendario) com CTA "Gerar primeira escala" que abre o SmartScheduleModal

### 3c. Resumo visual compacto

- Mini barra de progresso no card semanal mostrando % de confirmados vs total
- Tooltip com detalhamento ao hover

### 3d. Botao de exportar escalas

- Botao "Exportar" no header que gera PDF da semana/mes usando jsPDF (ja instalado)

### 3e. Mobile UX

- Na visao semanal mobile, cards empilham em coluna unica com scroll horizontal opcional
- Na visao mensal mobile, celulas compactadas com apenas dot indicators, tap abre sheet com detalhes

---

## Arquivos Modificados/Criados

| Arquivo | Acao |
|---|---|
| `src/components/schedules/DraggableScheduleCard.tsx` | Criar |
| `src/components/schedules/DroppableDayColumn.tsx` | Criar |
| `src/components/schedules/MonthlyCalendarView.tsx` | Criar |
| `src/components/schedules/ScheduleExportButton.tsx` | Criar |
| `src/pages/Schedules.tsx` | Editar (DnD, toggle visao, filtros, empty state, export) |
| `src/hooks/useVolunteerSchedules.tsx` | Editar (adicionar `updateSchedule` mutation) |

### Dependencias

Nenhuma nova -- `@dnd-kit/*` e `jspdf` ja estao instalados.

