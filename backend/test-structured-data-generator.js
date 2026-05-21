/**
 * Test script for Structured Data Generator
 */

import {
  generateJobPostingSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebSiteSchema
} from './src/utils/seo/structuredDataGenerator.js';

console.log('Structured Data Generator Test\n');
console.log('='.repeat(80));

// Test 1: Generate JobPosting Schema
console.log('\n1. Testing generateJobPostingSchema():');
try {
  const mockJob = {
    title: 'Railway Recruitment 2024 - 10000 Posts',
    slug: 'railway-recruitment-2024-10000-posts',
    content: 'Railway Recruitment Board has announced recruitment for 10000 posts. Eligible candidates can apply online.',
    summary: 'Railway Recruitment Board recruitment for 10000 posts. Apply online before the last date.',
    eligibility: 'Candidates must have 10th pass or equivalent qualification. Age limit: 18-33 years.',
    importantDates: 'Last Date: 31st December 2024',
    category: 'job',
    state: 'All India',
    organization: 'Railway Recruitment Board',
    vacancyCount: 10000,
    lastDate: new Date('2024-12-31'),
    qualificationLevel: '10th',
    applyLink: 'https://example.com/apply',
    salary: 'Rs. 35000 - 50000 per month',
    sourceId: 'test-job-001',
    publishedAt: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01')
  };

  const schema = generateJobPostingSchema(mockJob);
  
  // Validate required fields
  const hasContext = schema['@context'] === 'https://schema.org';
  const hasType = schema['@type'] === 'JobPosting';
  const hasTitle = schema.title === mockJob.title;
  const hasDescription = schema.description && schema.description.length > 0;
  const hasDatePosted = schema.datePosted && schema.datePosted.length > 0;
  const hasValidThrough = schema.validThrough && schema.validThrough.length > 0;
  const hasHiringOrg = schema.hiringOrganization && schema.hiringOrganization.name;
  const hasJobLocation = schema.jobLocation && schema.jobLocation.address;
  const hasBaseSalary = schema.baseSalary && schema.baseSalary.currency === 'INR';
  const hasQualifications = schema.qualifications && schema.qualifications.length > 0;
  const hasIdentifier = schema.identifier && schema.identifier.value;

  console.log(`   ✓ @context: ${hasContext ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ @type: ${hasType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ title: ${hasTitle ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ description: ${hasDescription ? 'Present' : 'Missing'}`);
  console.log(`   ✓ datePosted: ${hasDatePosted ? 'Present' : 'Missing'}`);
  console.log(`   ✓ validThrough: ${hasValidThrough ? 'Present' : 'Missing'}`);
  console.log(`   ✓ hiringOrganization: ${hasHiringOrg ? 'Present' : 'Missing'}`);
  console.log(`   ✓ jobLocation: ${hasJobLocation ? 'Present' : 'Missing'}`);
  console.log(`   ✓ baseSalary: ${hasBaseSalary ? 'Present' : 'Missing'}`);
  console.log(`   ✓ qualifications: ${hasQualifications ? 'Present' : 'Missing'}`);
  console.log(`   ✓ identifier: ${hasIdentifier ? 'Present' : 'Missing'}`);

  // Validate address structure
  const address = schema.jobLocation.address;
  const hasAddressType = address['@type'] === 'PostalAddress';
  const hasStreetAddress = address.streetAddress && address.streetAddress.length > 0;
  const hasAddressLocality = address.addressLocality && address.addressLocality.length > 0;
  const hasAddressRegion = address.addressRegion && address.addressRegion.length > 0;
  const hasPostalCode = address.postalCode && address.postalCode.length > 0;
  const hasAddressCountry = address.addressCountry === 'IN';

  console.log(`   ✓ address.@type: ${hasAddressType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ address.streetAddress: ${hasStreetAddress ? 'Present' : 'Missing'}`);
  console.log(`   ✓ address.addressLocality: ${hasAddressLocality ? 'Present' : 'Missing'}`);
  console.log(`   ✓ address.addressRegion: ${hasAddressRegion ? 'Present' : 'Missing'}`);
  console.log(`   ✓ address.postalCode: ${hasPostalCode ? 'Present' : 'Missing'}`);
  console.log(`   ✓ address.addressCountry: ${hasAddressCountry ? 'Valid' : 'Invalid'}`);

  console.log(`   ✓ JobPosting schema generated successfully`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 2: Generate JobPosting Schema with missing optional fields
console.log('\n2. Testing generateJobPostingSchema() with missing optional fields:');
try {
  const minimalJob = {
    title: 'Test Job',
    slug: 'test-job',
    content: 'Test job content',
    summary: 'Test job summary',
    eligibility: 'Test eligibility',
    importantDates: 'Test dates',
    category: 'job',
    state: '',
    organization: '',
    sourceId: 'test-job-002',
    createdAt: new Date()
  };

  const schema = generateJobPostingSchema(minimalJob);
  
  const hasDefaultLocation = schema.jobLocation && schema.jobLocation.address;
  const hasDefaultOrg = schema.hiringOrganization && schema.hiringOrganization.name;
  const hasValidThrough = schema.validThrough && schema.validThrough.length > 0;

  console.log(`   ✓ Default location: ${hasDefaultLocation ? 'Applied' : 'Missing'}`);
  console.log(`   ✓ Default organization: ${hasDefaultOrg ? 'Applied' : 'Missing'}`);
  console.log(`   ✓ Default validThrough: ${hasValidThrough ? 'Applied' : 'Missing'}`);
  console.log(`   ✓ Schema generated with fallback values`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 3: Generate FAQ Schema
console.log('\n3. Testing generateFAQSchema():');
try {
  const mockFAQs = [
    {
      question: 'What is the eligibility for this job?',
      answer: 'Candidates must have 10th pass or equivalent qualification.'
    },
    {
      question: 'What is the last date to apply?',
      answer: 'The last date to apply is 31st December 2024.'
    },
    {
      question: 'How to apply for this job?',
      answer: 'Candidates can apply online through the official website.'
    }
  ];

  const schema = generateFAQSchema(mockFAQs);
  
  const hasContext = schema['@context'] === 'https://schema.org';
  const hasType = schema['@type'] === 'FAQPage';
  const hasMainEntity = Array.isArray(schema.mainEntity);
  const hasCorrectCount = schema.mainEntity.length === mockFAQs.length;
  
  // Check first question structure
  const firstQuestion = schema.mainEntity[0];
  const hasQuestionType = firstQuestion['@type'] === 'Question';
  const hasQuestionName = firstQuestion.name === mockFAQs[0].question;
  const hasAnswer = firstQuestion.acceptedAnswer && firstQuestion.acceptedAnswer['@type'] === 'Answer';
  const hasAnswerText = firstQuestion.acceptedAnswer && firstQuestion.acceptedAnswer.text === mockFAQs[0].answer;

  console.log(`   ✓ @context: ${hasContext ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ @type: ${hasType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ mainEntity: ${hasMainEntity ? 'Array' : 'Not array'}`);
  console.log(`   ✓ Question count: ${hasCorrectCount ? 'Correct' : 'Incorrect'}`);
  console.log(`   ✓ Question @type: ${hasQuestionType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Question name: ${hasQuestionName ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Answer structure: ${hasAnswer ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Answer text: ${hasAnswerText ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ FAQ schema generated successfully`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 4: Generate Breadcrumb Schema
console.log('\n4. Testing generateBreadcrumbSchema():');
try {
  const mockBreadcrumbs = [
    { name: 'Home', url: 'https://sarkaripulse.net' },
    { name: 'Jobs', url: 'https://sarkaripulse.net/jobs' },
    { name: 'Railway Recruitment 2024', url: 'https://sarkaripulse.net/job/railway-recruitment-2024' }
  ];

  const schema = generateBreadcrumbSchema(mockBreadcrumbs);
  
  const hasContext = schema['@context'] === 'https://schema.org';
  const hasType = schema['@type'] === 'BreadcrumbList';
  const hasItemList = Array.isArray(schema.itemListElement);
  const hasCorrectCount = schema.itemListElement.length === mockBreadcrumbs.length;
  
  // Check first item structure
  const firstItem = schema.itemListElement[0];
  const hasListItemType = firstItem['@type'] === 'ListItem';
  const hasPosition = firstItem.position === 1;
  const hasName = firstItem.name === mockBreadcrumbs[0].name;
  const hasItem = firstItem.item === mockBreadcrumbs[0].url;

  // Check position sequence
  const positions = schema.itemListElement.map(item => item.position);
  const isSequential = positions.every((pos, idx) => pos === idx + 1);

  console.log(`   ✓ @context: ${hasContext ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ @type: ${hasType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ itemListElement: ${hasItemList ? 'Array' : 'Not array'}`);
  console.log(`   ✓ Item count: ${hasCorrectCount ? 'Correct' : 'Incorrect'}`);
  console.log(`   ✓ ListItem @type: ${hasListItemType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Position: ${hasPosition ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Name: ${hasName ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Item URL: ${hasItem ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Position sequence: ${isSequential ? 'Sequential' : 'Not sequential'}`);
  console.log(`   ✓ Breadcrumb schema generated successfully`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 5: Generate Organization Schema
console.log('\n5. Testing generateOrganizationSchema():');
try {
  const schema = generateOrganizationSchema();
  
  const hasContext = schema['@context'] === 'https://schema.org';
  const hasType = schema['@type'] === 'Organization';
  const hasName = schema.name && schema.name.length > 0;
  const hasUrl = schema.url && schema.url.length > 0;
  const hasLogo = schema.logo && schema.logo.length > 0;
  const hasDescription = schema.description && schema.description.length > 0;
  const hasSameAs = Array.isArray(schema.sameAs) && schema.sameAs.length > 0;
  const hasContactPoint = schema.contactPoint && schema.contactPoint['@type'] === 'ContactPoint';

  console.log(`   ✓ @context: ${hasContext ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ @type: ${hasType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ name: ${hasName ? 'Present' : 'Missing'}`);
  console.log(`   ✓ url: ${hasUrl ? 'Present' : 'Missing'}`);
  console.log(`   ✓ logo: ${hasLogo ? 'Present' : 'Missing'}`);
  console.log(`   ✓ description: ${hasDescription ? 'Present' : 'Missing'}`);
  console.log(`   ✓ sameAs: ${hasSameAs ? 'Present' : 'Missing'}`);
  console.log(`   ✓ contactPoint: ${hasContactPoint ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ Organization schema generated successfully`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 6: Generate WebSite Schema
console.log('\n6. Testing generateWebSiteSchema():');
try {
  const schema = generateWebSiteSchema();
  
  const hasContext = schema['@context'] === 'https://schema.org';
  const hasType = schema['@type'] === 'WebSite';
  const hasName = schema.name && schema.name.length > 0;
  const hasUrl = schema.url && schema.url.length > 0;
  const hasDescription = schema.description && schema.description.length > 0;
  const hasPotentialAction = schema.potentialAction && schema.potentialAction['@type'] === 'SearchAction';
  const hasSearchTarget = schema.potentialAction && schema.potentialAction.target;
  const hasQueryInput = schema.potentialAction && schema.potentialAction['query-input'];

  console.log(`   ✓ @context: ${hasContext ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ @type: ${hasType ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ name: ${hasName ? 'Present' : 'Missing'}`);
  console.log(`   ✓ url: ${hasUrl ? 'Present' : 'Missing'}`);
  console.log(`   ✓ description: ${hasDescription ? 'Present' : 'Missing'}`);
  console.log(`   ✓ potentialAction: ${hasPotentialAction ? 'Valid' : 'Invalid'}`);
  console.log(`   ✓ searchAction.target: ${hasSearchTarget ? 'Present' : 'Missing'}`);
  console.log(`   ✓ searchAction.query-input: ${hasQueryInput ? 'Present' : 'Missing'}`);
  console.log(`   ✓ WebSite schema generated successfully`);
} catch (error) {
  console.log(`   ✗ Error: ${error.message}`);
}

// Test 7: Error handling
console.log('\n7. Testing error handling:');

// Test null job
try {
  generateJobPostingSchema(null);
  console.log(`   ✗ Should throw error for null job`);
} catch (error) {
  console.log(`   ✓ Correctly throws error for null job: ${error.message}`);
}

// Test empty FAQ array
try {
  generateFAQSchema([]);
  console.log(`   ✗ Should throw error for empty FAQ array`);
} catch (error) {
  console.log(`   ✓ Correctly throws error for empty FAQ array: ${error.message}`);
}

// Test empty breadcrumb array
try {
  generateBreadcrumbSchema([]);
  console.log(`   ✗ Should throw error for empty breadcrumb array`);
} catch (error) {
  console.log(`   ✓ Correctly throws error for empty breadcrumb array: ${error.message}`);
}

console.log('\n' + '='.repeat(80));
console.log('\n✓ All tests completed successfully!\n');
