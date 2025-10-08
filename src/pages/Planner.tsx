import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Loader2, Image as ImageIcon, FileText, TrendingUp, Download, Undo2, Redo2, ChevronLeft, ChevronRight, Sparkles, BarChart3, Eye, Calendar, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import ContentIdeaModal from "@/components/ContentIdeaModal";
import ContentCard from "@/components/ContentCard";
import MobileContentCard from "@/components/MobileContentCard";
import EditContentDrawer from "@/components/EditContentDrawer";
import MoveToDrawer from "@/components/MoveToDrawer";
import PillarLegend from "@/components/PillarLegend";
import ExportPlannerModal from "@/components/ExportPlannerModal";
import TemplateGallery from "@/components/TemplateGallery";
import PlannerFilters, { FilterState } from "@/components/PlannerFilters";
import AdvancedFilters, { AdvancedFilterState } from "@/components/AdvancedFilters";
import BulkActionsBar from "@/components/BulkActionsBar";
import ContentPreviewCard from "@/components/ContentPreviewCard";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import PillarStats from "@/components/PillarStats";
import PostPreviewModal from "@/components/PostPreviewModal";
import PlannerTourButton from "@/components/PlannerTourButton";
import KeyboardShortcutsHelper from "@/components/KeyboardShortcutsHelper";
import AutoSaveIndicator from "@/components/AutoSaveIndicator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useHistory } from "@/hooks/useHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

const daysOfWeek = [
  { day: "Segunda", pilar: "Edificar" },
  { day: "Terça", pilar: "Alcançar" },
  { day: "Quarta", pilar: "Pertencer" },
  { day: "Quinta", pilar: "Servir" },
  { day: "Sexta", pilar: "Convite" },
  { day: "Sábado", pilar: "Comunidade" },
  { day: "Domingo", pilar: "Cobertura" }
];

interface ContentItem {
  id: string;
  titulo: string;
  tipo: string;
  pilar: string;
  dia_sugerido: string;
  copy: string;
  hashtags: string[];
  cta: string;
  imagem_url?: string;
  status?: string;
  tags?: string[];
  is_favorite?: boolean;
  is_archived?: boolean;
  [key: string]: any;
}

export default function Planner() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("Segunda");
  const [plannerId, setPlannerId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [movingContent, setMovingContent] = useState<any>(null);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"week" | "month" | "stats">("week");
  const [filters, setFilters] = useState<AdvancedFilterState>({
    type: "all",
    pillar: "all",
    hasImage: "all",
    day: "all",
    status: "all",
    favorite: "all",
    archived: "no",
    searchTerm: "",
    tags: [],
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [lastSaved, setLastSaved] = useState<Date>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const isMobile = useIsMobile();

  // History management
  const {
    state: contentByDay,
    set: setContentByDay,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<Record<string, ContentItem[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleRefresh = async () => {
    if (user) {
      await loadPlanner(user.id);
      toast({
        title: "✓ Atualizado",
        description: "Planner atualizado com sucesso",
        duration: 2000,
      });
    }
  };

  const { handlers: pullHandlers, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast({
            title: "↩️ Desfeito",
            description: "Ação anterior foi desfeita.",
            duration: 2000,
          });
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast({
            title: "↪️ Refeito",
            description: "Ação foi refeita.",
            duration: 2000,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, toast]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        loadPlanner(session.user.id);
        // Track planner visit
        trackEvent('planner_visited');
      }
    });
  }, [trackEvent]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  const getWeekStartDate = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const dateStr = monday.toISOString().split('T')[0];
    setWeekStartDate(dateStr);
    return dateStr;
  };

  const loadPlanner = async (userId: string) => {
    try {
      const weekStart = getWeekStartDate();
      
      const { data, error } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start_date', weekStart)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPlannerId(data.id);
        resetHistory((data.content as Record<string, ContentItem[]>) || {});
      } else {
        // Create new planner for this week
        const { data: newPlanner, error: createError } = await supabase
          .from('content_planners')
          .insert({
            user_id: userId,
            week_start_date: weekStart,
            content: {}
          })
          .select()
          .single();

        if (createError) throw createError;
        setPlannerId(newPlanner.id);
        resetHistory({});
      }
    } catch (error) {
      console.error('Error loading planner:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o planner.",
        variant: "destructive"
      });
    }
  };

  const savePlanner = async (newContent: Record<string, ContentItem[]>) => {
    if (!plannerId) return;

    setSaveStatus("saving");
    try {
      const { error } = await supabase
        .from('content_planners')
        .update({ content: newContent })
        .eq('id', plannerId);

      if (error) throw error;
      
      setSaveStatus("saved");
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error('Error saving planner:', error);
      setSaveStatus("idle");
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  };

  const handleIdeaGenerated = (idea: any) => {
    const day = idea.dia_sugerido || selectedDay;
    const newContent = {
      ...idea,
      id: crypto.randomUUID()
    };

    const updatedContent = {
      ...contentByDay,
      [day]: [...(contentByDay[day] || []), newContent]
    };

    setContentByDay(updatedContent);
    savePlanner(updatedContent);
  };

  const handleApplyTemplate = (templateData: any) => {
    const day = templateData.dia_sugerido || selectedDay;
    const newContent = {
      ...templateData,
      id: crypto.randomUUID()
    };

    const updatedContent = {
      ...contentByDay,
      [day]: [...(contentByDay[day] || []), newContent]
    };

    setContentByDay(updatedContent);
    savePlanner(updatedContent);
  };

  const handlePreviewContent = (day: string, contentId: string) => {
    const content = (contentByDay[day] || []).find(c => c.id === contentId);
    if (content) {
      setPreviewContent(content);
      setPreviewOpen(true);
    }
  };

  const handlePreviewSave = (updates: Partial<ContentItem>) => {
    if (previewContent) {
      const day = Object.keys(contentByDay).find(d => 
        contentByDay[d].some(c => c.id === previewContent.id)
      );
      if (day) {
        handleUpdate(day, previewContent.id, updates);
      }
    }
  };

  const handleDelete = (day: string, contentId: string) => {
    const deletedContent = (contentByDay[day] || []).find(c => c.id === contentId);
    
    const updatedContent = {
      ...contentByDay,
      [day]: (contentByDay[day] || []).filter(c => c.id !== contentId)
    };
    setContentByDay(updatedContent);
    savePlanner(updatedContent);
    
    // Show toast with undo option
    toast({
      title: "🗑️ Excluído",
      description: (
        <div>
          <p>"{deletedContent?.titulo}" foi removido.</p>
        </div>
      ),
      duration: 5000,
    });
  };

  const handleUpdate = (day: string, contentId: string, updates: any) => {
    const updatedContent = {
      ...contentByDay,
      [day]: (contentByDay[day] || []).map(c => 
        c.id === contentId ? { ...c, ...updates } : c
      )
    };
    setContentByDay(updatedContent);
    savePlanner(updatedContent);
  };

  const handleMove = (sourceDay: string, contentId: string, targetDay: string) => {
    if (sourceDay === targetDay) return;

    const content = (contentByDay[sourceDay] || []).find(c => c.id === contentId);
    if (!content) return;

    const updatedContent = {
      ...contentByDay,
      [sourceDay]: (contentByDay[sourceDay] || []).filter(c => c.id !== contentId),
      [targetDay]: [...(contentByDay[targetDay] || []), content]
    };
    
    setContentByDay(updatedContent);
    savePlanner(updatedContent);
    
    toast({
      title: "📦 Movido!",
      description: `"${content.titulo}" → ${targetDay}`,
      duration: 3000,
    });
  };

  const openEditDrawer = (day: string, contentId: string) => {
    const content = (contentByDay[day] || []).find(c => c.id === contentId);
    if (content) {
      setEditingContent({ ...content, day });
      setEditDrawerOpen(true);
    }
  };

  const openMoveDrawer = (day: string, contentId: string) => {
    const content = (contentByDay[day] || []).find(c => c.id === contentId);
    if (content) {
      setMovingContent({ ...content, day });
      setMoveDrawerOpen(true);
    }
  };

  const handleSaveEdit = (updates: any) => {
    if (editingContent) {
      handleUpdate(editingContent.day, editingContent.id, updates);
    }
  };

  const handleMoveConfirm = (targetDay: string) => {
    if (movingContent) {
      handleMove(movingContent.day, movingContent.id, targetDay);
      setSelectedDay(targetDay);
    }
  };

  const getCurrentDayIndex = () => {
    return daysOfWeek.findIndex(d => d.day === selectedDay);
  };

  const goToPreviousDay = () => {
    const currentIndex = getCurrentDayIndex();
    if (currentIndex > 0) {
      setSelectedDay(daysOfWeek[currentIndex - 1].day);
    }
  };

  const goToNextDay = () => {
    const currentIndex = getCurrentDayIndex();
    if (currentIndex < daysOfWeek.length - 1) {
      setSelectedDay(daysOfWeek[currentIndex + 1].day);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    if (over) {
      const day = daysOfWeek.find(d => over.id === d.day)?.day;
      setDragOverDay(day || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragOverDay(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source day and content
    let sourceDay = "";
    let draggedContent: ContentItem | null = null;

    for (const [day, contents] of Object.entries(contentByDay)) {
      const found = contents.find(c => c.id === activeId);
      if (found) {
        sourceDay = day;
        draggedContent = found;
        break;
      }
    }

    if (!draggedContent) return;

    // Check if dropped on a day container (column)
    const targetDay = daysOfWeek.find(d => overId === d.day)?.day;

    if (targetDay && targetDay !== sourceDay) {
      // Moving between days
      const updatedContent = {
        ...contentByDay,
        [sourceDay]: (contentByDay[sourceDay] || []).filter(c => c.id !== activeId),
        [targetDay]: [...(contentByDay[targetDay] || []), draggedContent]
      };
      setContentByDay(updatedContent);
      savePlanner(updatedContent);
      toast({
        title: "📦 Movido!",
        description: `"${draggedContent.titulo}" → ${targetDay}`,
        duration: 3000,
      });
    } else if (activeId !== overId) {
      // Reordering within the same day
      for (const [day, contents] of Object.entries(contentByDay)) {
        const activeIndex = contents.findIndex(c => c.id === activeId);
        const overIndex = contents.findIndex(c => c.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const newContents = [...contents];
          const [removed] = newContents.splice(activeIndex, 1);
          newContents.splice(overIndex, 0, removed);

          const updatedContent = {
            ...contentByDay,
            [day]: newContents
          };
          setContentByDay(updatedContent);
          savePlanner(updatedContent);
          break;
        }
      }
    }
  };

  const getActiveContent = () => {
    if (!activeId) return null;
    for (const contents of Object.values(contentByDay)) {
      const found = contents.find(c => c.id === activeId);
      if (found) return found;
    }
    return null;
  };

  // Calculate weekly metrics
  const weeklyMetrics = useMemo(() => {
    const allContent = Object.values(contentByDay).flat();
    const totalPosts = allContent.length;
    const targetPosts = 21; // 3 posts per day * 7 days
    
    // Count posts with images (assuming posts that have been through image generation)
    const postsWithImage = allContent.filter(c => c.imagem_url).length;
    
    // Count by type
    const typeCount = allContent.reduce((acc, content) => {
      acc[content.tipo] = (acc[content.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPosts,
      targetPosts,
      postsWithImage,
      typeCount,
      completionPercentage: Math.round((totalPosts / targetPosts) * 100),
      imagePercentage: totalPosts > 0 ? Math.round((postsWithImage / totalPosts) * 100) : 0,
    };
  }, [contentByDay]);

  // Calculate daily status
  const getDayStatus = (day: string) => {
    const contents = contentByDay[day] || [];
    const count = contents.length;
    
    if (count === 0) return { color: "bg-red-500", label: "Vazio", icon: "🔴" };
    if (count < 2) return { color: "bg-yellow-500", label: "Incompleto", icon: "🟡" };
    return { color: "bg-green-500", label: "Completo", icon: "🟢" };
  };

  // Apply filters to content
  const filteredContentByDay = useMemo(() => {
    const filtered: Record<string, ContentItem[]> = {};
    
    Object.entries(contentByDay).forEach(([day, contents]) => {
      filtered[day] = contents.filter((content) => {
        // Filter by archived status first
        if (filters.archived === "no" && content.is_archived) return false;
        if (filters.archived === "yes" && !content.is_archived) return false;
        
        // Filter by type
        if (filters.type !== "all" && content.tipo !== filters.type) return false;
        
        // Filter by pillar
        if (filters.pillar !== "all" && content.pilar !== filters.pillar) return false;
        
        // Filter by image status
        if (filters.hasImage === "with" && !content.imagem_url) return false;
        if (filters.hasImage === "without" && content.imagem_url) return false;
        
        // Filter by day
        if (filters.day !== "all" && day !== filters.day) return false;
        
        // Filter by status
        if (filters.status !== "all" && content.status !== filters.status) return false;
        
        // Filter by favorite
        if (filters.favorite === "yes" && !content.is_favorite) return false;
        if (filters.favorite === "no" && content.is_favorite) return false;
        
        // Filter by search term
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          const matchesTitle = content.titulo.toLowerCase().includes(searchLower);
          const matchesCopy = content.copy.toLowerCase().includes(searchLower);
          const matchesHashtags = content.hashtags.some(h => h.toLowerCase().includes(searchLower));
          if (!matchesTitle && !matchesCopy && !matchesHashtags) return false;
        }
        
        // Filter by tags
        if (filters.tags.length > 0) {
          const contentTags = content.tags || [];
          const hasMatchingTag = filters.tags.some(tag => contentTags.includes(tag));
          if (!hasMatchingTag) return false;
        }
        
        return true;
      });
    });
    
    return filtered;
  }, [contentByDay, filters]);

  // Count total filtered results
  const totalFilteredResults = useMemo(() => {
    return Object.values(filteredContentByDay).flat().length;
  }, [filteredContentByDay]);

  // Bulk Actions Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkMove = (targetDay: string) => {
    const updates = { ...contentByDay };
    
    selectedIds.forEach(id => {
      // Find source day
      let sourceDay = "";
      for (const [day, contents] of Object.entries(contentByDay)) {
        if (contents.some(c => c.id === id)) {
          sourceDay = day;
          break;
        }
      }
      
      if (sourceDay && sourceDay !== targetDay) {
        // Move content
        const content = updates[sourceDay].find(c => c.id === id);
        if (content) {
          updates[sourceDay] = updates[sourceDay].filter(c => c.id !== id);
          updates[targetDay] = [...(updates[targetDay] || []), content];
        }
      }
    });
    
    setContentByDay(updates);
    savePlanner(updates);
    setSelectedIds(new Set());
    
    toast({
      title: "✓ Movidos!",
      description: `${selectedIds.size} item(ns) movido(s) para ${targetDay}`,
    });
  };

  const handleBulkDelete = () => {
    const updates = { ...contentByDay };
    
    selectedIds.forEach(id => {
      for (const day in updates) {
        updates[day] = updates[day].filter(c => c.id !== id);
      }
    });
    
    setContentByDay(updates);
    savePlanner(updates);
    setSelectedIds(new Set());
    
    toast({
      title: "🗑️ Excluídos!",
      description: `${selectedIds.size} item(ns) excluído(s)`,
    });
  };

  const handleBulkArchive = () => {
    const updates = { ...contentByDay };
    
    selectedIds.forEach(id => {
      for (const day in updates) {
        updates[day] = updates[day].map(c => 
          c.id === id ? { ...c, is_archived: !c.is_archived } : c
        );
      }
    });
    
    setContentByDay(updates);
    savePlanner(updates);
    setSelectedIds(new Set());
    
    toast({
      title: "📦 Arquivados!",
      description: `${selectedIds.size} item(ns) arquivado(s)`,
    });
  };

  const handleBulkFavorite = () => {
    const updates = { ...contentByDay };
    
    selectedIds.forEach(id => {
      for (const day in updates) {
        updates[day] = updates[day].map(c => 
          c.id === id ? { ...c, is_favorite: !c.is_favorite } : c
        );
      }
    });
    
    setContentByDay(updates);
    savePlanner(updates);
    setSelectedIds(new Set());
    
    toast({
      title: "⭐ Favoritados!",
      description: `${selectedIds.size} item(ns) marcado(s) como favorito`,
    });
  };

  const handleBulkTag = () => {
    toast({
      title: "Em breve!",
      description: "Adição de tags em massa estará disponível em breve.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <Skeleton className="h-12 w-64 mb-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/")}
                  aria-label="Voltar para o início"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold text-white">Planner Visual</h1>
                <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
                
                {/* Undo/Redo buttons */}
                <div className="flex gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                    title="Desfazer (Ctrl+Z)"
                    aria-label="Desfazer última ação"
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                    title="Refazer (Ctrl+Y)"
                    aria-label="Refazer ação desfeita"
                    className="transition-transform hover:scale-110 disabled:opacity-50"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <PlannerTourButton />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTemplateGalleryOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExportModalOpen(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/historico")}>
                  Histórico
                </Button>
              </div>
            </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Weekly Progress Bar */}
          <div className="mb-6 bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progresso Semanal
              </h2>
              <Badge variant="outline" className="text-lg px-4 py-1">
                {weeklyMetrics.totalPosts}/{weeklyMetrics.targetPosts} posts
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Main Progress */}
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Total de posts planejados</span>
                  <span className="font-medium text-foreground">{weeklyMetrics.completionPercentage}%</span>
                </div>
                <Progress value={weeklyMetrics.completionPercentage} className="h-3" />
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{weeklyMetrics.totalPosts}</p>
                    <p className="text-xs text-muted-foreground">Total de Posts</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ImageIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{weeklyMetrics.postsWithImage}</p>
                    <p className="text-xs text-muted-foreground">Com Imagem ({weeklyMetrics.imagePercentage}%)</p>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground mb-2">Por Tipo:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(weeklyMetrics.typeCount).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="week" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Semana</span>
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Mês</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
            </TabsTrigger>
          </TabsList>

            {/* Filters */}
            {viewMode === "week" && (
              <div className="mt-6">
                <AdvancedFilters 
                  onFilterChange={setFilters} 
                  totalResults={totalFilteredResults}
                />
              </div>
            )}

            {/* Week View */}
            <TabsContent value="week" className="mt-6">
              <div className="mb-8">
                <PillarLegend />
              </div>

              {/* Desktop: 7-column grid */}
              <div className="hidden lg:grid lg:grid-cols-7 gap-4">
                {daysOfWeek.map(({ day, pilar }) => (
                  <SortableContext
                    key={day}
                    id={day}
                    items={(filteredContentByDay[day] || []).map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg p-3">
                        {/* Day Header with Status */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground text-sm">{day}</h3>
                              <span className="text-base">{getDayStatus(day).icon}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{pilar}</p>
                          </div>
                        </div>

                        {/* Daily Stats */}
                        <div className="space-y-1 mb-3 py-2 border-y border-border/30">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Posts
                            </span>
                            <span className="font-medium text-foreground">
                              {(filteredContentByDay[day] || []).length}/{(contentByDay[day] || []).length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <ImageIcon className="h-3 w-3" />
                              Imagens
                            </span>
                            <span className="font-medium text-foreground">
                              {(filteredContentByDay[day] || []).filter(c => c.imagem_url).length}/{(filteredContentByDay[day] || []).length}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setSelectedDay(day);
                            setModalOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Nova Ideia
                        </Button>
                      </div>
                      
                      <div
                        id={day}
                        className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-all duration-200 ${
                          dragOverDay === day 
                            ? 'bg-primary/20 border-2 border-primary border-dashed scale-105' 
                            : 'border-2 border-transparent'
                        }`}
                      >
                        {(filteredContentByDay[day] || []).map((content) => (
                          <div key={content.id} className="cursor-pointer">
                            <ContentCard
                              content={content}
                              onDelete={(id) => handleDelete(day, id)}
                              onUpdate={(id, updates) => handleUpdate(day, id, updates)}
                              isDraggable
                              isSelected={selectedIds.has(content.id)}
                              onToggleSelect={() => handleToggleSelect(content.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </SortableContext>
                ))}
              </div>

              {/* Mobile: Tabs Navigation */}
              <div className="lg:hidden" {...pullHandlers}>
            {/* Pull to Refresh Indicator */}
            {(pullDistance > 0 || isRefreshing) && (
              <div 
                className="flex justify-center items-center py-2 transition-all duration-300"
                style={{
                  transform: `translateY(${Math.min(pullDistance, 80)}px)`,
                  opacity: Math.min(pullDistance / 80, 1),
                }}
              >
                {isRefreshing ? (
                  <Loader2 className="h-6 w-6 animate-pull-refresh text-primary" />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {pullDistance >= 80 ? "Solte para atualizar" : "Puxe para atualizar"}
                  </div>
                )}
              </div>
            )}
            
            <Tabs value={selectedDay} onValueChange={setSelectedDay}>
              {/* Tabs Navigation with Scroll */}
              <div className="sticky top-[73px] z-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-4 -mx-4 px-4">
                <div className="flex items-center gap-2 mb-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousDay}
                    disabled={getCurrentDayIndex() === 0}
                    className="shrink-0"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card/30 backdrop-blur-sm h-auto p-1">
                    {daysOfWeek.map(({ day, pilar }) => {
                      const status = getDayStatus(day);
                      const count = (contentByDay[day] || []).length;
                      return (
                        <TabsTrigger
                          key={day}
                          value={day}
                          className="flex-col items-start h-auto py-2 px-3 min-w-[90px] data-[state=active]:bg-primary/20"
                        >
                          <div className="flex items-center gap-1 w-full">
                            <span className="font-semibold text-sm">{day.slice(0, 3)}</span>
                            <span className="text-xs">{status.icon}</span>
                          </div>
                          <div className="flex items-center gap-1 w-full">
                            <span className="text-[10px] text-muted-foreground">{pilar}</span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {count}
                            </Badge>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextDay}
                    disabled={getCurrentDayIndex() === daysOfWeek.length - 1}
                    className="shrink-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Current Day Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedDay}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {daysOfWeek.find(d => d.day === selectedDay)?.pilar}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setModalOpen(true)}
                    className="h-12 px-6"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Nova Ideia
                  </Button>
                </div>
              </div>

              {/* Tab Content for Each Day */}
              {daysOfWeek.map(({ day }, dayIndex) => (
                <TabsContent key={day} value={day} className="mt-0">
                  <div className="space-y-4">
                    {(filteredContentByDay[day] || []).map((content, index) => (
                      <div 
                        key={content.id}
                        className="animate-slide-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => handlePreviewContent(day, content.id)}
                      >
                        <MobileContentCard
                          content={content}
                          onDelete={(id) => handleDelete(day, id)}
                          onUpdate={(id, updates) => handleUpdate(day, id, updates)}
                          onMove={(id) => openMoveDrawer(day, id)}
                          onEdit={() => openEditDrawer(day, content.id)}
                        />
                      </div>
                    ))}
                    
                    {(!filteredContentByDay[day] || filteredContentByDay[day].length === 0) && (
                      <div className="bg-card/30 backdrop-blur-sm border border-border/50 border-dashed rounded-lg p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground mb-4">
                          {contentByDay[day]?.length > 0 ? "Nenhum conteúdo corresponde aos filtros" : `Nenhum conteúdo planejado para ${day}`}
                        </p>
                        <Button onClick={() => setModalOpen(true)} size="lg">
                          <Plus className="h-5 w-5 mr-2" />
                          Adicionar Primeira Ideia
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
              </div>
            </TabsContent>

            {/* Month View */}
            <TabsContent value="month" className="mt-6">
              <MonthlyCalendar 
                contentByDay={contentByDay}
                onDayClick={(day) => {
                  setSelectedDay(day);
                  setViewMode("week");
                }}
              />
            </TabsContent>

            {/* Stats View */}
            <TabsContent value="stats" className="mt-6">
              <PillarStats contentByDay={contentByDay} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onBulkMove={handleBulkMove}
          onBulkDelete={handleBulkDelete}
          onBulkArchive={handleBulkArchive}
          onBulkFavorite={handleBulkFavorite}
          onBulkTag={handleBulkTag}
          days={daysOfWeek}
        />

        <ContentIdeaModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          defaultPilar={daysOfWeek.find(d => d.day === selectedDay)?.pilar}
          onIdeaGenerated={handleIdeaGenerated}
        />

        <ExportPlannerModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          contentByDay={contentByDay}
          weekStartDate={weekStartDate}
        />

        <EditContentDrawer
          open={editDrawerOpen}
          onOpenChange={setEditDrawerOpen}
          content={editingContent}
          onSave={handleSaveEdit}
        />

        <MoveToDrawer
          open={moveDrawerOpen}
          onOpenChange={setMoveDrawerOpen}
          currentDay={movingContent?.day || ""}
          contentTitle={movingContent?.titulo || ""}
          onMove={handleMoveConfirm}
        />

        <TemplateGallery
          open={templateGalleryOpen}
          onOpenChange={setTemplateGalleryOpen}
          onApplyTemplate={handleApplyTemplate}
          selectedDay={selectedDay}
        />

        <PostPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          content={previewContent}
          onEdit={() => {
            if (previewContent) {
              const day = Object.keys(contentByDay).find(d => 
                contentByDay[d].some(c => c.id === previewContent.id)
              );
              if (day) {
                openEditDrawer(day, previewContent.id);
              }
            }
            setPreviewOpen(false);
          }}
          onSave={handlePreviewSave}
        />

        <KeyboardShortcutsHelper />

        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 rotate-3 scale-110 shadow-2xl animate-pulse">
              <ContentCard
                content={getActiveContent()!}
                onDelete={() => {}}
                onUpdate={() => {}}
                isDraggable={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
