import React, { useEffect, useRef } from 'react';
import type { Person } from '../../models/Person';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  person: Person;
  onAddChild: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  person,
  onAddChild,
  onEdit,
  onDelete,
  onViewDetails,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 10000,
      }}
    >
      <div className="context-menu-header">
        <strong>{person.name}</strong>
        <small className="text-muted d-block">{person.id}</small>
      </div>
      <hr className="my-1" />
      <button
        className="context-menu-item"
        onClick={() => handleAction(onViewDetails)}
      >
        <span className="context-menu-icon">👁️</span>
        View Details
      </button>
      <button
        className="context-menu-item"
        onClick={() => handleAction(onEdit)}
      >
        <span className="context-menu-icon">✏️</span>
        Edit Person
      </button>
      <button
        className="context-menu-item"
        onClick={() => handleAction(onAddChild)}
      >
        <span className="context-menu-icon">➕</span>
        Add Child
      </button>
      <hr className="my-1" />
      <button
        className="context-menu-item context-menu-item-danger"
        onClick={() => handleAction(onDelete)}
      >
        <span className="context-menu-icon">🗑️</span>
        Delete Person
      </button>
    </div>
  );
};
