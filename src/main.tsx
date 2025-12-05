import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element '#root' not found in document.");
}

const missingEnvVars = [
  ["VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY],
].filter(([, value]) => !value) as Array<[string, string | undefined]>;

if (missingEnvVars.length > 0) {
  rootElement.innerHTML = `
    <section style="font-family: system-ui, -apple-system, sans-serif; padding: 48px; max-width: 960px; margin: 0 auto; color: #e5e7eb; background: linear-gradient(135deg, #0f172a, #111827); border-radius: 16px; border: 1px solid #1f2937;">
      <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 12px;">Configuração do Supabase ausente</h1>
      <p style="margin: 0 0 16px 0; line-height: 1.6;">A aplicação não pode iniciar porque as variáveis de ambiente obrigatórias do Supabase não foram definidas.</p>
      <ul style="margin: 0 0 16px 20px; line-height: 1.6;">
        ${missingEnvVars.map(([key]) => `<li><code>${key}</code></li>`).join("")}
      </ul>
      <p style="margin: 0 0 12px 0; line-height: 1.6;">Crie um arquivo <code>.env</code> na raiz com os valores da sua instância Supabase, por exemplo:</p>
      <pre style="background: #0b1221; padding: 16px; border-radius: 12px; border: 1px solid #1f2937; overflow: auto;">VITE_SUPABASE_URL=https://<span style="color:#67e8f9">SUA-URL</span>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<span style="color:#67e8f9">SEU_PUBLIC_ANON_KEY</span></pre>
      <p style="margin: 12px 0 0 0; line-height: 1.6;">Depois de salvar, reinicie o servidor de desenvolvimento ou refaça o build.</p>
    </section>
  `;
} else {
  import("./App.tsx").then(({ default: App }) => {
    createRoot(rootElement).render(<App />);
  }).catch((error) => {
    console.error("Erro ao carregar a aplicação:", error);
  });
}
