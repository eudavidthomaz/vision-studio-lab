

# Card "Site da Igreja" no Dashboard

## Abordagem

Criar um `ChurchSiteCreatorCard` seguindo exatamente o padrão dos cards existentes (`ScheduleCreatorCard`, `YouTubeCreatorCard`): `GlassCard` com `glowColor="cyan"`, ícone temático, título, descrição e stats com fade-in escalonado.

## Arquivo novo: `src/components/ChurchSiteCreatorCard.tsx`

- **GlassCard** com `glowColor="cyan"`, `as="button"`, `className="w-full text-left"`
- **Ícone**: `Globe` do lucide-react, dentro de container `w-12 h-12 rounded-lg` com bg cyan sutil
- **Título**: "Site da Igreja"
- **Descrição**: "Crie e publique um site profissional para sua comunidade. Editável, responsivo e pronto para compartilhar."
- **Stats dinâmicas** (via `useChurchSite`): badge de status (Publicado/Rascunho/Não criado), contagem de ministérios, contagem de eventos — com `useInView` + `animate-fade-in` escalonado idêntico ao ScheduleCreatorCard
- **Shimmer no ícone** no hover (mesmo padrão do ScheduleCreatorCard via CSS existente)

## Alteração: `src/pages/Dashboard.tsx`

- Importar `ChurchSiteCreatorCard`
- Adicionar nova `<section>` após o `ScheduleCreatorCard`, navegando para `/sites` no click

## Detalhes de implementação

A consulta ao banco usa o hook `useChurchSite` já existente (que retorna `site`, `isLoading`). Os dados de stats vêm diretamente de `site.ministries.length`, `site.events.length` e `site.isPublished` — sem queries adicionais.

O card ficará com a paleta cyan (`hsl(188...)`) para diferenciar dos demais (primary/purple no AI, red no YouTube, blue nas Escalas).

