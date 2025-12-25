/**
 * API endpoint constants
 */

export const API_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  FAMILY_TREE: '/api/family-tree',
  FAMILY_TREE_BY_ID: (id: string) => `/api/family-tree/${id}`,
  FAMILY_TREE_DESCENDANTS: (id: string) => `/api/family-tree/${id}/descendants`,
  FAMILY_TREE_SEARCH: '/api/family-tree/search',
  FAMILY_TREE_BY_LEVEL: (level: number) => `/api/family-tree/level/${level}`,
  FAMILY_TREE_COUNT: '/api/family-tree/count',
  FAMILY_TREE_RELOAD: '/api/family-tree/reload-data',
};
