import { useState, memo, useEffect, useMemo } from 'react';
import { Group, Rect, Text, Circle, Image } from 'react-konva';
import type { TreeNode } from '../../models/TreeNode';
import { NODE_DIMENSIONS, getNodeDimensions } from '../../constants/dimensions';
import { getColorForLevel, UI_COLORS } from '../../constants/colors';
import { useUIStore } from '../../stores/uiStore';
import { useTreeStore } from '../../stores/treeStore';
import { useNodeDrag } from '../../hooks/useNodeDrag';
import { useViewportSize } from '../../hooks/useViewportSize';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { formatMobile, truncateText, formatGeneration, getAdaptiveMultilineTextSize } from '../../utils/formatUtils';

interface TreeNodeComponentProps {
  node: TreeNode;
  onRightClick?: (node: TreeNode, x: number, y: number) => void;
}

// Cache for loaded images (prevents re-loading same image)
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Avatar Image Component
 * Loads and renders avatar image with circular clipping
 * Uses native Image() constructor instead of external library
 */
const AvatarImage: React.FC<{ avatarUrl: string; x: number; y: number; radius: number }> = ({
  avatarUrl,
  x,
  y,
  radius,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    if (imageCache.has(avatarUrl)) {
      setImage(imageCache.get(avatarUrl)!);
      setIsLoading(false);
      return;
    }

    // Load image using native Image constructor
    const img = new window.Image();

    // Don't set crossOrigin for local files - this can cause CORS issues
    // Only set for external URLs
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      // Cache the loaded image
      imageCache.set(avatarUrl, img);
      setImage(img);
      setIsLoading(false);
      console.log(`✅ Avatar loaded successfully: ${avatarUrl}`);
    };

    img.onerror = (error) => {
      console.error(`❌ Failed to load avatar: ${avatarUrl}`, error);
      // Still set loading to false to show placeholder
      setIsLoading(false);
    };

    console.log(`🔄 Loading avatar: ${avatarUrl}`);
    img.src = avatarUrl;

    return () => {
      // Cleanup: cancel loading if component unmounts
      img.onload = null;
      img.onerror = null;
    };
  }, [avatarUrl]);

  if (isLoading || !image) {
    // Show placeholder circle while loading
    return (
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill="#E0E0E0"
        stroke="#FFFFFF"
        strokeWidth={NODE_DIMENSIONS.avatarBorderWidth}
      />
    );
  }

  return (
    <Image
      image={image}
      x={x - radius}
      y={y - radius}
      width={radius * 2}
      height={radius * 2}
      clipFunc={(ctx: CanvasRenderingContext2D) => {
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.closePath();
      }}
    />
  );
};

/**
 * Individual tree node component rendered with Konva
 * NEW DESIGN: Floating Avatar - Elegant
 * - Avatar centered at top, overlapping card edge
 * - Separate dummy avatars for male/female (SVG data URIs)
 * - Name, address, mobile centered vertically
 * - Generation level at bottom (subtle)
 * - No signature badge (cleaner design)
 */
const TreeNodeComponentBase: React.FC<TreeNodeComponentProps> = ({ node, onRightClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const mode = useUIStore((state) => state.mode);
  const isZooming = useUIStore((state) => state.isZooming);
  const selectedNodeId = useTreeStore((state) => state.selectedNodeId);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const setSelectedParent = useUIStore((state) => state.setSelectedParent);
  const selectedParentNode = useUIStore((state) => state.selectedParentNode);
  const { handleDragEnd } = useNodeDrag();

  // Get responsive dimensions based on viewport
  const viewport = useViewportSize();
  const dimensions = useMemo(() => getNodeDimensions(viewport), [viewport.width, viewport.height]);

  const isSelected = selectedNodeId === node.id;
  const isSelectedAsParent = selectedParentNode?.id === node.id;
  const isDraggable = mode === 'edit';

  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
    if (onRightClick) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      onRightClick(node, pointerPos.x, pointerPos.y);
    }
  };

  const handleNodeClick = (e: any) => {
    e.cancelBubble = true; // Prevent stage click

    // Set as selected node for info panel (always)
    setSelectedNode(node.id);

    // Only set as selected parent for inline popup in EDIT mode
    if (mode === 'edit') {
      setSelectedParent({
        id: node.id,
        name: node.name,
        level: node.level || 1,
        position: {
          x: node.x,
          y: node.y,
        },
      });
    }
  };

  // Calculate positions based on responsive design specs
  const cardWidth = dimensions.width;
  const cardHeight = dimensions.height;
  const avatarRadius = dimensions.avatarSize / 2;
  const avatarCenterX = cardWidth / 2;
  const avatarCenterY = avatarRadius - dimensions.avatarOverlap;

  // Get avatar URL with gender-based placeholder (uses SVG data URIs)
  const avatarUrl = getAvatarUrl(node.avatar, node.gender);

  // Calculate adaptive multi-line text size for name (with 8px padding on each side)
  const namePadding = 16; // 8px on each side
  const availableNameWidth = cardWidth - namePadding;
  const {
    fontSize: nameFontSize,
    displayText: nameDisplayText,
    needsWrapping
  } = getAdaptiveMultilineTextSize(
    node.name,
    availableNameWidth,
    2, // Allow up to 2 lines
    [dimensions.fontSize.name, dimensions.fontSize.name - 1, dimensions.fontSize.name - 2, dimensions.fontSize.name - 3],
    '600' // Font weight
  );

  // Text Y positions (adjusted for potential 2-line names and responsive sizing)
  const nameY = avatarCenterY + avatarRadius + 8;
  const nameLineHeight = nameFontSize * 1.3; // 1.3 line height multiplier
  const nameHeight = needsWrapping ? nameLineHeight * 2 : nameLineHeight;

  // Adjust positions based on whether name wraps and responsive sizing
  const addressY = nameY + nameHeight + 6;
  const mobileY = addressY + (dimensions.fontSize.details * 1.5);
  const generationY = cardHeight - dimensions.fontSize.details - 8;

  return (
    <Group
      x={node.x}
      y={node.y}
      draggable={isDraggable}
      onDragEnd={(e) => {
        e.cancelBubble = true;
        handleDragEnd(node.id, e);
      }}
      onMouseEnter={() => !isZooming && setIsHovered(true)}
      onMouseLeave={() => !isZooming && setIsHovered(false)}
      onClick={handleNodeClick}
      onTap={handleNodeClick}
      onContextMenu={handleContextMenu}
    >
      {/* Card background */}
      <Rect
        width={cardWidth}
        height={cardHeight}
        fill={getColorForLevel(node.level)}
        cornerRadius={dimensions.cornerRadius}
        shadowBlur={isHovered || isSelected || isSelectedAsParent ? 15 : 0}
        shadowOffsetY={isHovered || isSelected || isSelectedAsParent ? 6 : 0}
        shadowColor="rgba(0,0,0,0.25)"
        shadowOpacity={0.35}
        stroke={isSelected || isSelectedAsParent ? UI_COLORS.selected : UI_COLORS.white}
        strokeWidth={isSelected || isSelectedAsParent ? 3 : 1}
      />

      {/* Avatar shadow (behind avatar) */}
      <Circle
        x={avatarCenterX}
        y={avatarCenterY}
        radius={avatarRadius}
        fill="transparent"
        shadowColor="rgba(0,0,0,0.25)"
        shadowBlur={12}
        shadowOffsetY={4}
      />

      {/* Avatar image (circular) - uses separate dummy avatars for male/female */}
      <AvatarImage
        avatarUrl={avatarUrl}
        x={avatarCenterX}
        y={avatarCenterY}
        radius={avatarRadius}
      />

      {/* Avatar border */}
      <Circle
        x={avatarCenterX}
        y={avatarCenterY}
        radius={avatarRadius}
        stroke={isSelected || isSelectedAsParent ? UI_COLORS.selected : UI_COLORS.white}
        strokeWidth={isSelected || isSelectedAsParent ? 4 : dimensions.avatarBorderWidth}
      />

      {/* Name text - adaptive sizing with multi-line support */}
      <Text
        text={nameDisplayText}
        x={namePadding / 2}
        y={nameY}
        width={availableNameWidth}
        height={nameHeight}
        fontSize={nameFontSize}
        fontStyle="600"
        fill={UI_COLORS.white}
        align="center"
        verticalAlign="top"
        wrap="word"
        lineHeight={1.3}
      />

      {/* Address with icon */}
      <Text
        text={`📍 ${truncateText(node.address || 'N/A', 18)}`}
        x={0}
        y={addressY}
        width={cardWidth}
        fontSize={dimensions.fontSize.details}
        fill={UI_COLORS.white}
        align="center"
      />

      {/* Mobile number with icon */}
      <Text
        text={`📱 ${formatMobile(node.mobile)}`}
        x={0}
        y={mobileY}
        width={cardWidth}
        fontSize={dimensions.fontSize.details}
        fill={UI_COLORS.white}
        align="center"
      />

      {/* Generation level (subtle) */}
      <Text
        text={formatGeneration(node.level)}
        x={0}
        y={generationY}
        width={cardWidth}
        fontSize={dimensions.fontSize.details - 2}
        fill={UI_COLORS.white}
        opacity={0.7}
        align="center"
      />
    </Group>
  );
};

/**
 * Memoized TreeNodeComponent - only re-renders when node data actually changes
 * Custom comparison checks critical node properties for optimal performance
 */
export const TreeNodeComponent = memo(TreeNodeComponentBase, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props changed (do re-render)
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.x === nextProps.node.x &&
    prevProps.node.y === nextProps.node.y &&
    prevProps.node.name === nextProps.node.name &&
    prevProps.node.address === nextProps.node.address &&
    prevProps.node.mobile === nextProps.node.mobile &&
    prevProps.node.gender === nextProps.node.gender &&
    prevProps.node.avatar === nextProps.node.avatar &&
    prevProps.node.level === nextProps.node.level
  );
});
