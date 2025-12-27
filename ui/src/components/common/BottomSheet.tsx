import React, { useRef, useState, useEffect, type ReactNode } from 'react';
import '../../styles/bottom-sheet.css';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[]; // [0.5, 0.9] = 50%, 90% of viewport height
  header?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Bottom Sheet component for mobile interfaces
 * Supports swipe-to-dismiss and snap points
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  snapPoints = [0.6],
  header,
  children,
  className = '',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);
  const sheetStartYRef = useRef(0);
  const currentTranslateY = useRef(0);

  // Calculate snap point positions
  const getSnapPosition = (snapPoint: number): number => {
    return window.innerHeight * (1 - snapPoint);
  };

  // Set initial position when opened
  useEffect(() => {
    if (isOpen && sheetRef.current) {
      const initialSnap = getSnapPosition(snapPoints[0]);
      sheetRef.current.style.transform = `translateY(${initialSnap}px)`;
      currentTranslateY.current = initialSnap;
      setCurrentSnapIndex(0);
    }
  }, [isOpen, snapPoints]);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;

    setIsDragging(true);
    dragStartYRef.current = e.touches[0].clientY;
    sheetStartYRef.current = currentTranslateY.current;
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sheetRef.current) return;

    const deltaY = e.touches[0].clientY - dragStartYRef.current;
    const newY = sheetStartYRef.current + deltaY;

    // Get max snap position (highest on screen)
    const maxSnap = getSnapPosition(Math.max(...snapPoints));

    // Prevent dragging above max snap point
    if (newY >= maxSnap) {
      sheetRef.current.style.transform = `translateY(${newY}px)`;
      sheetRef.current.style.transition = 'none';
      currentTranslateY.current = newY;
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || !sheetRef.current) return;

    setIsDragging(false);

    const deltaY = e.changedTouches[0].clientY - dragStartYRef.current;
    const velocity = deltaY / 50; // Simple velocity calculation

    // Swipe down to close threshold (100px or fast swipe)
    if (deltaY > 100 || velocity > 2) {
      closeSheet();
      return;
    }

    // Swipe up to next snap point
    if (deltaY < -100 && currentSnapIndex < snapPoints.length - 1) {
      const nextIndex = currentSnapIndex + 1;
      snapToPoint(nextIndex);
      return;
    }

    // Find nearest snap point
    snapToNearest();
  };

  // Snap to specific point
  const snapToPoint = (index: number) => {
    if (!sheetRef.current) return;

    const snapY = getSnapPosition(snapPoints[index]);
    sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
    sheetRef.current.style.transform = `translateY(${snapY}px)`;
    currentTranslateY.current = snapY;
    setCurrentSnapIndex(index);
  };

  // Snap to nearest snap point
  const snapToNearest = () => {
    if (!sheetRef.current) return;

    const currentY = currentTranslateY.current;

    // Find closest snap point
    let closestIndex = 0;
    let closestDistance = Infinity;

    snapPoints.forEach((point, index) => {
      const snapY = getSnapPosition(point);
      const distance = Math.abs(currentY - snapY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    snapToPoint(closestIndex);
  };

  // Close sheet animation
  const closeSheet = () => {
    if (!sheetRef.current) return;

    sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
    sheetRef.current.style.transform = 'translateY(100%)';

    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`bottom-sheet ${isOpen ? 'open' : ''} ${className}`}>
      {/* Backdrop */}
      <div
        className="bottom-sheet-backdrop"
        onClick={closeSheet}
        role="button"
        tabIndex={0}
        aria-label="Close"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="bottom-sheet-content no-select"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div className="bottom-sheet-handle-container">
          <div className="bottom-sheet-handle" />
        </div>

        {/* Header */}
        {header && <div className="bottom-sheet-header">{header}</div>}

        {/* Body */}
        <div className="bottom-sheet-body smooth-scroll safe-area-bottom">
          {children}
        </div>
      </div>
    </div>
  );
};
