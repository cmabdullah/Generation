import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { familyTreeService } from '../../services/familyTreeService';
import { useTreeStore } from '../../stores/treeStore';
import { usePositionCacheStore } from '../../stores/positionCacheStore';
import { CacheInvalidationStrategy } from '../../utils/cacheInvalidation';
import { findParent } from '../../utils/treeLayout';
import type { Person } from '../../models/Person';

interface DeletePersonModalProps {
  isOpen: boolean;
  toggle: () => void;
  person: Person | null;
}

export const DeletePersonModal: React.FC<DeletePersonModalProps> = ({
  isOpen,
  toggle,
  person,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadTree = useTreeStore((state) => state.loadTree);
  const rootPerson = useTreeStore((state) => state.rootPerson);

  const handleDelete = async () => {
    if (!person) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Find parent before deleting
      const parent = rootPerson ? findParent(rootPerson, person.id) : null;

      await familyTreeService.deletePerson(person.id);

      toast.success(`Person "${person.name}" deleted successfully!`);

      // Invalidate affected cache entries
      if (rootPerson) {
        const toInvalidate = CacheInvalidationStrategy.onNodeDeleted(
          person.id,
          parent?.id || null,
          rootPerson
        );

        if (toInvalidate.length === 0) {
          // Deleting root - clear entire cache
          usePositionCacheStore.getState().clearCache();
        } else {
          usePositionCacheStore.getState().invalidateCache(toInvalidate);
        }
      }

      // Reload the tree to reflect deletion
      await loadTree();

      toggle();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete person';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    toggle();
  };

  if (!person) return null;

  const hasChildren = person.childs && person.childs.length > 0;

  return (
    <Modal isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className="bg-danger text-white">
        Confirm Delete
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}

        <div className="mb-3">
          <h5 className="text-danger">
            ⚠️ Are you sure you want to delete this person?
          </h5>
        </div>

        <div className="border rounded p-3 mb-3 bg-light">
          <p className="mb-1">
            <strong>Name:</strong> {person.name}
          </p>
          <p className="mb-1">
            <strong>ID:</strong> {person.id}
          </p>
          <p className="mb-1">
            <strong>Address:</strong> {person.address}
          </p>
          <p className="mb-0">
            <strong>Generation:</strong> Level {person.level}
          </p>
        </div>

        {hasChildren && (
          <Alert color="warning">
            <strong>Warning:</strong> This person has {person.childs.length}{' '}
            {person.childs.length === 1 ? 'child' : 'children'}. Deleting this person may
            affect the family tree structure.
          </Alert>
        )}

        <Alert color="danger" className="mb-0">
          <strong>This action cannot be undone!</strong>
        </Alert>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete Person'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
