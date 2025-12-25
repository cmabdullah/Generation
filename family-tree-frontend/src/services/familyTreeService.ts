import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import {
  Person,
  PersonRequest,
  PersonPatchRequest,
  ApiResponse,
} from '../models/Person';

/**
 * Family Tree API Service
 * All API calls to the backend
 */

export const familyTreeService = {
  /**
   * Get the complete family tree
   */
  getFullTree: async (): Promise<ApiResponse<Person>> => {
    const response = await api.get<ApiResponse<Person>>(API_ENDPOINTS.FAMILY_TREE);
    return response.data;
  },

  /**
   * Get person by ID
   */
  getPersonById: async (id: string): Promise<ApiResponse<Person>> => {
    const response = await api.get<ApiResponse<Person>>(
      API_ENDPOINTS.FAMILY_TREE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Get person with all descendants
   */
  getPersonWithDescendants: async (id: string): Promise<ApiResponse<Person>> => {
    const response = await api.get<ApiResponse<Person>>(
      API_ENDPOINTS.FAMILY_TREE_DESCENDANTS(id)
    );
    return response.data;
  },

  /**
   * Create a new person
   */
  createPerson: async (data: PersonRequest): Promise<ApiResponse<Person>> => {
    const response = await api.post<ApiResponse<Person>>(
      API_ENDPOINTS.FAMILY_TREE,
      data
    );
    return response.data;
  },

  /**
   * Update person (PATCH)
   * Used for position updates and other partial updates
   */
  updatePerson: async (
    id: string,
    data: PersonPatchRequest
  ): Promise<ApiResponse<Person>> => {
    const response = await api.patch<ApiResponse<Person>>(
      API_ENDPOINTS.FAMILY_TREE_BY_ID(id),
      data
    );
    return response.data;
  },

  /**
   * Delete person
   */
  deletePerson: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      API_ENDPOINTS.FAMILY_TREE_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Search persons by name
   */
  searchByName: async (name: string): Promise<ApiResponse<Person[]>> => {
    const response = await api.get<ApiResponse<Person[]>>(
      API_ENDPOINTS.FAMILY_TREE_SEARCH,
      { params: { name } }
    );
    return response.data;
  },

  /**
   * Get persons by generation level
   */
  getPersonsByLevel: async (level: number): Promise<ApiResponse<Person[]>> => {
    const response = await api.get<ApiResponse<Person[]>>(
      API_ENDPOINTS.FAMILY_TREE_BY_LEVEL(level)
    );
    return response.data;
  },

  /**
   * Get total person count
   */
  getTotalCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>(
      API_ENDPOINTS.FAMILY_TREE_COUNT
    );
    return response.data;
  },

  /**
   * Reload data from JSON file (admin operation)
   */
  reloadData: async (): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(
      API_ENDPOINTS.FAMILY_TREE_RELOAD
    );
    return response.data;
  },
};
