# Ide.On Vision Studio 🎬

Plataforma de IA para criar conteúdo evangelístico impactante para redes sociais, baseado em pregações.

## ✨ Features Principais

### 🎤 Transcrição de Áudio
- Grave pregações ao vivo ou faça upload de arquivos
- Transcrição automática com OpenAI Whisper
- Suporte a múltiplos formatos (MP3, WAV, M4A, WEBM)
- Processamento em até 60 segundos

### 🤖 Geração de Conteúdo com IA
- **AI Creator**: Crie qualquer tipo de conteúdo via prompt
- **Sermon Pack**: 12 conteúdos automáticos baseados em sermão
- **Quick Posts**: Posts rápidos por tipo e tema
- **Photo Ideas**: Sugestões criativas de fotos
- **Video Scripts**: Roteiros profissionais para vídeos
- **34 tipos de conteúdo** suportados

### 📚 Biblioteca Unificada
- Todos os conteúdos em um só lugar
- Filtros avançados (tipo, pilar, tags, status)
- Busca full-text otimizada
- Organização por tags personalizadas
- Workflow completo (draft → published → archived)
- Edição, duplicação e exclusão

### 🎨 Tipos de Conteúdo Suportados
- **Posts**: post_simples, carrossel, foto_post
- **Stories**: stories, qa_estruturado
- **Vídeos**: reel, roteiro_video
- **Conteúdo Bíblico**: devocional, estudo, esboco, resumo_pregacao
- **Engajamento**: desafio_semanal, ideia_estrategica
- **Materiais**: guia, discipulado
- E mais 20+ tipos adicionais!

### 📊 Analytics & Uso
- Dashboard de quotas em tempo real
- Histórico completo de geração
- Métricas de performance
- Controle de limites por plano (Free/Pro/Team/Admin)

### 🏷️ Pilares Editoriais
- **EDIFICAR**: Fortalecer a fé dos crentes
- **ALCANÇAR**: Evangelizar não-crentes
- **EXALTAR**: Adoração e louvor
- **ENVIAR**: Mobilizar para missões

## 🔒 Segurança

Sistema robusto de segurança implementado:

✅ Row Level Security (RLS) em todas as tabelas  
✅ Rate Limiting por endpoint (10-50 req/hora)  
✅ Validação de entrada robusta  
✅ Sanitização anti-XSS  
✅ Audit logs completos  
✅ Tratamento de erros padronizado  

Ver [SECURITY.md](./SECURITY.md) para detalhes completos.

## 📚 Documentação

- [ARQUITETURA_SISTEMA_IDEON.md](./ARQUITETURA_SISTEMA_IDEON.md) - Arquitetura técnica completa
- [CONTENT_TYPES.md](./CONTENT_TYPES.md) - Tipos de conteúdo suportados
- [CORRECOES_SISTEMA.md](./CORRECOES_SISTEMA.md) - Histórico de correções

---

## Project info

**URL**: https://lovable.dev/projects/7265615f-78ba-4b21-b14a-5e5467afc285

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7265615f-78ba-4b21-b14a-5e5467afc285) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Lovable Cloud)
- Lovable AI Gateway

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7265615f-78ba-4b21-b14a-5e5467afc285) and click on Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)