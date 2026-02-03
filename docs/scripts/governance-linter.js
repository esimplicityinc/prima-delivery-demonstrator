#!/usr/bin/env node
/**
 * Governance Linter
 * Validates ROAD and ADR frontmatter for correctness and completeness
 * 
 * Usage:
 *   node governance-linter.js --all-roads   # Validate all ROAD items
 *   node governance-linter.js --adrs        # Validate all ADRs
 *   node governance-linter.js --ci          # Full CI validation (all checks)
 *   node governance-linter.js ROAD-001      # Validate specific item
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const DOCS_DIR = path.join(__dirname, '..');
const ROADS_DIR = path.join(DOCS_DIR, 'roads');
const ADRS_DIR = path.join(DOCS_DIR, 'adr');

// Valid values
const VALID_ROAD_STATUSES = [
  'proposed',
  'adr_validated',
  'bdd_pending',
  'bdd_complete',
  'implementing',
  'nfr_validating',
  'nfr_blocked',
  'complete'
];

const VALID_PRIORITIES = ['high', 'medium', 'low'];

const VALID_ADR_STATUSES = ['proposed', 'accepted', 'deprecated', 'superseded'];
const VALID_ADR_CATEGORIES = ['architecture', 'infrastructure', 'security', 'performance'];

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Validate a single ROAD item
 */
function validateRoadItem(filePath) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    
    // Required fields
    if (!data.id) {
      errors.push('Missing required field: id');
    } else if (!data.id.match(/^ROAD-\d+$/)) {
      errors.push(`Invalid id format: "${data.id}" (expected ROAD-XXX)`);
    }
    
    if (!data.title) {
      errors.push('Missing required field: title');
    }
    
    if (!data.status) {
      errors.push('Missing required field: status');
    } else if (!VALID_ROAD_STATUSES.includes(data.status)) {
      errors.push(`Invalid status: "${data.status}" (valid: ${VALID_ROAD_STATUSES.join(', ')})`);
    }
    
    if (data.phase === undefined || data.phase === null) {
      warnings.push('Missing field: phase (defaulting to 1)');
    } else if (typeof data.phase !== 'number' || data.phase < 0) {
      errors.push(`Invalid phase: "${data.phase}" (must be a non-negative number)`);
    }
    
    if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
      errors.push(`Invalid priority: "${data.priority}" (valid: ${VALID_PRIORITIES.join(', ')})`);
    }
    
    // Date fields
    if (data.created && !isValidDate(data.created)) {
      warnings.push(`Invalid date format for created: "${data.created}" (expected YYYY-MM-DD)`);
    }
    
    if (data.started && !isValidDate(data.started)) {
      warnings.push(`Invalid date format for started: "${data.started}" (expected YYYY-MM-DD)`);
    }
    
    if (data.completed && !isValidDate(data.completed)) {
      warnings.push(`Invalid date format for completed: "${data.completed}" (expected YYYY-MM-DD)`);
    }
    
    // Governance structure validation
    if (data.governance) {
      if (data.governance.bdd && data.governance.bdd.status) {
        if (!['draft', 'approved'].includes(data.governance.bdd.status)) {
          errors.push(`Invalid governance.bdd.status: "${data.governance.bdd.status}" (valid: draft, approved)`);
        }
      }
      
      if (data.governance.nfrs && data.governance.nfrs.status) {
        if (!['pending', 'validating', 'pass', 'fail'].includes(data.governance.nfrs.status)) {
          errors.push(`Invalid governance.nfrs.status: "${data.governance.nfrs.status}" (valid: pending, validating, pass, fail)`);
        }
      }
    }
    
    // Dependency arrays
    if (data.depends_on && !Array.isArray(data.depends_on)) {
      errors.push('depends_on must be an array');
    }
    
    if (data.blocked_by && !Array.isArray(data.blocked_by)) {
      errors.push('blocked_by must be an array');
    }
    
    if (data.blocks && !Array.isArray(data.blocks)) {
      errors.push('blocks must be an array');
    }
    
    // Check for template placeholders
    if (content.includes('ROAD-XXX') || content.includes('YYYY-MM-DD')) {
      warnings.push('Contains unresolved template placeholders (ROAD-XXX or YYYY-MM-DD)');
    }
    
  } catch (err) {
    errors.push(`Failed to parse file: ${err.message}`);
  }
  
  return { fileName, errors, warnings };
}

/**
 * Validate a single ADR
 */
function validateAdr(filePath) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(filePath);
  
  // Skip template file
  if (fileName === 'ADR-TEMPLATE.md') {
    return { fileName, errors, warnings, skipped: true };
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    
    // Required fields
    if (!data.id) {
      errors.push('Missing required field: id');
    } else if (!data.id.match(/^ADR-\d+$/)) {
      errors.push(`Invalid id format: "${data.id}" (expected ADR-XXX)`);
    }
    
    if (!data.title) {
      errors.push('Missing required field: title');
    }
    
    if (!data.status) {
      errors.push('Missing required field: status');
    } else if (!VALID_ADR_STATUSES.includes(data.status)) {
      errors.push(`Invalid status: "${data.status}" (valid: ${VALID_ADR_STATUSES.join(', ')})`);
    }
    
    if (data.category && !VALID_ADR_CATEGORIES.includes(data.category)) {
      errors.push(`Invalid category: "${data.category}" (valid: ${VALID_ADR_CATEGORIES.join(', ')})`);
    }
    
    // Date fields
    if (data.created && !isValidDate(data.created)) {
      warnings.push(`Invalid date format for created: "${data.created}" (expected YYYY-MM-DD)`);
    }
    
    // Check for template placeholders
    if (content.includes('ADR-XXX') || content.includes('YYYY-MM-DD')) {
      warnings.push('Contains unresolved template placeholders (ADR-XXX or YYYY-MM-DD)');
    }
    
  } catch (err) {
    errors.push(`Failed to parse file: ${err.message}`);
  }
  
  return { fileName, errors, warnings };
}

/**
 * Check if a string is a valid date (YYYY-MM-DD format)
 */
function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate all ROAD items
 */
function validateAllRoads() {
  log('\n📋 Validating ROAD Items\n', 'cyan');
  
  if (!fs.existsSync(ROADS_DIR)) {
    log('  Roads directory not found', 'yellow');
    return { total: 0, passed: 0, failed: 0 };
  }
  
  const files = fs.readdirSync(ROADS_DIR)
    .filter(f => f.match(/^ROAD-\d+\.md$/));
  
  if (files.length === 0) {
    log('  No ROAD items found (this is OK for a new project)', 'dim');
    return { total: 0, passed: 0, failed: 0 };
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const file of files) {
    const filePath = path.join(ROADS_DIR, file);
    const result = validateRoadItem(filePath);
    
    if (result.errors.length === 0) {
      log(`  ✓ ${result.fileName}`, 'green');
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => log(`    ⚠ ${w}`, 'yellow'));
      }
      passed++;
    } else {
      log(`  ✗ ${result.fileName}`, 'red');
      result.errors.forEach(e => log(`    ✗ ${e}`, 'red'));
      result.warnings.forEach(w => log(`    ⚠ ${w}`, 'yellow'));
      failed++;
    }
  }
  
  return { total: files.length, passed, failed };
}

/**
 * Validate all ADRs
 */
function validateAllAdrs() {
  log('\n📐 Validating ADRs\n', 'cyan');
  
  if (!fs.existsSync(ADRS_DIR)) {
    log('  ADR directory not found', 'yellow');
    return { total: 0, passed: 0, failed: 0 };
  }
  
  const files = fs.readdirSync(ADRS_DIR)
    .filter(f => f.match(/^ADR-\d+\.md$/));
  
  if (files.length === 0) {
    log('  No ADRs found (this is OK for a new project)', 'dim');
    return { total: 0, passed: 0, failed: 0 };
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const file of files) {
    const filePath = path.join(ADRS_DIR, file);
    const result = validateAdr(filePath);
    
    if (result.skipped) {
      continue;
    }
    
    if (result.errors.length === 0) {
      log(`  ✓ ${result.fileName}`, 'green');
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => log(`    ⚠ ${w}`, 'yellow'));
      }
      passed++;
    } else {
      log(`  ✗ ${result.fileName}`, 'red');
      result.errors.forEach(e => log(`    ✗ ${e}`, 'red'));
      result.warnings.forEach(w => log(`    ⚠ ${w}`, 'yellow'));
      failed++;
    }
  }
  
  return { total: files.length, passed, failed };
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  let roadResults = { total: 0, passed: 0, failed: 0 };
  let adrResults = { total: 0, passed: 0, failed: 0 };
  
  if (args.includes('--all-roads') || args.includes('--ci')) {
    roadResults = validateAllRoads();
  }
  
  if (args.includes('--adrs') || args.includes('--ci')) {
    adrResults = validateAllAdrs();
  }
  
  // Summary
  const totalFailed = roadResults.failed + adrResults.failed;
  const totalPassed = roadResults.passed + adrResults.passed;
  const total = roadResults.total + adrResults.total;
  
  log('\n────────────────────────────────────', 'dim');
  log(`Total: ${total} | Passed: ${totalPassed} | Failed: ${totalFailed}`, 
    totalFailed > 0 ? 'red' : 'green');
  
  if (totalFailed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateRoadItem, validateAdr, validateAllRoads, validateAllAdrs };
