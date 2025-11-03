import { describe, it, expect } from 'vitest';
import { validateItem } from '../validator';
import type { AnySchemaObject } from 'ajv';
import type { Json } from '../types';

describe('Validator', () => {
  describe('validateItem', () => {
    it('should validate item against simple schema', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      };

      const validItem: Json = { name: 'John', age: 30 };
      const result = validateItem(validItem, schema);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject item missing required fields', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      };

      const invalidItem: Json = { name: 'John' }; // missing 'age'
      const result = validateItem(invalidItem, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
      expect(result.errors?.[0]).toContain("must have required property 'age'");
    });

    it('should reject item with wrong type', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      };

      const invalidItem: Json = { name: 'John', age: 'thirty' }; // wrong type
      const result = validateItem(invalidItem, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(err => err.includes('/age'))).toBe(true);
    });

    it('should validate nested objects', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['name', 'email'],
          },
        },
        required: ['user'],
      };

      const validItem: Json = {
        user: {
          name: 'John',
          email: 'john@example.com',
        },
      };

      const result = validateItem(validItem, schema);
      expect(result.valid).toBe(true);
    });

    it('should validate arrays', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
        },
        required: ['tags'],
      };

      const validItem: Json = { tags: ['tag1', 'tag2'] };
      const result = validateItem(validItem, schema);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid array items', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        required: ['tags'],
      };

      const invalidItem: Json = { tags: ['tag1', 123] }; // number in string array
      const result = validateItem(invalidItem, schema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle invalid schema gracefully', () => {
      const invalidSchema = {
        type: 'invalid-type', // invalid schema
      } as unknown as AnySchemaObject;

      const item: Json = { name: 'Test' };
      const result = validateItem(item, invalidSchema);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Invalid JSON Schema');
    });

    it('should validate with additionalProperties', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
      };

      const validItem: Json = { name: 'John' };
      const result = validateItem(validItem, schema);
      expect(result.valid).toBe(true);

      const invalidItem: Json = { name: 'John', extra: 'field' };
      const resultInvalid = validateItem(invalidItem, schema);
      expect(resultInvalid.valid).toBe(false);
    });

    it('should validate enum values', () => {
      const schema: AnySchemaObject = {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['pending', 'active', 'completed'],
          },
        },
        required: ['status'],
      };

      const validItem: Json = { status: 'active' };
      const result = validateItem(validItem, schema);
      expect(result.valid).toBe(true);

      const invalidItem: Json = { status: 'invalid' };
      const resultInvalid = validateItem(invalidItem, schema);
      expect(resultInvalid.valid).toBe(false);
    });
  });
});
