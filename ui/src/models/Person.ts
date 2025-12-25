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

/**
 * Person request for creating new person
 */
export interface PersonRequest {
  id: string;
  name: string;
  avatar?: string;
  address: string;
  level: number;
  signature: string;
  spouse?: string;
  positionX?: number;
  positionY?: number;
  parentId?: string;
}

/**
 * Person patch request for updating person
 */
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

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
