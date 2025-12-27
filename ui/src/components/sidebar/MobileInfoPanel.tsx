import { Card, CardBody, Badge } from 'reactstrap';
import { BottomSheet } from '../common/BottomSheet';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';
import { findParent } from '../../utils/treeLayout';

/**
 * Mobile info panel using Bottom Sheet pattern
 * Replaces desktop sidebar on mobile devices
 */
export const MobileInfoPanel: React.FC = () => {
  const selectedNodeId = useTreeStore((state) => state.selectedNodeId);
  const rootPerson = useTreeStore((state) => state.rootPerson);
  const allPersons = useTreeStore((state) => state.allPersons);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const showInfoPanel = useUIStore((state) => state.showInfoPanel);
  const setShowInfoPanel = useUIStore((state) => state.setShowInfoPanel);

  if (!selectedNodeId) {
    return null;
  }

  const selectedPerson = allPersons.find((p) => p.id === selectedNodeId);

  if (!selectedPerson) {
    return null;
  }

  const parent = rootPerson ? findParent(rootPerson, selectedNodeId) : null;
  const siblings = parent?.childs.filter((c) => c.id !== selectedNodeId) || [];

  const handleClose = () => {
    setShowInfoPanel(false);
    setSelectedNode(null);
  };

  return (
    <BottomSheet
      isOpen={showInfoPanel}
      onClose={handleClose}
      snapPoints={[0.5, 0.9]}
      header={
        <div className="text-center p-3">
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e9ecef',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}
          >
            👤
          </div>
          <h5 className="mb-0">{selectedPerson.name}</h5>
          <Badge color="primary" className="mt-2">
            {selectedPerson.signature}
          </Badge>
        </div>
      }
    >
      <div className="p-4">
        {/* Person Details */}
        <Card className="mb-3">
          <CardBody>
            <h6 className="fw-bold mb-3">Details</h6>

            <div className="mb-2">
              <strong>📍 Address:</strong>
              <div className="text-muted">{selectedPerson.address || 'N/A'}</div>
            </div>

            <div className="mb-2">
              <strong>📊 Generation:</strong>
              <div className="text-muted">Level {selectedPerson.level}</div>
            </div>

            <div className="mb-2">
              <strong>🆔 ID:</strong>
              <div className="text-muted text-truncate">{selectedPerson.id}</div>
            </div>

            {selectedPerson.spouse && (
              <div className="mb-2">
                <strong>💑 Spouse:</strong>
                <div className="text-muted">{selectedPerson.spouse}</div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Parent */}
        {parent && (
          <Card className="mb-3">
            <CardBody>
              <h6 className="fw-bold mb-2">👨‍👩 Parent</h6>
              <div
                className="text-primary"
                style={{
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: '#f8f9fa',
                }}
                onClick={() => setSelectedNode(parent.id)}
                role="button"
                tabIndex={0}
              >
                {parent.name}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Siblings */}
        {siblings.length > 0 && (
          <Card className="mb-3">
            <CardBody>
              <h6 className="fw-bold mb-2">👫 Siblings ({siblings.length})</h6>
              <div className="d-flex flex-column gap-2">
                {siblings.map((sibling) => (
                  <div
                    key={sibling.id}
                    className="text-primary"
                    style={{
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      backgroundColor: '#f8f9fa',
                    }}
                    onClick={() => setSelectedNode(sibling.id)}
                    role="button"
                    tabIndex={0}
                  >
                    • {sibling.name}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Children */}
        {selectedPerson.childs && selectedPerson.childs.length > 0 && (
          <Card className="mb-3">
            <CardBody>
              <h6 className="fw-bold mb-2">
                👶 Children ({selectedPerson.childs.length})
              </h6>
              <div className="d-flex flex-column gap-2">
                {selectedPerson.childs.map((child) => (
                  <div
                    key={child.id}
                    className="text-primary"
                    style={{
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      backgroundColor: '#f8f9fa',
                    }}
                    onClick={() => setSelectedNode(child.id)}
                    role="button"
                    tabIndex={0}
                  >
                    • {child.name}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </BottomSheet>
  );
};
