import { Card, CardBody, CardTitle, Button, Badge } from 'reactstrap';
import { useTreeStore } from '../../stores/treeStore';
import { useUIStore } from '../../stores/uiStore';
import { findParent } from '../../utils/treeLayout';

/**
 * Right sidebar info panel showing selected person details
 */
export const InfoPanel: React.FC = () => {
  const selectedNodeId = useTreeStore((state) => state.selectedNodeId);
  const rootPerson = useTreeStore((state) => state.rootPerson);
  const allPersons = useTreeStore((state) => state.allPersons);
  const setSelectedNode = useTreeStore((state) => state.setSelectedNode);
  const showInfoPanel = useUIStore((state) => state.showInfoPanel);
  const toggleInfoPanel = useUIStore((state) => state.toggleInfoPanel);

  if (!showInfoPanel || !selectedNodeId) {
    return null;
  }

  const selectedPerson = allPersons.find((p) => p.id === selectedNodeId);

  if (!selectedPerson) {
    return null;
  }

  const parent = rootPerson ? findParent(rootPerson, selectedNodeId) : null;
  const siblings = parent?.childs.filter((c) => c.id !== selectedNodeId) || [];

  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        right: 0,
        width: '350px',
        height: 'calc(100vh - 60px)',
        backgroundColor: 'white',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        zIndex: 999,
        padding: '20px',
      }}
    >
      {/* Close button */}
      <Button
        close
        onClick={() => {
          toggleInfoPanel();
          setSelectedNode(null);
        }}
        style={{ position: 'absolute', top: '10px', right: '10px' }}
      />

      <CardTitle tag="h5" className="mb-3">
        📋 Person Details
      </CardTitle>

      <Card className="mb-3">
        <CardBody>
          <h6 className="fw-bold">{selectedPerson.name}</h6>

          <div className="mt-3">
            <p className="mb-2">
              <strong>📝 Signature:</strong>{' '}
              <Badge color="primary">{selectedPerson.signature}</Badge>
            </p>

            <p className="mb-2">
              <strong>📍 Address:</strong> {selectedPerson.address || 'N/A'}
            </p>

            <p className="mb-2">
              <strong>🆔 ID:</strong> {selectedPerson.id}
            </p>

            <p className="mb-2">
              <strong>📊 Level:</strong> Generation {selectedPerson.level}
            </p>

            {selectedPerson.spouse && (
              <p className="mb-2">
                <strong>💑 Spouse:</strong> {selectedPerson.spouse}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Parent */}
      {parent && (
        <Card className="mb-3">
          <CardBody>
            <h6 className="fw-bold">👨‍👩 Parent</h6>
            <p
              className="mb-0 text-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedNode(parent.id)}
            >
              {parent.name}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Siblings */}
      {siblings.length > 0 && (
        <Card className="mb-3">
          <CardBody>
            <h6 className="fw-bold">👫 Siblings ({siblings.length})</h6>
            <ul className="list-unstyled mb-0">
              {siblings.map((sibling) => (
                <li
                  key={sibling.id}
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(sibling.id)}
                >
                  • {sibling.name}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Children */}
      {selectedPerson.childs && selectedPerson.childs.length > 0 && (
        <Card className="mb-3">
          <CardBody>
            <h6 className="fw-bold">
              👶 Children ({selectedPerson.childs.length})
            </h6>
            <ul className="list-unstyled mb-0">
              {selectedPerson.childs.map((child) => (
                <li
                  key={child.id}
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedNode(child.id)}
                >
                  • {child.name}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
