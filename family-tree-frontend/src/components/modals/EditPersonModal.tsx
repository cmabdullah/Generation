import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { familyTreeService } from '../../services/familyTreeService';
import { useTreeStore } from '../../stores/treeStore';
import { Person } from '../../models/Person';

interface EditPersonModalProps {
  isOpen: boolean;
  toggle: () => void;
  person: Person | null;
}

interface EditPersonFormData {
  name: string;
  avatar: string;
  address: string;
  level: number;
  signature: string;
  spouse?: string;
}

export const EditPersonModal: React.FC<EditPersonModalProps> = ({
  isOpen,
  toggle,
  person,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadTree = useTreeStore((state) => state.loadTree);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditPersonFormData>();

  // Populate form when person changes
  useEffect(() => {
    if (person) {
      setValue('name', person.name);
      setValue('avatar', person.avatar);
      setValue('address', person.address);
      setValue('level', person.level);
      setValue('signature', person.signature);
      setValue('spouse', person.spouse || '');
    }
  }, [person, setValue]);

  const onSubmit = async (data: EditPersonFormData) => {
    if (!person) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await familyTreeService.updatePerson(person.id, data);

      toast.success(`Person "${data.name}" updated successfully!`);

      // Reload the tree to show the updates
      await loadTree();

      reset();
      toggle();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update person';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    toggle();
  };

  if (!person) return null;

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Edit Person: {person.name}</ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}

          <FormGroup>
            <Label for="edit-id">ID</Label>
            <Input id="edit-id" type="text" value={person.id} disabled />
            <small className="form-text text-muted">ID cannot be changed</small>
          </FormGroup>

          <FormGroup>
            <Label for="edit-name">
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-name"
              type="text"
              placeholder="Full name"
              {...register('name', { required: 'Name is required' })}
              invalid={!!errors.name}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
          </FormGroup>

          <FormGroup>
            <Label for="edit-address">
              Address <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-address"
              type="text"
              placeholder="City, Country"
              {...register('address', { required: 'Address is required' })}
              invalid={!!errors.address}
            />
            {errors.address && (
              <div className="invalid-feedback d-block">{errors.address.message}</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="edit-level">
              Generation Level <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-level"
              type="number"
              min="1"
              max="10"
              placeholder="1-10"
              {...register('level', {
                required: 'Level is required',
                min: { value: 1, message: 'Level must be at least 1' },
                max: { value: 10, message: 'Level cannot exceed 10' },
                valueAsNumber: true,
              })}
              invalid={!!errors.level}
            />
            {errors.level && <div className="invalid-feedback d-block">{errors.level.message}</div>}
            <small className="form-text text-muted">
              Generation level determines node color (1=root, 2=children, etc.)
            </small>
          </FormGroup>

          <FormGroup>
            <Label for="edit-signature">
              Signature <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-signature"
              type="text"
              maxLength={3}
              placeholder="e.g., AB or LL"
              {...register('signature', {
                required: 'Signature is required',
                maxLength: { value: 3, message: 'Signature cannot exceed 3 characters' },
              })}
              invalid={!!errors.signature}
            />
            {errors.signature && (
              <div className="invalid-feedback d-block">{errors.signature.message}</div>
            )}
            <small className="form-text text-muted">Short identifier displayed on node</small>
          </FormGroup>

          <FormGroup>
            <Label for="edit-spouse">Spouse (Optional)</Label>
            <Input
              id="edit-spouse"
              type="text"
              placeholder="Spouse name"
              {...register('spouse')}
            />
          </FormGroup>

          <FormGroup>
            <Label for="edit-avatar">Avatar Filename</Label>
            <Input
              id="edit-avatar"
              type="text"
              placeholder="io.jpeg"
              {...register('avatar')}
            />
            <small className="form-text text-muted">Image filename (optional)</small>
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
