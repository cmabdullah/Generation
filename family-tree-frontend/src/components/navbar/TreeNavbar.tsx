import { Navbar, Nav, Button, Input } from 'reactstrap';
import { ZoomControls } from './ZoomControls';
import { useUIStore } from '../../stores/uiStore';
import { useTreeStore } from '../../stores/treeStore';

/**
 * Top navigation bar with controls and search
 */
export const TreeNavbar: React.FC = () => {
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const toggleInfoPanel = useUIStore((state) => state.toggleInfoPanel);
  const showInfoPanel = useUIStore((state) => state.showInfoPanel);
  const refreshTree = useTreeStore((state) => state.refreshTree);

  const handleModeToggle = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };

  return (
    <Navbar
      color="dark"
      dark
      expand="md"
      className="px-3"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
    >
      <div className="d-flex w-100 align-items-center justify-content-between">
        {/* Left section */}
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0">🌳 Family Tree</h5>

          <Input
            type="search"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '200px' }}
            bsSize="sm"
          />
        </div>

        {/* Center section */}
        <div className="d-flex align-items-center gap-2">
          <ZoomControls />
        </div>

        {/* Right section */}
        <Nav className="d-flex flex-row align-items-center gap-2">
          <Button
            color={mode === 'edit' ? 'warning' : 'success'}
            size="sm"
            onClick={handleModeToggle}
          >
            {mode === 'view' ? '✏️ Edit Mode' : '👁️ View Mode'}
          </Button>

          <Button
            color="info"
            size="sm"
            onClick={toggleInfoPanel}
            outline={!showInfoPanel}
          >
            ℹ️ Info
          </Button>

          <Button
            color="secondary"
            size="sm"
            onClick={refreshTree}
          >
            🔄 Refresh
          </Button>
        </Nav>
      </div>
    </Navbar>
  );
};
