import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
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
    <div className="flex flex-col items-center gap-4">
      {!isRecording && !isProcessing && (
        <Button
          onClick={startRecording}
          size="lg"
          className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center gap-2">
            <Mic className="h-12 w-12" />
            <span className="text-sm font-medium">Iniciar</span>
          </div>
        </Button>
      )}

      {isRecording && (
        <Button
          onClick={stopRecording}
          size="lg"
          className="h-32 w-32 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 animate-pulse"
        >
          <div className="flex flex-col items-center gap-2">
            <Square className="h-12 w-12" />
            <span className="text-sm font-medium">Parar</span>
          </div>
        </Button>
      )}

      {isProcessing && (
        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-2xl flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      )}

      <p className="text-sm text-gray-400 text-center max-w-xs">
        {!isRecording && !isProcessing && "Clique para iniciar a gravação da pregação"}
        {isRecording && "Gravando... Clique para parar"}
        {isProcessing && "Transcrevendo sua pregação..."}
      </p>
    </div>
  );
};

export default RecordingButton;
