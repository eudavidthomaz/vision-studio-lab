import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChurchSite } from "@/hooks/useChurchSite";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Globe,
  Edit,
  ExternalLink,
  Plus,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  Church,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function Sites() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [churchName, setChurchName] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    site,
    isLoading,
    createSite,
    togglePublish,
    deleteSite,
  } = useChurchSite();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate("/auth");
      } else {
        setUser({ id: data.user.id });
      }
    });
  }, [navigate]);

  const handleCreateSite = async () => {
    if (!churchName.trim()) {
      toast.error("Digite o nome da igreja");
      return;
    }
    await createSite.mutateAsync(churchName.trim());
    setChurchName("");
    setIsCreateOpen(false);
  };

  const handleTogglePublish = async () => {
    if (!site) return;
    await togglePublish.mutateAsync({ id: site.id, publish: !site.isPublished });
  };

  const handleDeleteSite = async () => {
    if (!site) return;
    await deleteSite.mutateAsync(site.id);
    setIsDeleteOpen(false);
  };

  const handleCopyLink = async () => {
    if (!site) return;
    const url = `${window.location.origin}/igreja/${site.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Site da Igreja</h1>
              <p className="text-sm text-muted-foreground">Crie e gerencie o site público da sua igreja</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            <Skeleton className="h-48 w-full" />
          </div>
        ) : site ? (
          // Site exists - show management card
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Church className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {site.branding.name || "Meu Site"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      /igreja/{site.slug}
                    </p>
                  </div>
                </div>
                <Badge variant={site.isPublished ? "default" : "secondary"}>
                  {site.isPublished ? "Publicado" : "Rascunho"}
                </Badge>
              </div>

              {/* Preview Link */}
              {site.isPublished && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Link público:</span>
                      <a
                        href={`/igreja/${site.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {window.location.origin}/igreja/{site.slug}
                      </a>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/sites/editor")}>
                  <Edit className="w-4 h-4" /> Editar Site
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTogglePublish}
                  disabled={togglePublish.isPending}
                >
                  {site.isPublished ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Despublicar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Publicar
                    </>
                  )}
                </Button>
                {site.isPublished && (
                  <Button variant="outline" asChild>
                    <a href={`/igreja/${site.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" /> Ver Site
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{site.ministries.length}</p>
                <p className="text-xs text-muted-foreground">Ministérios</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{site.events.length}</p>
                <p className="text-xs text-muted-foreground">Eventos</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{site.faq.length}</p>
                <p className="text-xs text-muted-foreground">FAQs</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{site.schedule.length}</p>
                <p className="text-xs text-muted-foreground">Horários</p>
              </Card>
            </div>
          </div>
        ) : (
          // No site - show create CTA
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Crie o site da sua igreja
            </h2>
            <p className="text-muted-foreground mb-8">
              Em poucos minutos, tenha um site profissional e moderno para sua comunidade.
            </p>
            <Button size="lg" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-5 h-5" /> Criar Site
            </Button>
          </div>
        )}
      </main>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar site da igreja</DialogTitle>
            <DialogDescription>
              Digite o nome da sua igreja para começar. Você poderá personalizar tudo depois.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Ex: Igreja Presbiteriana Central"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateSite()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSite} disabled={createSite.isPending}>
              {createSite.isPending ? "Criando..." : "Criar Site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir site?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O site e todos os dados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
