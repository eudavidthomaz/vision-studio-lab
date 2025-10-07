import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FeedbackButton = () => {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<string>("feature");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Por favor, escreva sua mensagem");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const { error } = await supabase.from('user_feedback').insert({
        user_id: user.id,
        feedback_type: feedbackType,
        message: message.trim(),
        page_url: window.location.pathname,
        sentiment: feedbackType === 'praise' ? 'positive' : 
                   feedbackType === 'complaint' ? 'negative' : 'neutral'
      });

      if (error) throw error;

      toast.success("Feedback enviado! Obrigado pela contribuição 🙏");
      setMessage("");
      setOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error("Erro ao enviar feedback. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Enviar Feedback</DrawerTitle>
          <DrawerDescription>
            Sua opinião nos ajuda a melhorar o Ide.On
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-4">
          <div className="space-y-3">
            <Label>Tipo de feedback</Label>
            <RadioGroup value={feedbackType} onValueChange={setFeedbackType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug" className="font-normal cursor-pointer">
                  🐛 Bug / Erro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feature" id="feature" />
                <Label htmlFor="feature" className="font-normal cursor-pointer">
                  ✨ Sugestão de melhoria
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="praise" id="praise" />
                <Label htmlFor="praise" className="font-normal cursor-pointer">
                  👏 Elogio
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="complaint" id="complaint" />
                <Label htmlFor="complaint" className="font-normal cursor-pointer">
                  😕 Reclamação
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Descreva seu feedback em detalhes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FeedbackButton;
