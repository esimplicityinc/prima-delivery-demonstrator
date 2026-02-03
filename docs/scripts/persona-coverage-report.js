#!/usr/bin/env node
/**
 * Persona Coverage Report
 * Generates report showing user story coverage by persona
 *
 * Usage:
 *   ./scripts/persona-coverage-report.js
 *   ./scripts/persona-coverage-report.js --format=json
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const yaml = require('js-yaml');

// Use __dirname for paths since script is in docs/scripts/
const DOCS_DIR = path.join(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const format = args.includes('--format=json') ? 'json' : 'human';

/**
 * Extract front matter from markdown content
 */
function extractFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  try {
    return yaml.load(match[1]);
  } catch (e) {
    return { error: e.message };
  }
}

/**
 * Load all personas
 */
function loadPersonas() {
  const personas = [];
  const personasDir = path.join(DOCS_DIR, 'personas');
  
  // Gracefully handle missing directory
  if (!fs.existsSync(personasDir)) {
    return personas;
  }
  
  const files = glob.sync(path.join(personasDir, 'PER-*.md'));

  for (const file of files) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);

    if (fm && fm.id) {
      personas.push({
        id: fm.id,
        name: fm.name || fm.id,
        tag: fm.tag || `@${fm.id}`,
        type: fm.type || 'unknown',
        archetype: fm.archetype || 'unknown',
        status: fm.status || 'draft',
        description: fm.description || '',
        typical_capabilities: fm.typical_capabilities || [],
        related_stories: fm.related_stories || [],
        related_personas: fm.related_personas || []
      });
    }
  }

  return personas;
}

/**
 * Load all user stories
 */
function loadUserStories() {
  const stories = [];
  const storiesDir = path.join(DOCS_DIR, 'user-stories');
  
  // Gracefully handle missing directory
  if (!fs.existsSync(storiesDir)) {
    return stories;
  }
  
  const files = glob.sync(path.join(storiesDir, 'US-*.md'));

  for (const file of files) {
    if (path.basename(file) === 'index.md') continue;

    const content = fs.readFileSync(file, 'utf8');
    const fm = extractFrontMatter(content);

    if (fm && fm.id) {
      stories.push({
        id: fm.id,
        title: fm.title || fm.id,
        persona: fm.persona || null,
        capabilities: fm.capabilities || [],
        use_cases: fm.use_cases || [],
        status: fm.status || 'unknown'
      });
    }
  }

  return stories;
}

/**
 * Generate coverage report
 */
function generateReport() {
  const personas = loadPersonas();
  const stories = loadUserStories();

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPersonas: personas.length,
      totalStories: stories.length,
      storiesWithPersona: 0,
      storiesWithoutPersona: 0,
      coveragePercent: 0
    },
    personas: {}
  };

  // Initialize persona tracking
  for (const persona of personas) {
    report.personas[persona.id] = {
      name: persona.name,
      tag: persona.tag,
      type: persona.type,
      archetype: persona.archetype,
      status: persona.status,
      storyCount: 0,
      stories: [],
      capabilities: persona.typical_capabilities,
      covered: false
    };
  }

  // Map stories to personas
  for (const story of stories) {
    if (story.persona && report.personas[story.persona]) {
      report.personas[story.persona].storyCount++;
      report.personas[story.persona].stories.push({
        id: story.id,
        title: story.title,
        status: story.status
      });
      report.personas[story.persona].covered = true;
      report.summary.storiesWithPersona++;
    } else {
      report.summary.storiesWithoutPersona++;
    }
  }

  // Calculate coverage
  const coveredCount = Object.values(report.personas)
    .filter(p => p.covered).length;
  report.summary.coveragePercent = personas.length > 0
    ? Math.round((coveredCount / personas.length) * 100)
    : 0;

  return report;
}

/**
 * Output in human-readable format
 */
function outputHuman(report) {
  console.log('👥 Persona Coverage Report');
  console.log('═══════════════════════════════════════════\n');

  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Coverage: ${report.summary.coveragePercent}% (${Object.values(report.personas).filter(p => p.covered).length}/${report.summary.totalPersonas} personas have stories)\n`);

  console.log('Summary:');
  console.log(`  Total Personas: ${report.summary.totalPersonas}`);
  console.log(`  Total Stories: ${report.summary.totalStories}`);
  console.log(`  Stories with Persona: ${report.summary.storiesWithPersona}`);
  console.log(`  Stories without Persona: ${report.summary.storiesWithoutPersona}\n`);

  console.log('Persona Coverage:');
  console.log('───────────────────────────────────────────\n');

  for (const [personaId, personaData] of Object.entries(report.personas)) {
    const status = personaData.covered ? '✅' : '❌';
    const stories = personaData.storyCount > 0
      ? `${personaData.storyCount} stories`
      : 'No story coverage';

    console.log(`${status} ${personaId}: ${personaData.name}`);
    console.log(`   Tag: ${personaData.tag}`);
    console.log(`   Type: ${personaData.type} | Archetype: ${personaData.archetype}`);
    console.log(`   Status: ${personaData.status}`);
    console.log(`   Stories: ${stories}`);

    if (personaData.stories.length > 0) {
      console.log('   Story Details:');
      for (const story of personaData.stories) {
        console.log(`     - ${story.id}: ${story.title}`);
      }
    }

    if (personaData.capabilities.length > 0) {
      console.log(`   Capabilities: ${personaData.capabilities.join(', ')}`);
    }

    console.log('');
  }

  // Uncovered personas
  const uncovered = Object.entries(report.personas)
    .filter(([_, p]) => !p.covered)
    .map(([id, _]) => id);

  if (uncovered.length > 0) {
    console.log('❌ Personas without Story Coverage:');
    console.log('───────────────────────────────────────────');
    for (const personaId of uncovered) {
      const p = report.personas[personaId];
      console.log(`  ${personaId}: ${p.name} (${p.status})`);
    }
    console.log('');
  }

  // Stories without personas
  if (report.summary.storiesWithoutPersona > 0) {
    console.log('⚠️  Stories without Persona Assignment:');
    console.log('───────────────────────────────────────────');
    const stories = loadUserStories().filter(s => !s.persona);
    for (const story of stories) {
      console.log(`  ${story.id}: ${story.title}`);
    }
    console.log('');
  }
}

/**
 * Main
 */
function main() {
  const report = generateReport();

  // Check if we have any data to report on
  if (report.summary.totalPersonas === 0 && report.summary.totalStories === 0) {
    console.log('📊 Persona Coverage Report');
    console.log('═══════════════════════════════════════════\n');
    console.log('ℹ️  No personas or user stories found');
    console.log('   Add personas/ and user-stories/ directories when ready\n');
    process.exit(0);
  }

  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    outputHuman(report);
  }

  // Exit with error if any persona has no coverage
  const uncoveredCount = Object.values(report.personas)
    .filter(p => !p.covered).length;

  if (uncoveredCount > 0 || report.summary.storiesWithoutPersona > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();
