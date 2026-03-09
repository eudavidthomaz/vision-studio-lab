

# Plano: Feature "Site da Igreja" — Template Multi-Tenant

## Visão Geral

Transformar a página `/bio` atual em um **produto SaaS escalável** onde cada usuário pode criar, editar e publicar seu próprio site de igreja através de um painel administrativo dentro do app.

---

## Arquitetura Proposta

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
├─────────────────────────────────────────────────────────────────┤
│  /sites              → Listagem + CTA criar site                │
│  /sites/editor       → Painel de edição com preview             │
│  /igreja/:slug       → Página pública (template renderizado)    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                   │
├─────────────────────────────────────────────────────────────────┤
│  church_sites        → Configuração completa do site            │
│  church_site_events  → Agenda de eventos (1:N)                  │
│  church_site_ministries → Ministérios (1:N)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fase 1: Infraestrutura de Dados

### Tabela `church_sites`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `slug` | text | Único, URL pública |
| `is_published` | boolean | Se está visível |
| `branding` | jsonb | Nome, tagline, logo_url, cores |
| `contact` | jsonb | WhatsApp, email, endereço, maps_url |
| `social_links` | jsonb | Instagram, YouTube, Facebook, etc. |
| `hero` | jsonb | Título, subtítulo, imagem, botões ativos |
| `about` | jsonb | Quem somos, valores (array de 3) |
| `schedule` | jsonb | Horários dos cultos |
| `faq` | jsonb | Perguntas frequentes (array) |
| `media` | jsonb | YouTube embed, playlist |
| `giving` | jsonb | PIX, instruções de oferta |
| `sections_visibility` | jsonb | Toggles para cada seção |
| `theme_config` | jsonb | Modo padrão (light/dark), cores |
| `seo` | jsonb | Title, description, og_image |
| `created_at` / `updated_at` | timestamp | Controle |

### Tabelas Auxiliares

- **`church_site_events`**: `id, site_id, title, date, time, tag, order`
- **`church_site_ministries`**: `id, site_id, title, description, icon, order`

### RLS Policies

- SELECT/UPDATE/DELETE: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- SELECT público: `is_published = true` (para renderização da página pública)

---

## Fase 2: Refatoração do Template

### Estrutura de Arquivos

```text
src/
├── components/
│   └── church-site/
│       ├── ChurchSiteTemplate.tsx    ← Template principal (recebe config)
│       ├── sections/
│       │   ├── HeroSection.tsx
│       │   ├── FirstTimeSection.tsx
│       │   ├── ScheduleSection.tsx
│       │   ├── AboutSection.tsx
│       │   ├── MinistriesSection.tsx
│       │   ├── MediaSection.tsx
│       │   ├── EventsSection.tsx
│       │   ├── PrayerSection.tsx
│       │   ├── ContactSection.tsx
│       │   ├── GivingSection.tsx
│       │   └── FooterSection.tsx
│       └── editor/
│           ├── SiteEditor.tsx        ← Painel principal
│           ├── BrandingEditor.tsx
│           ├── SectionsEditor.tsx
│           ├── ContactEditor.tsx
│           ├── EventsEditor.tsx
│           ├── MinistriesEditor.tsx
│           └── PreviewPane.tsx
├── pages/
│   ├── Sites.tsx                     ← Listagem
│   ├── SiteEditor.tsx                ← Editor com preview
│   └── ChurchSite.tsx                ← /igreja/:slug (público)
├── hooks/
│   └── useChurchSite.tsx             ← CRUD do site
└── types/
    └── churchSite.ts                 ← Tipagem TypeScript
```

### Transformação do Bio.tsx

O arquivo atual `Bio.tsx` será congelado como referência. O novo `ChurchSiteTemplate.tsx`:

1. Recebe `config: ChurchSiteConfig` como prop
2. Renderiza seções condicionalmente baseado em `sections_visibility`
3. Usa dados do config ao invés de hardcoded
4. Mantém estrutura visual idêntica

---

## Fase 3: Sistema de Edição

### Painel do Editor (2 colunas)

| Esquerda (40%) | Direita (60%) |
|----------------|---------------|
| Accordion com seções | Preview responsivo |
| Campos de formulário | Atualiza em tempo real |
| Toggles de visibilidade | Desktop/Mobile switch |

### Seções Editáveis

1. **Marca & Identidade**: Nome, tagline, logo, cores
2. **Hero**: Título, subtítulo, imagem de fundo, CTAs
3. **Primeira Vez**: FAQ items (add/remove/reorder)
4. **Horários**: Dias e horários dos cultos
5. **Sobre Nós**: Texto institucional, 3 valores
6. **Ministérios**: Lista com ícone, título, descrição
7. **Mídia**: Link do YouTube, embed
8. **Agenda**: Eventos com data, horário, tag
9. **Oração**: Texto do pedido de oração
10. **Contato**: WhatsApp, Instagram, Email, Maps
11. **Ofertas**: Texto, chave PIX
12. **SEO**: Title, description

---

## Fase 4: Publicação

### Fluxo

1. Usuário edita site no painel
2. Auto-save a cada mudança (debounced)
3. Clica em "Publicar"
4. Sistema valida slug único
5. `is_published = true`
6. Site acessível em `/igreja/:slug`

### Validação de Slug

- Lowercase, sem espaços
- Apenas letras, números, hífens
- Único no sistema
- Reservados: `admin`, `api`, `app`, etc.

---

## Fase 5: Rotas e Navegação

```text
Rotas Protegidas (requer auth):
├── /sites                    → Lista do site do usuário
└── /sites/editor             → Editor completo

Rota Pública:
└── /igreja/:slug             → Renderiza ChurchSiteTemplate
```

---

## Detalhes Técnicos

### TypeScript Interfaces

```typescript
interface ChurchSiteConfig {
  id: string;
  slug: string;
  isPublished: boolean;
  branding: {
    name: string;
    tagline: string;
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  contact: {
    whatsapp: string;
    email: string;
    address: string;
    mapsUrl: string;
  };
  socialLinks: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  hero: {
    title: string;
    subtitle: string;
    coverImageUrl?: string;
    showVisitButton: boolean;
    showMapButton: boolean;
    showYoutubeButton: boolean;
    showWhatsappButton: boolean;
  };
  schedule: Array<{ day: string; times: string[] }>;
  faq: Array<{ question: string; answer: string }>;
  about: {
    description: string;
    values: Array<{ icon: string; title: string; content: string }>;
  };
  ministries: Array<{ id: string; title: string; description: string[]; icon: string }>;
  events: Array<{ date: string; title: string; time: string; tag: string }>;
  media: {
    youtubeEmbedUrl?: string;
    youtubeChannelUrl?: string;
  };
  giving: {
    description: string;
    pixKey?: string;
    showSection: boolean;
  };
  sectionsVisibility: {
    hero: boolean;
    firstTime: boolean;
    schedule: boolean;
    about: boolean;
    ministries: boolean;
    media: boolean;
    events: boolean;
    prayer: boolean;
    contact: boolean;
    giving: boolean;
  };
  themeConfig: {
    defaultMode: 'light' | 'dark';
    allowToggle: boolean;
  };
  seo: {
    title: string;
    description: string;
    ogImageUrl?: string;
  };
}
```

---

## Ordem de Implementação

| # | Tarefa | Dependência |
|---|--------|-------------|
| 1 | Criar tabela `church_sites` + RLS | — |
| 2 | Criar tabelas auxiliares (`events`, `ministries`) | 1 |
| 3 | Criar tipos TypeScript | 1 |
| 4 | Criar hook `useChurchSite` | 1, 3 |
| 5 | Refatorar Bio.tsx → seções isoladas | 3 |
| 6 | Criar `ChurchSiteTemplate.tsx` | 5 |
| 7 | Criar página pública `/igreja/:slug` | 6 |
| 8 | Criar página `/sites` (listagem) | 4 |
| 9 | Criar editor com preview | 4, 6 |
| 10 | Implementar auto-save | 9 |
| 11 | Sistema de publicação com validação de slug | 9 |
| 12 | Adicionar rotas no App.tsx | 7, 8, 9 |

---

## Considerações de Segurança

1. **RLS rigoroso**: Cada usuário só acessa seu próprio site
2. **Validação de slug**: Server-side para evitar colisões
3. **Sanitização**: XSS protection em campos de texto
4. **Rate limiting**: Para criação de sites
5. **Isolamento de tema**: Página pública não afeta app interno

---

## Preparação Antes da Implementação

Antes de começar a codar, precisamos:

1. ✅ Congelar `/bio` como template de referência
2. ✅ Criar migration para tabelas
3. ✅ Definir schema JSON completo
4. ✅ Criar tipos TypeScript
5. ✅ Estruturar pastas de componentes

**Pronto para iniciar?**

