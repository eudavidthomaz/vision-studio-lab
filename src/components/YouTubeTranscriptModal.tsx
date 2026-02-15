import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Youtube, Loader2 } from "lucide-react";

interface YouTubeTranscriptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (youtubeUrl: string, instructions?: string) => Promise<void>;
  isLoading: boolean;
}

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/)/;

export const YouTubeTranscriptModal = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: YouTubeTranscriptModalProps) => {
  const [url, setUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleSubmit = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Cole a URL do vídeo");
      return;
    }
    if (!YOUTUBE_REGEX.test(trimmed)) {
      setUrlError("URL inválida. Use um link do YouTube (youtube.com, youtu.be ou youtube.com/live)");
      return;
    }
    setUrlError("");
    await onSubmit(trimmed, instructions.trim() || undefined);
  };

  const handleClose = (open: boolean) => {
    if (!isLoading) {
      setUrl("");
      setInstructions("");
      setUrlError("");
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Extrair Conteúdo do YouTube
          </DialogTitle>
          <DialogDescription>
            Cole o link do vídeo e as legendas reais serão extraídas e salvas junto aos seus sermões.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="yt-url">URL do Vídeo *</Label>
            <Input
              id="yt-url"
              placeholder="youtube.com/watch?v=... | youtu.be/... | youtube.com/live/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              disabled={isLoading}
            />
            {urlError && <p className="text-sm text-destructive">{urlError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yt-instructions">Instruções adicionais (opcional)</Label>
            <Textarea
              id="yt-instructions"
              placeholder="Ex: Foque nos pontos sobre graça e redenção..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Extraindo conteúdo...
              </>
            ) : (
              "Extrair Conteúdo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
