/**
 * Schema Validator Utility
 * 
 * Validates structured data (JSON-LD) against Schema.org specifications.
 * Ensures all required fields are present and data types are correct.
 * 
 * @module schemaValidator
 */

/**
 * Check if all required fields are present in a schema object
 * 
 * @param {Object} schema - Schema object to validate
 * @param {string[]} requiredFields - Array of required field paths (e.g., ['@context', '@type', 'title'])
 * @returns {string[]} Array of missing field paths
 */
export function checkRequiredFields(schema, requiredFields) {
  const missingFields = [];

  for (const fieldPath of requiredFields) {
    const value = getNestedValue(schema, fieldPath);
    
    if (value === undefined || value === null || value === '') {
      missingFields.push(fieldPath);
    }
  }

  return missingFields;
}

/**
 * Get nested value from object using dot notation path
 * 
 * @param {Object} obj - Object to traverse
 * @param {string} path - Dot notation path (e.g., 'hiringOrganization.name')
 * @returns {*} Value at path or undefined
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Validate field data types in a schema object
 * 
 * @param {Object} schema - Schema object to validate
 * @param {Object} fieldTypes - Map of field paths to expected types
 *                               Example: { 'title': 'string', 'datePosted': 'string', 'baseSalary.value': 'number' }
 * @returns {string[]} Array of type error messages
 */
export function validateFieldTypes(schema, fieldTypes) {
  const typeErrors = [];

  for (const [fieldPath, expectedType] of Object.entries(fieldTypes)) {
    const value = getNestedValue(schema, fieldPath);
    
    // Skip validation if field is missing (handled by checkRequiredFields)
    if (value === undefined || value === null) {
      continue;
    }

    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (actualType !== expectedType) {
      typeErrors.push(`Field '${fieldPath}' should be type '${expectedType}' but got '${actualType}'`);
    }
  }

  return typeErrors;
}

/**
 * Validate JobPosting schema against Schema.org specifications
 * 
 * @param {Object} schema - JobPosting JSON-LD object
 * @returns {Object} Validation result { valid: boolean, errors: string[], warnings: string[], schemaType: string }
 */
export function validateJobPostingSchema(schema) {
  const errors = [];
  const warnings = [];

  // Required fields according to Schema.org JobPosting specification
  const requiredFields = [
    '@context',
    '@type',
    'title',
    'description',
    'datePosted',
    'hiringOrganization',
    'hiringOrganization.name',
    'jobLocation',
    'jobLocation.address'
  ];

  // Recommended fields
  const recommendedFields = [
    'validThrough',
    'employmentType',
    'baseSalary',
    'qualifications',
    'responsibilities',
    'identifier'
  ];

  // Check required fields
  const missingRequired = checkRequiredFields(schema, requiredFields);
  if (missingRequired.length > 0) {
    errors.push(...missingRequired.map(field => `Missing required field: ${field}`));
  }

  // Check recommended fields (warnings only)
  const missingRecommended = checkRequiredFields(schema, recommendedFields);
  if (missingRecommended.length > 0) {
    warnings.push(...missingRecommended.map(field => `Missing recommended field: ${field}`));
  }

  // Validate @type
  if (schema['@type'] && schema['@type'] !== 'JobPosting') {
    errors.push(`@type should be 'JobPosting' but got '${schema['@type']}'`);
  }

  // Validate field types
  const fieldTypes = {
    'title': 'string',
    'description': 'string',
    'datePosted': 'string',
    'validThrough': 'string',
    'employmentType': 'string',
    'hiringOrganization': 'object',
    'hiringOrganization.name': 'string',
    'jobLocation': 'object',
    'jobLocation.address': 'object',
    'baseSalary': 'object',
    'qualifications': 'string',
    'responsibilities': 'string'
  };

  const typeErrors = validateFieldTypes(schema, fieldTypes);
  if (typeErrors.length > 0) {
    errors.push(...typeErrors);
  }

  // Validate address fields if present
  if (schema.jobLocation && schema.jobLocation.address) {
    const address = schema.jobLocation.address;
    const addressFields = {
      'addressLocality': 'string',
      'addressRegion': 'string',
      'postalCode': 'string',
      'addressCountry': 'string'
    };

    for (const [field, type] of Object.entries(addressFields)) {
      if (address[field] !== undefined && address[field] !== null) {
        const actualType = typeof address[field];
        if (actualType !== type) {
          errors.push(`jobLocation.address.${field} should be type '${type}' but got '${actualType}'`);
        }
      }
    }

    // Warn about missing address details
    if (!address.addressLocality) warnings.push('Missing recommended field: jobLocation.address.addressLocality');
    if (!address.addressRegion) warnings.push('Missing recommended field: jobLocation.address.addressRegion');
    if (!address.postalCode) warnings.push('Missing recommended field: jobLocation.address.postalCode');
  }

  // Validate baseSalary structure if present
  if (schema.baseSalary) {
    if (schema.baseSalary['@type'] !== 'MonetaryAmount') {
      errors.push(`baseSalary.@type should be 'MonetaryAmount' but got '${schema.baseSalary['@type']}'`);
    }
    if (!schema.baseSalary.currency) {
      warnings.push('Missing recommended field: baseSalary.currency');
    }
    if (!schema.baseSalary.value) {
      warnings.push('Missing recommended field: baseSalary.value');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'JobPosting'
  };
}

/**
 * Validate FAQ schema against Schema.org specifications
 * 
 * @param {Object} schema - FAQ JSON-LD object
 * @returns {Object} Validation result { valid: boolean, errors: string[], warnings: string[], schemaType: string }
 */
export function validateFAQSchema(schema) {
  const errors = [];
  const warnings = [];

  // Required fields for FAQPage
  const requiredFields = [
    '@context',
    '@type',
    'mainEntity'
  ];

  // Check required fields
  const missingRequired = checkRequiredFields(schema, requiredFields);
  if (missingRequired.length > 0) {
    errors.push(...missingRequired.map(field => `Missing required field: ${field}`));
  }

  // Validate @type
  if (schema['@type'] && schema['@type'] !== 'FAQPage') {
    errors.push(`@type should be 'FAQPage' but got '${schema['@type']}'`);
  }

  // Check for duplicate @type fields (common error)
  const schemaString = JSON.stringify(schema);
  const typeMatches = schemaString.match(/"@type"/g);
  if (typeMatches && typeMatches.length > (schema.mainEntity ? schema.mainEntity.length + 1 : 1)) {
    warnings.push('Possible duplicate @type fields detected');
  }

  // Validate mainEntity array
  if (schema.mainEntity) {
    if (!Array.isArray(schema.mainEntity)) {
      errors.push('mainEntity should be an array');
    } else {
      // Validate each question in mainEntity
      schema.mainEntity.forEach((question, index) => {
        if (!question['@type'] || question['@type'] !== 'Question') {
          errors.push(`mainEntity[${index}].@type should be 'Question'`);
        }
        if (!question.name) {
          errors.push(`mainEntity[${index}].name is required`);
        }
        if (!question.acceptedAnswer) {
          errors.push(`mainEntity[${index}].acceptedAnswer is required`);
        } else {
          if (!question.acceptedAnswer['@type'] || question.acceptedAnswer['@type'] !== 'Answer') {
            errors.push(`mainEntity[${index}].acceptedAnswer.@type should be 'Answer'`);
          }
          if (!question.acceptedAnswer.text) {
            errors.push(`mainEntity[${index}].acceptedAnswer.text is required`);
          }
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'FAQPage'
  };
}

/**
 * Validate BreadcrumbList schema against Schema.org specifications
 * 
 * @param {Object} schema - BreadcrumbList JSON-LD object
 * @returns {Object} Validation result { valid: boolean, errors: string[], warnings: string[], schemaType: string }
 */
export function validateBreadcrumbSchema(schema) {
  const errors = [];
  const warnings = [];

  // Required fields for BreadcrumbList
  const requiredFields = [
    '@context',
    '@type',
    'itemListElement'
  ];

  // Check required fields
  const missingRequired = checkRequiredFields(schema, requiredFields);
  if (missingRequired.length > 0) {
    errors.push(...missingRequired.map(field => `Missing required field: ${field}`));
  }

  // Validate @type
  if (schema['@type'] && schema['@type'] !== 'BreadcrumbList') {
    errors.push(`@type should be 'BreadcrumbList' but got '${schema['@type']}'`);
  }

  // Validate itemListElement array
  if (schema.itemListElement) {
    if (!Array.isArray(schema.itemListElement)) {
      errors.push('itemListElement should be an array');
    } else {
      // Validate each list item
      schema.itemListElement.forEach((item, index) => {
        if (!item['@type'] || item['@type'] !== 'ListItem') {
          errors.push(`itemListElement[${index}].@type should be 'ListItem'`);
        }
        if (item.position === undefined || item.position === null) {
          errors.push(`itemListElement[${index}].position is required`);
        } else if (typeof item.position !== 'number') {
          errors.push(`itemListElement[${index}].position should be a number`);
        }
        if (!item.name) {
          errors.push(`itemListElement[${index}].name is required`);
        }
        if (!item.item) {
          errors.push(`itemListElement[${index}].item is required`);
        }
      });

      // Validate position sequence (should start at 1 and be sequential)
      const positions = schema.itemListElement.map(item => item.position).filter(p => typeof p === 'number');
      const sortedPositions = [...positions].sort((a, b) => a - b);
      if (positions.length > 0) {
        if (sortedPositions[0] !== 1) {
          warnings.push('BreadcrumbList positions should start at 1');
        }
        for (let i = 1; i < sortedPositions.length; i++) {
          if (sortedPositions[i] !== sortedPositions[i - 1] + 1) {
            warnings.push('BreadcrumbList positions should be sequential');
            break;
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'BreadcrumbList'
  };
}

/**
 * Generic schema validator
 * Validates any JSON-LD schema based on schema type
 * 
 * @param {Object} schema - Any JSON-LD object
 * @param {string} schemaType - Schema type (JobPosting, FAQPage, BreadcrumbList, etc.)
 * @returns {Object} Validation result { valid: boolean, errors: string[], warnings: string[], schemaType: string }
 */
export function validateSchema(schema, schemaType) {
  // Validate basic JSON-LD structure
  if (!schema || typeof schema !== 'object') {
    return {
      valid: false,
      errors: ['Schema must be a valid object'],
      warnings: [],
      schemaType
    };
  }

  // Route to specific validator based on schema type
  switch (schemaType) {
    case 'JobPosting':
      return validateJobPostingSchema(schema);
    
    case 'FAQPage':
    case 'FAQ':
      return validateFAQSchema(schema);
    
    case 'BreadcrumbList':
    case 'Breadcrumb':
      return validateBreadcrumbSchema(schema);
    
    default:
      // Generic validation for unknown types
      const errors = [];
      const warnings = [];

      if (!schema['@context']) {
        errors.push('Missing required field: @context');
      }
      if (!schema['@type']) {
        errors.push('Missing required field: @type');
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        schemaType
      };
  }
}
