'use client';

import { useState } from 'react';

export type JSONSchema = {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
};

export type JSONSchemaProperty = {
  type: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

type ItemFormProps = {
  schema: JSONSchema;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
};

function computeInitialData(schema: JSONSchema): Record<string, unknown> {
  const initialData: Record<string, unknown> = {};
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (prop.type === 'boolean') {
        initialData[key] = false;
      } else if (prop.type === 'number' || prop.type === 'integer') {
        initialData[key] = prop.minimum ?? 0;
      } else {
        initialData[key] = '';
      }
    }
  }
  return initialData;
}

function FormInner({ schema, onSubmit, onCancel }: ItemFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => computeInitialData(schema));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (schema.required) {
      for (const key of schema.required) {
        const value = formData[key];
        if (value === '' || value === null || value === undefined) {
          newErrors[key] = 'This field is required';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert string numbers to actual numbers
      const processedData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(formData)) {
        const prop = schema.properties?.[key];
        if (prop?.type === 'number' || prop?.type === 'integer') {
          processedData[key] = value === '' ? null : Number(value);
        } else {
          processedData[key] = value;
        }
      }
      onSubmit(processedData);
    }
  };

  const renderField = (key: string, prop: JSONSchemaProperty) => {
    const isRequired = schema.required?.includes(key);
    const value = formData[key];

    switch (prop.type) {
      case 'string':
        if (prop.enum) {
          return (
            <select
              id={`field-${key}`}
              value={value as string}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={isRequired}
            >
              <option value="">Select...</option>
              {prop.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }
        return (
          <input
            id={`field-${key}`}
            type="text"
            value={value as string}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={isRequired}
            minLength={prop.minLength}
            maxLength={prop.maxLength}
            pattern={prop.pattern}
          />
        );

      case 'number':
      case 'integer':
        return (
          <input
            id={`field-${key}`}
            type="number"
            value={value as number}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={isRequired}
            min={prop.minimum}
            max={prop.maximum}
            step={prop.type === 'integer' ? 1 : 'any'}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              id={`field-${key}`}
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              {value ? 'True' : 'False'}
            </span>
          </div>
        );

      default:
        return (
          <input
            id={`field-${key}`}
            type="text"
            value={value as string}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={isRequired}
          />
        );
    }
  };

  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">No properties defined in schema</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(schema.properties).map(([key, prop]) => (
        <div key={key}>
          <label htmlFor={`field-${key}`} className="block text-sm font-medium mb-2">
            {key}
            {schema.required?.includes(key) && (
              <span className="text-red-600 ml-1">*</span>
            )}
            <span className="text-gray-500 text-xs ml-2">({prop.type})</span>
          </label>
          {renderField(key, prop)}
          {errors[key] && (
            <p className="text-red-600 text-sm mt-1">{errors[key]}</p>
          )}
        </div>
      ))}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ItemForm({ schema, onSubmit, onCancel }: ItemFormProps) {
  const formKey = `${JSON.stringify(schema.properties ?? {})}|${(schema.required ?? []).join(',')}`;
  return <FormInner key={formKey} schema={schema} onSubmit={onSubmit} onCancel={onCancel} />;
}
