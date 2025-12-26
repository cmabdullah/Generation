import { memo } from 'react';
import { Line } from 'react-konva';
import { UI_COLORS } from '../../constants/colors';

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/**
 * Curved connection line between parent and child nodes
 * Uses Bezier curves for smooth appearance
 * Memoized to prevent unnecessary re-renders
 */
const ConnectionLineBase: React.FC<ConnectionLineProps> = ({ from, to }) => {
  const midY = (from.y + to.y) / 2;

  // Create curved path using Bezier control points
  const points = [
    from.x,
    from.y,
    from.x,
    midY,
    to.x,
    midY,
    to.x,
    to.y,
  ];

  return (
    <Line
      points={points}
      stroke={UI_COLORS.connection}
      strokeWidth={2}
      tension={0.5}
      bezier
      listening={false}
    />
  );
};

/**
 * Memoized ConnectionLine - only re-renders when coordinates change
 */
export const ConnectionLine = memo(ConnectionLineBase, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return (
    prevProps.from.x === nextProps.from.x &&
    prevProps.from.y === nextProps.from.y &&
    prevProps.to.x === nextProps.to.x &&
    prevProps.to.y === nextProps.to.y
  );
});
