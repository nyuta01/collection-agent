/**
 * Represents any JSON-serializable value
 */
export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Represents a stored item with ULID identifier
 */
export interface StoredItem {
  id: string;
  [key: string]: Json;
}
