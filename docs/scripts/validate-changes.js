#!/usr/bin/env node
/**
 * Change File Validator
 * Validates CHANGE file frontmatter for correctness and completeness
 * 
 * Usage:
 *   node validate-changes.js          # Validate all CHANGE files
 *   node validate-changes.js --strict # Strict mode (warnings become errors)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Configuration
const DOCS_DIR = path.join(__dirname, '..');
const CHANGES_DIR = path.join(DOCS_DIR, 'changes');

// Valid values
const VALID_STATUSES = ['draft', 'published'];
const VALID_CATEGORIES = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
const VALID_COMPLIANCE_STATUSES = ['pending', 'pass', 'fail', 'na'];
const VALID_AGENT_ROLES = [
  'adr_validation',
  'bdd_author',
  'test_validation',
  'implementation',
  'ci_validation',
  'accessibility_review',
  'ddd_compliance',
  'nfr_validation'
];

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
 * Validate a single CHANGE file
 */
function validateChangeFile(filePath, strict = false) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(filePath);
  
  // Skip template and index files
  if (fileName === 'TEMPLATE.md' || fileName === 'index.md') {
    return { fileName, errors, warnings, skipped: true };
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    
    // Required fields
    if (!data.id) {
      errors.push('Missing required field: id');
    } else if (!data.id.match(/^CHANGE-\d+$/)) {
      errors.push(`Invalid id format: "${data.id}" (expected CHANGE-XXX)`);
    }
    
    if (!data.road_id) {
      warnings.push('Missing field: road_id (should link to a ROAD item)');
    } else if (!data.road_id.match(/^ROAD-\d+$/)) {
      errors.push(`Invalid road_id format: "${data.road_id}" (expected ROAD-XXX)`);
    }
    
    if (!data.title) {
      errors.push('Missing required field: title');
    }
    
    if (!data.date) {
      errors.push('Missing required field: date');
    } else if (!isValidDate(data.date)) {
      errors.push(`Invalid date format: "${data.date}" (expected YYYY-MM-DD)`);
    }
    
    if (!data.status) {
      errors.push('Missing required field: status');
    } else if (!VALID_STATUSES.includes(data.status)) {
      errors.push(`Invalid status: "${data.status}" (valid: ${VALID_STATUSES.join(', ')})`);
    }
    
    // Categories validation
    if (!data.categories || !Array.isArray(data.categories)) {
      warnings.push('Missing or invalid field: categories (should be an array)');
    } else {
      data.categories.forEach(cat => {
        if (!VALID_CATEGORIES.includes(cat)) {
          errors.push(`Invalid category: "${cat}" (valid: ${VALID_CATEGORIES.join(', ')})`);
        }
      });
    }
    
    // Compliance structure validation
    if (data.compliance) {
      // ADR check
      if (data.compliance.adr_check) {
        const adrStatus = data.compliance.adr_check.status;
        if (adrStatus && !VALID_COMPLIANCE_STATUSES.includes(adrStatus)) {
          errors.push(`Invalid compliance.adr_check.status: "${adrStatus}"`);
        }
      }
      
      // BDD check
      if (data.compliance.bdd_check) {
        const bddStatus = data.compliance.bdd_check.status;
        if (bddStatus && !VALID_COMPLIANCE_STATUSES.includes(bddStatus)) {
          errors.push(`Invalid compliance.bdd_check.status: "${bddStatus}"`);
        }
        
        // Validate numeric fields
        if (data.compliance.bdd_check.scenarios !== undefined) {
          if (typeof data.compliance.bdd_check.scenarios !== 'number') {
            warnings.push('compliance.bdd_check.scenarios should be a number');
          }
        }
        
        if (data.compliance.bdd_check.passed !== undefined) {
          if (typeof data.compliance.bdd_check.passed !== 'number') {
            warnings.push('compliance.bdd_check.passed should be a number');
          }
        }
      }
      
      // NFR checks
      if (data.compliance.nfr_checks) {
        for (const [nfrType, nfrData] of Object.entries(data.compliance.nfr_checks)) {
          if (nfrData && nfrData.status && !VALID_COMPLIANCE_STATUSES.includes(nfrData.status)) {
            errors.push(`Invalid compliance.nfr_checks.${nfrType}.status: "${nfrData.status}"`);
          }
        }
      }
    } else {
      warnings.push('Missing compliance structure');
    }
    
    // Signatures validation
    if (data.signatures) {
      if (!Array.isArray(data.signatures)) {
        errors.push('signatures must be an array');
      } else {
        data.signatures.forEach((sig, idx) => {
          if (!sig.agent) {
            errors.push(`signatures[${idx}]: missing agent field`);
          }
          if (!sig.role) {
            warnings.push(`signatures[${idx}]: missing role field`);
          } else if (!VALID_AGENT_ROLES.includes(sig.role)) {
            warnings.push(`signatures[${idx}]: unknown role "${sig.role}"`);
          }
        });
      }
    }
    
    // Check for template placeholders
    if (content.includes('CHANGE-XXX') || content.includes('ROAD-XXX') || content.includes('YYYY-MM-DD')) {
      warnings.push('Contains unresolved template placeholders');
    }
    
    // Published status checks
    if (data.status === 'published') {
      if (!data.compliance) {
        errors.push('Published changes must have compliance data');
      } else {
        if (data.compliance.adr_check?.status !== 'pass') {
          warnings.push('Published change has ADR check not passed');
        }
        if (data.compliance.bdd_check?.status !== 'pass') {
          warnings.push('Published change has BDD check not passed');
        }
      }
      
      if (!data.signatures || data.signatures.length === 0) {
        warnings.push('Published changes should have agent signatures');
      }
    }
    
  } catch (err) {
    errors.push(`Failed to parse file: ${err.message}`);
  }
  
  // In strict mode, warnings become errors
  if (strict) {
    errors.push(...warnings);
    warnings.length = 0;
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
 * Validate all CHANGE files
 */
function validateAllChanges(strict = false) {
  log('\n📝 Validating CHANGE Files\n', 'cyan');
  
  if (!fs.existsSync(CHANGES_DIR)) {
    log('  Changes directory not found', 'yellow');
    return { total: 0, passed: 0, failed: 0 };
  }
  
  const files = fs.readdirSync(CHANGES_DIR)
    .filter(f => f.endsWith('.md'));
  
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const file of files) {
    const filePath = path.join(CHANGES_DIR, file);
    const result = validateChangeFile(filePath, strict);
    
    if (result.skipped) {
      skipped++;
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
  
  const validated = files.length - skipped;
  if (validated === 0) {
    log('  No CHANGE files found (this is OK for a new project)', 'dim');
  }
  
  return { total: validated, passed, failed };
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  
  const results = validateAllChanges(strict);
  
  log('\n────────────────────────────────────', 'dim');
  log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`, 
    results.failed > 0 ? 'red' : 'green');
  
  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateChangeFile, validateAllChanges };
