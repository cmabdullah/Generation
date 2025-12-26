import React, { useState, useEffect } from 'react';
import { Input, Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { familyTreeService } from '../../services/familyTreeService';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';

interface ChildRow {
  tempId: string;
  name: string;
  id: string;
}

/**
 * MultiChildQuickForm - Batch add multiple children at once
 */
export const MultiChildQuickForm: React.FC = () => {
  const selectedParent = useUIStore((state) => state.selectedParentNode);
  const childPopupMode = useUIStore((state) => state.childPopupMode);
  const setChildPopupMode = useUIStore((state) => state.setChildPopupMode);
  const clearSelectedParent = useUIStore((state) => state.clearSelectedParent);
  const loadTree = useTreeStore((state) => state.loadTree);
  const zoom = useUIStore((state) => state.zoom);
  const panX = useUIStore((state) => state.panX);
  const panY = useUIStore((state) => state.panY);

  const [children, setChildren] = useState<ChildRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: Create child row
  const createChildRow = (_parentId: string, parentLevel: number, index: number): ChildRow => {
    const nextLevel = parentLevel + 1;
    const timestamp = Date.now().toString(36).slice(-4);

    return {
      tempId: `temp-${Date.now()}-${index}`,
      name: '',
      id: `gen${nextLevel}-${timestamp}-${index}`,
    };
  };

  // Initialize with 3 empty rows
  useEffect(() => {
    if (selectedParent && childPopupMode === 'multiple') {
      setChildren([
        createChildRow(selectedParent.id, selectedParent.level, 0),
        createChildRow(selectedParent.id, selectedParent.level, 1),
        createChildRow(selectedParent.id, selectedParent.level, 2),
      ]);
    }
  }, [selectedParent, childPopupMode]);

  const addRow = () => {
    if (!selectedParent) return;
    setChildren([
      ...children,
      createChildRow(selectedParent.id, selectedParent.level, children.length),
    ]);
  };

  const removeRow = (tempId: string) => {
    setChildren(children.filter((c) => c.tempId !== tempId));
  };

  const updateName = (tempId: string, name: string) => {
    setChildren(children.map((c) =>
      c.tempId === tempId ? { ...c, name } : c
    ));
  };

  const handleCreateAll = async () => {
    if (!selectedParent) return;

    // Validate: all must have names
    const filledChildren = children.filter((c) => c.name.trim());

    if (filledChildren.length === 0) {
      toast.error('Please enter at least one child name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create all in parallel
      await Promise.all(
        filledChildren.map((child) =>
          familyTreeService.createPerson({
            id: child.id,
            name: child.name.trim(),
            parentId: selectedParent.id,
            level: selectedParent.level + 1,
            address: 'Dhaka',
            signature: child.name.trim().substring(0, 2).toUpperCase(),
            avatar: 'io.jpeg',
          })
        )
      );

      toast.success(`✅ Created ${filledChildren.length} children!`);

      // Reload tree
      await loadTree();

      // Close popup
      clearSelectedParent();

    } catch (error: any) {
      console.error('Failed to create children:', error);
      toast.error('Failed to create some children');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedParent || childPopupMode !== 'multiple') return;

      if (e.key === 'Escape') {
        setChildPopupMode('single');
      } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleCreateAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedParent, childPopupMode, children]);

  if (!selectedParent || childPopupMode !== 'multiple') return null;

  // Calculate popup position in screen coordinates
  const popupX = selectedParent.position.x * zoom + panX - 150;
  const popupY = selectedParent.position.y * zoom + panY + 130;

  return (
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
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        minWidth: '400px',
        maxWidth: '500px',
        animation: 'fadeInUp 0.2s ease-out',
      }}
    >
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
          👨‍👩‍👧‍👦 Add Children to {selectedParent.name}
        </div>
        <Button
          color="link"
          size="sm"
          onClick={() => setChildPopupMode('single')}
          style={{ padding: '0 4px' }}
        >
          ← Single
        </Button>
      </div>

      <div style={{ marginBottom: '12px', maxHeight: '300px', overflowY: 'auto' }}>
        {children.map((child, index) => (
          <div
            key={child.tempId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              padding: '8px',
              background: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <span style={{ fontWeight: 'bold', minWidth: '20px' }}>
              {index + 1}.
            </span>
            <Input
              type="text"
              placeholder="Name"
              value={child.name}
              onChange={(e) => updateName(child.tempId, e.target.value)}
              disabled={isSubmitting}
              bsSize="sm"
              style={{ flex: 1 }}
            />
            <Input
              type="text"
              value={child.id}
              disabled
              bsSize="sm"
              style={{ width: '120px', fontSize: '11px' }}
            />
            <Button
              color="link"
              size="sm"
              onClick={() => removeRow(child.tempId)}
              disabled={isSubmitting || children.length === 1}
              style={{ padding: '0 4px', color: '#dc3545' }}
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <Button
          color="secondary"
          size="sm"
          outline
          onClick={addRow}
          disabled={isSubmitting}
        >
          + Add Row
        </Button>
        <Button
          color="success"
          size="sm"
          onClick={handleCreateAll}
          disabled={isSubmitting || children.every((c) => !c.name.trim())}
          style={{ flex: 1 }}
        >
          {isSubmitting ? '⏳ Creating...' : `✓ Create All (${children.filter(c => c.name.trim()).length})`}
        </Button>
      </div>

      <div style={{ fontSize: '11px', color: '#666' }}>
        💡 Press <kbd>Ctrl+Enter</kbd> to create • <kbd>Esc</kbd> to go back
      </div>
    </div>
  );
};
