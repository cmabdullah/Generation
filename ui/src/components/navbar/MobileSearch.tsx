import { useState, useEffect } from 'react';
import { Input, Button } from 'reactstrap';
import { useUIStore } from '../../stores/uiStore';

/**
 * Mobile collapsible search input
 * Hidden by default, expands when search icon is tapped
 * Optimized for mobile screens with smooth animations
 */
export const MobileSearch: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      const input = document.querySelector('input[type="search"]') as HTMLInputElement;
      input?.focus();
    }
  }, [isExpanded]);

  // Collapse when query is cleared
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '300px',
          zIndex: 1001
        }}
      >
        <div className="d-flex gap-2">
          <Input
            type="search"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={handleChange}
            bsSize="sm"
            autoFocus
          />
          <Button color="secondary" size="sm" onClick={handleClear}>
            ✕
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      color="secondary"
      size="sm"
      onClick={() => setIsExpanded(true)}
      style={{ minWidth: '44px', height: '44px' }}
      title="Search"
    >
      🔍
    </Button>
  );
};
