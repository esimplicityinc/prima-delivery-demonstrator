#!/usr/bin/env node
/**
 * Documentation Validation Runner
 * Runs all validation scripts before building the documentation site
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Scripts are in the same directory as this file
const SCRIPTS_DIR = __dirname;
const DOCS_DIR = path.join(__dirname, '..');
const ROOT_DIR = path.join(__dirname, '..', '..');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runScript(scriptPath, args = [], description) {
  log(`\n▶ ${description}`, 'blue');
  
  try {
    const script = path.join(SCRIPTS_DIR, scriptPath);
    
    // Check if script exists
    if (!fs.existsSync(script)) {
      log(`  ⚠ Script not found: ${scriptPath}`, 'yellow');
      return { success: true, skipped: true };
    }
    
    const command = `node "${script}" ${args.join(' ')}`;
    const output = execSync(command, {
      cwd: DOCS_DIR,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (output) {
      console.log(output);
    }
    
    log('  ✓ Passed', 'green');
    return { success: true, skipped: false };
  } catch (error) {
    log('  ✗ Failed', 'red');
    if (error.stdout) {
      console.log(error.stdout.toString());
    }
    if (error.stderr) {
      console.error(error.stderr.toString());
    }
    return { success: false, skipped: false, error };
  }
}

function main() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   Documentation Validation Suite      ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  const results = [];
  
  // Check if we should run all validations or just critical ones
  const mode = process.argv.includes('--ci') ? 'ci' : 'standard';
  const skipOptional = process.argv.includes('--skip-optional');
  
  log(`\nRunning in ${mode} mode`, 'cyan');
  
  // 1. Validate all ROAD items
  log('\n═══ Roadmap Items ═══', 'cyan');
  results.push(runScript(
    'governance-linter.js',
    ['--all-roads'],
    'Validating all roadmap items'
  ));
  
  // 2. Validate ADRs
  log('\n═══ Architecture Decisions ═══', 'cyan');
  results.push(runScript(
    'governance-linter.js',
    ['--adrs'],
    'Validating architecture decision records'
  ));
  
  // 3. Validate CHANGE files
  log('\n═══ Change History ═══', 'cyan');
  results.push(runScript(
    'validate-changes.js',
    [],
    'Validating change files'
  ));
  
  // 4. Validate BDD tags (optional in standard mode)
  if (!skipOptional) {
    log('\n═══ BDD Tests ═══', 'cyan');
    results.push(runScript(
      'validate-bdd-tags.js',
      mode === 'ci' ? ['--strict'] : [],
      'Validating BDD capability tags'
    ));
  }
  
  // 5. Run CI mode if requested
  if (mode === 'ci') {
    log('\n═══ Full CI Validation ═══', 'cyan');
    results.push(runScript(
      'governance-linter.js',
      ['--ci'],
      'Running comprehensive CI validation'
    ));
  }
  
  // Summary
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║           Validation Summary           ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  const passed = results.filter(r => r.success && !r.skipped).length;
  const failed = results.filter(r => !r.success).length;
  const skipped = results.filter(r => r.skipped).length;
  const total = results.length;
  
  log(`\nTotal checks: ${total}`, 'blue');
  log(`✓ Passed: ${passed}`, 'green');
  if (skipped > 0) {
    log(`⊘ Skipped: ${skipped}`, 'yellow');
  }
  if (failed > 0) {
    log(`✗ Failed: ${failed}`, 'red');
  }
  
  if (failed > 0) {
    log('\n❌ Validation failed! Fix the errors above before building.', 'red');
    process.exit(1);
  } else {
    log('\n✅ All validations passed!', 'green');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
