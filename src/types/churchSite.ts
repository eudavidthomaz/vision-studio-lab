// ============================================
// Church Site - TypeScript Types & Interfaces
// ============================================

// ---------------------
// Sub-interfaces
// ---------------------

export interface ChurchSiteBranding {
  name: string;
  tagline: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface ChurchSiteContact {
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
}

export interface ChurchSiteSocialLinks {
  instagram?: string | null;
  youtube?: string | null;
  facebook?: string | null;
}

export interface ChurchSiteHero {
  welcomeLabel: string;
  title: string;
  subtitle: string;
  coverImageUrl?: string | null;
  showVisitButton: boolean;
  showMapButton: boolean;
  showYoutubeButton: boolean;
  showWhatsappButton: boolean;
}

export interface ChurchSiteScheduleItem {
  day: string;
  times: string[];
}

export interface ChurchSiteFaqItem {
  question: string;
  answer: string;
}

export interface ChurchSiteValue {
  icon: string;
  title: string;
  content: string;
}

export interface ChurchSiteAbout {
  description: string;
  values: ChurchSiteValue[];
}

export interface ChurchSiteMinistry {
  id: string;
  title: string;
  description: string[];
  icon: string;
  sortOrder?: number;
}

export interface ChurchSiteEvent {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  tag?: string | null;
  sortOrder?: number;
}

export interface ChurchSiteMedia {
  youtubeEmbedUrl?: string | null;
  youtubeChannelUrl?: string | null;
}

export interface ChurchSiteGiving {
  description: string;
  pixKey?: string | null;
  showSection: boolean;
}

export interface ChurchSiteSectionsVisibility {
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
}

export interface ChurchSiteThemeConfig {
  defaultMode: 'light' | 'dark';
  allowToggle: boolean;
}

export interface ChurchSiteSeo {
  title: string;
  description: string;
  ogImageUrl?: string | null;
}

// NEW: Section Titles Configuration
export interface ChurchSiteSectionTitle {
  title: string;
  subtitle: string;
}

export interface ChurchSiteSectionTitles {
  firstTime: ChurchSiteSectionTitle;
  about: ChurchSiteSectionTitle;
  ministries: ChurchSiteSectionTitle;
  media: ChurchSiteSectionTitle;
  events: ChurchSiteSectionTitle;
  prayer: ChurchSiteSectionTitle;
  contact: ChurchSiteSectionTitle;
  giving: ChurchSiteSectionTitle;
}

// ---------------------
// Main Interface
// ---------------------

export interface ChurchSiteConfig {
  id: string;
  userId: string;
  slug: string;
  isPublished: boolean;
  branding: ChurchSiteBranding;
  contact: ChurchSiteContact;
  socialLinks: ChurchSiteSocialLinks;
  hero: ChurchSiteHero;
  schedule: ChurchSiteScheduleItem[];
  faq: ChurchSiteFaqItem[];
  about: ChurchSiteAbout;
  ministries: ChurchSiteMinistry[];
  events: ChurchSiteEvent[];
  media: ChurchSiteMedia;
  giving: ChurchSiteGiving;
  sectionsVisibility: ChurchSiteSectionsVisibility;
  themeConfig: ChurchSiteThemeConfig;
  seo: ChurchSiteSeo;
  sectionTitles: ChurchSiteSectionTitles;
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------
// Database Row Type (snake_case)
// ---------------------

export interface ChurchSiteRow {
  id: string;
  user_id: string;
  slug: string;
  is_published: boolean;
  branding: ChurchSiteBranding;
  contact: ChurchSiteContact;
  social_links: ChurchSiteSocialLinks;
  hero: ChurchSiteHero;
  schedule: ChurchSiteScheduleItem[];
  faq: ChurchSiteFaqItem[];
  about: ChurchSiteAbout;
  media: ChurchSiteMedia;
  giving: ChurchSiteGiving;
  sections_visibility: ChurchSiteSectionsVisibility;
  theme_config: ChurchSiteThemeConfig;
  seo: ChurchSiteSeo;
  section_titles?: ChurchSiteSectionTitles;
  created_at: string;
  updated_at: string;
}

// ---------------------
// Default Values
// ---------------------

export const DEFAULT_BRANDING: ChurchSiteBranding = {
  name: '',
  tagline: '',
  logoUrl: null,
  primaryColor: '#8B5CF6',
  secondaryColor: '#6366F1',
};

export const DEFAULT_CONTACT: ChurchSiteContact = {
  whatsapp: '',
  email: '',
  address: '',
  mapsUrl: '',
};

export const DEFAULT_SOCIAL_LINKS: ChurchSiteSocialLinks = {
  instagram: null,
  youtube: null,
  facebook: null,
};

export const DEFAULT_HERO: ChurchSiteHero = {
  title: 'Bem-vindo à nossa Igreja',
  subtitle: 'Um lugar de fé, amor e comunhão',
  coverImageUrl: null,
  showVisitButton: true,
  showMapButton: true,
  showYoutubeButton: true,
  showWhatsappButton: true,
};

export const DEFAULT_ABOUT: ChurchSiteAbout = {
  description: '',
  values: [],
};

export const DEFAULT_MEDIA: ChurchSiteMedia = {
  youtubeEmbedUrl: null,
  youtubeChannelUrl: null,
};

export const DEFAULT_GIVING: ChurchSiteGiving = {
  description: '',
  pixKey: null,
  showSection: true,
};

export const DEFAULT_SECTIONS_VISIBILITY: ChurchSiteSectionsVisibility = {
  hero: true,
  firstTime: true,
  schedule: true,
  about: true,
  ministries: true,
  media: true,
  events: true,
  prayer: true,
  contact: true,
  giving: true,
};

export const DEFAULT_THEME_CONFIG: ChurchSiteThemeConfig = {
  defaultMode: 'dark',
  allowToggle: true,
};

export const DEFAULT_SEO: ChurchSiteSeo = {
  title: '',
  description: '',
  ogImageUrl: null,
};

export const DEFAULT_SECTION_TITLES: ChurchSiteSectionTitles = {
  firstTime: {
    title: 'É sua primeira vez por aqui?',
    subtitle: 'Queremos tornar sua visita leve, simples e acolhedora. Aqui você encontra uma comunidade que ama a Deus, ama pessoas e deseja caminhar com você.',
  },
  about: {
    title: 'Quem somos',
    subtitle: 'Somos uma igreja comprometida com o evangelho de Jesus, com a centralidade da Palavra e com uma vida cristã vivida em comunidade.',
  },
  ministries: {
    title: 'Há um lugar para você aqui',
    subtitle: 'A vida da igreja acontece de muitas formas ao longo da semana.',
  },
  media: {
    title: 'Assista e conheça mais',
    subtitle: 'Acompanhe nossas mensagens, cultos e conteúdos para conhecer melhor a visão da igreja.',
  },
  events: {
    title: 'Próximos encontros',
    subtitle: 'Fique por dentro dos próximos cultos e eventos especiais.',
  },
  prayer: {
    title: 'Podemos orar por você?',
    subtitle: 'Você não precisa caminhar sozinho. Envie seu pedido de oração. Nossa equipe terá alegria em interceder pela sua vida.',
  },
  contact: {
    title: 'Fale com a gente',
    subtitle: 'Estamos aqui para ajudar você.',
  },
  giving: {
    title: 'Dízimos e ofertas',
    subtitle: 'Sua generosidade coopera com a missão, o cuidado com pessoas e o avanço da obra de Deus.',
  },
};

// ---------------------
// Transform Functions
// ---------------------

export function transformRowToConfig(row: ChurchSiteRow, ministries: ChurchSiteMinistry[] = [], events: ChurchSiteEvent[] = []): ChurchSiteConfig {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    isPublished: row.is_published,
    branding: row.branding ?? DEFAULT_BRANDING,
    contact: row.contact ?? DEFAULT_CONTACT,
    socialLinks: row.social_links ?? DEFAULT_SOCIAL_LINKS,
    hero: row.hero ?? DEFAULT_HERO,
    schedule: row.schedule ?? [],
    faq: row.faq ?? [],
    about: row.about ?? DEFAULT_ABOUT,
    ministries,
    events,
    media: row.media ?? DEFAULT_MEDIA,
    giving: row.giving ?? DEFAULT_GIVING,
    sectionsVisibility: row.sections_visibility ?? DEFAULT_SECTIONS_VISIBILITY,
    themeConfig: row.theme_config ?? DEFAULT_THEME_CONFIG,
    seo: row.seo ?? DEFAULT_SEO,
    sectionTitles: row.section_titles ?? DEFAULT_SECTION_TITLES,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function transformConfigToRow(config: Partial<ChurchSiteConfig>): Partial<ChurchSiteRow> {
  const row: Partial<ChurchSiteRow> = {};
  
  if (config.slug !== undefined) row.slug = config.slug;
  if (config.isPublished !== undefined) row.is_published = config.isPublished;
  if (config.branding !== undefined) row.branding = config.branding;
  if (config.contact !== undefined) row.contact = config.contact;
  if (config.socialLinks !== undefined) row.social_links = config.socialLinks;
  if (config.hero !== undefined) row.hero = config.hero;
  if (config.schedule !== undefined) row.schedule = config.schedule;
  if (config.faq !== undefined) row.faq = config.faq;
  if (config.about !== undefined) row.about = config.about;
  if (config.media !== undefined) row.media = config.media;
  if (config.giving !== undefined) row.giving = config.giving;
  if (config.sectionsVisibility !== undefined) row.sections_visibility = config.sectionsVisibility;
  if (config.themeConfig !== undefined) row.theme_config = config.themeConfig;
  if (config.seo !== undefined) row.seo = config.seo;
  if (config.sectionTitles !== undefined) row.section_titles = config.sectionTitles;
  
  return row;
}

// ---------------------
// Slug Validation
// ---------------------

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || slug.length < 3) {
    return { valid: false, error: 'Slug deve ter pelo menos 3 caracteres' };
  }
  
  if (slug.length > 50) {
    return { valid: false, error: 'Slug deve ter no máximo 50 caracteres' };
  }
  
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { valid: false, error: 'Slug deve conter apenas letras minúsculas, números e hífens' };
  }
  
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug não pode começar ou terminar com hífen' };
  }
  
  if (slug.includes('--')) {
    return { valid: false, error: 'Slug não pode conter hífens consecutivos' };
  }
  
  return { valid: true };
}

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços viram hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início/fim
    .slice(0, 50);
}
