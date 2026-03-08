

# Atualizar Logo da Plataforma

## Resumo

Copiar o logo enviado para `src/assets/logo-ideon.png`, importá-lo como módulo ES6, e substituir todos os placeholders genéricos (texto "I.O", ícone `Sparkles` usado como identidade visual, e `/logo.png`) pelo novo logo.

## Mudanças

### 1. Copiar o asset
Mover `user-uploads://Black_and_Beige_Minimalist_Aesthetic_Modern_Simple_Typography_Agency_Logo_3.png` → `src/assets/logo-ideon.png`

### 2. Substituir logo nos componentes

| Arquivo | O que tem hoje | O que muda |
|---|---|---|
| `src/components/HeroHeader.tsx` (linha 27-29) | `<div>` com texto "I.O" | `<img src={logoIdeon}>` dentro do mesmo container |
| `src/pages/Landing.tsx` (linha 83) | `<h1>Ide.On</h1>` texto puro | `<img>` do logo + texto "Ide.On" ao lado |
| `src/pages/Auth.tsx` (linha 223) | `<h1>Ide.On</h1>` texto puro | `<img>` do logo acima do título |
| `src/pages/Install.tsx` (linha 92) | `<img src="/logo.png">` (logo genérico antigo) | `<img src={logoIdeon}>` (novo logo importado) |
| `src/components/AICreatorCard.tsx` (linha 14) | `<Sparkles>` grande como ícone central | `<img>` do logo no lugar |
| `src/components/content-feed/EmptyFeedState.tsx` (linha 12) | `<Sparkles>` como ícone decorativo | `<img>` do logo no lugar |
| `src/pages/ContentLibrary.tsx` (linha 398) | `<Sparkles>` no empty state | `<img>` do logo no lugar |

### 3. O que NÃO muda
- `Sparkles` usado como ícone pequeno em botões (ex: "Criar com IA") — mantém, pois é ícone de ação, não identidade
- Favicon, apple-touch-icon, og-image — mantém (são assets separados no `public/`)
- Textos "Ide.On" em parágrafos descritivos — mantém

