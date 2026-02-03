#!/usr/bin/env node
/**
 * Update BDD Test Results in CHANGE files
 * 
 * Reads Cucumber JSON report and updates individual docs/changes/CHANGE-XXX.md
 * files with test results in front matter.
 * 
 * Usage: node scripts/update-bdd-results.js [ROAD-ID]
 * If no ROAD-ID provided, processes all ROAD items with test results
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use __dirname for paths since script is in docs/scripts/
const CUCUMBER_REPORT_PATH = path.join(__dirname, '..', 'stack-tests', 'cucumber-report', 'report.json');
const CHANGES_DIR = path.join(__dirname, '..', 'changes');
const FEATURES_DIR = path.join(__dirname, '..', 'stack-tests', 'features');

/**
 * Parse Cucumber JSON report
 */
function parseCucumberReport() {
  if (!fs.existsSync(CUCUMBER_REPORT_PATH)) {
    console.log('ℹ️  Cucumber report not found:', CUCUMBER_REPORT_PATH);
    console.log('   Skipping BDD results update (run tests first when ready)');
    return null;
  }

  const reportContent = fs.readFileSync(CUCUMBER_REPORT_PATH, 'utf8');
  const report = JSON.parse(reportContent);
  
  if (!Array.isArray(report) || report.length === 0) {
    console.log('⚠️  No test results in report');
    return [];
  }

  return report;
}

/**
 * Extract ROAD ID from tags
 */
function extractRoadId(tags) {
  if (!Array.isArray(tags)) return null;
  
  for (const tag of tags) {
    const name = tag.name || tag;
    const match = name.match(/@ROAD-(\d+)/);
    if (match) {
      return `ROAD-${match[1]}`;
    }
  }
  return null;
}

/**
 * Map feature file to relative path from repo root
 */
function getFeatureFilePath(feature) {
  const uri = feature.uri || '';
  // Convert absolute path to relative
  return uri.replace(process.cwd() + '/', '');
}

/**
 * Process Cucumber report and group by ROAD ID
 */
function processTestResults(features) {
  const resultsByRoad = new Map();

  for (const feature of features) {
    const roadId = extractRoadId(feature.tags);
    if (!roadId) {
      console.log(`⚠️  Skipping feature without ROAD tag: ${feature.name}`);
      continue;
    }

    const scenarios = [];
    let passed = 0;
    let failed = 0;
    let pending = 0;

    for (const element of feature.elements || []) {
      if (element.type !== 'scenario') continue;

      const scenario = {
        name: element.name,
        tags: (element.tags || []).map(t => t.name || t),
        status: 'pending',
        duration: 0,
        error: null
      };

      // Calculate scenario status from steps
      let hasFailed = false;
      let totalDuration = 0;
      const errors = [];

      for (const step of element.steps || []) {
        if (step.result) {
          totalDuration += step.result.duration || 0;
          
          if (step.result.status === 'failed') {
            hasFailed = true;
            if (step.result.error_message) {
              errors.push(step.result.error_message);
            }
          } else if (step.result.status === 'skipped' || step.result.status === 'pending') {
            // Keep as pending unless failed
          }
        }
      }

      if (hasFailed) {
        scenario.status = 'failed';
        scenario.error = errors.join('\n');
        failed++;
      } else if (element.steps && element.steps.length > 0) {
        // Check if all steps passed
        const allPassed = element.steps.every(s => s.result && s.result.status === 'passed');
        if (allPassed) {
          scenario.status = 'passed';
          passed++;
        } else {
          scenario.status = 'pending';
          pending++;
        }
      } else {
        pending++;
      }

      // Convert duration from nanoseconds to seconds
      scenario.duration = (totalDuration / 1000000000).toFixed(2) + 's';

      scenarios.push(scenario);
    }

    const filePath = getFeatureFilePath(feature);

    if (!resultsByRoad.has(roadId)) {
      resultsByRoad.set(roadId, []);
    }

    resultsByRoad.get(roadId).push({
      file: filePath,
      feature: feature.name,
      description: feature.description || '',
      tags: (feature.tags || []).map(t => t.name || t),
      scenarios,
      summary: {
        total: scenarios.length,
        passed,
        failed,
        pending
      },
      lastRun: new Date().toISOString()
    });
  }

  return resultsByRoad;
}

/**
 * Find CHANGE file for a ROAD ID
 */
function findChangeFile(roadId) {
  const changeFiles = fs.readdirSync(CHANGES_DIR)
    .filter(f => f.startsWith('CHANGE-') && f.endsWith('.md'));
  
  for (const file of changeFiles) {
    const filePath = path.join(CHANGES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    
    if (data.road_id === roadId) {
      return { file, filePath, data };
    }
  }
  
  return null;
}

/**
 * Update individual CHANGE files with test results
 */
function updateChangeFiles(resultsByRoad, targetRoadId = null) {
  if (!fs.existsSync(CHANGES_DIR)) {
    console.error('❌ Changes directory not found:', CHANGES_DIR);
    process.exit(1);
  }

  let updated = false;

  // Process each ROAD item
  for (const [roadId, bddResults] of resultsByRoad) {
    if (targetRoadId && roadId !== targetRoadId) {
      continue;
    }

    // Find the CHANGE file for this ROAD ID
    const changeInfo = findChangeFile(roadId);

    if (!changeInfo) {
      console.log(`⚠️  No CHANGE entry found for ${roadId}`);
      continue;
    }

    // Read and parse the CHANGE file
    const fileContent = fs.readFileSync(changeInfo.filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Calculate total scenarios
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    
    for (const feature of bddResults) {
      if (feature.summary) {
        totalScenarios += feature.summary.total || 0;
        passedScenarios += feature.summary.passed || 0;
        failedScenarios += feature.summary.failed || 0;
      }
    }

    // Add/update test_results in frontmatter
    data.test_results = {
      bdd: {
        total: totalScenarios,
        passed: passedScenarios,
        failed: failedScenarios,
        status: failedScenarios > 0 ? 'fail' : 'pass',
        features: bddResults.map(r => ({
          name: r.feature,
          file: r.file,
          scenarios: r.summary?.total || 0,
          passed: r.summary?.passed || 0,
          failed: r.summary?.failed || 0
        }))
      }
    };

    // Also update compliance.bdd_check
    if (!data.compliance) {
      data.compliance = {};
    }
    data.compliance.bdd_check = {
      status: failedScenarios > 0 ? 'fail' : 'pass',
      scenarios: totalScenarios,
      passed: passedScenarios,
      coverage: totalScenarios > 0 ? Math.round((passedScenarios / totalScenarios) * 100) + '%' : 'N/A'
    };

    // Reconstruct the file with updated frontmatter
    const updatedContent = matter.stringify(content, data);
    fs.writeFileSync(changeInfo.filePath, updatedContent);
    
    updated = true;
    console.log(`✅ Updated ${changeInfo.file} for ${roadId} (${totalScenarios} scenarios, ${passedScenarios} passed)`);
  }

  if (updated) {
    console.log('\n✅ CHANGE files updated successfully');
  } else {
    console.log('\n⚠️  No updates made');
  }
}

/**
 * Main function
 */
function main() {
  const targetRoadId = process.argv[2] || null;

  console.log('🧪 Updating BDD Test Results in CHANGE files\n');

  if (targetRoadId) {
    console.log(`🎯 Target: ${targetRoadId}\n`);
  }

  // Parse test results
  const features = parseCucumberReport();
  if (!features || features.length === 0) {
    console.log('ℹ️  No features to process');
    return;
  }

  // Process and group by ROAD ID
  const resultsByRoad = processTestResults(features);
  
  if (resultsByRoad.size === 0) {
    console.log('⚠️  No test results with ROAD tags found');
    return;
  }

  console.log(`📊 Found test results for ${resultsByRoad.size} ROAD item(s)\n`);

  // Update individual CHANGE files
  updateChangeFiles(resultsByRoad, targetRoadId);
}

main();
