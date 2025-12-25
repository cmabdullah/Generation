import { useState } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import { TreeNode } from '../../models/TreeNode';
import { NODE_DIMENSIONS } from '../../constants/dimensions';
import { getColorForLevel, UI_COLORS } from '../../constants/colors';
import { useUIStore } from '../../stores/uiStore';
import { useTreeStore } from '../../stores/treeStore';
import { useNodeDrag } from '../../hooks/useNodeDrag';

interface TreeNodeComponentProps {
  node: TreeNode;
  onRightClick?: (node: TreeNode, x: number, y: number) => void;
}

/**
 * Individual tree node component rendered with Konva
 * Displays person information and handles interactions
 */
export const TreeNodeComponent: React.FC<TreeNodeComponentProps> = ({ node, onRightClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mode = useUIStore((state) => state.mode);
  const selectedNodeId = useTreeStore((state) => state.selectedNodeId);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const { handleDragEnd } = useNodeDrag();

  const isSelected = selectedNodeId === node.id;
  const isDraggable = mode === 'edit';

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    if (onRightClick) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      onRightClick(node, pointerPos.x, pointerPos.y);
    }
  };

  // Truncate long names
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable={isDraggable}
      onDragEnd={(e) => handleDragEnd(node.id, e)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedNode(node.id)}
      onTap={() => setSelectedNode(node.id)}
      onContextMenu={handleContextMenu}
    >
      {/* Node card background */}
      <Rect
        width={NODE_DIMENSIONS.width}
        height={NODE_DIMENSIONS.height}
        fill={getColorForLevel(node.level)}
        cornerRadius={NODE_DIMENSIONS.cornerRadius}
        shadowBlur={isHovered || isSelected ? 10 : 0}
        shadowColor={UI_COLORS.shadow}
        shadowOpacity={0.3}
        stroke={isSelected ? UI_COLORS.selected : UI_COLORS.white}
        strokeWidth={isSelected ? 3 : 1}
      />

      {/* Name text */}
      <Text
        text={truncateName(node.name)}
        x={NODE_DIMENSIONS.padding}
        y={20}
        width={NODE_DIMENSIONS.width - 2 * NODE_DIMENSIONS.padding}
        fontSize={14}
        fontStyle="bold"
        fill={UI_COLORS.white}
        align="center"
        wrap="word"
      />

      {/* Address/Location */}
      <Text
        text={`📍 ${node.address || 'N/A'}`}
        x={NODE_DIMENSIONS.padding}
        y={55}
        width={NODE_DIMENSIONS.width - 2 * NODE_DIMENSIONS.padding}
        fontSize={12}
        fill={UI_COLORS.white}
        align="center"
      />

      {/* Signature badge */}
      <Circle
        x={NODE_DIMENSIONS.width / 2}
        y={NODE_DIMENSIONS.height - 26}
        radius={NODE_DIMENSIONS.signatureBadgeRadius}
        fill="#2c3e50"
        stroke={UI_COLORS.white}
        strokeWidth={2}
      />

      <Text
        text={node.signature || '?'}
        x={0}
        y={NODE_DIMENSIONS.height - 31}
        width={NODE_DIMENSIONS.width}
        fontSize={16}
        fontStyle="bold"
        fill={UI_COLORS.white}
        align="center"
      />
    </Group>
  );
};
