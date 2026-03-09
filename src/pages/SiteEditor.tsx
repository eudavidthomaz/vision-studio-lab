import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChurchSite } from "@/hooks/useChurchSite";
import { ChurchSiteTemplate } from "@/components/church-site/ChurchSiteTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Save,
  Smartphone,
  Tablet,
  Monitor,
  ChevronDown,
  Palette,
  Layout,
  MapPin,
  Calendar,
  Users,
  Play,
  MessageCircle,
  HandHeart,
  Settings,
  Loader2,
  Globe,
  Check,
  Clock,
  HelpCircle,
  Heart,
  CalendarDays,
  Share2,
  Eye,
  PenLine,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import type { ChurchSiteConfig } from "@/types/churchSite";

// Editor components
import { FaqEditor } from "@/components/church-site/editor/FaqEditor";
import { ScheduleEditor } from "@/components/church-site/editor/ScheduleEditor";
import { ValuesEditor } from "@/components/church-site/editor/ValuesEditor";
import { MinistriesEditor } from "@/components/church-site/editor/MinistriesEditor";
import { EventsEditor } from "@/components/church-site/editor/EventsEditor";
import { ImageUpload } from "@/components/church-site/editor/ImageUpload";
import { SectionTitlesEditor } from "@/components/church-site/editor/SectionTitlesEditor";

const PREVIEW_BREAKPOINTS = [
  { label: "Fluid",          width: 0,    icon: Monitor },
  { label: "Desktop · 1280", width: 1280, icon: Monitor },
  { label: "Laptop · 1024",  width: 1024, icon: Monitor },
  { label: "Tablet · 768",   width: 768,  icon: Tablet },
  { label: "Mobile · 640",   width: 640,  icon: Smartphone },
  { label: "Mobile · 375",   width: 375,  icon: Smartphone },
] as const;

// Editor section component
interface EditorSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function EditorSection({ title, icon, children, defaultOpen = false }: EditorSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border/40">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function SiteEditor() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [localConfig, setLocalConfig] = useState<ChurchSiteConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [editorMode, setEditorMode] = useState<"edit" | "preview">("edit");

  const { 
    site, 
    isLoading, 
    updateSite, 
    togglePublish,
    addMinistry,
    updateMinistry,
    deleteMinistry,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useChurchSite();

  // Initialize local config from site
  useEffect(() => {
    if (site && !localConfig) {
      setLocalConfig(site);
    }
  }, [site, localConfig]);

  // Debounced config for preview — prevents re-render on every keystroke
  const previewConfig = useDebounce(localConfig, 300);

  // Compact viewport detection
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const onChange = () => {
      const compact = mql.matches;
      setIsCompact(compact);
      if (compact) setPreviewWidth(0);
    };
    mql.addEventListener("change", onChange);
    setIsCompact(mql.matches);
    if (mql.matches) setPreviewWidth(0);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
      } else {
        setUser({ id: data.user.id });
      }
    });
  }, [navigate]);

  // Debounced auto-save
  const debouncedConfig = useDebounce(localConfig, 2000);

  // Use ref to always have fresh references for auto-save
  const localConfigRef = React.useRef(localConfig);
  const siteRef = React.useRef(site);
  const hasChangesRef = React.useRef(hasChanges);
  localConfigRef.current = localConfig;
  siteRef.current = site;
  hasChangesRef.current = hasChanges;

  const handleSave = useCallback(async () => {
    const currentConfig = localConfigRef.current;
    const currentSite = siteRef.current;
    if (!currentConfig || !currentSite) return;
    
    setIsSaving(true);
    try {
      const { ministries, events, ...siteConfig } = currentConfig;
      await updateSite.mutateAsync({ id: currentSite.id, updates: siteConfig });
      setHasChanges(false);
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  }, [updateSite]);

  useEffect(() => {
    if (debouncedConfig && hasChangesRef.current && siteRef.current) {
      handleSave();
    }
  }, [debouncedConfig, handleSave]);

  const updateConfig = useCallback(<K extends keyof ChurchSiteConfig>(
    key: K,
    value: ChurchSiteConfig[K]
  ) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
    setHasChanges(true);
  }, []);

  const updateNestedConfig = useCallback((
    key: keyof ChurchSiteConfig,
    nestedKey: string,
    value: unknown
  ) => {
    setLocalConfig((prev) => {
      if (!prev) return prev;
      const existing = prev[key];
      if (typeof existing === "object" && existing !== null && !Array.isArray(existing)) {
        return {
          ...prev,
          [key]: {
            ...(existing as Record<string, unknown>),
            [nestedKey]: value,
          },
        };
      }
      return prev;
    });
    setHasChanges(true);
  }, []);


  if (!user) return null;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  if (!site || !localConfig) {
    navigate("/sites");
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sites")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Editor do Site</h1>
            <div className="flex items-center gap-2">
              <Badge variant={site.isPublished ? "default" : "secondary"} className="text-xs">
                {site.isPublished ? "Publicado" : "Rascunho"}
              </Badge>
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Alterações pendentes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Breakpoint selector */}
          <div className="flex items-center border border-border/40 rounded-lg p-1 gap-0.5">
            {PREVIEW_BREAKPOINTS.map((bp) => {
              const Icon = bp.icon;
              const isActive = previewWidth === bp.width;
              return (
                <Button
                  key={bp.width}
                  variant={isActive ? "solid" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewWidth(bp.width)}
                  className={`px-2.5 text-xs ${isActive ? "ring-2 ring-primary/50" : ""}`}
                  title={bp.label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline ml-1">{bp.label}</span>
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => togglePublish.mutate({ id: site.id, publish: !site.isPublished })}
            disabled={togglePublish.isPending}
          >
            {site.isPublished ? "Despublicar" : "Publicar"}
          </Button>

          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : hasChanges ? (
              <Save className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isSaving ? "Salvando..." : hasChanges ? "Salvar" : "Salvo"}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Editor Panel */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <ScrollArea className="h-full">
              <div className="divide-y divide-border/40">
                {/* Branding Section */}
                <EditorSection title="Marca & Identidade" icon={<Palette className="w-4 h-4 text-primary" />} defaultOpen>
                  <div className="space-y-3">
                    <div>
                      <Label>Logo da Igreja</Label>
                      <ImageUpload
                        value={localConfig.branding.logoUrl}
                        onChange={(url) => updateNestedConfig("branding", "logoUrl", url)}
                        folder="logos"
                        label="logo"
                      />
                    </div>
                    <div>
                      <Label>Nome da Igreja</Label>
                      <Input
                        value={localConfig.branding.name}
                        onChange={(e) => updateNestedConfig("branding", "name", e.target.value)}
                        placeholder="Igreja Presbiteriana Central"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Usado no rodapé, SEO e identificação da marca
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Cor Primária</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={localConfig.branding.primaryColor}
                            onChange={(e) => updateNestedConfig("branding", "primaryColor", e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={localConfig.branding.primaryColor}
                            onChange={(e) => updateNestedConfig("branding", "primaryColor", e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Cor Secundária</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={localConfig.branding.secondaryColor}
                            onChange={(e) => updateNestedConfig("branding", "secondaryColor", e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            value={localConfig.branding.secondaryColor}
                            onChange={(e) => updateNestedConfig("branding", "secondaryColor", e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </EditorSection>

                {/* Hero Section */}
                <EditorSection title="Hero / Capa" icon={<Layout className="w-4 h-4 text-primary" />}>
                  <div className="space-y-3">
                    <div>
                      <Label>Imagem de Capa</Label>
                      <ImageUpload
                        value={localConfig.hero.coverImageUrl}
                        onChange={(url) => updateNestedConfig("hero", "coverImageUrl", url)}
                        folder="covers"
                        label="capa"
                      />
                    </div>
                    <div>
                      <Label>Vídeo do YouTube (embed)</Label>
                      <Input
                        value={localConfig.media.youtubeEmbedUrl || ""}
                        onChange={(e) => updateNestedConfig("media", "youtubeEmbedUrl", e.target.value || null)}
                        placeholder="https://www.youtube-nocookie.com/embed/VIDEO_ID"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5 bg-muted/50 rounded-md p-2">
                        💡 Escolha entre um <strong>vídeo do YouTube</strong> ou uma <strong>imagem de capa</strong>. Se ambos forem preenchidos, o vídeo terá prioridade.
                      </p>
                    </div>
                    <div>
                      <Label>Label de Boas-vindas</Label>
                      <Input
                        value={localConfig.hero.welcomeLabel}
                        onChange={(e) => updateNestedConfig("hero", "welcomeLabel", e.target.value)}
                        placeholder="Bem-vindo"
                      />
                    </div>
                    <div>
                      <Label>Título do Hero</Label>
                      <Input
                        value={localConfig.hero.title}
                        onChange={(e) => updateNestedConfig("hero", "title", e.target.value)}
                        placeholder="Ex: Bem-vindo à Igreja Central"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Título exibido em destaque na capa do site
                      </p>
                    </div>
                    <div>
                      <Label>Subtítulo</Label>
                      <Textarea
                        value={localConfig.hero.subtitle}
                        onChange={(e) => updateNestedConfig("hero", "subtitle", e.target.value)}
                        placeholder="Um lugar de fé, amor e comunhão"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Botões do Hero</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Quero visitar</span>
                          <Switch
                            checked={localConfig.hero.showVisitButton}
                            onCheckedChange={(v) => updateNestedConfig("hero", "showVisitButton", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Como chegar (mapa)</span>
                          <Switch
                            checked={localConfig.hero.showMapButton}
                            onCheckedChange={(v) => updateNestedConfig("hero", "showMapButton", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Assistir online</span>
                          <Switch
                            checked={localConfig.hero.showYoutubeButton}
                            onCheckedChange={(v) => updateNestedConfig("hero", "showYoutubeButton", v)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">WhatsApp</span>
                          <Switch
                            checked={localConfig.hero.showWhatsappButton}
                            onCheckedChange={(v) => updateNestedConfig("hero", "showWhatsappButton", v)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </EditorSection>

                {/* Schedule Section - NEW */}
                <EditorSection title="Horários dos Cultos" icon={<Clock className="w-4 h-4 text-primary" />}>
                  <ScheduleEditor
                    items={localConfig.schedule}
                    onChange={(items) => updateConfig("schedule", items)}
                  />
                </EditorSection>

                {/* FAQ Section - NEW */}
                <EditorSection title="Primeira Vez (FAQ)" icon={<HelpCircle className="w-4 h-4 text-primary" />}>
                  <FaqEditor
                    items={localConfig.faq}
                    onChange={(items) => updateConfig("faq", items)}
                  />
                </EditorSection>

                {/* About Section with Values - ENHANCED */}
                <EditorSection title="Sobre Nós" icon={<Users className="w-4 h-4 text-primary" />}>
                  <div className="space-y-4">
                    <div>
                      <Label>Descrição da igreja</Label>
                      <Textarea
                        value={localConfig.about.description}
                        onChange={(e) => updateNestedConfig("about", "description", e.target.value)}
                        placeholder="Somos uma igreja comprometida com o evangelho..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Identidade da Igreja (Missão, Visão, Valores)</Label>
                      <ValuesEditor
                        values={localConfig.about.values}
                        onChange={(values) => updateNestedConfig("about", "values", values)}
                      />
                    </div>
                  </div>
                </EditorSection>

                {/* Ministries Section - NEW */}
                <EditorSection title="Ministérios" icon={<Heart className="w-4 h-4 text-primary" />}>
                  <MinistriesEditor
                    ministries={localConfig.ministries}
                    onAdd={async (ministry) => {
                      const result = await addMinistry.mutateAsync({ siteId: site.id, ministry });
                      setLocalConfig(prev => prev ? {
                        ...prev,
                        ministries: [...prev.ministries, {
                          id: result.id,
                          title: result.title,
                          description: result.description || [],
                          icon: result.icon || 'Heart',
                          sortOrder: result.sort_order || 0,
                        }],
                      } : prev);
                    }}
                    onUpdate={async (id, updates) => {
                      await updateMinistry.mutateAsync({ id, updates });
                      setLocalConfig(prev => prev ? {
                        ...prev,
                        ministries: prev.ministries.map(m => m.id === id ? { ...m, ...updates } : m),
                      } : prev);
                    }}
                    onDelete={async (id) => {
                      await deleteMinistry.mutateAsync(id);
                      setLocalConfig(prev => prev ? {
                        ...prev,
                        ministries: prev.ministries.filter(m => m.id !== id),
                      } : prev);
                    }}
                  />
                </EditorSection>

                {/* Events Section - NEW */}
                <EditorSection title="Eventos / Agenda" icon={<CalendarDays className="w-4 h-4 text-primary" />}>
                  <EventsEditor
                    events={localConfig.events}
                    onAdd={async (event) => {
                      const result = await addEvent.mutateAsync({ siteId: site.id, event });
                      setLocalConfig(prev => prev ? {
                        ...prev,
                        events: [...prev.events, {
                          id: result.id,
                          title: result.title,
                          date: result.event_date,
                          time: result.event_time,
                          tag: result.tag,
                          sortOrder: result.sort_order || 0,
                        }],
                      } : prev);
                    }}
                    onUpdate={async (id, updates) => {
                      await updateEvent.mutateAsync({ id, updates });
                      setLocalConfig(prev => prev ? {
                        ...prev,
                        events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e),
                      } : prev);
                    }}
                    onDelete={async (id) => {
                      await deleteEvent.mutateAsync(id);
                      setLocalConfig(prev => prev ? {
                        ...prev,
                        events: prev.events.filter(e => e.id !== id),
                      } : prev);
                    }}
                  />
                </EditorSection>

                {/* Contact Section */}
                <EditorSection title="Contato & Localização" icon={<MapPin className="w-4 h-4 text-primary" />}>
                  <div className="space-y-3">
                    <div>
                      <Label>WhatsApp (link completo)</Label>
                      <Input
                        value={localConfig.contact.whatsapp}
                        onChange={(e) => updateNestedConfig("contact", "whatsapp", e.target.value)}
                        placeholder="https://wa.me/5511999999999"
                      />
                    </div>
                    <div>
                      <Label>E-mail</Label>
                      <Input
                        value={localConfig.contact.email}
                        onChange={(e) => updateNestedConfig("contact", "email", e.target.value)}
                        placeholder="contato@igreja.com.br"
                      />
                    </div>
                    <div>
                      <Label>Endereço completo</Label>
                      <Textarea
                        value={localConfig.contact.address}
                        onChange={(e) => updateNestedConfig("contact", "address", e.target.value)}
                        placeholder="Rua Exemplo, 123 - Bairro, Cidade - SP"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Link do Google Maps</Label>
                      <Input
                        value={localConfig.contact.mapsUrl}
                        onChange={(e) => updateNestedConfig("contact", "mapsUrl", e.target.value)}
                        placeholder="https://maps.google.com/?q=..."
                      />
                    </div>
                  </div>
                </EditorSection>

                {/* Social Links */}
                <EditorSection title="Redes Sociais" icon={<Share2 className="w-4 h-4 text-primary" />}>
                  <div className="space-y-3">
                    <div>
                      <Label>Instagram</Label>
                      <Input
                        value={localConfig.socialLinks.instagram || ""}
                        onChange={(e) => updateNestedConfig("socialLinks", "instagram", e.target.value || null)}
                        placeholder="https://instagram.com/suaigreja"
                      />
                    </div>
                    <div>
                      <Label>YouTube</Label>
                      <Input
                        value={localConfig.socialLinks.youtube || ""}
                        onChange={(e) => updateNestedConfig("socialLinks", "youtube", e.target.value || null)}
                        placeholder="https://youtube.com/@suaigreja"
                      />
                    </div>
                    <div>
                      <Label>Facebook</Label>
                      <Input
                        value={localConfig.socialLinks.facebook || ""}
                        onChange={(e) => updateNestedConfig("socialLinks", "facebook", e.target.value || null)}
                        placeholder="https://facebook.com/suaigreja"
                      />
                    </div>
                  </div>
                </EditorSection>

                {/* Giving Section */}
                <EditorSection title="Dízimos e Ofertas" icon={<HandHeart className="w-4 h-4 text-primary" />}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Mostrar seção</Label>
                      <Switch
                        checked={localConfig.giving.showSection}
                        onCheckedChange={(v) => updateNestedConfig("giving", "showSection", v)}
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={localConfig.giving.description}
                        onChange={(e) => updateNestedConfig("giving", "description", e.target.value)}
                        placeholder="Sua generosidade coopera com a missão..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Chave PIX</Label>
                      <Input
                        value={localConfig.giving.pixKey || ""}
                        onChange={(e) => updateNestedConfig("giving", "pixKey", e.target.value || null)}
                        placeholder="email@igreja.com.br ou CNPJ"
                      />
                    </div>
                  </div>
                </EditorSection>

                {/* Sections Visibility */}
                <EditorSection title="Visibilidade das Seções" icon={<Settings className="w-4 h-4 text-primary" />}>
                  <div className="space-y-2">
                    {Object.entries({
                      hero: "Hero / Capa",
                      firstTime: "Primeira Vez (FAQ)",
                      schedule: "Horários",
                      about: "Sobre Nós",
                      ministries: "Ministérios",
                      media: "Mídia",
                      events: "Eventos",
                      prayer: "Pedido de Oração",
                      contact: "Contato",
                      giving: "Dízimos e Ofertas",
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{label}</span>
                        <Switch
                          checked={localConfig.sectionsVisibility[key as keyof typeof localConfig.sectionsVisibility]}
                          onCheckedChange={(v) =>
                            updateConfig("sectionsVisibility", {
                              ...localConfig.sectionsVisibility,
                              [key]: v,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </EditorSection>

                {/* Theme Config */}
                <EditorSection title="Configurações de Tema" icon={<Palette className="w-4 h-4 text-primary" />}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Permitir trocar tema (claro/escuro)</Label>
                      <Switch
                        checked={localConfig.themeConfig.allowToggle}
                        onCheckedChange={(v) => updateNestedConfig("themeConfig", "allowToggle", v)}
                      />
                    </div>
                    <div>
                      <Label>Tema padrão</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={localConfig.themeConfig.defaultMode === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateNestedConfig("themeConfig", "defaultMode", "dark")}
                        >
                          Escuro
                        </Button>
                        <Button
                          variant={localConfig.themeConfig.defaultMode === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateNestedConfig("themeConfig", "defaultMode", "light")}
                        >
                          Claro
                        </Button>
                      </div>
                    </div>
                  </div>
                </EditorSection>

                {/* Section Titles - Customization */}
                <EditorSection title="Textos das Seções" icon={<Layout className="w-4 h-4 text-primary" />}>
                  <SectionTitlesEditor
                    sectionTitles={localConfig.sectionTitles}
                    onChange={(sectionTitles) => updateConfig("sectionTitles", sectionTitles)}
                  />
                </EditorSection>

                {/* SEO */}
                <EditorSection title="SEO" icon={<Globe className="w-4 h-4 text-primary" />}>
                  <div className="space-y-3">
                    <div>
                      <Label>Título da página (SEO)</Label>
                      <Input
                        value={localConfig.seo.title}
                        onChange={(e) => updateNestedConfig("seo", "title", e.target.value)}
                        placeholder="Igreja Presbiteriana Central - Cidade"
                      />
                    </div>
                    <div>
                      <Label>Descrição (meta description)</Label>
                      <Textarea
                        value={localConfig.seo.description}
                        onChange={(e) => updateNestedConfig("seo", "description", e.target.value)}
                        placeholder="Conheça a Igreja Presbiteriana Central..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Imagem de compartilhamento (og:image)</Label>
                      <ImageUpload
                        value={localConfig.seo.ogImageUrl}
                        onChange={(url) => updateNestedConfig("seo", "ogImageUrl", url)}
                        folder="og-images"
                        label="og:image"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Imagem exibida ao compartilhar o link do site em redes sociais. Recomendado: 1200×630px.
                      </p>
                    </div>
                  </div>
                </EditorSection>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={65}>
            <div className="h-full bg-muted/30 flex items-start justify-center p-4 overflow-auto">
              <div
                className="bg-background rounded-lg shadow-2xl overflow-hidden transition-all duration-300 mx-auto"
                style={{
                  width: previewWidth === 0 ? '100%' : `${previewWidth}px`,
                  maxWidth: '100%',
                  height: previewWidth === 0 ? '100%' : '85vh',
                }}
              >
                <div className="h-full overflow-auto">
                  {previewConfig && <ChurchSiteTemplate config={previewConfig} isPreview />}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
