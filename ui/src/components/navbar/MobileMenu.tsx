import { useState } from 'react';
import { Button, Offcanvas, Nav, NavItem, NavLink } from 'reactstrap';
import { useTreeStore } from '../../stores/treeStore';
import { usePositionCacheStore } from '../../stores/positionCacheStore';

/**
 * Mobile off-canvas menu for secondary actions
 * Contains advanced features that don't fit in the main navigation
 */
export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const refreshTree = useTreeStore((state) => state.refreshTree);
  const recalculateLayout = useTreeStore((state) => state.recalculateLayout);

  const toggle = () => setIsOpen(!isOpen);

  const handleResetLayout = () => {
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
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        color="secondary"
        size="sm"
        onClick={toggle}
        style={{ minWidth: '44px', height: '44px' }}
        title="Menu"
      >
        ☰
      </Button>

      <Offcanvas
        direction="end"
        isOpen={isOpen}
        toggle={toggle}
      >
        <div style={{ padding: '1rem' }}>
          <h5>Menu</h5>
        </div>

        <Nav vertical>
          <NavItem>
            <NavLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                refreshTree();
                setIsOpen(false);
              }}
              className="d-flex justify-content-between align-items-center"
            >
              <span>🔄 Refresh Tree</span>
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleResetLayout();
              }}
              className="d-flex justify-content-between align-items-center"
            >
              <span>↺ Reset Layout</span>
            </NavLink>
          </NavItem>

          <NavItem className="mt-3">
            <div className="text-muted small px-2">
              Tree Statistics
            </div>
          </NavItem>

          <NavItem>
            <div className="px-3 py-2 text-muted">
              <small>
                Total positions cached: <strong>{Array.from(usePositionCacheStore.getState().cache.values()).length}</strong>
              </small>
            </div>
          </NavItem>

          <NavItem>
            <div className="px-3 py-2 text-muted">
              <small>
                Manual positions: <strong>{Array.from(usePositionCacheStore.getState().cache.values()).filter(p => p.source === 'manual').length}</strong>
              </small>
            </div>
          </NavItem>
        </Nav>
      </Offcanvas>
    </>
  );
};
