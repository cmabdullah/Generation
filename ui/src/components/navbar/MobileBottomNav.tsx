import { Button } from 'reactstrap';
import { useUIStore } from '../../stores/uiStore';

/**
 * Mobile bottom navigation bar with zoom and mode controls
 * Only displayed on mobile devices (< 768px)
 * Positioned above the footer for easy thumb access
 */
export const MobileBottomNav: React.FC = () => {
  const zoom = useUIStore((state) => state.zoom);
  const zoomIn = useUIStore((state) => state.zoomIn);
  const zoomOut = useUIStore((state) => state.zoomOut);
  const resetView = useUIStore((state) => state.resetView);
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 40, // Above footer
        left: 0,
        right: 0,
        height: '60px',
        background: 'white',
        borderTop: '1px solid #dee2e6',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 10px'
      }}
    >
      {/* Zoom Controls */}
      <Button
        color="secondary"
        size="sm"
        onClick={zoomOut}
        style={{ minWidth: '44px', height: '44px' }}
        title="Zoom Out"
      >
        −
      </Button>

      <span
        style={{
          fontSize: '12px',
          minWidth: '50px',
          textAlign: 'center',
          fontWeight: '600'
        }}
      >
        {zoomPercentage}%
      </span>

      <Button
        color="secondary"
        size="sm"
        onClick={zoomIn}
        style={{ minWidth: '44px', height: '44px' }}
        title="Zoom In"
      >
        +
      </Button>

      <Button
        color="primary"
        size="sm"
        onClick={resetView}
        style={{ minWidth: '44px', height: '44px' }}
        title="Reset View"
      >
        ↺
      </Button>

      {/* Mode Toggle */}
      <Button
        color={mode === 'edit' ? 'warning' : 'success'}
        size="sm"
        onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
        style={{ minWidth: '44px', height: '44px' }}
        title={mode === 'view' ? 'Edit Mode' : 'View Mode'}
      >
        {mode === 'view' ? '✏️' : '👁️'}
      </Button>
    </div>
  );
};
