import { useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  positionClasses, 
  fontSizeClasses, 
  fontWeightClasses, 
  fontFamilyClasses,
  availableIcons,
  positionOptions,
  fontSizeOptions,
  fontFamilyOptions,
  iconOptions,
  type Overlay,
  type TextOverlay,
  type IconOverlay
} from "@/lib/overlayPositions";

interface EditableOverlayProps {
  overlay: Overlay;
  index: number;
  onUpdate: (updated: Overlay) => void;
  onRemove: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  scale?: number;
}

/** Edit panel rendered via portal — completely outside the scaled canvas */
const EditPanel = ({ 
  children, 
  isMobile, 
  onStop 
}: { 
  children: React.ReactNode; 
  isMobile: boolean; 
  onStop: (e: React.MouseEvent) => void;
}) => {
  const panel = (
    <div
      className={
        isMobile
          ? "fixed bottom-0 inset-x-0 z-[100] bg-popover border-t border-border rounded-t-xl p-3 shadow-2xl max-h-[50vh] overflow-y-auto safe-area-bottom"
          : "fixed z-[100] bg-popover border border-border rounded-lg p-3 shadow-xl max-w-[320px] w-[320px] max-h-[50vh] overflow-y-auto"
      }
      style={!isMobile ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } : undefined}
      onClick={onStop}
    >
      {children}
    </div>
  );

  // Backdrop to catch clicks outside
  const backdrop = (
    <div className="fixed inset-0 z-[99]" />
  );

  return createPortal(
    <>
      {backdrop}
      {panel}
    </>,
    document.body
  );
};

const TextEditFields = ({ 
  overlay, 
  onUpdate, 
  onRemove 
}: { 
  overlay: TextOverlay; 
  onUpdate: (updated: Overlay) => void; 
  onRemove: () => void;
}) => (
  <div className="space-y-3">
    <div>
      <Label className="text-xs">Texto</Label>
      <Input
        value={overlay.content}
        onChange={(e) => onUpdate({ ...overlay, content: e.target.value })}
        className="h-8 text-sm"
      />
    </div>
    
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs">Posição</Label>
        <Select value={overlay.position} onValueChange={(v) => onUpdate({ ...overlay, position: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {positionOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Tamanho</Label>
        <Select value={overlay.font_size} onValueChange={(v) => onUpdate({ ...overlay, font_size: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <Label className="text-xs">Fonte</Label>
      <Select value={overlay.font_family || 'montserrat'} onValueChange={(v) => onUpdate({ ...overlay, font_family: v })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {fontFamilyOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="flex items-center gap-3 flex-wrap">
      <div>
        <Label className="text-xs">Cor</Label>
        <Input
          type="color"
          value={overlay.color_hex}
          onChange={(e) => onUpdate({ ...overlay, color_hex: e.target.value })}
          className="h-8 w-12 p-1 cursor-pointer"
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={overlay.background_highlight}
          onCheckedChange={(v) => onUpdate({ ...overlay, background_highlight: v })}
        />
        <Label className="text-xs">Fundo</Label>
      </div>
      <Button variant="destructive" size="sm" onClick={onRemove} className="ml-auto h-7">
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  </div>
);

const IconEditFields = ({ 
  overlay, 
  onUpdate, 
  onRemove 
}: { 
  overlay: IconOverlay; 
  onUpdate: (updated: Overlay) => void; 
  onRemove: () => void;
}) => (
  <div className="space-y-3">
    <div>
      <Label className="text-xs">Ícone</Label>
      <Select value={overlay.icon_name} onValueChange={(v) => onUpdate({ ...overlay, icon_name: v })}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {iconOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs">Posição</Label>
        <Select value={overlay.position} onValueChange={(v) => onUpdate({ ...overlay, position: v })}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {positionOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Cor</Label>
        <Input
          type="color"
          value={overlay.color_hex}
          onChange={(e) => onUpdate({ ...overlay, color_hex: e.target.value })}
          className="h-8 w-full p-1 cursor-pointer"
        />
      </div>
    </div>
    <Button variant="destructive" size="sm" onClick={onRemove} className="w-full h-7">
      <Trash2 className="h-3 w-3 mr-1" />
      Remover
    </Button>
  </div>
);

const EditableOverlay = ({ 
  overlay, 
  index,
  onUpdate, 
  onRemove,
  isEditing,
  onStartEdit,
  scale = 1
}: EditableOverlayProps) => {
  const isMobile = useIsMobile();
  const positionClass = positionClasses[overlay.position] || positionClasses['center'];
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  if (overlay.type === 'text') {
    const textOverlay = overlay as TextOverlay;
    const fontSizeClass = fontSizeClasses[textOverlay.font_size] || 'text-xl';
    const fontWeightClass = fontWeightClasses[textOverlay.font_weight] || 'font-bold';
    const fontFamilyClass = fontFamilyClasses[textOverlay.font_family || 'montserrat'] || 'font-overlay-modern';

    return (
      <div 
        className={`absolute ${positionClass} z-10 cursor-pointer group max-w-[80%]`}
        onClick={onStartEdit}
      >
        {textOverlay.background_highlight && (
          <div className="absolute inset-0 bg-black/50 -m-2 rounded-lg blur-sm -z-10" />
        )}
        
        <div
          className={`${fontSizeClass} ${fontWeightClass} ${fontFamilyClass} drop-shadow-lg text-center leading-tight`}
          style={{ color: textOverlay.color_hex, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
        >
          {textOverlay.content}
        </div>

        {!isEditing && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary text-primary-foreground rounded-full p-1">
              <GripVertical className="h-3 w-3" />
            </div>
          </div>
        )}

        {isEditing && (
          <EditPanel isMobile={isMobile} onStop={stopPropagation}>
            <TextEditFields overlay={textOverlay} onUpdate={onUpdate} onRemove={onRemove} />
          </EditPanel>
        )}
      </div>
    );
  }

  // Icon overlay
  const iconOverlay = overlay as IconOverlay;
  const IconComponent = availableIcons[iconOverlay.icon_name];
  if (!IconComponent) return null;

  return (
    <div 
      className={`absolute ${positionClass} z-10 cursor-pointer group`}
      onClick={onStartEdit}
    >
      <IconComponent 
        className="h-8 w-8 drop-shadow-lg" 
        style={{ color: iconOverlay.color_hex }}
      />

      {!isEditing && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-primary-foreground rounded-full p-1">
            <GripVertical className="h-3 w-3" />
          </div>
        </div>
      )}

      {isEditing && (
        <EditPanel isMobile={isMobile} onStop={stopPropagation}>
          <IconEditFields overlay={iconOverlay} onUpdate={onUpdate} onRemove={onRemove} />
        </EditPanel>
      )}
    </div>
  );
};

export default EditableOverlay;
