

# Rebranding do Calendário Mensal — Estilo Bento Card

## O que muda

O calendário atual (`MonthlyCalendarView`) tem visual genérico (Card básico, botões outline, grid plano). A referência mostra um estilo **bento card** com:

- Container com bordas arredondadas, fundo escuro/glass, borda sutil luminosa
- Dias com destaque em cor sólida (indigo/primary) para dias com escalas
- Tipografia mais refinada (mês/ano em destaque)
- Layout clean sem badges pesados — usar dots ou highlight de fundo nos dias

## Mudanças Técnicas

### `src/components/schedules/MonthlyCalendarView.tsx` — Rewrite visual completo

1. **Container**: Trocar `<Card>` por wrapper com glassmorphism (`bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-2xl`)
2. **Header do mês**: Tipografia `font-gunterz` no nome do mês, navegação com botões ghost minimalistas
3. **Weekday labels**: Uppercase, `text-[11px] tracking-wider text-muted-foreground/60`
4. **Day cells**:
   - Base: `rounded-xl` com hover sutil
   - Dias com escalas: `bg-primary text-primary-foreground rounded-xl` (estilo da referência com highlight sólido)
   - Hoje: ring de primary
   - Fora do mês: `opacity-20`
5. **Popover**: Manter funcionalidade atual, mas com fundo glass no popover content
6. **Mobile**: Dots permanecem, mas com cores mais vibrantes

Toda a lógica de dados (schedulesByDate, weeks, queries) permanece inalterada. Apenas classes CSS e estrutura JSX do render mudam.

