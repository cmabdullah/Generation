import { useRef, useState, useMemo } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { TreeNodeComponent } from './TreeNodeComponent';
import { ConnectionLine } from './ConnectionLine';
import { ContextMenu } from './ContextMenu';
import { AddPersonModal } from '../modals/AddPersonModal';
import { EditPersonModal } from '../modals/EditPersonModal';
import { DeletePersonModal } from '../modals/DeletePersonModal';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';
import { NODE_DIMENSIONS } from '../../constants/dimensions';
import type { Connection, TreeNode } from '../../models/TreeNode';
import type { Person } from '../../models/Person';

/**
 * Main canvas component using Konva for rendering the family tree
 */
export const FamilyTreeCanvas: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);

  const allNodes = useTreeStore((state) => state.allNodes);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const setShowInfoPanel = useUIStore((state) => state.setShowInfoPanel);
  const zoom = useUIStore((state) => state.zoom);
  const panX = useUIStore((state) => state.panX);
  const panY = useUIStore((state) => state.panY);
  const setZoom = useUIStore((state) => state.setZoom);
  const setPan = useUIStore((state) => state.setPan);
  const mode = useUIStore((state) => state.mode);

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
  // Only re-calculate when viewport state changes
  const stageConfig = useMemo(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
    scaleX: zoom,
    scaleY: zoom,
    x: panX,
    y: panY,
  }), [zoom, panX, panY]);

  // Memoize nodes to prevent unnecessary re-renders
  const memoizedNodes = useMemo(() => allNodes, [allNodes]);

  // Calculate connections between nodes
  const connections: Connection[] = useMemo(() => {
    const conns: Connection[] = [];
    allNodes.forEach((node) => {
      node.childs.forEach((child) => {
        const childNode = allNodes.find((n) => n.id === child.id);
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
  }, [allNodes]);

  // Handle zoom with mouse wheel
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.05;
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
  };

  // Handle stage drag (pan) in view mode
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setPan(e.target.x(), e.target.y());
  };

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
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        {...stageConfig}
        onWheel={handleWheel}
        draggable={mode === 'view'}
        onDragEnd={handleDragEnd}
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

        {/* Nodes layer */}
        <Layer>
          {memoizedNodes.map((node) => (
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
    </div>
  );
};
