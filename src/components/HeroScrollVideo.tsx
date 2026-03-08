import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef } from "react";

export type HeroScrollVideoProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  credits?: ReactNode;
  iframeSrc?: string;
  overlay?: {
    caption?: ReactNode;
    heading?: ReactNode;
    paragraphs?: ReactNode[];
    extra?: ReactNode;
  };
  initialBoxSize?: number;
  targetSize?: { widthVw: number; heightVh: number; borderRadius?: number } | "fullscreen";
  scrollHeightVh?: number;
  showHeroExitAnimation?: boolean;
  overlayBlur?: number;
  overlayRevealDelay?: number;
  eases?: { container?: string; overlay?: string; text?: string };
  smoothScroll?: boolean;
  lenisOptions?: Record<string, unknown>;
  className?: string;
  style?: CSSProperties;
};

const DEFAULTS = {
  initialBoxSize: 360,
  scrollHeightVh: 280,
  overlayBlur: 10,
  overlayRevealDelay: 0.35,
  eases: { container: "expo.out", overlay: "expo.out", text: "power3.inOut" },
};

export const HeroScrollVideo: React.FC<HeroScrollVideoProps> = ({
  title,
  subtitle,
  meta,
  credits,
  iframeSrc,
  overlay,
  initialBoxSize = DEFAULTS.initialBoxSize,
  targetSize = "fullscreen",
  scrollHeightVh = DEFAULTS.scrollHeightVh,
  showHeroExitAnimation = true,
  overlayBlur = DEFAULTS.overlayBlur,
  overlayRevealDelay = DEFAULTS.overlayRevealDelay,
  eases = DEFAULTS.eases,
  smoothScroll = true,
  lenisOptions,
  className,
  style,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayCaptionRef = useRef<HTMLDivElement>(null);
  const overlayContentRef = useRef<HTMLDivElement>(null);

  const cssVars: CSSProperties = useMemo(
    () => ({
      "--initial-size": `${initialBoxSize}px`,
      "--overlay-blur": `${overlayBlur}px`,
    } as CSSProperties),
    [initialBoxSize, overlayBlur]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    let gsap: any;
    let ScrollTrigger: any;
    let lenis: any;
    let heroTl: any;
    let mainTl: any;
    let overlayDarkenEl: HTMLDivElement | null = null;
    let rafCb: ((t: number) => void) | null = null;
    let cancelled = false;

    (async () => {
      const gsapPkg = await import("gsap");
      gsap = gsapPkg.gsap || gsapPkg.default || gsapPkg;

      const stPkg = await import("gsap/ScrollTrigger").catch(() => import("gsap/dist/ScrollTrigger"));
      ScrollTrigger = (stPkg as any).ScrollTrigger || (stPkg as any).default || stPkg;

      gsap.registerPlugin(ScrollTrigger);

      if (cancelled) return;

      if (smoothScroll) {
        try {
          const lenisPkg = await import("lenis");
          const LenisCtor = (lenisPkg as any).default || (lenisPkg as any).Lenis;
          if (LenisCtor) {
            lenis = new LenisCtor({
              duration: 0.8,
              smoothWheel: true,
              gestureOrientation: "vertical" as const,
              ...lenisOptions,
            });
            rafCb = (time: number) => lenis?.raf(time * 1000);
            gsap.ticker.add(rafCb);
            gsap.ticker.lagSmoothing(0);
            lenis?.on?.("scroll", ScrollTrigger.update);
          }
        } catch {
          // Lenis optional
        }
      }

      const containerEase = eases.container ?? "expo.out";
      const overlayEase = eases.overlay ?? "expo.out";
      const textEase = eases.text ?? "power3.inOut";

      const container = containerRef.current;
      const overlayEl = overlayRef.current;
      const overlayCaption = overlayCaptionRef.current;
      const overlayContent = overlayContentRef.current;
      const headline = headlineRef.current;

      if (!container || !overlayEl) return;

      // Darkening overlay
      overlayDarkenEl = document.createElement("div");
      overlayDarkenEl.style.position = "absolute";
      overlayDarkenEl.style.inset = "0";
      overlayDarkenEl.style.background = "rgba(0,0,0,0)";
      overlayDarkenEl.style.pointerEvents = "none";
      overlayDarkenEl.style.zIndex = "1";
      container.appendChild(overlayDarkenEl);

      // Headline roll-away
      if (showHeroExitAnimation && headline) {
        heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: headline,
            start: "top top",
            end: "top+=420 top",
            scrub: 1.1,
          },
        });

        headline.querySelectorAll(".hsv-headline > *").forEach((el: Element, i: number) => {
          heroTl.to(
            el,
            {
              rotationX: 80,
              y: -36,
              scale: 0.86,
              opacity: 0,
              filter: "blur(4px)",
              transformOrigin: "center top",
              ease: textEase,
            },
            i * 0.08
          );
        });
      }

      // Main sticky expansion
      const triggerEl = rootRef.current?.querySelector("[data-sticky-scroll]") as HTMLElement;
      if (!triggerEl) return;

      mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
        },
      });

      const target = (() => {
        if (targetSize === "fullscreen") {
          return { width: "92vw", height: "92vh", borderRadius: 0 };
        }
        return {
          width: `${targetSize.widthVw ?? 92}vw`,
          height: `${targetSize.heightVh ?? 92}vh`,
          borderRadius: targetSize.borderRadius ?? 0,
        };
      })();

      gsap.set(container, {
        width: initialBoxSize,
        height: initialBoxSize,
        borderRadius: 20,
        filter: "none",
        clipPath: "inset(0 0 0 0)",
      });
      gsap.set(overlayEl, { clipPath: "inset(100% 0 0 0)" });
      if (overlayContent) {
        gsap.set(overlayContent, { filter: `blur(${overlayBlur}px)`, scale: 1.05 });
        gsap.set(overlayContent, { y: 30 });
      }
      if (overlayCaption) gsap.set(overlayCaption, { y: 30 });

      mainTl
        .to(container, { width: target.width, height: target.height, borderRadius: target.borderRadius, ease: containerEase }, 0)
        .to(overlayDarkenEl, { backgroundColor: "rgba(0,0,0,0.4)", ease: "power2.out" }, 0)
        .to(overlayEl, { clipPath: "inset(0% 0 0 0)", backdropFilter: `blur(${overlayBlur}px)`, ease: overlayEase }, overlayRevealDelay);

      if (overlayCaption) {
        mainTl.to(overlayCaption, { y: 0, ease: overlayEase }, overlayRevealDelay + 0.05);
      }
      if (overlayContent) {
        mainTl.to(overlayContent, { y: 0, filter: "blur(0px)", scale: 1, ease: overlayEase }, overlayRevealDelay + 0.05);
      }
    })();

    return () => {
      cancelled = true;
      try { heroTl?.kill?.(); mainTl?.kill?.(); } catch {}
      try {
        if (ScrollTrigger?.getAll) {
          ScrollTrigger.getAll().forEach((t: any) => {
            if (rootRef.current?.contains(t.trigger)) t.kill(true);
          });
        }
      } catch {}
      try { overlayDarkenEl?.parentElement?.removeChild(overlayDarkenEl); } catch {}
      try {
        if (rafCb && gsap?.ticker) { gsap.ticker.remove(rafCb); gsap.ticker.lagSmoothing(1000, 16); }
      } catch {}
      try { lenis?.off?.("scroll", ScrollTrigger?.update); lenis?.destroy?.(); } catch {}
    };
  }, [initialBoxSize, targetSize, scrollHeightVh, overlayBlur, overlayRevealDelay, eases.container, eases.overlay, eases.text, showHeroExitAnimation, smoothScroll, lenisOptions]);

  return (
    <div ref={rootRef} className={`hsv-root ${className ?? ""}`} style={{ ...cssVars, ...style }}>
      {/* Headline / Hero area */}
      <div ref={headlineRef} className="hsv-container">
        <div className="hsv-headline" style={{ transformStyle: "preserve-3d" }}>
          <div className="hsv-title">{title}</div>
          {subtitle && <div className="hsv-subtitle">{subtitle}</div>}
          {meta && <div className="hsv-meta">{meta}</div>}
          {credits && <div className="hsv-credits">{credits}</div>}
        </div>
      </div>

      {/* Sticky scroll section */}
      <div data-sticky-scroll style={{ height: `${scrollHeightVh}vh` }} className="hsv-scroll">
        <div className="hsv-sticky is-sticky">
          <div ref={containerRef} className="hsv-media">
            {iframeSrc && (
              <iframe
                src={iframeSrc}
                title="Video de apresentação"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Overlay */}
            <div ref={overlayRef} className="hsv-overlay">
              {overlay?.caption && (
                <div ref={overlayCaptionRef} className="hsv-caption">
                  {overlay.caption}
                </div>
              )}
              <div ref={overlayContentRef} className="hsv-overlay-content">
                {overlay?.heading && <h3>{overlay.heading}</h3>}
                {overlay?.paragraphs?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {overlay?.extra}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hsv-root {
          --bg: hsl(var(--background));
          --text: hsl(var(--foreground));
          --muted: hsl(var(--muted-foreground));
          --muted-bg: hsl(var(--muted) / 0.15);
          --muted-border: hsl(var(--border));
          --overlay-bg: hsl(var(--background) / 0.55);
          --overlay-text: hsl(var(--foreground));
          --accent: hsl(var(--primary));
          --accent-2: hsl(var(--accent));
          --shadow: 0 12px 36px hsl(var(--primary) / 0.15);
        }

        .hsv-container {
          height: 100vh;
          display: grid;
          place-items: center;
          padding: clamp(16px, 3vw, 40px);
          perspective: 900px;
        }

        .hsv-headline {
          text-align: center;
          transform-style: preserve-3d;
          max-width: min(100%, 1100px);
        }
        .hsv-headline > * {
          transform-style: preserve-3d;
          backface-visibility: hidden;
          transform-origin: center top;
        }

        .hsv-title {
          margin: 0 0 .6rem 0;
          font-family: 'Gunterz', sans-serif;
          font-size: clamp(40px, 8vw, 96px);
          line-height: 0.98;
          font-weight: 900;
          letter-spacing: -0.02em;
          text-wrap: balance;
          background: linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 50%, hsl(var(--primary)) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 2px 0 rgba(0,0,0,0.05));
        }
        .hsv-subtitle {
          margin: 0 0 1.25rem 0;
          font-size: clamp(16px, 3vw, 24px);
          font-weight: 500;
          color: hsl(var(--muted-foreground));
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }
        .hsv-meta {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          padding: .5rem 1rem;
          border-radius: 999px;
          font-size: .875rem;
          font-weight: 600;
          letter-spacing: .02em;
          background: hsl(var(--primary) / 0.1);
          border: 1px solid hsl(var(--primary) / 0.2);
          color: hsl(var(--primary));
          margin: 1rem 0 0 0;
        }
        .hsv-credits {
          margin-top: 1.5rem;
        }

        .hsv-scroll { position: relative; }
        .hsv-sticky.is-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          display: grid;
          place-items: center;
        }

        .hsv-media {
          position: relative;
          width: var(--initial-size);
          height: var(--initial-size);
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          display: grid;
          place-items: center;
          transition: border-radius 0.3s ease;
          box-shadow: var(--shadow);
        }

        .hsv-overlay {
          position: absolute;
          inset: 0;
          background: hsl(var(--background) / 0.55);
          color: hsl(var(--foreground));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(16px, 4vw, 40px);
          clip-path: inset(100% 0 0 0);
          backdrop-filter: blur(var(--overlay-blur));
          z-index: 2;
        }

        .hsv-caption {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          position: absolute;
          top: clamp(8px, 3vw, 24px);
          left: 0;
          width: 100%;
          text-align: center;
          opacity: 0.95;
          font-weight: 600;
          color: hsl(var(--primary));
        }

        .hsv-overlay-content {
          max-width: 68ch;
          display: grid;
          gap: 0.9rem;
        }
        .hsv-overlay-content h3 {
          font-family: 'Gunterz', sans-serif;
          font-size: clamp(26px, 5vw, 50px);
          line-height: 1.02;
          margin: 0;
          font-weight: 900;
          letter-spacing: -0.01em;
          background: linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 40%, hsl(var(--primary)) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-wrap: balance;
        }
        .hsv-overlay-content p {
          font-size: clamp(15px, 2.1vw, 19px);
          line-height: 1.75;
          margin: 0;
          color: hsl(var(--muted-foreground));
          opacity: 0.95;
        }

        @media (max-width: 900px) {
          .hsv-overlay-content { max-width: 40ch; }
        }
      `}</style>
    </div>
  );
};

export default HeroScrollVideo;
