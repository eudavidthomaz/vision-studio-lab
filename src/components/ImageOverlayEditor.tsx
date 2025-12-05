import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Plus, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EditableOverlay from "./EditableOverlay";
import { type OverlayData, type Overlay, type TextOverlay } from "@/lib/overlayPositions";

interface ImageOverlayEditorProps {
  userImage: string;
  overlayData: OverlayData;
  onOverlayUpdate: (data: OverlayData) => void;
  onExport: (imageUrl: string) => void;
  formato: string;
}

const formatDimensions: Record<string, { width: number; height: number }> = {
  'feed_square': { width: 1080, height: 1080 },
  'feed_portrait': { width: 1080, height: 1350 },
  'story': { width: 1080, height: 1920 },
  'reel_cover': { width: 1080, height: 1920 },
};

const ImageOverlayEditor = ({ 
  userImage, 
  overlayData, 
  onOverlayUpdate,
  onExport,
  formato 
}: ImageOverlayEditorProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(75);
  const { toast } = useToast();

  const dimensions = formatDimensions[formato] || formatDimensions['feed_square'];
  const scale = Math.min(400 / dimensions.width, 600 / dimensions.height);

  const updateOverlay = (index: number, updated: Overlay) => {
    const newOverlays = [...overlayData.overlays];
    newOverlays[index] = updated;
    onOverlayUpdate({ ...overlayData, overlays: newOverlays });
  };

  const removeOverlay = (index: number) => {
    const newOverlays = overlayData.overlays.filter((_, i) => i !== index);
    onOverlayUpdate({ ...overlayData, overlays: newOverlays });
    setEditingIndex(null);
  };

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      type: 'text',
      content: 'Novo Texto',
      position: 'center',
      color_hex: '#FFFFFF',
      font_weight: 'bold',
      font_size: 'xl',
      background_highlight: true,
    };
    onOverlayUpdate({ 
      ...overlayData, 
      overlays: [...overlayData.overlays, newOverlay] 
    });
    setEditingIndex(overlayData.overlays.length);
  };

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
    const filterValue = `brightness-${value[0]}`;
    onOverlayUpdate({ ...overlayData, image_filter: filterValue });
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    setEditingIndex(null);

    try {
      // Wait for any UI updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create high-res canvas
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: dimensions.width,
        height: dimensions.height,
      });

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
          'image/png',
          1.0
        );
      });

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_overlay.png`;
      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);

      onExport(publicUrl);

      toast({
        title: "Imagem exportada!",
        description: "Sua imagem foi salva com sucesso.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    setEditingIndex(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: dimensions.width,
        height: dimensions.height,
      });

      const link = document.createElement('a');
      link.download = `ide-on-overlay-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      toast({
        title: "Download iniciado",
        description: "Sua imagem está sendo baixada.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const brightnessFilter = `brightness(${brightness / 100})`;

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div 
        className="relative mx-auto overflow-hidden rounded-lg shadow-xl bg-muted"
        style={{ 
          width: dimensions.width * scale, 
          height: dimensions.height * scale 
        }}
        onClick={() => setEditingIndex(null)}
      >
        {/* Canvas for export */}
        <div
          ref={canvasRef}
          className="absolute top-0 left-0 origin-top-left"
          style={{ 
            width: dimensions.width, 
            height: dimensions.height,
            transform: `scale(${scale})`
          }}
        >
          {/* Layer 1: User Image with Filter */}
          <img
            src={userImage}
            alt="Imagem base"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: brightnessFilter }}
            crossOrigin="anonymous"
          />

          {/* Layer 2: Overlays */}
          {overlayData.overlays.map((overlay, index) => (
            <EditableOverlay
              key={index}
              overlay={overlay}
              index={index}
              onUpdate={(updated) => updateOverlay(index, updated)}
              onRemove={() => removeOverlay(index)}
              isEditing={editingIndex === index}
              onStartEdit={() => setEditingIndex(index)}
              scale={scale}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 bg-muted/50 rounded-lg p-4">
        {/* Brightness Slider */}
        <div className="space-y-2">
          <Label className="text-sm">Brilho da Imagem: {brightness}%</Label>
          <Slider
            value={[brightness]}
            onValueChange={handleBrightnessChange}
            min={30}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Add Text Button */}
        <Button
          variant="outline"
          onClick={addTextOverlay}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Texto
        </Button>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Salvar na Biblioteca
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tips */}
      <p className="text-xs text-muted-foreground text-center">
        💡 Clique nos textos para editar • Arraste para reposicionar
      </p>
    </div>
  );
};

export default ImageOverlayEditor;
