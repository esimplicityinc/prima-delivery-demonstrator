#!/usr/bin/env node
/**
 * BDD Tag Validator
 * Validates that BDD feature files have required tags and proper structure
 * 
 * Usage:
 *   node validate-bdd-tags.js          # Validate all feature files
 *   node validate-bdd-tags.js --strict # Strict mode (all warnings become errors)
 * 
 * Expected tags:
 *   @capability - Links to a capability/feature
 *   @context    - Bounded context (e.g., @context:marketplace)
 *   @road       - Links to roadmap item (e.g., @road:ROAD-001)
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration - common locations for feature files
const FEATURE_PATTERNS = [
  'stack-tests/features/**/*.feature',
  'tests/features/**/*.feature',
  'features/**/*.feature',
  'e2e/**/*.feature',
  'bdd/**/*.feature'
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
 * Parse a feature file and extract tags and structure
 */
function parseFeatureFile(content) {
  const lines = content.split('\n');
  const result = {
    featureTags: [],
    featureName: '',
    scenarios: [],
    errors: [],
    warnings: []
  };
  
  let currentTags = [];
  let inScenario = false;
  let currentScenario = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    
    // Tags line
    if (line.startsWith('@')) {
      currentTags = line.split(/\s+/).filter(t => t.startsWith('@'));
      continue;
    }
    
    // Feature line
    if (line.startsWith('Feature:')) {
      result.featureName = line.replace('Feature:', '').trim();
      result.featureTags = [...currentTags];
      currentTags = [];
      continue;
    }
    
    // Scenario or Scenario Outline
    if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
      if (currentScenario) {
        result.scenarios.push(currentScenario);
      }
      
      currentScenario = {
        name: line.replace(/Scenario( Outline)?:/, '').trim(),
        tags: [...currentTags],
        lineNumber: lineNum,
        hasGiven: false,
        hasWhen: false,
        hasThen: false
      };
      currentTags = [];
      inScenario = true;
      continue;
    }
    
    // Step keywords
    if (inScenario && currentScenario) {
      if (line.startsWith('Given ')) currentScenario.hasGiven = true;
      if (line.startsWith('When ')) currentScenario.hasWhen = true;
      if (line.startsWith('Then ')) currentScenario.hasThen = true;
    }
  }
  
  // Don't forget the last scenario
  if (currentScenario) {
    result.scenarios.push(currentScenario);
  }
  
  return result;
}

/**
 * Validate a single feature file
 */
function validateFeatureFile(filePath, strict = false) {
  const errors = [];
  const warnings = [];
  const fileName = path.basename(filePath);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = parseFeatureFile(content);
    
    // Check for feature-level tags
    if (parsed.featureTags.length === 0) {
      warnings.push('No feature-level tags found');
    } else {
      // Check for @capability tag
      const hasCapability = parsed.featureTags.some(t => 
        t.startsWith('@capability') || t.startsWith('@cap:')
      );
      if (!hasCapability) {
        warnings.push('Missing @capability tag at feature level');
      }
      
      // Check for @context tag
      const hasContext = parsed.featureTags.some(t => 
        t.startsWith('@context') || t.startsWith('@ctx:')
      );
      if (!hasContext) {
        warnings.push('Missing @context tag at feature level');
      }
    }
    
    // Check feature name
    if (!parsed.featureName) {
      errors.push('Missing feature name');
    }
    
    // Check scenarios
    if (parsed.scenarios.length === 0) {
      errors.push('No scenarios found');
    }
    
    for (const scenario of parsed.scenarios) {
      // Check for Given/When/Then
      if (!scenario.hasGiven && !scenario.hasWhen) {
        warnings.push(`Scenario "${scenario.name}" (line ${scenario.lineNumber}): Missing Given or When step`);
      }
      if (!scenario.hasThen) {
        warnings.push(`Scenario "${scenario.name}" (line ${scenario.lineNumber}): Missing Then step`);
      }
      
      // Check for empty scenario name
      if (!scenario.name || scenario.name.trim() === '') {
        errors.push(`Line ${scenario.lineNumber}: Scenario has no name`);
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
  
  return { fileName, filePath, errors, warnings };
}

/**
 * Find all feature files
 */
async function findFeatureFiles(rootDir) {
  const allFiles = [];
  
  for (const pattern of FEATURE_PATTERNS) {
    try {
      const files = await glob(pattern, { 
        cwd: rootDir,
        absolute: true,
        nodir: true
      });
      allFiles.push(...files);
    } catch (err) {
      // Pattern didn't match anything, that's OK
    }
  }
  
  // Remove duplicates
  return [...new Set(allFiles)];
}

/**
 * Validate all feature files
 */
async function validateAllFeatures(strict = false) {
  log('\n🥒 Validating BDD Feature Files\n', 'cyan');
  
  const rootDir = path.join(__dirname, '..', '..');
  const files = await findFeatureFiles(rootDir);
  
  if (files.length === 0) {
    log('  No feature files found (this is OK if BDD tests are not set up yet)', 'dim');
    log(`  Searched patterns: ${FEATURE_PATTERNS.join(', ')}`, 'dim');
    return { total: 0, passed: 0, failed: 0 };
  }
  
  let passed = 0;
  let failed = 0;
  
  for (const file of files) {
    const result = validateFeatureFile(file, strict);
    const relativePath = path.relative(rootDir, file);
    
    if (result.errors.length === 0) {
      log(`  ✓ ${relativePath}`, 'green');
      if (result.warnings.length > 0) {
        result.warnings.forEach(w => log(`    ⚠ ${w}`, 'yellow'));
      }
      passed++;
    } else {
      log(`  ✗ ${relativePath}`, 'red');
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
async function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  
  const results = await validateAllFeatures(strict);
  
  log('\n────────────────────────────────────', 'dim');
  log(`Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`, 
    results.failed > 0 ? 'red' : 'green');
  
  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { validateFeatureFile, validateAllFeatures, parseFeatureFile };
