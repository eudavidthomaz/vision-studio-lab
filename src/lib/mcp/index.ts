import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoami from "./tools/whoami";
import listSermons from "./tools/list-sermons";
import getSermon from "./tools/get-sermon";
import listContent from "./tools/list-content";
import getContent from "./tools/get-content";
import listVolunteers from "./tools/list-volunteers";
import listSchedules from "./tools/list-schedules";
import listChurchSites from "./tools/list-church-sites";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ideon-mcp",
  title: "Ide.On",
  version: "0.1.0",
  instructions:
    "Ide.On é uma plataforma de conteúdo digital para igrejas. Use estas ferramentas para consultar, em nome do usuário autenticado, seus sermões, biblioteca de conteúdos, voluntários, escalas e sites de igreja. Todas as leituras respeitam RLS: o usuário só vê os próprios dados.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoami, listSermons, getSermon, listContent, getContent, listVolunteers, listSchedules, listChurchSites],
});
