import { Person } from './Person';

/**
 * TreeNode extends Person with calculated canvas position and dimensions
 */

export interface TreeNode extends Person {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Connection {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export type ViewMode = 'view' | 'edit';
