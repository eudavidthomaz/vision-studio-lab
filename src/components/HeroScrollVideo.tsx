import React, { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";

interface ScrollExpandMediaProps {
  mediaSrc: string;
  bgImageSrc?: string;
  title?: string;
  subtitle?: string;
  meta?: ReactNode;
  cta?: ReactNode;
  scrollHint?: string;
  children?: ReactNode;
}

export const HeroScrollVideo: React.FC<ScrollExpandMediaProps> = ({
  mediaSrc,
  bgImageSrc,
  title = "",
  subtitle,
  meta,
  cta,
  scrollHint = "Role para expandir ↓",
  children,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Reset on mediaSrc change
  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaSrc]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Wheel + Touch handlers
  useEffect(() => {
    let currentProgress = scrollProgress;

    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        e.preventDefault();
        return;
      }
      if (!mediaFullyExpanded) {
        e.preventDefault();
        const delta = e.deltaY * 0.0009;
        const next = Math.min(Math.max(currentProgress + delta, 0), 1);
        currentProgress = next;
        setScrollProgress(next);
        if (next >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (next < 0.75) {
          setShowContent(false);
        }
      }
    };

    let touchY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
      setTouchStartY(touchY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchY) return;
      const currentTouchY = e.touches[0].clientY;
      const deltaY = touchY - currentTouchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        setShowContent(false);
        e.preventDefault();
        return;
      }
      if (!mediaFullyExpanded) {
        e.preventDefault();
        const factor = deltaY < 0 ? 0.008 : 0.005;
        const delta = deltaY * factor;
        const next = Math.min(Math.max(currentProgress + delta, 0), 1);
        currentProgress = next;
        setScrollProgress(next);
        if (next >= 1) {
          setMediaFullyExpanded(true);
          setShowContent(true);
        } else if (next < 0.75) {
          setShowContent(false);
        }
        touchY = currentTouchY;
      }
    };

    const handleTouchEnd = () => {
      touchY = 0;
      setTouchStartY(0);
    };

    const handleScroll = () => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [scrollProgress, mediaFullyExpanded]);

  // Computed dimensions
  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);

  // Split title into first word and rest
  const words = title.split(" ");
  const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ");
  const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ");

  // Build YouTube embed URL with autoplay params
  const embedSrc = (() => {
    if (!mediaSrc) return "";
    if (mediaSrc.includes("embed")) {
      const sep = mediaSrc.includes("?") ? "&" : "?";
      return `${mediaSrc}${sep}autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`;
    }
    if (mediaSrc.includes("youtube")) {
      const videoId = mediaSrc.split("v=")[1]?.split("&")[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=${videoId}`;
    }
    return mediaSrc;
  })();

  return (
    <div className="overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Background image */}
          {bgImageSrc && (
            <motion.div
              className="absolute inset-0 z-0 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 - scrollProgress }}
              transition={{ duration: 0.1 }}
            >
              <img
                src={bgImageSrc}
                alt="Background"
                className="w-screen h-screen object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/10" />
            </motion.div>
          )}

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              {/* Expanding media box */}
              <div
                className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: "95vw",
                  maxHeight: "85vh",
                  boxShadow: "0px 0px 50px hsl(var(--primary) / 0.2)",
                }}
              >
                {/* YouTube iframe */}
                <div className="relative w-full h-full pointer-events-none">
                  <iframe
                    src={embedSrc}
                    title="Video de apresentação"
                    className="w-full h-full rounded-xl"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }} />
                  <motion.div
                    className="absolute inset-0 bg-black/30 rounded-xl"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 0.5 - scrollProgress * 0.3 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                {/* Below-media hints */}
                <div className="flex flex-col items-center text-center relative z-10 mt-4">
                  {subtitle && (
                    <p
                      className="text-muted-foreground text-sm md:text-base max-w-md"
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {subtitle}
                    </p>
                  )}
                  {scrollHint && scrollProgress < 0.8 && (
                    <motion.p
                      className="text-muted-foreground/60 font-medium text-center text-xs mt-2"
                      animate={{ opacity: 1 - scrollProgress * 2 }}
                    >
                      {scrollHint}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Title text — splits and slides apart */}
              <div className="flex items-center justify-center text-center gap-3 md:gap-4 w-full relative z-10 flex-col mix-blend-difference">
                <motion.h2
                  className="font-gunterz text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight"
                  style={{ transform: `translateX(-${textTranslateX}vw)` }}
                >
                  {firstLine}
                </motion.h2>
                <motion.h2
                  className="font-gunterz text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight"
                  style={{ transform: `translateX(${textTranslateX}vw)` }}
                >
                  {secondLine}
                </motion.h2>
              </div>

              {/* Meta badge + CTA — visible when not scrolling */}
              <motion.div
                className="absolute bottom-12 md:bottom-16 z-20 flex flex-col items-center gap-4"
                animate={{ opacity: scrollProgress < 0.3 ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {meta && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide bg-primary/10 border border-primary/20 text-primary">
                    {meta}
                  </div>
                )}
                {cta}
              </motion.div>
            </div>

            {/* Children content — fades in after full expansion */}
            <motion.section
              className="flex flex-col w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroScrollVideo;
