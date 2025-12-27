import React, { useState, useEffect, useRef } from 'react';
import { Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { familyTreeService } from '../../services/familyTreeService';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';
import { MultiChildQuickForm } from './MultiChildQuickForm';

/**
 * SingleChildQuickForm - Fast inline form for adding a single child
 */
const SingleChildQuickForm: React.FC = () => {
  const selectedParent = useUIStore((state) => state.selectedParentNode);
  const setChildPopupMode = useUIStore((state) => state.setChildPopupMode);
  const clearSelectedParent = useUIStore((state) => state.clearSelectedParent);
  const loadTree = useTreeStore((state) => state.loadTree);
  const zoom = useUIStore((state) => state.zoom);
  const panX = useUIStore((state) => state.panX);
  const panY = useUIStore((state) => state.panY);

  // Single child state
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Helper: Generate child ID
  const generateChildId = (_parentId: string, parentLevel: number): string => {
    const nextLevel = parentLevel + 1;
    const timestamp = Date.now().toString(36).slice(-4);
    return `gen${nextLevel}-${timestamp}`;
  };

  // Auto-generate ID when parent changes
  useEffect(() => {
    if (selectedParent) {
      const newId = generateChildId(selectedParent.id, selectedParent.level);
      setId(newId);
      setName('');

      // Auto-focus name input
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [selectedParent]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedParent) return;

      if (e.key === 'Escape') {
        clearSelectedParent();
      } else if (e.key === 'Enter' && !e.shiftKey && name.trim()) {
        e.preventDefault();
        handleCreateChild();
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        setChildPopupMode('multiple');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedParent, name, clearSelectedParent, setChildPopupMode]);

  const handleCreateChild = async () => {
    if (!name.trim() || !selectedParent) return;

    setIsSubmitting(true);
    try {
      await familyTreeService.createPerson({
        id,
        name: name.trim(),
        parentId: selectedParent.id,
        level: selectedParent.level + 1,
        address: 'Dhaka', // Default
        signature: name.trim().substring(0, 2).toUpperCase(),
        avatar: 'io.jpeg',
      });

      toast.success(`✅ "${name}" added as child of ${selectedParent.name}`);

      // Reload tree
      await loadTree();

      // Reset form but keep parent selected
      setName('');
      setId(generateChildId(selectedParent.id, selectedParent.level));
      setTimeout(() => nameInputRef.current?.focus(), 100);

    } catch (error: any) {
      console.error('Failed to create child:', error);
      toast.error(error.response?.data?.message || 'Failed to create child');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedParent) return null;

  // Calculate popup position in screen coordinates (updated for new node height: 145px)
  const popupX = selectedParent.position.x * zoom + panX - 100;
  const popupY = selectedParent.position.y * zoom + panY + 155; // Updated from 145 to 155 (145 + 10px gap)

  // Calculate connection line coordinates (updated for new node dimensions)
  const nodeBottomX = selectedParent.position.x * zoom + panX + 100; // Center of node (200px wide / 2)
  const nodeBottomY = selectedParent.position.y * zoom + panY + 145; // Bottom of node (new height: 145px)
  const popupTopX = popupX + 140; // Center of popup (280px wide / 2)
  const popupTopY = popupY;

  return (
    <>
      {/* Visual connection line from node to popup */}
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 999,
        }}
      >
        <line
          x1={nodeBottomX}
          y1={nodeBottomY}
          x2={popupTopX}
          y2={popupTopY}
          stroke="#007bff"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.6"
        />
      </svg>

      {/* Popup */}
      <div
        style={{
          position: 'absolute',
          left: popupX,
          top: popupY,
          zIndex: 1000,
          background: '#fff',
          border: '2px solid #007bff',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          minWidth: '280px',
          animation: 'fadeInUp 0.2s ease-out',
        }}
      >
      <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '14px' }}>
        👶 Add Child to {selectedParent.name}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <Input
          innerRef={nameInputRef}
          type="text"
          placeholder="Child's name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          disabled={isSubmitting}
          style={{ fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          disabled={isSubmitting}
          bsSize="sm"
          style={{ fontSize: '12px', flex: 1 }}
        />
        <span style={{ fontSize: '12px' }}>⚡</span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          color="success"
          size="sm"
          onClick={handleCreateChild}
          disabled={!name.trim() || isSubmitting}
          style={{ flex: 1 }}
        >
          {isSubmitting ? '⏳' : '✓'} Create
        </Button>
        <Button
          color="primary"
          size="sm"
          outline
          onClick={() => setChildPopupMode('multiple')}
          disabled={isSubmitting}
        >
          + Multiple
        </Button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
        💡 Press <kbd>Enter</kbd> to create • <kbd>Esc</kbd> to cancel
      </div>
      </div>
    </>
  );
};

/**
 * InlineChildPopup - Wrapper component that renders the appropriate form
 */
export const InlineChildPopup: React.FC = () => {
  const childPopupMode = useUIStore((state) => state.childPopupMode);
  const mode = useUIStore((state) => state.mode);

  // Only show popup in EDIT mode
  if (mode !== 'edit') {
    return null;
  }

  if (childPopupMode === 'single') {
    return <SingleChildQuickForm />;
  } else if (childPopupMode === 'multiple') {
    return <MultiChildQuickForm />;
  }

  return null;
};
