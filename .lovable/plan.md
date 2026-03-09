

# Diagnóstico Completo: Church Site Feature

## PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **COLUNA `section_titles` NÃO EXISTE NO BANCO (QUEBRA TUDO)**

Network request mostra erro 400:
```
"Could not find the 'section_titles' column of 'church_sites' in the schema cache"
```

O código TypeScript referencia `section_titles`, mas a coluna **nunca foi criada** no banco. Isso faz TODOS os saves falharem.

### 2. **LOGO NÃO PERSISTE**

O upload funciona (status 200), mas a resposta do banco mostra `"logoUrl": null`. 

**Causa raiz**: O save falha por causa do erro acima. O logo é enviado para storage, mas o update do `branding.logoUrl` falha junto com todo o resto.

### 3. **CAMPOS REDUNDANTES / CONFUSOS**

- "Nome da Igreja" aparece em **Marca & Identidade** 
- "Título Principal" aparece em **Hero**  
- Ambos populam o mesmo texto visual ("Bem-vindo à IP BETHA")

Isso confunde o usuário. Na página /bio original, o título é composto:
```
"Igreja Presbiteriana" (nome)
"Bethaville" (parte do nome)
```

Não há redundância — existe apenas `CHURCH.name`.

### 4. **`welcomeLabel` NO HERO NÃO ESTÁ NO DEFAULT DO BANCO**

O default do banco para `hero` não inclui `welcomeLabel`:
```json
// Banco (default atual)
{"title": "...", "subtitle": "...", "coverImageUrl": null, ...}

// Deveria ter:
{"welcomeLabel": "Bem-vindo", "title": "...", ...}
```

---

## PLANO DE CORREÇÃO

### FASE 1: Criar Coluna `section_titles` no Banco

```sql
ALTER TABLE public.church_sites 
ADD COLUMN section_titles jsonb DEFAULT '{
  "firstTime": {"title": "É sua primeira vez por aqui?", "subtitle": "Queremos tornar sua visita..."},
  "about": {"title": "Quem somos", "subtitle": "..."},
  ...
}'::jsonb;
```

### FASE 2: Atualizar Default do `hero` no Banco

```sql
ALTER TABLE public.church_sites 
ALTER COLUMN hero SET DEFAULT '{
  "welcomeLabel": "Bem-vindo",
  "title": "Bem-vindo à nossa Igreja",
  "subtitle": "Um lugar de fé, amor e comunhão",
  "coverImageUrl": null,
  "showVisitButton": true,
  "showMapButton": true,
  "showYoutubeButton": true,
  "showWhatsappButton": true
}'::jsonb;
```

### FASE 3: Remover Redundância de Campos no Editor

**Problema**: "Nome da Igreja" + "Título Principal" são confusos.

**Solução**: 
- Manter "Nome da Igreja" em Branding (usado para logo, footer, SEO)
- O "Título Principal" no Hero deve ter placeholder diferente e NÃO ser auto-populado do nome

No `SiteEditor.tsx`, remover a lógica que copia `branding.name` para `hero.title` automaticamente.

### FASE 4: Garantir que Logo é Persistido

Após corrigir o erro de `section_titles`, o logo deve funcionar automaticamente porque o save vai passar.

---

## ARQUIVOS A MODIFICAR

| Arquivo | Alteração |
|---------|-----------|
| **Migration SQL** | Adicionar coluna `section_titles` + atualizar default de `hero` |
| `src/hooks/useChurchSite.tsx` | Não incluir `section_titles` no insert se não existir ainda (fallback) |

---

## RESULTADO ESPERADO

1. Saves funcionam sem erro 400
2. Logo persiste corretamente  
3. Campos do editor não confundem usuário
4. Feature funcional para produção

