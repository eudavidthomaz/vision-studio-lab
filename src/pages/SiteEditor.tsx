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
          {/* Compact: Edit/Preview toggle */}
          {isCompact ? (
            <div className="flex items-center border border-border/40 rounded-lg p-1 gap-0.5">
              <Button
                variant={editorMode === "edit" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setEditorMode("edit")}
                className={`px-3 text-xs ${editorMode === "edit" ? "ring-2 ring-primary/50" : ""}`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span className="ml-1">Editar</span>
              </Button>
              <Button
                variant={editorMode === "preview" ? "solid" : "ghost"}
                size="sm"
                onClick={() => setEditorMode("preview")}
                className={`px-3 text-xs ${editorMode === "preview" ? "ring-2 ring-primary/50" : ""}`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="ml-1">Preview</span>
              </Button>
            </div>
          ) : (
            /* Desktop: Breakpoint selector */
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
          )}

          <Button
            variant="outline"
            onClick={() => togglePublish.mutate({ id: site.id, publish: !site.isPublished })}
            disabled={togglePublish.isPending}
            className={isCompact ? "hidden sm:inline-flex" : ""}
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
            <span className={isCompact ? "hidden sm:inline" : ""}>
              {isSaving ? "Salvando..." : hasChanges ? "Salvar" : "Salvo"}
            </span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {isCompact ? (
          /* ── Compact layout: both panels always mounted, toggle visibility ── */
          <div className="h-full relative">
            {/* Editor panel — hidden when preview active */}
            <div className={`h-full ${editorMode === "edit" ? "block" : "hidden"}`}>
              <ScrollArea className="h-full">
                <div className="divide-y divide-border/40">
                  <EditorPanelContent
                    localConfig={localConfig}
                    site={site}
                    updateConfig={updateConfig}
                    updateNestedConfig={updateNestedConfig}
                    addMinistry={addMinistry}
                    updateMinistry={updateMinistry}
                    deleteMinistry={deleteMinistry}
                    addEvent={addEvent}
                    updateEvent={updateEvent}
                    deleteEvent={deleteEvent}
                    setLocalConfig={setLocalConfig}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* Preview panel — hidden when edit active */}
            <div className={`h-full overflow-auto ${editorMode === "preview" ? "block" : "hidden"}`}>
              {previewConfig && <ChurchSiteTemplate config={previewConfig} isPreview />}
            </div>
          </div>
        ) : (
          /* ── Desktop layout: side-by-side resizable panels ── */
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
              <ScrollArea className="h-full">
                <div className="divide-y divide-border/40">
                  <EditorPanelContent
                    localConfig={localConfig}
                    site={site}
                    updateConfig={updateConfig}
                    updateNestedConfig={updateNestedConfig}
                    addMinistry={addMinistry}
                    updateMinistry={updateMinistry}
                    deleteMinistry={deleteMinistry}
                    addEvent={addEvent}
                    updateEvent={updateEvent}
                    deleteEvent={deleteEvent}
                    setLocalConfig={setLocalConfig}
                  />
                </div>
              </ScrollArea>
            </ResizablePanel>

            <ResizableHandle withHandle />

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
        )}
      </div>
    </div>
  );
}
