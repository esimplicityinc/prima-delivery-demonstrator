#!/usr/bin/env node
/**
 * BDD Tag Validator
 * Validates that all @CAP-XXX tags reference existing capabilities
 *
 * Usage:
 *   ./scripts/validate-bdd-tags.js
 *   ./scripts/validate-bdd-tags.js --strict
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Use __dirname for paths since script is in docs/scripts/
const FEATURES_DIR = path.join(__dirname, '..', 'stack-tests', 'features');
const DOCS_DIR = path.join(__dirname, '..');

// Known valid capability IDs
const VALID_CAPABILITIES = [
  'CAP-001', 'CAP-002', 'CAP-003', 'CAP-004',
  'CAP-005', 'CAP-006', 'CAP-007'
];

// Parse arguments
const args = process.argv.slice(2);
const strict = args.includes('--strict');

const results = {
  errors: [],
  warnings: [],
  passed: [],
  total: 0
};

/**
 * Extract tags from feature/scenario content
 */
function extractTags(content) {
  const tags = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('@')) {
      const lineTags = trimmed.split(/\s+/);
      for (const tag of lineTags) {
        if (tag.startsWith('@')) {
          tags.push(tag);
        }
      }
    }
  }

  return tags;
}

/**
 * Validate capability tags in a feature file
 */
function validateFeatureFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tags = extractTags(content);

  const capTags = tags.filter(tag => tag.match(/^@CAP-\d+$/));

  for (const tag of capTags) {
    results.total++;
    const capId = tag.substring(1); // Remove @

    if (!VALID_CAPABILITIES.includes(capId)) {
      results.errors.push({
        file: filePath,
        tag: tag,
        message: `Unknown capability tag: ${tag}`
      });
    } else {
      results.passed.push({
        file: filePath,
        tag: tag,
        message: `Valid capability tag`
      });
    }
  }

  // In strict mode, warn if no capability tags
  if (strict && capTags.length === 0) {
    results.warnings.push({
      file: filePath,
      message: 'No capability tags found (@CAP-XXX)'
    });
  }
}

/**
 * Main validation
 */
function main() {
  // Gracefully handle missing features directory
  if (!fs.existsSync(FEATURES_DIR)) {
    console.log('🔍 BDD Tag Validator');
    console.log('═══════════════════════════════════════════\n');
    console.log('ℹ️  Features directory not found:', FEATURES_DIR);
    console.log('   Skipping BDD tag validation (add stack-tests/features/ when ready)\n');
    process.exit(0);
  }

  const featureFiles = glob.sync(path.join(FEATURES_DIR, '**/*.feature'));

  if (featureFiles.length === 0) {
    console.log('🔍 BDD Tag Validator');
    console.log('═══════════════════════════════════════════\n');
    console.log('ℹ️  No feature files found in:', FEATURES_DIR);
    console.log('   Skipping BDD tag validation\n');
    process.exit(0);
  }

  for (const file of featureFiles) {
    validateFeatureFile(file);
  }

  // Output results
  console.log('🔍 BDD Tag Validator');
  console.log('═══════════════════════════════════════════\n');

  if (results.errors.length > 0) {
    console.log(`❌ ERRORS (${results.errors.length})`);
    console.log('───────────────────────────────────────────');
    for (const error of results.errors) {
      const file = path.relative(process.cwd(), error.file);
      console.log(`\n${error.tag} in ${file}`);
      console.log(`  ${error.message}`);
    }
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${results.warnings.length})`);
    console.log('───────────────────────────────────────────');
    for (const warning of results.warnings) {
      const file = path.relative(process.cwd(), warning.file);
      console.log(`\n${file}`);
      console.log(`  ${warning.message}`);
    }
    console.log('');
  }

  console.log('───────────────────────────────────────────');
  console.log(`Summary: ${results.errors.length} errors, ${results.warnings.length} warnings`);
  console.log(`Capability tags checked: ${results.total}\n`);

  if (results.errors.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();
