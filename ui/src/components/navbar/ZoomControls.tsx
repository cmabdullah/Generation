import { Button, ButtonGroup } from 'reactstrap';
import { useUIStore } from '../../stores/uiStore';

/**
 * Zoom control buttons for the canvas
 */
export const ZoomControls: React.FC = () => {
  const zoom = useUIStore((state) => state.zoom);
  const zoomIn = useUIStore((state) => state.zoomIn);
  const zoomOut = useUIStore((state) => state.zoomOut);
  const resetView = useUIStore((state) => state.resetView);

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <div className="d-flex align-items-center gap-2">
      <ButtonGroup size="sm">
        <Button color="secondary" onClick={zoomOut} title="Zoom Out">
          −
        </Button>
        <Button color="light" disabled style={{ minWidth: '60px' }}>
          {zoomPercentage}%
        </Button>
        <Button color="secondary" onClick={zoomIn} title="Zoom In">
          +
        </Button>
      </ButtonGroup>
      <Button color="primary" size="sm" onClick={resetView}>
        Reset View
      </Button>
    </div>
  );
};
