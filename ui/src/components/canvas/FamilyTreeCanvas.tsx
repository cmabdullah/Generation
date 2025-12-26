import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { TreeNodeComponent } from './TreeNodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { ContextMenu } from './ContextMenu';
import { AddPersonModal } from '../modals/AddPersonModal';
import { EditPersonModal } from '../modals/EditPersonModal';
import { DeletePersonModal } from '../modals/DeletePersonModal';
import { InlineChildPopup } from './InlineChildPopup';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';
import { useViewportPreservation } from '../../hooks/useViewportPreservation';
import { NODE_DIMENSIONS, LAYOUT_CONSTANTS } from '../../constants/dimensions';
import { throttleWheel } from '../../utils/smoothZoom';
import type { Connection, TreeNode } from '../../models/TreeNode';
import type { Person } from '../../models/Person';

/**
 * Main canvas component using Konva for rendering the family tree
 */
export const FamilyTreeCanvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const zoomTimeoutRef = useRef<number | null>(null);

  // Track window dimensions for responsive canvas
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const allNodes = useTreeStore((state) => state.allNodes);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const setShowInfoPanel = useUIStore((state) => state.setShowInfoPanel);
  const zoom = useUIStore((state) => state.zoom);
  const panX = useUIStore((state) => state.panX);
  const panY = useUIStore((state) => state.panY);
  const setZoom = useUIStore((state) => state.setZoom);
  const setPan = useUIStore((state) => state.setPan);
  const mode = useUIStore((state) => state.mode);
  const setIsZooming = useUIStore((state) => state.setIsZooming);
  const clearSelectedParent = useUIStore((state) => state.clearSelectedParent);

  // Preserve viewport during tree operations to prevent unexpected jumps
  useViewportPreservation();

  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: TreeNode | null;
  }>({ visible: false, x: 0, y: 0, node: null });

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [parentIdForAdd, setParentIdForAdd] = useState<string | undefined>(undefined);

  // Memoize Stage configuration to prevent unnecessary re-renders
  // Only re-calculate when viewport state or window size changes
  const stageConfig = useMemo(() => ({
    width: windowSize.width,
    height: windowSize.height,
    scaleX: zoom,
    scaleY: zoom,
    x: panX,
    y: panY,
  }), [windowSize.width, windowSize.height, zoom, panX, panY]);

  // Viewport culling: Only render nodes visible in the current viewport
  // This is the biggest performance optimization - reduces render from 1,532 to ~50-100 nodes
  const visibleNodes = useMemo(() => {
    // Calculate viewport bounds in world coordinates
    const viewportBounds = {
      left: -panX / zoom,
      right: (-panX + windowSize.width) / zoom,
      top: -panY / zoom,
      bottom: (-panY + windowSize.height) / zoom,
    };

    // Add padding to include nodes slightly outside viewport (for smooth scrolling)
    const padding = 200; // pixels
    viewportBounds.left -= padding;
    viewportBounds.right += padding;
    viewportBounds.top -= padding;
    viewportBounds.bottom += padding;

    // Filter nodes that intersect with viewport
    return allNodes.filter((node) => {
      const nodeRight = node.x + NODE_DIMENSIONS.width;
      const nodeBottom = node.y + NODE_DIMENSIONS.height;

      // Check if node is completely outside viewport (inverted logic for early exit)
      const isOutside =
        nodeRight < viewportBounds.left ||
        node.x > viewportBounds.right ||
        nodeBottom < viewportBounds.top ||
        node.y > viewportBounds.bottom;

      return !isOutside; // Include if not outside
    });
  }, [allNodes, zoom, panX, panY, windowSize.width, windowSize.height]);

  // Calculate connections between nodes
  // Optimized with Map for O(1) lookups instead of O(n) find()
  // Only calculates connections for visible nodes
  const connections: Connection[] = useMemo(() => {
    // Build lookup map once: O(n) instead of O(n²)
    const nodeMap = new Map(allNodes.map((node) => [node.id, node]));

    const conns: Connection[] = [];
    // Only iterate through visible nodes to create connections
    visibleNodes.forEach((node) => {
      node.childs.forEach((child) => {
        const childNode = nodeMap.get(child.id); // O(1) lookup!
        // Only add connection if child is also visible (or close to viewport)
        if (childNode) {
          conns.push({
            id: `${node.id}-${child.id}`,
            from: {
              x: node.x + NODE_DIMENSIONS.width / 2,
              y: node.y + NODE_DIMENSIONS.height,
            },
            to: {
              x: childNode.x + NODE_DIMENSIONS.width / 2,
              y: childNode.y,
            },
          });
        }
      });
    });
    return conns;
  }, [allNodes, visibleNodes]);

  // Handle zoom with mouse wheel (memoized with useCallback for performance)
  const handleWheelCore = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    // Disable hover effects during zoom for better performance
    setIsZooming(true);

    // Clear previous timeout
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }

    // Use faster zoom factor from constants (1.08 instead of 1.05 = 60% faster)
    const scaleBy = LAYOUT_CONSTANTS.wheelZoomFactor;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = zoom;
    const pointer = stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - panX) / oldScale,
      y: (pointer.y - panY) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setZoom(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setPan(newPos.x, newPos.y);

    // Re-enable hover effects 150ms after last zoom event
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZooming(false);
    }, 150);
  }, [zoom, panX, panY, setZoom, setPan, setIsZooming]);

  // Throttled wheel handler - limits to 16ms (60fps) for smoother performance
  const handleWheel = useMemo(
    () => throttleWheel(handleWheelCore, 16),
    [handleWheelCore]
  );

  // Handle stage drag (pan) in view mode
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Only update pan if this is actually the Stage, not a node
    if (e.target === stageRef.current) {
      setPan(e.target.x(), e.target.y());
    }
  };

  // Click on stage background to deselect parent
  const handleStageClick = useCallback((e: any) => {
    // Only clear if clicking the stage itself (not a node)
    if (e.target === e.target.getStage()) {
      clearSelectedParent();
    }
  }, [clearSelectedParent]);

  // Handle right-click on node
  const handleNodeRightClick = (node: TreeNode, x: number, y: number) => {
    setContextMenu({ visible: true, x, y, node });
  };

  // Context menu handlers
  const handleAddChild = () => {
    if (contextMenu.node) {
      setParentIdForAdd(contextMenu.node.id);
      setAddModalOpen(true);
    }
  };

  const handleEdit = () => {
    if (contextMenu.node) {
      setSelectedPerson(contextMenu.node as Person);
      setEditModalOpen(true);
    }
  };

  const handleDelete = () => {
    if (contextMenu.node) {
      setSelectedPerson(contextMenu.node as Person);
      setDeleteModalOpen(true);
    }
  };

  const handleViewDetails = () => {
    if (contextMenu.node) {
      setSelectedNode(contextMenu.node.id);
      setShowInfoPanel(true);
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Stage
        ref={stageRef}
        {...stageConfig}
        onWheel={handleWheel}
        draggable={mode === 'view'}
        onDragEnd={handleDragEnd}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        {/* Connections layer */}
        <Layer>
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              from={connection.from}
              to={connection.to}
            />
          ))}
        </Layer>

        {/* Nodes layer - only renders visible nodes (viewport culling) */}
        <Layer>
          {visibleNodes.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              onRightClick={handleNodeRightClick}
            />
          ))}
        </Layer>
      </Stage>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.node && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          person={contextMenu.node as Person}
          onAddChild={handleAddChild}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        />
      )}

      {/* Modals */}
      <AddPersonModal
        isOpen={addModalOpen}
        toggle={() => {
          setAddModalOpen(false);
          setParentIdForAdd(undefined);
        }}
        parentId={parentIdForAdd}
      />

      <EditPersonModal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen(false)}
        person={selectedPerson}
      />

      <DeletePersonModal
        isOpen={deleteModalOpen}
        toggle={() => setDeleteModalOpen(false)}
        person={selectedPerson}
      />

      {/* Inline Child Popup - rendered outside Stage for proper HTML rendering */}
      <InlineChildPopup />
    </div>
  );
};
