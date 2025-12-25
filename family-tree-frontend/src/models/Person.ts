/**
 * Person model matching backend Person entity
 */

export interface Person {
  id: string;
  name: string;
  avatar: string;
  address: string;
  level: number;
  signature: string;
  spouse?: string;
  positionX?: number;
  positionY?: number;
  childs: Person[];
}

export interface PersonRequest {
  id: string;
  name: string;
  avatar?: string;
  address?: string;
  level: number;
  signature?: string;
  spouse?: string;
  positionX?: number;
  positionY?: number;
  parentId?: string;
}

export interface PersonPatchRequest {
  name?: string;
  avatar?: string;
  address?: string;
  level?: number;
  signature?: string;
  spouse?: string;
  positionX?: number;
  positionY?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
