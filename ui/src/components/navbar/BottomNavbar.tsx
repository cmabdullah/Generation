import { Button } from 'reactstrap';
import { useUIStore } from '../../stores/uiStore';
import { useTreeStore } from '../../stores/treeStore';
import '../../styles/bottom-navbar.css';

/**
 * Bottom navigation bar for mobile
 * Thumb-accessible with essential controls
 */
export const BottomNavbar: React.FC = () => {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const showInfoPanel = useUIStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useUIStore((state) => state.toggleInfoPanel);
  const zoomIn = useUIStore((state) => state.zoomIn);
  const zoomOut = useUIStore((state) => state.zoomOut);
  const refreshTree = useTreeStore((state) => state.refreshTree);

  const handleModeToggle = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };

  return (
    <nav className="bottom-nav safe-area-bottom" role="navigation" aria-label="Main navigation">
      <Button
        className="nav-item tap-target"
        onClick={handleModeToggle}
        color={mode === 'edit' ? 'warning' : 'secondary'}
        title={mode === 'view' ? 'Switch to Edit Mode' : 'Switch to View Mode'}
        aria-label={mode === 'view' ? 'Edit mode' : 'View mode'}
      >
        {mode === 'view' ? '✏️' : '👁️'}
      </Button>

      <Button
        className="nav-item tap-target"
        onClick={zoomOut}
        color="secondary"
        title="Zoom Out"
        aria-label="Zoom out"
      >
        ➖
      </Button>

      <Button
        className="nav-item tap-target"
        onClick={zoomIn}
        color="secondary"
        title="Zoom In"
        aria-label="Zoom in"
      >
        ➕
      </Button>

      <Button
        className="nav-item tap-target"
        onClick={toggleInfoPanel}
        color={showInfoPanel ? 'info' : 'secondary'}
        title="Toggle Info Panel"
        aria-label="Info panel"
      >
        ℹ️
      </Button>

      <Button
        className="nav-item tap-target"
        onClick={refreshTree}
        color="secondary"
        title="Refresh Tree"
        aria-label="Refresh"
      >
        🔄
      </Button>
    </nav>
  );
};
