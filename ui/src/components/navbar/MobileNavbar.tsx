import { Navbar, Input, Collapse, Button } from 'reactstrap';
import { useUIStore } from '../../stores/uiStore';

/**
 * Mobile-optimized top navigation bar
 * Simplified with collapsible search
 */
export const MobileNavbar: React.FC = () => {
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const mobileSearchExpanded = useUIStore((state) => state.mobileSearchExpanded);
  const toggleMobileSearch = useUIStore((state) => state.toggleMobileSearch);

  return (
    <Navbar
      color="dark"
      dark
      className="px-2 safe-area-top mobile-navbar"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
    >
      {/* Top bar: Logo + Search toggle */}
      <div className="d-flex w-100 align-items-center justify-content-between">
        <h6 className="mb-0 text-white">কে?</h6>

        <Button
          size="sm"
          color="secondary"
          outline
          onClick={toggleMobileSearch}
          className="tap-target"
          aria-label="Toggle search"
        >
          {mobileSearchExpanded ? '✕' : '🔍'}
        </Button>
      </div>

      {/* Expandable search bar */}
      <Collapse isOpen={mobileSearchExpanded} className="w-100 mt-2">
        <Input
          type="search"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-100"
          autoFocus
          bsSize="sm"
        />
      </Collapse>
    </Navbar>
  );
};
