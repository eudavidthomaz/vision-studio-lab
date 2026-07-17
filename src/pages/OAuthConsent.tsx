import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, User } from "lucide-react";
import { Helmet } from "react-helmet-async";

// Local typed wrapper for the Supabase OAuth Server namespace.
type OAuthClient = {
  name?: string;
  client_name?: string;
  client_uri?: string;
  redirect_uris?: string[];
};

type AuthzDetails = {
  authorization_id?: string;
  client?: OAuthClient;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthDecision = {
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthzDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthDecision | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthDecision | null; error: { message: string } | null }>;
};

function getOAuthAPI(): OAuthAPI | null {
  const oauth = (supabase.auth as unknown as { oauth?: OAuthAPI }).oauth;
  if (
    oauth &&
    typeof oauth.getAuthorizationDetails === "function" &&
    typeof oauth.approveAuthorization === "function" &&
    typeof oauth.denyAuthorization === "function"
  ) {
    return oauth;
  }
  return null;
}

function authorizationIdFrom(params: URLSearchParams) {
  return params.get("authorization_id") ?? params.get("authorizationId") ?? "";
}

function currentPathWithQuery() {
  return `${window.location.pathname}${window.location.search}`;
}

function redirectToLogin() {
  const next = currentPathWithQuery();
  window.location.href = `/auth?next=${encodeURIComponent(next)}`;
}

function redirectFrom(data?: OAuthDecision | AuthzDetails | null) {
  return data?.redirect_url ?? data?.redirect_to;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = useMemo(() => authorizationIdFrom(params), [params]);
  const [details, setDetails] = useState<AuthzDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAuthorization() {
      if (!authorizationId) {
        setError("Parâmetro authorization_id ausente.");
        setLoading(false);
        return;
      }

      const { data: claimsData } = await supabase.auth.getClaims();
      if (!claimsData?.claims) {
        redirectToLogin();
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;
      setUserEmail(userData.user?.email ?? null);

      const oauth = getOAuthAPI();
      if (!oauth) {
        setError(
          "O servidor OAuth 2.1 do Supabase não está habilitado ou o SDK publicado não inclui as APIs supabase.auth.oauth. Habilite Authentication > OAuth Server no Supabase, configure Authorization Path como /oauth/consent e publique com @supabase/supabase-js atualizado."
        );
        setLoading(false);
        return;
      }

      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const immediate = redirectFrom(data);
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }

      setDetails(data);
      setLoading(false);
    }

    loadAuthorization();

    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    const oauth = getOAuthAPI();
    if (!oauth) {
      setError(
        "O servidor OAuth 2.1 do Supabase não está habilitado ou o SDK publicado não inclui as APIs supabase.auth.oauth."
      );
      return;
    }

    setBusy(true);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    const target = redirectFrom(data);
    if (!target) {
      setError("O servidor de autorização não retornou uma URL de redirecionamento.");
      setBusy(false);
      return;
    }

    window.location.href = target;
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "um aplicativo externo";
  const redirectUri = details?.client?.redirect_uris?.[0];
  const scopes = details?.scopes ?? (details?.scope ? details.scope.split(/\s+/).filter(Boolean) : []);

  return (
    <>
      <Helmet>
        <title>Conectar {clientName} ao Ide.On</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="min-h-dvh flex items-center justify-center px-4 py-10 bg-background">
        <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Autorizar conexão</h1>
              <p className="text-xs text-muted-foreground">Ide.On • OAuth 2.1</p>
            </div>
          </div>

          {loading ? (
            <div className="py-10 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : error ? (
            <div className="space-y-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm">
                  <span className="font-semibold">{clientName}</span> está solicitando permissão para usar o Ide.On
                  como você.
                </p>

                {userEmail && (
                  <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{userEmail}</span>
                  </div>
                )}

                <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground space-y-2">
                  <p>Ao aprovar, este aplicativo poderá chamar as ferramentas MCP do Ide.On em seu nome — leitura de sermões, biblioteca de conteúdos, voluntários, escalas e sites.</p>
                  <p>Todo o acesso respeita as políticas de segurança da sua conta (RLS). Você pode revogar a qualquer momento nas configurações de segurança.</p>
                  {scopes.length > 0 && (
                    <p><span className="font-medium text-foreground">Escopos:</span> {scopes.join(", ")}</p>
                  )}
                  {redirectUri && (
                    <p className="break-all"><span className="font-medium text-foreground">Redirect:</span> {redirectUri}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="outline" disabled={busy} onClick={() => decide(false)}>
                  Cancelar
                </Button>
                <Button disabled={busy} onClick={() => decide(true)}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aprovar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
