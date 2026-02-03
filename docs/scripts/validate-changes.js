#!/usr/bin/env node
/**
 * Validate CHANGE files
 * 
 * Validates all docs/changes/CHANGE-*.md files have required frontmatter
 * 
 * Usage: node scripts/validate-changes.js [CHANGE-ID]
 * If no CHANGE-ID provided, validates all CHANGE files
 */

const fs = require('fs');
const path = require('path');

// Simple YAML-like parser for frontmatter (no dependencies)
function parseFrontmatter(content) {
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) return { data: {}, content: content };

  const yamlText = fmMatch[1];
  const restContent = content.slice(fmMatch[0].length);

  const data = {};
  const lines = yamlText.split('\n');

  function parseValue(value) {
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrContent = value.slice(1, -1);
      return arrContent.split(',').map(s => s.trim()).filter(s => s);
    } else if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    } else if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else if (!isNaN(value) && value !== '') {
      return Number(value);
    } else {
      return value;
    }
  }

  // Parse with state machine approach
  // Stack tracks: { type: 'object'|'array', ref: object/array, key: string, indent: number }
  const stack = [{ type: 'object', ref: data, key: null, indent: -1 }];
  let lineIdx = 0;

  function getIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  function peekStack() {
    return stack[stack.length - 1];
  }

  function popUntilIndent(indent) {
    while (stack.length > 1 && peekStack().indent >= indent) {
      stack.pop();
    }
  }

  function isArrayItemLine(line, baseIndent) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) return false;
    const lineIndent = getIndent(line);
    // Array item should be at baseIndent + 2
    return lineIndent === baseIndent + 2;
  }

  function lookAheadForArray(startIdx, baseIndent) {
    for (let i = startIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '' || line.trim().startsWith('#')) continue;
      const indent = getIndent(line);
      if (indent <= baseIndent) return false; // Out of scope
      if (line.trim().startsWith('- ')) {
        return indent === baseIndent + 2;
      }
      return false;
    }
    return false;
  }

  while (lineIdx < lines.length) {
    let line = lines[lineIdx];

    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      lineIdx++;
      continue;
    }

    const indent = getIndent(line);
    const trimmed = line.trim();

    // Check if it's an array item marker
    if (trimmed.startsWith('- ')) {
      const current = peekStack();
      const itemContent = trimmed.slice(2);

      // Pop stack to find the containing array
      while (stack.length > 1 && current.type !== 'array') {
        stack.pop();
      }

      const arr = peekStack().ref;

      // Check if itemContent has inline key: value
      const inlineMatch = itemContent.match(/^(\w+):\s*(.*)$/);

      if (inlineMatch) {
        const key = inlineMatch[1];
        const value = inlineMatch[2].trim();

        if (value === '') {
          // This is the start of an object in the array
          const newObj = {};
          arr.push(newObj);
          stack.push({ type: 'object', ref: newObj, key: null, indent: indent });
          // The next line will process the nested key
          // We need to push this as current context and continue
          // The key from "- key:" becomes the current key context for nested values
          // Actually, we should process the nested key on the next iteration
        } else {
          // Simple object with one key-value pair in array
          const obj = {};
          obj[key] = parseValue(value);
          arr.push(obj);
        }
      } else {
        // Simple value in array
        arr.push(parseValue(itemContent));
      }

      lineIdx++;
      continue;
    }

    // It's a key: value line
    const keyMatch = line.match(/^(\s*)([\w-]+):\s*(.*)$/);

    if (keyMatch) {
      const keyIndent = keyMatch[1].length;
      const key = keyMatch[2];
      const value = keyMatch[3].trim();

      // Pop stack until we find the right container
      popUntilIndent(keyIndent);

      const current = peekStack();

      if (value === '') {
        // Check if this should be an array
        if (lookAheadForArray(lineIdx, keyIndent)) {
          const newArr = [];
          if (current.type === 'object') {
            current.ref[key] = newArr;
          } else if (current.type === 'array') {
            // This shouldn't happen for well-formed YAML
            const lastItem = current.ref[current.ref.length - 1];
            if (lastItem && typeof lastItem === 'object') {
              lastItem[key] = newArr;
            }
          }
          stack.push({ type: 'array', ref: newArr, key: key, indent: keyIndent });
        } else {
          // It's a nested object
          const newObj = {};
          if (current.type === 'object') {
            current.ref[key] = newObj;
          } else if (current.type === 'array') {
            const lastItem = current.ref[current.ref.length - 1];
            if (lastItem && typeof lastItem === 'object') {
              lastItem[key] = newObj;
            }
          }
          stack.push({ type: 'object', ref: newObj, key: key, indent: keyIndent });
        }
      } else {
        // Regular key-value pair
        if (current.type === 'object') {
          current.ref[key] = parseValue(value);
        } else if (current.type === 'array') {
          // We're adding a key-value pair to an object inside an array
          const lastItem = current.ref[current.ref.length - 1];
          if (lastItem && typeof lastItem === 'object' && !Array.isArray(lastItem)) {
            lastItem[key] = parseValue(value);
          }
        }
      }
    }

    lineIdx++;
  }

  return { data, content: restContent };
}

// Simple glob implementation
function glob(pattern) {
  const dir = path.dirname(pattern);
  const basename = path.basename(pattern);
  const regex = new RegExp('^' + basename.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
  
  if (!fs.existsSync(dir)) return [];
  
  return fs.readdirSync(dir)
    .filter(f => regex.test(f))
    .map(f => path.join(dir, f));
}

// Use __dirname for paths since script is in docs/scripts/
const CHANGES_DIR = path.join(__dirname, '..', 'changes');

const REQUIRED_FIELDS = [
  'id',
  'road_id',
  'title',
  'date',
  'version',
  'status',
  'categories'
];

const REQUIRED_COMPLIANCE = [
  'adr_check',
  'bdd_check',
  'nfr_checks'
];

const VALID_STATUSES = ['draft', 'published', 'archived'];
const VALID_CATEGORIES = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Validate a single CHANGE file
 */
function validateChange(filePath) {
  const changeId = path.basename(filePath, '.md');
  const errors = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = parseFrontmatter(content);
    
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (data[field] === undefined || data[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Validate status
    if (data.status && !VALID_STATUSES.includes(data.status)) {
      errors.push(`Invalid status: ${data.status}. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    
    // Validate categories
    if (data.categories) {
      if (!Array.isArray(data.categories)) {
        errors.push('categories must be an array');
      } else {
        for (const cat of data.categories) {
          if (!VALID_CATEGORIES.includes(cat)) {
            errors.push(`Invalid category: ${cat}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
          }
        }
      }
    }
    
    // Check compliance section
    if (!data.compliance) {
      errors.push('Missing compliance section');
    } else {
      for (const check of REQUIRED_COMPLIANCE) {
        if (!data.compliance[check]) {
          errors.push(`Missing compliance check: ${check}`);
        }
      }
      
      // Validate adr_check
      if (data.compliance.adr_check) {
        if (!['pending', 'pass', 'fail'].includes(data.compliance.adr_check.status)) {
          errors.push(`Invalid adr_check.status: ${data.compliance.adr_check.status}`);
        }
      }
      
      // Validate bdd_check
      if (data.compliance.bdd_check) {
        if (!['pending', 'pass', 'fail'].includes(data.compliance.bdd_check.status)) {
          errors.push(`Invalid bdd_check.status: ${data.compliance.bdd_check.status}`);
        }
        if (typeof data.compliance.bdd_check.scenarios !== 'number') {
          errors.push('bdd_check.scenarios must be a number');
        }
        if (typeof data.compliance.bdd_check.passed !== 'number') {
          errors.push('bdd_check.passed must be a number');
        }
      }
      
      // Validate nfr_checks
      if (data.compliance.nfr_checks) {
        const nfrTypes = ['performance', 'security', 'accessibility'];
        for (const nfrType of nfrTypes) {
          if (!data.compliance.nfr_checks[nfrType]) {
            errors.push(`Missing nfr_checks.${nfrType}`);
          } else if (!['pending', 'pass', 'fail', 'na'].includes(data.compliance.nfr_checks[nfrType].status)) {
            errors.push(`Invalid nfr_checks.${nfrType}.status: ${data.compliance.nfr_checks[nfrType].status}`);
          }
        }
      }
    }
    
    // Check signatures for published changes
    if (data.status === 'published') {
      if (!data.signatures || data.signatures.length === 0) {
        errors.push('Published changes must have at least one signature');
      } else {
        // Check required signature fields
        for (let i = 0; i < data.signatures.length; i++) {
          const sig = data.signatures[i];
          if (!sig.agent) {
            errors.push(`Signature ${i + 1} missing agent field`);
          }
          if (!sig.role) {
            errors.push(`Signature ${i + 1} missing role field`);
          }
          if (!sig.status) {
            errors.push(`Signature ${i + 1} missing status field`);
          }
          if (!sig.timestamp) {
            errors.push(`Signature ${i + 1} missing timestamp field`);
          }
        }
      }
    }
    
    // Check for placeholder text in frontmatter values only (not content)
    const frontmatterText = JSON.stringify(data);
    if (frontmatterText.includes('XXX') || frontmatterText.includes('YYY')) {
      errors.push('Frontmatter contains placeholder text (XXX or YYY)');
    }
    
  } catch (err) {
    errors.push(`Parse error: ${err.message}`);
  }
  
  return errors;
}

/**
 * Main function
 */
function main() {
  const targetChangeId = process.argv[2] || null;
  
  console.log('🔍 Validating CHANGE files...\n');
  
  // Check if changes directory exists
  if (!fs.existsSync(CHANGES_DIR)) {
    console.error('❌ Changes directory not found:', CHANGES_DIR);
    process.exit(1);
  }
  
  let changeFiles;
  
  if (targetChangeId) {
    // Validate specific file
    const targetFile = path.join(CHANGES_DIR, targetChangeId + '.md');
    if (!fs.existsSync(targetFile)) {
      console.error(`❌ CHANGE file not found: ${targetChangeId}`);
      process.exit(1);
    }
    changeFiles = [targetFile];
  } else {
    // Validate all CHANGE files
    changeFiles = glob(path.join(CHANGES_DIR, 'CHANGE-*.md'));
  }
  
  console.log(`Found ${changeFiles.length} CHANGE file(s) to validate\n`);
  
  for (const file of changeFiles) {
    const changeId = path.basename(file, '.md');
    const errors = validateChange(file);
    
    results.total++;
    
    if (errors.length > 0) {
      console.log(`❌ ${changeId}:`);
      errors.forEach(e => console.log(`   - ${e}`));
      results.failed++;
      results.errors.push({
        changeId,
        file,
        errors
      });
    } else {
      console.log(`✅ ${changeId}`);
      results.passed++;
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Validation complete!`);
  console.log(`   Total: ${results.total}`);
  console.log(`   Passed: ${results.passed}`);
  console.log(`   Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log(`\n❌ Validation failed with ${results.failed} error(s)`);
    process.exit(1);
  } else {
    console.log(`\n✅ All CHANGE files valid!`);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateChange };
