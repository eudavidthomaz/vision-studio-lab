

# Correção Completa: Hero Section do Church Site

## Problemas Identificados

### 1. Nome da igreja dentro do elemento de vídeo
Em `HeroSection.tsx` L119-121, quando não há vídeo NEM imagem de capa, o fallback renderiza `{branding.name}` como placeholder gigante dentro do card de vídeo. Resultado: texto solto dentro do container que deveria mostrar mídia.

### 2. YouTube embed URL está na seção "Mídia / YouTube" (L572-587)
O campo para inserir o link do YouTube está escondido na seção "Mídia" do editor, mas o vídeo é exibido no **Hero** (primeira dobra). O usuário não encontra onde configurar o que aparece na capa do site.

### 3. Logo da igreja não é usado em NENHUM lugar do template
Busca por `logoUrl` em `src/components/church-site` retorna **zero resultados**. O upload funciona, mas o logo nunca é renderizado — nem no Hero, nem no Footer, nem na navegação.

### 4. Vídeo e imagem de capa competem pelo mesmo espaço sem explicação
O editor tem campo de imagem de capa E campo de YouTube embed, mas nenhuma indicação de que são mutuamente exclusivos (vídeo tem prioridade sobre imagem no código).

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/church-site/sections/HeroSection.tsx` | Remover fallback com `branding.name` no card; usar logo; melhorar placeholder vazio |
| `src/components/church-site/sections/FooterSection.tsx` | Renderizar logo ao lado do nome da igreja |
| `src/pages/SiteEditor.tsx` | Mover YouTube embed para seção Hero; adicionar texto explicativo vídeo vs imagem; remover campo duplicado da seção Mídia |

---

## Implementação

### 1. HeroSection.tsx — Corrigir fallback do card + usar logo

**Remover** o fallback que renderiza `branding.name` como texto gigante dentro do card de vídeo. Substituir por um placeholder visual neutro (gradiente + ícone de imagem).

**Adicionar** logo no topo do `titleComponent` (antes do welcomeLabel) quando `branding.logoUrl` existir.

```text
Antes:
  [Bem-vindo]
  [Título]
  [Subtítulo]
  [Card: "Nome da Igreja" em texto gigante]

Depois:
  [Logo da igreja (se existir)]
  [Bem-vindo]
  [Título]  
  [Subtítulo]
  [Card: vídeo OU imagem OU placeholder com ícone]
```

### 2. FooterSection.tsx — Renderizar logo

Adicionar logo ao lado do nome da igreja no footer quando `branding.logoUrl` existir.

### 3. SiteEditor.tsx — Reorganizar campos

**Mover** o campo `youtubeEmbedUrl` de "Mídia / YouTube" para "Hero / Capa", logo abaixo do campo de imagem.

**Adicionar** texto explicativo:
> "Escolha entre um vídeo do YouTube ou uma imagem de capa. Se ambos forem preenchidos, o vídeo terá prioridade."

**Manter** a seção "Mídia / YouTube" com informação de que o vídeo do Hero é configurado na seção Hero.

