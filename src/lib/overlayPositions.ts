import { 
  Heart, 
  BookOpen, 
  Calendar, 
  Clock, 
  MapPin, 
  Play, 
  Music, 
  Users,
  Church,
  HandHeart,
  Sparkles,
  Star,
  Sun,
  Moon
} from "lucide-react";

export const positionClasses: Record<string, string> = {
  'top_left': 'top-6 left-6',
  'top_center': 'top-6 left-1/2 -translate-x-1/2',
  'top_right': 'top-6 right-6',
  'center_left': 'top-1/2 left-6 -translate-y-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'center_right': 'top-1/2 right-6 -translate-y-1/2',
  'bottom_left': 'bottom-6 left-6',
  'bottom_center': 'bottom-6 left-1/2 -translate-x-1/2',
  'bottom_right': 'bottom-6 right-6',
};

export const fontSizeClasses: Record<string, string> = {
  'xs': 'text-xs',
  'sm': 'text-sm',
  'base': 'text-base',
  'lg': 'text-lg',
  'xl': 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
};

export const fontWeightClasses: Record<string, string> = {
  'normal': 'font-normal',
  'medium': 'font-medium',
  'semibold': 'font-semibold',
  'bold': 'font-bold',
  'extrabold': 'font-extrabold',
};

export const fontFamilyClasses: Record<string, string> = {
  'bebas_neue': 'font-overlay-impact',
  'playfair': 'font-overlay-elegant',
  'montserrat': 'font-overlay-modern',
  'dancing_script': 'font-overlay-handwritten',
  'inter': 'font-overlay-clean',
};

export const filterClasses: Record<string, string> = {
  'none': '',
  'brightness-50': 'brightness-50',
  'brightness-75': 'brightness-75',
  'brightness-90': 'brightness-90',
  'brightness-110': 'brightness-110',
  'contrast-75': 'contrast-75',
  'contrast-125': 'contrast-125',
  'grayscale': 'grayscale',
  'sepia': 'sepia',
};

export const gradientStyles: Record<string, string> = {
  'none': '',
  'bottom_dark_strong': 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)',
  'bottom_dark_subtle': 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
  'top_dark': 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 50%)',
  'full_dark': 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))',
  'radial_vignette': 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.7) 100%)',
};

export const availableIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'heart': Heart,
  'bible': BookOpen,
  'calendar': Calendar,
  'clock': Clock,
  'location': MapPin,
  'play': Play,
  'music': Music,
  'users': Users,
  'church': Church,
  'worship_hands': HandHeart,
  'sparkles': Sparkles,
  'star': Star,
  'sun': Sun,
  'moon': Moon,
};

export const positionOptions = [
  { value: 'top_left', label: 'Superior Esquerdo' },
  { value: 'top_center', label: 'Superior Centro' },
  { value: 'top_right', label: 'Superior Direito' },
  { value: 'center_left', label: 'Centro Esquerdo' },
  { value: 'center', label: 'Centro' },
  { value: 'center_right', label: 'Centro Direito' },
  { value: 'bottom_left', label: 'Inferior Esquerdo' },
  { value: 'bottom_center', label: 'Inferior Centro' },
  { value: 'bottom_right', label: 'Inferior Direito' },
];

export const fontSizeOptions = [
  { value: 'sm', label: 'Pequeno' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra Grande' },
  { value: '2xl', label: '2x Grande' },
  { value: '3xl', label: '3x Grande' },
  { value: '4xl', label: '4x Grande' },
  { value: '5xl', label: '5x Grande' },
  { value: '6xl', label: '6x Grande' },
  { value: '7xl', label: '7x Grande' },
];

export const fontFamilyOptions = [
  { value: 'bebas_neue', label: 'Bebas Neue (Impacto)' },
  { value: 'playfair', label: 'Playfair Display (Elegante)' },
  { value: 'montserrat', label: 'Montserrat (Moderno)' },
  { value: 'dancing_script', label: 'Dancing Script (Manuscrito)' },
  { value: 'inter', label: 'Inter (Limpo)' },
];

export const gradientOptions = [
  { value: 'none', label: 'Sem gradiente' },
  { value: 'bottom_dark_strong', label: 'Escuro de baixo (forte)' },
  { value: 'bottom_dark_subtle', label: 'Escuro de baixo (suave)' },
  { value: 'top_dark', label: 'Escuro de cima' },
  { value: 'full_dark', label: 'Escurecimento total' },
  { value: 'radial_vignette', label: 'Vinheta radial' },
];

export const iconOptions = Object.keys(availableIcons).map(key => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
}));

export interface TextOverlay {
  type: 'text';
  content: string;
  position: string;
  color_hex: string;
  font_weight: string;
  font_size: string;
  font_family?: string;
  background_highlight: boolean;
}

export interface IconOverlay {
  type: 'icon';
  icon_name: string;
  position: string;
  color_hex: string;
}

export type Overlay = TextOverlay | IconOverlay;

export interface OverlayData {
  layout_action: string;
  overlays: Overlay[];
  image_filter: string;
  gradient_overlay?: string;
  analysis?: {
    dominant_color: string;
    suggested_text_color: string;
    safe_zones: string[];
    image_description?: string;
  };
}
