import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Podcast, Square, Loader2, Upload, File as FileIcon, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureApi } from "@/hooks/useSecureApi";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AudioInputProps {
  onTranscriptionComplete: (transcript: string, sermonId?: string) => void;
}

const AudioInput = ({ onTranscriptionComplete }: AudioInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { invokeFunction } = useSecureApi();
  const navigate = useNavigate();

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
        title: "Sua voz está sendo registrada",
        description: "Compartilhe a mensagem que Deus colocou em seu coração. Pare quando terminar.",
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
        await transcribeAudio(audioBlob);
      } catch (error) {
        console.error('Error processing audio:', error);
        setIsProcessing(false);
        toast({
          title: "Erro",
          description: "Não foi possível processar o áudio. Tente novamente.",
          variant: "destructive",
        });
      }
    };

    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|webm)$/i)) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo de áudio válido (.mp3, .wav, .m4a, .webm).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 25MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      await transcribeAudio(selectedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erro",
        description: "Houve uma dificuldade ao processar o arquivo. Por favor, tente novamente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioData: Blob | File) => {
    try {
      setIsProcessing(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Prepare file name
      const isFile = audioData instanceof File;
      const fileName = isFile ? (audioData as File).name : 'recording.webm';
      const timestamp = Date.now();
      const storageFileName = `${user.id}/${timestamp}_${fileName}`;

      toast({
        title: "Preparando sua mensagem",
        description: "Cada palavra está sendo cuidadosamente registrada para alcançar mais vidas.",
      });

      // Upload audio to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sermons')
        .upload(storageFileName, audioData, {
          contentType: audioData.type,
          upsert: false,
        });

      if (uploadError || !uploadData) {
        throw new Error('Erro ao fazer upload do áudio');
      }

      // Call transcription function with storage URL
      const response = await invokeFunction('transcribe-sermon', {
        audio_url: uploadData.path,
        metadata: {
          fileName,
          contentType: audioData.type,
          fileSize: audioData.size,
        }
      }) as any;

      if (!response?.success) {
        throw new Error(response?.error || 'Erro na transcrição');
      }

      const result = response.data;

      // Handle async processing
      if (result.status === 'processing') {
        const audioSizeMB = audioData.size / (1024 * 1024);
        const estimatedMinutes = Math.ceil(audioSizeMB / 2);
        
        toast({
          title: "⏳ Processando áudio de longa duração",
          description: "Áudios maiores levam mais tempo. Fique tranquilo, você será notificado quando estiver pronto!",
          duration: 6000,
        });

        toast({
          title: "📊 Tempo estimado",
          description: `Aproximadamente ${estimatedMinutes} minuto${estimatedMinutes > 1 ? 's' : ''} para áudios deste tamanho.`,
          duration: 5000,
        });

        // Poll for completion
        const sermonId = result.sermon_id;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max (5s intervals)

        const pollInterval = setInterval(async () => {
          attempts++;
          
          // Mostrar progresso visual a cada 3 tentativas (15 segundos)
          if (attempts % 3 === 0) {
            toast({
              title: "🔄 Ainda processando...",
              description: `Verificando status da transcrição (tentativa ${attempts}/${maxAttempts})`,
              duration: 3000,
            });
          }
          
          if (attempts > maxAttempts) {
            clearInterval(pollInterval);
            setIsProcessing(false);
            toast({
              title: "⚠️ Tempo limite excedido",
              description: "A transcrição está demorando mais que o esperado. Verifique sua biblioteca mais tarde.",
              variant: "destructive",
            });
            return;
          }

          const { data: sermon } = await supabase
            .from('sermons')
            .select('status, transcript, error_message')
            .eq('id', sermonId)
            .single();

          if (sermon?.status === 'completed' && sermon.transcript) {
            clearInterval(pollInterval);
            setIsProcessing(false);
            
            toast({
              title: "✅ Transcrição concluída!",
              description: "Seu áudio foi transcrito com sucesso.",
            });

            onTranscriptionComplete(sermon.transcript, sermonId);
            setSelectedFile(null);
          } else if (sermon?.status === 'failed') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            
            toast({
              title: "❌ Erro na transcrição",
              description: sermon.error_message || "Não foi possível transcrever o áudio.",
              variant: "destructive",
            });
          }
        }, 5000); // Check every 5 seconds

        return;
      }

      // Immediate response (small files)
      if (result.transcript) {
        toast({
          title: "Mensagem capturada!",
          description: "Sua pregação está pronta para impactar vidas através de cada plataforma.",
        });

        onTranscriptionComplete(result.transcript, result.sermon_id);
        setSelectedFile(null);
      }

    } catch (error: any) {
      console.error('Transcription error:', error);
      toast({
        title: "Erro na transcrição",
        description: error.message || "Não foi possível transcrever o áudio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Tabs defaultValue="record" className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="record">Gravar Ao Vivo</TabsTrigger>
        <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
      </TabsList>

      <TabsContent value="record" className="flex flex-col items-center gap-6">
        {!isRecording && !isProcessing && (
          <Button
            onClick={startRecording}
            size="lg"
            variant="ghost"
            className="relative h-40 w-40 rounded-full bg-gradient-to-br from-white/5 to-primary/20 backdrop-blur-xl border-2 border-white/20 hover:border-white/30 shadow-[0_8px_32px_0_rgba(168,85,247,0.3)] hover:shadow-[0_8px_48px_0_rgba(168,85,247,0.5)] transition-all duration-500 hover:scale-105 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative z-10">
              <Podcast className="h-[152px] w-[152px] text-white opacity-90 drop-shadow-[0_0_25px_rgba(168,85,247,0.9)] group-hover:drop-shadow-[0_0_35px_rgba(168,85,247,1)] transition-all duration-500" strokeWidth={1} />
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
          {!isRecording && !isProcessing && "Comece a compartilhar a palavra"}
          {isRecording && "Registrando sua mensagem... Clique para finalizar"}
          {isProcessing && "Preservando cada palavra da sua pregação..."}
        </p>
      </TabsContent>

      <TabsContent value="upload" className="flex flex-col items-center gap-6">
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,.webm,audio/mpeg,audio/wav,audio/mp4,audio/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!selectedFile && !isProcessing && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg p-12 flex flex-col items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-16 w-16 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Clique para selecionar um arquivo</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP3, WAV, M4A ou WEBM (máx. 25MB)
                    </p>
                  </div>
                </div>
              )}

              {selectedFile && !isProcessing && (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleFileUpload}
                      className="flex-1"
                    >
                      Transformar em Conteúdo
                    </Button>
                    <Button
                      onClick={() => setSelectedFile(null)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="w-full flex flex-col items-center gap-6 p-8">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-base font-semibold text-foreground">
                      Transformando áudio em texto sagrado...
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Cada palavra está sendo preservada com cuidado. 
                      Áudios maiores podem levar alguns minutos.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:100ms]" />
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:200ms]" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/meus-conteudos')}
                    className="mt-4"
                  >
                    <Library className="w-4 h-4 mr-2" />
                    Ver Minhas Pregações
                  </Button>
                  <p className="text-xs text-muted-foreground text-center max-w-sm">
                    Você pode sair desta tela. A transcrição continuará em segundo plano.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AudioInput;
