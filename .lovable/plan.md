

# Fix: Aumentar Espaçamento entre Cards do Carousel 3D

## Problema
Os cards se sobrepõem porque o raio do círculo 3D (`radius`) é pequeno demais em relação à largura dos cards. Com `radius: 280` desktop e cards de `280px` de largura, os itens ficam muito próximos no arco.

## Solução
Aumentar o `radius` default e ajustar a altura do container proporcionalmente:

| Prop | Antes | Depois |
|---|---|---|
| `radius` desktop | 280px | 450px |
| `radius` mobile | 180px | 300px |
| Container height | `cardH + 60` | `cardH + 80` |

### Arquivo: `src/components/ui/circular-carousel.tsx`
- Linha 28: `radius = radiusProp ?? (isMobile ? 300 : 450)`
- Ajustar altura do container para acomodar o raio maior

Uma mudança de 2 linhas. Sem impacto em outros componentes — o `CarrosselView` não passa `radius` explicitamente.

