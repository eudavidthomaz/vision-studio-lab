import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import HistoryCard from "@/components/HistoryCard";
import DetailModal from "@/components/DetailModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Historico() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyPacks, setWeeklyPacks] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [planners, setPlanners] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<"pack" | "challenge" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        loadHistory(session.user.id);
        // Track history visit
        trackEvent('history_visited');
      }
    });
  }, [trackEvent]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  const loadHistory = async (userId: string) => {
    try {
      // Load weekly packs
      const { data: packsData, error: packsError } = await supabase
        .from('weekly_packs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (packsError) throw packsError;
      setWeeklyPacks(packsData || []);

      // Load challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('ideon_challenges')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;
      setChallenges(challengesData || []);

      // Load planners
      const { data: plannersData, error: plannersError } = await supabase
        .from('content_planners')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (plannersError) throw plannersError;
      setPlanners(plannersData || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, type: "pack" | "challenge" | "planner") => {
    try {
      let error;
      
      if (type === "pack") {
        const { error: deleteError } = await supabase
          .from('weekly_packs')
          .delete()
          .eq('id', id);
        error = deleteError;
        setWeeklyPacks(weeklyPacks.filter(p => p.id !== id));
      } else if (type === "challenge") {
        const { error: deleteError } = await supabase
          .from('ideon_challenges')
          .delete()
          .eq('id', id);
        error = deleteError;
        setChallenges(challenges.filter(c => c.id !== id));
      } else {
        const { error: deleteError } = await supabase
          .from('content_planners')
          .delete()
          .eq('id', id);
        error = deleteError;
        setPlanners(planners.filter(p => p.id !== id));
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item deletado com sucesso."
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o item.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (item: any, type: "pack" | "challenge") => {
    setSelectedItem(item);
    setModalType(type);
  };

  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const createdAt = new Date(item.created_at).toLocaleDateString();
      return createdAt.includes(searchLower);
    });
  };

  const paginateItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const getTotalPages = (items: any[]) => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const renderPagination = (items: any[]) => {
    const totalPages = getTotalPages(items);
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Histórico de Conteúdo</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="packs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="packs">
              Pacotes Semanais ({weeklyPacks.length})
            </TabsTrigger>
            <TabsTrigger value="challenges">
              Desafios Ide.On ({challenges.length})
            </TabsTrigger>
            <TabsTrigger value="planners">
              Planners ({planners.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packs" className="mt-6">
            {filterItems(weeklyPacks).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum pacote semanal encontrado.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginateItems(filterItems(weeklyPacks)).map((pack) => (
                    <HistoryCard
                      key={pack.id}
                      item={pack}
                      type="pack"
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
                {renderPagination(filterItems(weeklyPacks))}
              </>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            {filterItems(challenges).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum desafio encontrado.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginateItems(filterItems(challenges)).map((challenge) => (
                    <HistoryCard
                      key={challenge.id}
                      item={challenge}
                      type="challenge"
                      onDelete={handleDelete}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
                {renderPagination(filterItems(challenges))}
              </>
            )}
          </TabsContent>

          <TabsContent value="planners" className="mt-6">
            {filterItems(planners).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum planner encontrado.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paginateItems(filterItems(planners)).map((planner) => (
                    <HistoryCard
                      key={planner.id}
                      item={planner}
                      type="planner"
                      onDelete={handleDelete}
                      onViewDetails={() => {}}
                    />
                  ))}
                </div>
                {renderPagination(filterItems(planners))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedItem && modalType && (
        <DetailModal
          item={selectedItem}
          type={modalType}
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedItem(null);
              setModalType(null);
            }
          }}
        />
      )}
    </div>
  );
}