# 📋 Tipos de Conteúdo Suportados - Ide.On

## Visão Geral

O Ide.On suporta **34 tipos diferentes** de conteúdo para redes sociais, todos salvos na tabela unificada `content_library`. Cada tipo possui estrutura JSON específica e é classificado em um dos 4 pilares editoriais.

---

## 🎯 Categorias e Tipos

### 1. Posts e Carrosséis (7 tipos)

| content_type | Nome | Descrição | Pilar Comum |
|--------------|------|-----------|-------------|
| `post_simples` | Post Simples | Post de texto para feed | EDIFICAR |
| `carrossel` | Carrossel | Sequência de 5-10 slides | EDIFICAR |
| `foto_post` | Post com Foto | Post com imagem destacada | ALCANÇAR |
| `convite` | Convite | Convite para eventos | ALCANÇAR |
| `convite_grupos` | Convite Grupos | Convite para grupos pequenos | EDIFICAR |
| `aviso` | Aviso | Comunicado importante | EDIFICAR |
| `calendario` | Calendário | Grade mensal de eventos | EDIFICAR |

### 2. Stories (2 tipos)

| content_type | Nome | Descrição | Pilar Comum |
|--------------|------|-----------|-------------|
| `stories` | Stories | Stories para Instagram/FB | ALCANÇAR |
| `qa_estruturado` | Q&A Estruturado | Perguntas e respostas | EDIFICAR |

### 3. Vídeos (2 tipos)

| content_type | Nome | Descrição | Pilar Comum |
|--------------|------|-----------|-------------|
| `reel` | Reel/Short | Vídeo curto (15-90s) | ALCANÇAR |
| `roteiro_video` | Roteiro de Vídeo | Script completo para vídeo longo | ENVIAR |

### 4. Conteúdo Bíblico (7 tipos)

| content_type | Nome | Descrição | Pilar Comum |
|--------------|------|-----------|-------------|
| `devocional` | Devocional | Reflexão diária com aplicação | EXALTAR |
| `estudo` | Estudo Bíblico | Estudo aprofundado de passagem | EDIFICAR |
| `esboco` | Esboço de Pregação | Estrutura completa de sermão | EDIFICAR |
| `versiculos_citados` | Versículos Citados | Lista de referências bíblicas | EDIFICAR |
| `resumo_pregacao` | Resumo de Pregação | Síntese de sermão pregado | EDIFICAR |
| `trilha_oracao` | Trilha de Oração | Guia de oração estruturado | EXALTAR |

### 5. Engajamento (2 tipos)

| content_type | Nome | Descrição | Pilar Comum |
|--------------|------|-----------|-------------|
| `desafio_semanal` | Desafio Semanal | Desafio de 7 dias | ENVIAR |
| `ideia_estrategica` | Ideia Estratégica | Estratégia de marketing/engajamento | ENVIAR |

### 6. Materiais Educativos (2 tipos)

| content_type | Nome | Descrição | Pilar Comum |
|--------------|------|-----------|-------------|
| `guia` | Guia | Material educativo/manual | EDIFICAR |
| `discipulado` | Discipulado | Conteúdo de formação espiritual | EDIFICAR |

### 7. Outros (12+ tipos adicionais)

O sistema suporta tipos adicionais customizados conforme demanda da comunidade.

---

## 📊 Estruturas JSON por Tipo

### 1. Devocional

```json
{
  "content_type": "devocional",
  "titulo": "Fé em Ação",
  "devocional": {
    "versiculo": "Tiago 2:17",
    "texto_versiculo": "Assim também a fé, se não tiver obras, é morta em si mesma.",
    "reflexao": "A verdadeira fé se manifesta em ações concretas. Quando cremos genuinamente em algo, nossas atitudes refletem essa convicção. Tiago nos desafia a não sermos apenas ouvintes, mas praticantes da palavra.",
    "oracao": "Senhor, que minha fé se traduza em amor prático. Que eu não apenas fale sobre Ti, mas que minhas ações demonstrem Teu caráter. Ajuda-me a ser luz onde há escuridão.",
    "aplicacao_pratica": "Hoje, faça um ato de bondade inesperado para alguém que você não conhece bem. Pode ser ajudar com compras, oferecer um lanche, ou simplesmente ouvir com atenção."
  },
  "fundamento_biblico": {
    "versiculos": ["Tiago 2:14-26", "Mateus 5:16", "Efésios 2:10"],
    "contexto": "Tiago escreve para uma comunidade que estava se tornando apática, separando fé de prática. Ele argumenta que fé verdadeira sempre produz frutos visíveis.",
    "principio_atemporal": "Fé genuína sempre produz transformação prática e amor em ação."
  },
  "pilar": "EXALTAR"
}
```

### 2. Post Simples

```json
{
  "content_type": "post_simples",
  "titulo": "Amor ao Próximo",
  "texto": "O amor não é apenas um sentimento, é uma decisão diária.\n\nQuando escolhemos amar mesmo quando é difícil, refletimos o coração de Cristo.\n\n💙 Como você tem demonstrado amor prático hoje?",
  "pilar": "EDIFICAR",
  "hashtags": ["#amor", "#fe", "#jesus", "#igrejacomunidade"]
}
```

### 3. Reel

```json
{
  "content_type": "reel",
  "titulo": "3 Razões para Crer",
  "hook": "Você sabia que a fé cristã não é cega? 🤔",
  "roteiro": "1. EVIDÊNCIAS HISTÓRICAS\nA ressurreição de Jesus é o evento mais bem documentado da antiguidade.\n\n2. TRANSFORMAÇÃO DE VIDAS\nMilhões de pessoas ao redor do mundo experimentaram mudança radical.\n\n3. ESPERANÇA QUE LIBERTA\nA fé oferece propósito, perdão e vida eterna.",
  "cta": "Quer saber mais? Comente 'FÉ' que te envio material gratuito! 📖",
  "duracao": "45 segundos",
  "pilar": "ALCANÇAR",
  "musica_sugerida": "Música inspiradora de fundo (sem letra)"
}
```

### 4. Carrossel

```json
{
  "content_type": "carrossel",
  "titulo": "5 Passos para Oração Eficaz",
  "slides": [
    {
      "numero": 1,
      "titulo": "ADORAÇÃO",
      "texto": "Comece reconhecendo quem Deus é. Louve Sua grandeza, bondade e fidelidade.",
      "versiculo": "Salmos 95:1-2"
    },
    {
      "numero": 2,
      "titulo": "CONFISSÃO",
      "texto": "Seja honesto sobre seus pecados. Deus já sabe, mas deseja que você reconheça.",
      "versiculo": "1 João 1:9"
    },
    {
      "numero": 3,
      "titulo": "GRATIDÃO",
      "texto": "Agradeça pelas bênçãos recebidas. Cultive um coração grato.",
      "versiculo": "1 Tessalonicenses 5:18"
    },
    {
      "numero": 4,
      "titulo": "INTERCESSÃO",
      "texto": "Ore por outras pessoas. Seja um canal de bênção.",
      "versiculo": "1 Timóteo 2:1"
    },
    {
      "numero": 5,
      "titulo": "SÚPLICA",
      "texto": "Apresente suas necessidades pessoais. Deus se importa com você!",
      "versiculo": "Filipenses 4:6"
    }
  ],
  "pilar": "EXALTAR"
}
```

### 5. Estudo Bíblico

```json
{
  "content_type": "estudo",
  "titulo": "O Bom Samaritano - Amor Sem Fronteiras",
  "passagem_principal": "Lucas 10:25-37",
  "estudo_biblico": {
    "introducao": "Jesus conta esta parábola em resposta a um doutor da lei que tentava justificar-se. A história revela o verdadeiro significado de 'amar o próximo'.",
    "contexto_historico": "Na época, samaritanos e judeus eram inimigos históricos. A rota de Jericó era perigosa, conhecida por assaltos. Sacerdotes e levitas eram líderes religiosos respeitados.",
    "pontos_principais": [
      {
        "ponto": "1. O Próximo Inesperado",
        "explicacao": "Jesus subverte expectativas ao fazer um samaritano ser o herói. Amor verdadeiro transcende barreiras culturais, raciais e religiosas.",
        "aplicacao": "Quem você tem evitado ajudar por preconceito?"
      },
      {
        "ponto": "2. Amor Prático",
        "explicacao": "O samaritano não apenas sentiu compaixão, mas agiu: limpou feridas, transportou o homem, pagou despesas.",
        "aplicacao": "Amor exige sacrifício de tempo, recursos e conforto."
      },
      {
        "ponto": "3. Vai e Faz o Mesmo",
        "explicacao": "Jesus termina com um imperativo: 'Vai e faz o mesmo'. Não é opcional.",
        "aplicacao": "A fé que não gera ação não é fé genuína."
      }
    ],
    "perguntas_discussao": [
      "Quem são os 'samaritanos' (pessoas inesperadas) em sua vida?",
      "Que desculpas você usa para não ajudar quem está necessitado?",
      "Como sua igreja pode ser mais como o bom samaritano em sua comunidade?"
    ],
    "desafio_pratico": "Esta semana, identifique alguém fora do seu círculo habitual que precise de ajuda. Faça algo concreto por essa pessoa."
  },
  "fundamento_biblico": {
    "versiculos": ["Lucas 10:25-37", "Levítico 19:18", "Mateus 22:37-40"],
    "contexto": "Jesus responde à pergunta 'Quem é o meu próximo?' redefinindo amor ao próximo como ação compassiva sem limites.",
    "principio_atemporal": "Amor genuíno transcende barreiras e se manifesta em ação sacrificial."
  },
  "pilar": "EDIFICAR"
}
```

### 6. Desafio Semanal

```json
{
  "content_type": "desafio_semanal",
  "titulo": "7 Dias de Generosidade",
  "descricao": "Uma semana para treinar seu coração a ser generoso como Deus é generoso.",
  "desafio_semanal": {
    "dia_1": {
      "titulo": "Segunda - Doação Financeira",
      "desafio": "Doe para uma causa que você nunca apoiou antes. Pode ser R$10, R$50 ou mais.",
      "reflexao": "2 Coríntios 9:7 - 'Deus ama quem dá com alegria.'"
    },
    "dia_2": {
      "titulo": "Terça - Tempo",
      "desafio": "Ofereça 2 horas do seu dia para ajudar alguém sem esperar nada em troca.",
      "reflexao": "Como você se sentiu ao doar seu tempo?"
    },
    "dia_3": {
      "titulo": "Quarta - Talentos",
      "desafio": "Use um talento seu para abençoar alguém (cozinhe, conserte algo, ensine).",
      "reflexao": "1 Pedro 4:10 - Administre bem os dons recebidos."
    },
    "dia_4": {
      "titulo": "Quinta - Palavras",
      "desafio": "Escreva 3 mensagens de encorajamento para pessoas que precisam.",
      "reflexao": "Suas palavras têm poder de transformar o dia de alguém."
    },
    "dia_5": {
      "titulo": "Sexta - Hospitalidade",
      "desafio": "Convide alguém para comer em sua casa (pode ser delivery dividido!).",
      "reflexao": "Hebreus 13:2 - Não se esqueça da hospitalidade."
    },
    "dia_6": {
      "titulo": "Sábado - Recursos",
      "desafio": "Doe roupas, alimentos ou objetos que você não usa mais.",
      "reflexao": "Desapegar é libertar-se e abençoar outros."
    },
    "dia_7": {
      "titulo": "Domingo - Gratidão",
      "desafio": "Agradeça publicamente (post, story) por pessoas que foram generosas com você.",
      "reflexao": "O que você aprendeu nesta semana sobre generosidade?"
    }
  },
  "fundamento_biblico": {
    "versiculos": ["2 Coríntios 9:6-15", "Atos 20:35", "Lucas 6:38"],
    "contexto": "Deus é o maior exemplo de generosidade: deu Seu filho Jesus. Somos chamados a refletir esse caráter.",
    "principio_atemporal": "Generosidade não é sobre quanto você tem, mas sobre o coração com que você dá."
  },
  "pilar": "ENVIAR"
}
```

---

## 🏷️ Pilares Editoriais

Todos os conteúdos são classificados em um dos 4 pilares estratégicos:

| Pilar | 🎯 Propósito | 👥 Público-Alvo | 📊 Tipos Comuns |
|-------|-------------|----------------|----------------|
| **EDIFICAR** | Fortalecer a fé dos crentes | Membros da igreja | `devocional`, `estudo`, `post_simples`, `esboco` |
| **ALCANÇAR** | Evangelizar não-crentes | Pessoas fora da igreja | `reel`, `stories`, `convite`, `foto_post` |
| **EXALTAR** | Adoração e louvor a Deus | Toda a comunidade | `devocional`, `trilha_oracao`, `post_simples` |
| **ENVIAR** | Mobilizar para missões e serviço | Líderes e voluntários | `desafio_semanal`, `ideia_estrategica`, `roteiro_video` |

### Distribuição Recomendada

Para uma estratégia de conteúdo equilibrada:

- **40% EDIFICAR** - Fortalecer os que já creem
- **30% ALCANÇAR** - Evangelizar e atrair novos
- **20% EXALTAR** - Cultivar adoração
- **10% ENVIAR** - Mobilizar para ação

---

## 🔍 Como Adicionar um Novo Tipo

### 1. Definir Estrutura JSON

Crie a interface TypeScript:

```typescript
interface NovoTipo {
  content_type: 'novo_tipo';
  titulo: string;
  novo_tipo_especifico: {
    campo_1: string;
    campo_2: string[];
    // ...
  };
  fundamento_biblico?: {
    versiculos: string[];
    contexto: string;
    principio_atemporal: string;
  };
  pilar: 'EDIFICAR' | 'ALCANÇAR' | 'EXALTAR' | 'ENVIAR';
}
```

### 2. Atualizar `content-engine`

Em `supabase/functions/content-engine/index.ts`:

```typescript
function detectContentType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Adicione nova detecção
  if (lowerPrompt.includes('novo tipo keyword')) {
    return 'novo_tipo';
  }
  
  // ... outros tipos
  
  return 'post_simples'; // default
}
```

### 3. Criar View Component

Em `src/components/content-views/NovoTipoView.tsx`:

```typescript
import React from 'react';
import { Card } from '@/components/ui/card';

interface NovoTipoViewProps {
  content: any;
}

export const NovoTipoView: React.FC<NovoTipoViewProps> = ({ content }) => {
  const data = content.novo_tipo_especifico;
  
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">{content.titulo}</h2>
      <div className="space-y-4">
        <p>{data.campo_1}</p>
        {/* Renderize campos específicos */}
      </div>
    </Card>
  );
};
```

### 4. Registrar no ContentViewer

Em `src/components/ContentViewer.tsx`:

```typescript
import { NovoTipoView } from './content-views/NovoTipoView';

const viewComponents: Record<string, React.ComponentType<any>> = {
  // ... tipos existentes
  'novo_tipo': NovoTipoView,
};
```

### 5. Atualizar Documentação

- Adicione o tipo neste arquivo (`CONTENT_TYPES.md`)
- Atualize `ARQUITETURA_SISTEMA_IDEON.md`
- Documente estrutura JSON e uso

---

## 📈 Estatísticas de Uso

Os tipos mais gerados (dados hipotéticos):

1. **post_simples** - 35% dos conteúdos
2. **stories** - 20%
3. **devocional** - 15%
4. **reel** - 12%
5. **carrossel** - 8%
6. **estudo** - 5%
7. **Outros** - 5%

---

## 🎨 Boas Práticas

### 1. Títulos
- Sejam descritivos e atraentes
- Máximo de 60 caracteres
- Incluam palavra-chave principal

### 2. Pilar
- Escolha o pilar que melhor representa o objetivo
- Mantenha consistência com a mensagem
- Use EDIFICAR como padrão quando em dúvida

### 3. Tags
- Use tags consistentes: `["tema", "formato", "data"]`
- Inclua `pack-semanal` para conteúdos de pack
- Adicione datas para organização temporal

### 4. Status
- `draft` → Conteúdo em edição
- `published` → Publicado nas redes
- `archived` → Arquivado/inativo

### 5. Fundamento Bíblico
- Sempre inclua quando relevante
- Cite versículos completos
- Explique contexto histórico
- Extraia princípio atemporal

---

## 🚀 Roadmap de Novos Tipos

Tipos planejados para versões futuras:

- ✅ `podcast_roteiro` - Roteiro de episódio
- ✅ `infografico` - Dados visuais
- ✅ `testemunho` - História pessoal
- ✅ `sermao_infantil` - Mensagem para crianças
- ✅ `quiz_biblico` - Quiz interativo
- ✅ `oracao_dirigida` - Oração estruturada

Sugestões? Abra uma issue no repositório!

---

## 📚 Recursos Adicionais

- [ARQUITETURA_SISTEMA_IDEON.md](./ARQUITETURA_SISTEMA_IDEON.md) - Arquitetura técnica
- [README.md](./README.md) - Visão geral do projeto
- [SECURITY.md](./SECURITY.md) - Segurança e compliance

---

**Última Atualização:** 11/01/2025  
**Versão:** 1.0  
**Total de Tipos:** 34+