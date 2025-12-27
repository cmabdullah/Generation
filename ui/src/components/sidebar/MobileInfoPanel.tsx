import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge, Card } from 'reactstrap';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';
import { useResponsiveBreakpoint } from '../../hooks/useResponsiveBreakpoint';
import { findParent } from '../../utils/treeLayout';
import { getAvatarUrl } from '../../utils/avatarUtils';
import { getResponsiveNavbarHeight } from '../../utils/responsiveUtils';

/**
 * Mobile info panel displayed as a full-screen modal
 * Desktop/tablet: Uses the existing sidebar InfoPanel
 */
export const MobileInfoPanel: React.FC = () => {
  const { isMobile, breakpoint } = useResponsiveBreakpoint();
  const selectedNodeId = useTreeStore((state) => state.selectedNodeId);
  const rootPerson = useTreeStore((state) => state.rootPerson);
  const allPersons = useTreeStore((state) => state.allPersons);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const showInfoPanel = useUIStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useUIStore((state) => state.toggleInfoPanel);

  const selectedPerson = allPersons.find((p) => p.id === selectedNodeId);

  if (!showInfoPanel || !selectedNodeId || !selectedPerson) {
    return null;
  }

  const parent = rootPerson ? findParent(rootPerson, selectedNodeId) : null;
  const siblings = parent?.childs.filter((c) => c.id !== selectedNodeId) || [];

  const handleClose = () => {
    toggleInfoPanel();
    setSelectedNode(null);
  };

  // For desktop/tablet, return null (existing InfoPanel will be used)
  if (!isMobile) {
    return null;
  }

  const avatarUrl = getAvatarUrl(selectedPerson.avatar, selectedPerson.gender);

  return (
    <Modal
      isOpen={true}
      toggle={handleClose}
      fullscreen
      scrollable
      style={{ marginTop: getResponsiveNavbarHeight(breakpoint) }}
    >
      <ModalHeader toggle={handleClose} close={
        <Button
          close
          onClick={handleClose}
          style={{ fontSize: '24px' }}
        />
      }>
        Person Details
      </ModalHeader>

      <ModalBody className="p-0">
        {/* Header with Avatar */}
        <div
          className="text-center p-4"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <img
            src={avatarUrl}
            alt={selectedPerson.name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              objectFit: 'cover'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getAvatarUrl('', selectedPerson.gender);
            }}
          />
          <h3 className="mt-3 mb-2">{selectedPerson.name}</h3>
          <Badge color="light" className="fw-bold">
            Generation {selectedPerson.level}
          </Badge>
        </div>

        {/* Details */}
        <div className="p-3">
          {/* Basic Info Card */}
          <Card className="mb-3 shadow-sm">
            <div className="p-3">
              <h6 className="fw-bold mb-3">Basic Information</h6>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Signature</small>
                <Badge color="primary" className="fs-6">
                  {selectedPerson.signature}
                </Badge>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block mb-1">ID</small>
                <div className="fw-medium">{selectedPerson.id}</div>
              </div>

              {selectedPerson.spouse && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Spouse</small>
                  <div className="fw-medium">💑 {selectedPerson.spouse}</div>
                </div>
              )}

              <div className="mb-3">
                <small className="text-muted d-block mb-1">Address</small>
                <div className="fw-medium">📍 {selectedPerson.address || 'N/A'}</div>
              </div>

              <div>
                <small className="text-muted d-block mb-1">Mobile</small>
                <div className="fw-medium">📱 {selectedPerson.mobile || 'N/A'}</div>
              </div>
            </div>
          </Card>

          {/* Relationships */}
          <Card className="mb-3 shadow-sm">
            <div className="p-3">
              <h6 className="fw-bold mb-3">Relationships</h6>

              {/* Parent */}
              {parent && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">Parent</small>
                  <Button
                    color="outline-primary"
                    size="sm"
                    block
                    onClick={() => setSelectedNode(parent.id)}
                    className="text-start"
                  >
                    👨‍👩 {parent.name}
                  </Button>
                </div>
              )}

              {/* Siblings */}
              {siblings.length > 0 && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-2">
                    Siblings ({siblings.length})
                  </small>
                  {siblings.map((sibling) => (
                    <Button
                      key={sibling.id}
                      color="outline-secondary"
                      size="sm"
                      block
                      onClick={() => setSelectedNode(sibling.id)}
                      className="text-start mb-2"
                    >
                      👫 {sibling.name}
                    </Button>
                  ))}
                </div>
              )}

              {/* Children */}
              {selectedPerson.childs && selectedPerson.childs.length > 0 && (
                <div>
                  <small className="text-muted d-block mb-2">
                    Children ({selectedPerson.childs.length})
                  </small>
                  {selectedPerson.childs.map((child) => (
                    <Button
                      key={child.id}
                      color="outline-success"
                      size="sm"
                      block
                      onClick={() => setSelectedNode(child.id)}
                      className="text-start mb-2"
                    >
                      👶 {child.name}
                    </Button>
                  ))}
                </div>
              )}

              {!parent && siblings.length === 0 && (!selectedPerson.childs || selectedPerson.childs.length === 0) && (
                <div className="text-muted text-center py-3">
                  <small>No relationships recorded</small>
                </div>
              )}
            </div>
          </Card>
        </div>
      </ModalBody>

      <ModalFooter className="justify-content-center">
        <Button color="secondary" onClick={handleClose} size="lg" block>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
