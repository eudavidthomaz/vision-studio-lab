import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical, Heart, BookOpen, Calendar, Clock, MapPin, Play, Music, Users, Church, Sparkles, Star, Sun, Moon } from "lucide-react";
import { 
  positionClasses, 
  fontSizeClasses, 
  fontWeightClasses, 
  positionOptions,
  fontSizeOptions,
  iconOptions,
  type Overlay,
  type TextOverlay,
  type IconOverlay
} from "@/lib/overlayPositions";

// Icon mapping
const iconComponents: Record<string, React.ElementType> = {
  'heart': Heart,
  'bible': BookOpen,
  'calendar': Calendar,
  'clock': Clock,
  'location': MapPin,
  'play': Play,
  'music': Music,
  'users': Users,
  'church': Church,
  'worship_hands': Heart, // Using Heart as fallback
  'sparkles': Sparkles,
  'star': Star,
  'sun': Sun,
  'moon': Moon,
};

interface EditableOverlayProps {
  overlay: Overlay;
  index: number;
  onUpdate: (updated: Overlay) => void;
  onRemove: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  scale?: number;
}

const EditableOverlay = ({ 
  overlay, 
  index,
  onUpdate, 
  onRemove,
  isEditing,
  onStartEdit,
  scale = 1
}: EditableOverlayProps) => {
  const positionClass = positionClasses[overlay.position] || positionClasses['center'];

  if (overlay.type === 'text') {
    const textOverlay = overlay as TextOverlay;
    const fontSizeClass = fontSizeClasses[textOverlay.font_size] || 'text-xl';
    const fontWeightClass = fontWeightClasses[textOverlay.font_weight] || 'font-bold';

    return (
      <div 
        className={`absolute ${positionClass} z-10 cursor-pointer group max-w-[80%]`}
        onClick={onStartEdit}
      >
        {textOverlay.background_highlight && (
          <div className="absolute inset-0 bg-black/50 -m-2 rounded-lg blur-sm -z-10" />
        )}
        
        <div
          className={`${fontSizeClass} ${fontWeightClass} drop-shadow-lg text-center leading-tight`}
          style={{ 
            color: textOverlay.color_hex,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
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
          <div 
            className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-lg p-3 shadow-xl z-50 min-w-[280px]"
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `scale(${1/scale})`, transformOrigin: 'top left' }}
          >
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Texto</Label>
                <Input
                  value={textOverlay.content}
                  onChange={(e) => onUpdate({ ...textOverlay, content: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Posição</Label>
                  <Select 
                    value={textOverlay.position} 
                    onValueChange={(v) => onUpdate({ ...textOverlay, position: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs">Tamanho</Label>
                  <Select 
                    value={textOverlay.font_size} 
                    onValueChange={(v) => onUpdate({ ...textOverlay, font_size: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontSizeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <Label className="text-xs">Cor</Label>
                  <Input
                    type="color"
                    value={textOverlay.color_hex}
                    onChange={(e) => onUpdate({ ...textOverlay, color_hex: e.target.value })}
                    className="h-8 w-12 p-1 cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={textOverlay.background_highlight}
                    onCheckedChange={(v) => onUpdate({ ...textOverlay, background_highlight: v })}
                  />
                  <Label className="text-xs">Fundo</Label>
                </div>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onRemove}
                  className="ml-auto h-7"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Icon overlay
  const iconOverlay = overlay as IconOverlay;
  const IconComponent = iconComponents[iconOverlay.icon_name] || Sparkles;

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
        <div 
          className="absolute top-full left-0 mt-2 bg-popover border border-border rounded-lg p-3 shadow-xl z-50 min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
          style={{ transform: `scale(${1/scale})`, transformOrigin: 'top left' }}
        >
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Ícone</Label>
              <Select 
                value={iconOverlay.icon_name} 
                onValueChange={(v) => onUpdate({ ...iconOverlay, icon_name: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Posição</Label>
                <Select 
                  value={iconOverlay.position} 
                  onValueChange={(v) => onUpdate({ ...iconOverlay, position: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-xs">Cor</Label>
                <Input
                  type="color"
                  value={iconOverlay.color_hex}
                  onChange={(e) => onUpdate({ ...iconOverlay, color_hex: e.target.value })}
                  className="h-8 w-full p-1 cursor-pointer"
                />
              </div>
            </div>

            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onRemove}
              className="w-full h-7"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remover
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableOverlay;
