

# Rebranding da Tela de Login

## Objetivo
Redesenhar `src/pages/Auth.tsx` inspirando-se no design de referência fornecido (card glassmorphism com efeito 3D, inputs com ícones, toggle de senha, glow animado), adaptado para a identidade Ide.On e usando framer-motion (já instalado).

## Design

```text
┌─────────────────────────────────────┐
│  Background: gradiente radial       │
│  com glow spots animados            │
│                                     │
│   ┌───────────────────────────┐     │
│   │  Glass card (3D tilt)     │     │
│   │                           │     │
│   │   [Logo Ide.On]           │     │
│   │   "Bem-vindo de volta"    │     │
│   │   "Entre para continuar"  │     │
│   │                           │     │
│   │   [📧 Email input      ] │     │
│   │   [🔒 Senha input   👁] │     │
│   │                           │     │
│   │   [☐ Lembrar] [Esqueci?] │     │
│   │                           │     │
│   │   [===== Entrar =====]   │     │
│   │                           │     │
│   │   ── ou ──                │     │
│   │                           │     │
│   │   [G  Google Sign In  ]  │     │
│   │                           │     │
│   │   Não tem conta? Cadastre │     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
```

## Mudanças

### `src/pages/Auth.tsx` — Rewrite completo do JSX/UI

**Preservar 100%:** Toda a lógica de estado, handlers (`handleAuth`, `handleGoogleSignIn`, `handleResetPassword`, `handleTabChange`), `useEffect`, `translateAuthError`, Dialog de reset. Zero mudanças na lógica de autenticação.

**Adicionar:**
- `framer-motion` imports (`motion`, `useMotionValue`, `useTransform`) para efeito 3D no card
- Estados: `showPassword`, `focusedInput` para UX dos inputs
- Ícones: `Mail`, `Lock`, `Eye`, `EyeClosed`, `ArrowRight` do lucide-react

**UI — Background:**
- Gradiente radial escuro (roxo/primary para preto) cobrindo a tela inteira
- 2-3 blobs animados com `framer-motion` (glow spots em roxo/cyan, `animate` com loop)
- Overlay de noise sutil via CSS

**UI — Card:**
- Container `motion.div` com `style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}` reagindo ao mouse
- Glassmorphism: `bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]`
- Borda glow animada (traveling light beam via CSS `@keyframes`)
- Logo Ide.On centralizada com anel de glow
- Títulos: "Bem-vindo de volta" / "Crie sua conta" conforme `isLogin`

**UI — Inputs:**
- Wrapper relativo com ícone à esquerda (Mail / Lock) em `text-white/40`
- Input com fundo `bg-white/5`, border transparente, focus `border-white/20 bg-white/10`
- Campo de senha com botão Eye/EyeClosed à direita
- Highlight animado no focus (barra inferior com gradient)

**UI — Ações:**
- Linha "Lembrar-me" + "Esqueci minha senha" (somente no modo login)
- Botão principal: gradiente primary, glow effect, ícone ArrowRight, loading spinner
- Divider "ou" minimalista
- Botão Google: outline glassmorphism com SVG do Google
- Link "Não tem conta? Cadastre-se" / "Já tem conta? Entre"

**UI — Alert de tentativas falhas:** Manter, estilizar com glassmorphism

### `src/index.css` — Adicionar keyframes

- `@keyframes borderTravel` para o efeito de luz percorrendo a borda do card
- `@keyframes float` para os glow spots do background

### Componentes reutilizados
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` — mantidos para reset de senha
- `Button` (variant solid) — usado no botão principal e Google
- `Input` — usado dentro dos wrappers customizados
- `Label` — mantido no dialog de reset

### Não alterado
- Nenhum outro arquivo é modificado
- Toda a lógica de auth, navegação, toasts, analytics permanece intacta
- O Dialog de reset de senha mantém o design atual (shadcn)

