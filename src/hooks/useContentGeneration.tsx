import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContentFormat } from "./useContentTemplates";

export type StructuredModalidades = {
  blog?: {
    estrategia: string;
    titulo: string;
    resumo: string;
    corpo: string;
    ctas: string[];
    metadados: string[];
    suposicoes: string;
  };
  carrossel?: {
    estrategia: string;
    slides: string[];
    ctas: string[];
    metadados: string[];
    suposicoes: string;
  };
  email?: {
    assunto: string;
    preheader: string;
    corpo: string;
    cta: string;
    metadados: string[];
    suposicoes: string;
  };
  roteiro_video?: {
    gancho: string;
    apresentacao: string;
    pontos_chave: string[];
    fechamento: string;
    cta: string;
    sugestoes_cena: string | string[];
    metadados: string[];
    suposicoes: string;
  };
  post_curto?: {
    headline: string;
    corpo: string;
    cta: string;
    metadados: string[];
    suposicoes: string;
  };
  [key: string]: any;
};

export interface StructuredContentPayload {
  modalidades: StructuredModalidades;
  checklist?: Record<string, any>;
  formats?: ContentFormat[];
}

export function useContentGeneration() {
  const [lastPayload, setLastPayload] = useState<StructuredContentPayload | null>(null);
  const [promptUsed, setPromptUsed] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async (params: { prompt: string; formats: ContentFormat[]; options?: Record<string, any> }) => {
      const { data, error } = await supabase.functions.invoke("content-engine", {
        body: {
          prompt: params.prompt,
          formats: params.formats,
          options: params.options ?? {},
        },
      });

      if (error) {
        throw error;
      }

      return data as StructuredContentPayload;
    },
    onSuccess: (data, variables) => {
      setLastPayload(data);
      setPromptUsed(variables.prompt);
      toast.success("Conteúdo estruturado gerado!");
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err?.message || "Erro ao gerar conteúdo estruturado");
    },
  });

  const reset = () => {
    setLastPayload(null);
    setPromptUsed("");
    mutation.reset();
  };

  const isLoading = useMemo(() => mutation.isPending, [mutation.isPending]);

  return {
    generate: mutation.mutateAsync,
    isLoading,
    lastPayload,
    promptUsed,
    reset,
  };
}
