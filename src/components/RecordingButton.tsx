import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Podcast, Square, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecordingButtonProps {
  onTranscriptionComplete: (transcript: string) => void;
}

const RecordingButton = ({ onTranscriptionComplete }: RecordingButtonProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Gravação iniciada",
        description: "Fale sua pregação. Clique em parar quando terminar.",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    setIsRecording(false);
    setIsProcessing(true);

    recorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          toast({
            title: "Processando...",
            description: "Transcrevendo sua pregação. Isso pode levar alguns minutos.",
          });

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-sermon`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ audio_base64: base64Audio }),
              }
            );

            if (!response.ok) {
              throw new Error('Erro na transcrição');
            }

            const { transcript } = await response.json();
            
            toast({
              title: "Sucesso!",
              description: "Pregação transcrita com sucesso.",
            });

            onTranscriptionComplete(transcript);
          } catch (error) {
            console.error('Error transcribing:', error);
            toast({
              title: "Erro",
              description: "Não foi possível transcrever o áudio. Tente novamente.",
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      } catch (error) {
        console.error('Error processing audio:', error);
        setIsProcessing(false);
        toast({
          title: "Erro",
          description: "Erro ao processar o áudio.",
          variant: "destructive",
        });
      }
    };

    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {!isRecording && !isProcessing && (
        <Button
          onClick={startRecording}
          size="lg"
          variant="ghost"
          className="relative h-40 w-40 rounded-full bg-gradient-to-br from-white/5 to-primary/20 backdrop-blur-xl border-2 border-white/20 hover:border-white/30 shadow-[0_8px_32px_0_rgba(168,85,247,0.3)] hover:shadow-[0_8px_48px_0_rgba(168,85,247,0.5)] transition-all duration-500 hover:scale-105 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="relative z-10">
            <Podcast className="h-38 w-38 text-white opacity-90 drop-shadow-[0_0_25px_rgba(168,85,247,0.9)] group-hover:drop-shadow-[0_0_35px_rgba(168,85,247,1)] transition-all duration-500" strokeWidth={1} />
          </div>
        </Button>
      )}

      {isRecording && (
        <Button
          onClick={stopRecording}
          size="lg"
          className="relative h-40 w-40 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10 backdrop-blur-xl border-2 border-destructive/30 hover:border-destructive/50 shadow-2xl hover:shadow-destructive/30 transition-all duration-500 hover:scale-105 overflow-hidden group animate-pulse"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
          <div className="relative flex flex-col items-center gap-2 z-10">
            <Square className="h-16 w-16 text-destructive group-hover:text-destructive/90 transition-colors" />
            <span className="text-sm font-semibold text-foreground">Parar</span>
          </div>
        </Button>
      )}

      {isProcessing && (
        <div className="relative h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-xl border-2 border-primary/30 shadow-2xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent animate-pulse" />
          <Loader2 className="relative h-16 w-16 text-primary animate-spin z-10" />
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {!isRecording && !isProcessing && "Clique para iniciar a gravação da pregação"}
        {isRecording && "Gravando... Clique para parar"}
        {isProcessing && "Transcrevendo sua pregação..."}
      </p>
    </div>
  );
};

export default RecordingButton;
