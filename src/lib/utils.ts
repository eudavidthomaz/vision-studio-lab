import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    let videoId: string | null = null;

    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1).split(/[/?]/)[0];
    } else if (u.hostname.includes('youtube-nocookie')) {
      return url;
    } else if (u.hostname.includes('youtube')) {
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/')[2];
      else if (u.pathname.startsWith('/live/')) videoId = u.pathname.split('/')[2];
      else videoId = u.searchParams.get('v');
    }

    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch { /* URL inválida */ }
  return null;
}
