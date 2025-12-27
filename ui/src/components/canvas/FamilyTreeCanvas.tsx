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
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useIsMobile } from '../../utils/responsive';
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

  // Detect if on mobile device
  const isMobile = useIsMobile();

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
  const touchGesturesEnabled = useUIStore((state) => state.touchGesturesEnabled);
  const isPanModeActive = useUIStore((state) => state.isPanModeActive);

  // Preserve viewport during tree operations to prevent unexpected jumps
  useViewportPreservation();

  // Store initial zoom for pinch gesture
  const initialZoomRef = useRef<number>(zoom);

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

  // Helper function to find node at screen position
  const findNodeAtPoint = useCallback(
    (x: number, y: number): TreeNode | null => {
      // Convert screen coordinates to canvas coordinates
      const canvasX = (x - panX) / zoom;
      const canvasY = (y - panY) / zoom;

      // Find node at this position
      return (
        allNodes.find((node) => {
          return (
            canvasX >= node.x &&
            canvasX <= node.x + NODE_DIMENSIONS.width &&
            canvasY >= node.y &&
            canvasY <= node.y + NODE_DIMENSIONS.height
          );
        }) || null
      );
    },
    [allNodes, panX, panY, zoom]
  );

  // Touch gesture handlers
  const touchGestureHandlers = useTouchGestures({
    onPinchZoom: useCallback(
      (scale: number, center: { x: number; y: number }) => {
        if (!touchGesturesEnabled) return;

        // Update zoom based on pinch scale
        const newZoom = Math.max(
          LAYOUT_CONSTANTS.minZoom,
          Math.min(LAYOUT_CONSTANTS.maxZoom, initialZoomRef.current * scale)
        );

        setZoom(newZoom);
        setIsZooming(true);

        // Adjust pan to zoom towards pinch center
        const mousePointTo = {
          x: (center.x - panX) / zoom,
          y: (center.y - panY) / zoom,
        };

        const newPan = {
          x: center.x - mousePointTo.x * newZoom,
          y: center.y - mousePointTo.y * newZoom,
        };

        setPan(newPan.x, newPan.y);
      },
      [touchGesturesEnabled, panX, panY, zoom, setZoom, setPan, setIsZooming]
    ),

    onPan: useCallback(
      (deltaX: number, deltaY: number) => {
        if (!touchGesturesEnabled || mode !== 'view') return;

        // Apply pan delta
        setPan(panX + deltaX, panY + deltaY);
      },
      [touchGesturesEnabled, mode, panX, panY, setPan]
    ),

    onLongPress: useCallback(
      (point: { x: number; y: number }) => {
        if (!touchGesturesEnabled) return;

        // Find node at long-press position
        const node = findNodeAtPoint(point.x, point.y);

        if (node) {
          // Show context menu
          setContextMenu({
            visible: true,
            x: point.x,
            y: point.y,
            node,
          });
        }
      },
      [touchGesturesEnabled, findNodeAtPoint]
    ),

    onDoubleTap: useCallback(
      (point: { x: number; y: number }) => {
        if (!touchGesturesEnabled) return;

        // Zoom in on double-tap location
        const newZoom = Math.min(zoom * 2, LAYOUT_CONSTANTS.maxZoom);
        setZoom(newZoom);

        // Center on tap point
        const mousePointTo = {
          x: (point.x - panX) / zoom,
          y: (point.y - panY) / zoom,
        };

        const newPan = {
          x: point.x - mousePointTo.x * newZoom,
          y: point.y - mousePointTo.y * newZoom,
        };

        setPan(newPan.x, newPan.y);
      },
      [touchGesturesEnabled, zoom, panX, panY, setZoom, setPan]
    ),
  });

  // Update initial zoom reference when pinch starts
  useEffect(() => {
    initialZoomRef.current = zoom;
  }, [zoom]);

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
  // UPDATED: Connection lines now account for avatar overlap at top of child nodes
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
              // Connect from bottom-center of parent node
              x: node.x + NODE_DIMENSIONS.width / 2,
              y: node.y + NODE_DIMENSIONS.height,
            },
            to: {
              // Connect to top-center of child node, minus avatar overlap
              // This makes the line connect to the top of the card, not the overlapping avatar
              x: childNode.x + NODE_DIMENSIONS.width / 2,
              y: childNode.y - NODE_DIMENSIONS.avatarOverlap,
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

  // Click on stage background to deselect parent (only in edit mode)
  const handleStageClick = useCallback((e: any) => {
    // Only clear if clicking the stage itself (not a node) and in edit mode
    if (e.target === e.target.getStage() && mode === 'edit') {
      clearSelectedParent();
    }
  }, [clearSelectedParent, mode]);

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
    <div
      style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}
      className="no-overscroll no-select"
      {...(isMobile && touchGesturesEnabled && {
        onTouchStart: touchGestureHandlers.onTouchStart as any,
        onTouchMove: touchGestureHandlers.onTouchMove as any,
        onTouchEnd: touchGestureHandlers.onTouchEnd as any,
        onTouchCancel: touchGestureHandlers.onTouchCancel as any,
      })}
    >
      <Stage
        ref={stageRef}
        {...stageConfig}
        onWheel={handleWheel}
        draggable={mode === 'view' && (isPanModeActive || isMobile)}
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
