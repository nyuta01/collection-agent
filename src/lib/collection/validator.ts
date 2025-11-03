import Ajv, { type ValidateFunction, type AnySchemaObject } from 'ajv';
import type { Json } from './types';

const ajv = new Ajv({ allErrors: true });

/**
 * Validate an item against a JSON Schema
 * @param item - The item to validate
 * @param schema - JSON Schema definition
 * @returns Validation result with detailed error messages
 */
export function validateItem(
  item: Json,
  schema: AnySchemaObject
): { valid: boolean; errors?: string[] } {
  let validate: ValidateFunction;

  try {
    validate = ajv.compile(schema);
  } catch (error) {
    return {
      valid: false,
      errors: [`Invalid JSON Schema: ${error instanceof Error ? error.message : String(error)}`],
    };
  }

  const valid = validate(item);

  if (!valid && validate.errors) {
    const errors = validate.errors.map((error) => {
      const path = error.instancePath || '/';
      const message = error.message || 'validation failed';
      return `${path}: ${message}`;
    });

    return { valid: false, errors };
  }

  return { valid: true };
}
