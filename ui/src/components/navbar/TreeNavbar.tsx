import { useMemo } from 'react';
import { Navbar, Nav, Button, Input } from 'reactstrap';
import { ZoomControls } from './ZoomControls';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileMenu } from './MobileMenu';
import { MobileSearch } from './MobileSearch';
import { useUIStore } from '../../stores/uiStore';
import { useTreeStore } from '../../stores/treeStore';
import { usePositionCacheStore } from '../../stores/positionCacheStore';
import { useResponsiveBreakpoint } from '../../hooks/useResponsiveBreakpoint';
import { getResponsiveNavbarHeight } from '../../utils/responsiveUtils';

/**
 * Top navigation bar with controls and search
 * Responsive design: Mobile layout (<768px) vs Desktop layout (>=768px)
 */
export const TreeNavbar: React.FC = () => {
  const { isMobile, breakpoint } = useResponsiveBreakpoint();
  const mode = useUIStore((state) => state.mode);
  const setMode = useUIStore((state) => state.setMode);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const toggleInfoPanel = useUIStore((state) => state.toggleInfoPanel);
  const showInfoPanel = useUIStore((state) => state.showInfoPanel);
  const refreshTree = useTreeStore((state) => state.refreshTree);
  const recalculateLayout = useTreeStore((state) => state.recalculateLayout);
  const cacheVersion = usePositionCacheStore((state) => state.version);

  const handleModeToggle = () => {
    setMode(mode === 'view' ? 'edit' : 'view');
  };

  const handleResetLayout = () => {
    // Get fresh stats at click time
    const cache = usePositionCacheStore.getState().cache;
    const positions = Array.from(cache.values());
    const manualCount = positions.filter(p => p.source === 'manual').length;

    const confirmed = window.confirm(
      `This will reset all node positions to auto-calculated layout.\n\n` +
      `${manualCount} manually positioned nodes will be reset.\n\n` +
      `Continue?`
    );

    if (confirmed) {
      recalculateLayout();
    }
  };

  // Compute stats for tooltip (memoized, only recomputes when cache version changes)
  const { totalCount, manualCount } = useMemo(() => {
    const cache = usePositionCacheStore.getState().cache;
    const positions = Array.from(cache.values());
    return {
      totalCount: positions.length,
      manualCount: positions.filter(p => p.source === 'manual').length,
    };
  }, [cacheVersion]);

  const navbarHeight = getResponsiveNavbarHeight(breakpoint);

  // Mobile Layout: Simplified top bar + bottom navigation
  if (isMobile) {
    return (
      <>
        <Navbar
          color="dark"
          dark
          className="px-2"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            height: `${navbarHeight}px`,
            minHeight: `${navbarHeight}px`
          }}
        >
          <div className="d-flex w-100 align-items-center justify-content-between">
            {/* Logo/Title */}
            <h5 className="mb-0 text-white" style={{ fontSize: '18px' }}>
              কে?
            </h5>

            {/* Action Buttons */}
            <div className="d-flex gap-2 align-items-center">
              <MobileSearch />

              <Button
                color="info"
                size="sm"
                onClick={toggleInfoPanel}
                style={{ minWidth: '44px', height: '44px' }}
                title="Info Panel"
              >
                ℹ️
              </Button>

              <MobileMenu />
            </div>
          </div>
        </Navbar>

        {/* Bottom Navigation Bar */}
        <MobileBottomNav />
      </>
    );
  }

  // Desktop Layout: Original horizontal navigation
  return (
    <Navbar
      color="dark"
      dark
      expand="md"
      className="px-3"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: `${navbarHeight}px`,
        minHeight: `${navbarHeight}px`
      }}
    >
      <div className="d-flex w-100 align-items-center justify-content-between">
        {/* Left section */}
        <div className="d-flex align-items-center gap-3">
          <h5 className="mb-0 text-white">কে?</h5>

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

          <Button
            color="danger"
            size="sm"
            onClick={handleResetLayout}
            title={`Reset layout (${totalCount} positions cached, ${manualCount} manual)`}
            outline
          >
            ↺ Reset Layout
          </Button>
        </Nav>
      </div>
    </Navbar>
  );
};
