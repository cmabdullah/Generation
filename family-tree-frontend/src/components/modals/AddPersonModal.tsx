import React, { useState } from 'react';
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

interface AddPersonModalProps {
  isOpen: boolean;
  toggle: () => void;
  parentId?: string;
}

interface AddPersonFormData {
  id: string;
  name: string;
  avatar: string;
  address: string;
  level: number;
  signature: string;
  spouse?: string;
  parentId?: string;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  toggle,
  parentId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadTree = useTreeStore((state) => state.loadTree);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddPersonFormData>({
    defaultValues: {
      avatar: 'io.jpeg',
      parentId: parentId || '',
    },
  });

  const onSubmit = async (data: AddPersonFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await familyTreeService.createPerson({
        ...data,
        parentId: data.parentId || undefined,
      });

      toast.success(`Person "${data.name}" created successfully!`);

      // Reload the tree to show the new person
      await loadTree();

      reset();
      toggle();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create person';
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

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg">
      <ModalHeader toggle={handleClose}>Add New Person</ModalHeader>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}

          <FormGroup>
            <Label for="id">
              ID <span className="text-danger">*</span>
            </Label>
            <Input
              id="id"
              type="text"
              placeholder="e.g., gen2-001"
              {...register('id', {
                required: 'ID is required',
                pattern: {
                  value: /^[a-zA-Z0-9-_]+$/,
                  message: 'ID can only contain letters, numbers, hyphens, and underscores',
                },
              })}
              invalid={!!errors.id}
            />
            {errors.id && <div className="invalid-feedback d-block">{errors.id.message}</div>}
            <small className="form-text text-muted">Unique identifier for this person</small>
          </FormGroup>

          <FormGroup>
            <Label for="name">
              Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Full name"
              {...register('name', { required: 'Name is required' })}
              invalid={!!errors.name}
            />
            {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
          </FormGroup>

          <FormGroup>
            <Label for="address">
              Address <span className="text-danger">*</span>
            </Label>
            <Input
              id="address"
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
            <Label for="level">
              Generation Level <span className="text-danger">*</span>
            </Label>
            <Input
              id="level"
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
            <Label for="signature">
              Signature <span className="text-danger">*</span>
            </Label>
            <Input
              id="signature"
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
            <Label for="spouse">Spouse (Optional)</Label>
            <Input
              id="spouse"
              type="text"
              placeholder="Spouse name"
              {...register('spouse')}
            />
          </FormGroup>

          <FormGroup>
            <Label for="avatar">Avatar Filename</Label>
            <Input
              id="avatar"
              type="text"
              placeholder="io.jpeg"
              {...register('avatar')}
            />
            <small className="form-text text-muted">Image filename (optional)</small>
          </FormGroup>

          {parentId && (
            <FormGroup>
              <Label for="parentId">Parent ID</Label>
              <Input
                id="parentId"
                type="text"
                {...register('parentId')}
                disabled
              />
              <small className="form-text text-muted">
                This person will be added as a child of the selected parent
              </small>
            </FormGroup>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Person'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
