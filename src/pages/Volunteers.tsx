import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  UserCheck, 
  UserX,
  ArrowLeft,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import { useVolunteers, Volunteer, VolunteerInsert, VOLUNTEER_ROLES } from "@/hooks/useVolunteers";
import { VolunteerFormModal } from "@/components/volunteers/VolunteerFormModal";
import { VolunteerAvailabilityBadge } from "@/components/volunteers/VolunteerAvailabilityBadge";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/* ─── Mobile volunteer card ─── */
function MobileVolunteerCard({
  volunteer,
  getRoleLabel,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  volunteer: Volunteer;
  getRoleLabel: (v: string) => string;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{volunteer.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {getRoleLabel(volunteer.role)}
            </Badge>
            <Badge variant={volunteer.is_active ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
              {volunteer.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          {(volunteer.email || volunteer.phone) && (
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              {volunteer.email || volunteer.phone}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover z-50">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              {volunteer.is_active ? (
                <><UserX className="w-4 h-4 mr-2" />Desativar</>
              ) : (
                <><UserCheck className="w-4 h-4 mr-2" />Ativar</>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

/* ─── Volunteers list (mobile cards / desktop table) ─── */
function VolunteersList({
  volunteers,
  getRoleLabel,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  volunteers: Volunteer[];
  getRoleLabel: (v: string) => string;
  onEdit: (v: Volunteer) => void;
  onToggleActive: (v: Volunteer) => void;
  onDelete: (v: Volunteer) => void;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-2">
        {volunteers.map((v) => (
          <MobileVolunteerCard
            key={v.id}
            volunteer={v}
            getRoleLabel={getRoleLabel}
            onEdit={() => onEdit(v)}
            onToggleActive={() => onToggleActive(v)}
            onDelete={() => onDelete(v)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="hidden md:table-cell">Ministério</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Calendário</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volunteers.map((volunteer) => (
            <TableRow key={volunteer.id}>
              <TableCell className="font-medium">{volunteer.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="text-sm">
                  {volunteer.email && <div className="text-muted-foreground">{volunteer.email}</div>}
                  {volunteer.phone && <div className="text-muted-foreground">{volunteer.phone}</div>}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{getRoleLabel(volunteer.role)}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{volunteer.ministry || "-"}</TableCell>
              <TableCell>
                <Badge variant={volunteer.is_active ? "default" : "outline"}>
                  {volunteer.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <VolunteerAvailabilityBadge volunteerId={volunteer.id} showTooltip={true} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover z-50">
                    <DropdownMenuItem onClick={() => onEdit(volunteer)}>
                      <Pencil className="w-4 h-4 mr-2" />Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleActive(volunteer)}>
                      {volunteer.is_active ? (
                        <><UserX className="w-4 h-4 mr-2" />Desativar</>
                      ) : (
                        <><UserCheck className="w-4 h-4 mr-2" />Ativar</>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(volunteer)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Volunteers() {
  const navigate = useNavigate();
  const { list, create, update, toggleActive, remove } = useVolunteers();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [deletingVolunteer, setDeletingVolunteer] = useState<Volunteer | null>(null);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const filteredVolunteers = list.data?.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(query) ||
      v.email?.toLowerCase().includes(query) ||
      v.phone?.includes(query) ||
      v.role.toLowerCase().includes(query)
    );
  }) || [];

  const getRoleLabel = (value: string) => {
    return VOLUNTEER_ROLES.find(r => r.value === value)?.label || value;
  };

  const handleCreate = async (data: VolunteerInsert) => {
    await create.mutateAsync(data);
  };

  const handleUpdate = async (data: VolunteerInsert) => {
    if (!editingVolunteer) return;
    await update.mutateAsync({ id: editingVolunteer.id, ...data });
    setEditingVolunteer(null);
  };

  const handleDelete = async () => {
    if (!deletingVolunteer) return;
    await remove.mutateAsync(deletingVolunteer.id);
    setDeletingVolunteer(null);
  };

  const handleToggleActive = async (volunteer: Volunteer) => {
    await toggleActive.mutateAsync({ id: volunteer.id, is_active: !volunteer.is_active });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Voluntários
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Gerencie sua equipe de voluntários
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/voluntarios/relatorios")} className="gap-2" size="sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/escalas")} className="gap-2" size="sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Escalas</span>
            </Button>
            <Button onClick={() => setShowFormModal(true)} className="gap-2" size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Voluntário</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-3 sm:pt-4 pb-3 sm:pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou função..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-prevent-zoom
              />
            </div>
          </CardContent>
        </Card>

        {/* Volunteers */}
        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Equipe</CardTitle>
            <CardDescription>
              {list.data?.length || 0} voluntário(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {list.isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">
                  {searchQuery ? "Nenhum voluntário encontrado" : "Nenhum voluntário cadastrado"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Tente buscar com outros termos"
                    : "Comece cadastrando os membros da sua equipe"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowFormModal(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Cadastrar Voluntário
                  </Button>
                )}
              </div>
            ) : (
              <VolunteersList
                volunteers={filteredVolunteers}
                getRoleLabel={getRoleLabel}
                onEdit={(v) => { setEditingVolunteer(v); setShowFormModal(true); }}
                onToggleActive={handleToggleActive}
                onDelete={(v) => setDeletingVolunteer(v)}
              />
            )}
          </CardContent>
        </Card>

        {/* Form Modal */}
        <VolunteerFormModal
          open={showFormModal}
          onOpenChange={(open) => {
            setShowFormModal(open);
            if (!open) setEditingVolunteer(null);
          }}
          volunteer={editingVolunteer}
          onSubmit={editingVolunteer ? handleUpdate : handleCreate}
          isLoading={create.isPending || update.isPending}
        />

        {/* Delete Confirmation */}
        <AlertDialog 
          open={!!deletingVolunteer} 
          onOpenChange={(open) => !open && setDeletingVolunteer(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir voluntário?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O voluntário "{deletingVolunteer?.name}" 
                será removido permanentemente, incluindo todas as suas escalas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
