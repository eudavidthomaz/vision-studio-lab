

# Replace Emoji Tab Labels with Professional Lucide Icons

## Problem
Tab triggers use emoji characters (🏠, ✝️, 📺, 💬) — unprofessional and inconsistent across platforms.

## Solution
Replace each emoji with a matching Lucide icon rendered as a small inline SVG alongside the text label. Icons already imported or available in lucide-react.

## Changes

**File: `src/pages/Bio.tsx`**

Replace the 4 `TabsTrigger` elements (lines 241-264):

| Current | Icon Replacement |
|---------|-----------------|
| `🏠 Início` | `<ChurchIcon className="w-4 h-4" />` + "Início" |
| `✝️ Sobre` | `<BookOpen className="w-4 h-4" />` + "Sobre" |
| `📺 Mídia` | `<Play className="w-4 h-4" />` + "Mídia" |
| `💬 Contato` | `<MessageCircle className="w-4 h-4" />` + "Contato" |

Each trigger gets `gap-1.5 items-center` to align icon + text inline. Also remove the `🔴` emoji from the hero badge (line 221) and replace with a small pulsing red dot via CSS (`w-2 h-2 rounded-full bg-red-500 animate-pulse`).

No new files. No new dependencies.

