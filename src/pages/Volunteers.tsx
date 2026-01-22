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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Voluntários
              </h1>
              <p className="text-muted-foreground text-sm">
                Gerencie sua equipe de voluntários
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/voluntarios/relatorios")}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/escalas")}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Escalas</span>
            </Button>
            <Button onClick={() => setShowFormModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Voluntário</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone ou função..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Volunteers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
            <CardDescription>
              {list.data?.length || 0} voluntário(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {list.isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredVolunteers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "Nenhum voluntário encontrado" : "Nenhum voluntário cadastrado"}
                </h3>
                <p className="text-muted-foreground mb-4">
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
                    {filteredVolunteers.map((volunteer) => (
                      <TableRow key={volunteer.id}>
                        <TableCell className="font-medium">
                          {volunteer.name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm">
                            {volunteer.email && (
                              <div className="text-muted-foreground">{volunteer.email}</div>
                            )}
                            {volunteer.phone && (
                              <div className="text-muted-foreground">{volunteer.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getRoleLabel(volunteer.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {volunteer.ministry || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={volunteer.is_active ? "default" : "outline"}>
                            {volunteer.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <VolunteerAvailabilityBadge 
                            volunteerId={volunteer.id}
                            showTooltip={true}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingVolunteer(volunteer);
                                  setShowFormModal(true);
                                }}
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(volunteer)}
                              >
                                {volunteer.is_active ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingVolunteer(volunteer)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
