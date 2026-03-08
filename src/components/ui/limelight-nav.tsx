import React, { useState, useRef, useLayoutEffect, cloneElement } from 'react';

export type NavItem = {
  id: string | number;
  icon: React.ReactElement;
  label?: string;
  onClick?: () => void;
};

type LimelightNavProps = {
  items: NavItem[];
  defaultActiveIndex?: number;
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
};

export const LimelightNav = ({
  items,
  defaultActiveIndex = 0,
  activeIndex: controlledIndex,
  onTabChange,
  className,
  limelightClassName,
  iconContainerClassName,
  iconClassName,
}: LimelightNavProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const activeIndex = controlledIndex ?? internalIndex;
  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (items.length === 0) return;
    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];

    if (limelight && activeItem) {
      const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;
      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) return null;

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    setInternalIndex(index);
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav className={`relative inline-flex items-center h-14 rounded-xl bg-card/60 text-foreground border border-border/30 px-1 ${className || ''}`}>
      {items.map(({ id, icon, label, onClick }, index) => (
        <button
          key={id}
          ref={el => { navItemRefs.current[index] = el; }}
          className={`relative z-20 flex h-full cursor-pointer items-center justify-center px-5 py-2 rounded-lg transition-colors ${iconContainerClassName || ''}`}
          onClick={() => handleItemClick(index, onClick)}
          aria-label={label}
          type="button"
        >
          {cloneElement(icon, {
            className: `w-5 h-5 transition-opacity duration-150 ease-in-out ${
              activeIndex === index ? 'opacity-100 text-primary' : 'opacity-40 text-foreground'
            } ${icon.props.className || ''} ${iconClassName || ''}`,
          })}
        </button>
      ))}
      <div
        ref={limelightRef}
        className={`absolute top-0 z-10 w-10 h-[4px] rounded-full bg-primary shadow-[0_40px_12px_hsl(var(--primary)/0.4)] ${
          isReady ? 'transition-[left] duration-300 ease-in-out' : ''
        } ${limelightClassName || ''}`}
        style={{ left: '-999px' }}
      >
        <div className="absolute left-[-30%] top-[4px] w-[160%] h-12 [clip-path:polygon(5%_100%,25%_0,75%_0,95%_100%)] bg-gradient-to-b from-primary/25 to-transparent pointer-events-none" />
      </div>
    </nav>
  );
};
