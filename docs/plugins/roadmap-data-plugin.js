/**
 * Roadmap Data Plugin for Docusaurus
 * 
 * Parses all ROAD item files and generates static/roadmap-data.json
 * This allows the dashboard to load data at runtime
 * 
 * Status Workflow (8 states):
 * proposed → adr_validated → bdd_pending → bdd_complete → implementing → nfr_validating → complete
 *                                                                      ↘ nfr_blocked
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Valid status values for roadmap items
const VALID_STATUSES = [
  'proposed',
  'adr_validated',
  'bdd_pending',
  'bdd_complete',
  'implementing',
  'nfr_validating',
  'nfr_blocked',
  'complete'
];

// Valid priority values
const VALID_PRIORITIES = ['high', 'medium', 'low'];

module.exports = function roadmapDataPlugin(context, options) {
  return {
    name: 'roadmap-data-plugin',
    
    async loadContent() {
      const roadsDir = path.join(context.siteDir, 'roads');
      const staticDir = path.join(context.siteDir, 'static');
      
      // Ensure static directory exists
      if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir, { recursive: true });
      }
      
      const roadmapData = {
        items: [],
        generatedAt: new Date().toISOString(),
        validStatuses: VALID_STATUSES,
        validPriorities: VALID_PRIORITIES
      };
      
      // Read all ROAD files
      if (fs.existsSync(roadsDir)) {
        const files = fs.readdirSync(roadsDir)
          .filter(f => f.match(/ROAD-\d+\.md$/));
        
        for (const file of files) {
          try {
            const filePath = path.join(roadsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const { data } = matter(content);
            
            if (data.id && data.id.startsWith('ROAD-')) {
              // Validate and normalize status
              let status = data.status || 'proposed';
              if (!VALID_STATUSES.includes(status)) {
                console.warn(`⚠️  ${file}: Invalid status "${status}", defaulting to "proposed"`);
                status = 'proposed';
              }
              
              // Validate priority
              let priority = data.priority || 'medium';
              if (!VALID_PRIORITIES.includes(priority)) {
                console.warn(`⚠️  ${file}: Invalid priority "${priority}", defaulting to "medium"`);
                priority = 'medium';
              }
              
              // Build governance object with defaults
              const defaultGovernance = {
                adrs: {
                  validated: false,
                  validated_by: '',
                  validated_at: '',
                  compliance_check: []
                },
                bdd: {
                  status: 'draft',
                  approved_by: [],
                  test_results: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    coverage: '0%'
                  }
                },
                nfrs: {
                  applicable: [],
                  status: 'pending',
                  results: {}
                }
              };
              
              // Deep merge governance from file with defaults
              const governance = data.governance 
                ? deepMerge(defaultGovernance, data.governance)
                : defaultGovernance;
              
              roadmapData.items.push({
                id: data.id,
                title: data.title || 'Untitled',
                status,
                phase: data.phase || 1,
                priority,
                created: data.created || '',
                started: data.started || '',
                completed: data.completed || '',
                governance,
                blocks: data.blocks || [],
                depends_on: data.depends_on || [],
                blocked_by: data.blocked_by || [],
                filePath: `roads/${file.replace('.md', '')}`
              });
            }
          } catch (err) {
            console.warn(`Error parsing ${file}:`, err.message);
          }
        }
        
        // Sort by ID number
        roadmapData.items.sort((a, b) => {
          const numA = parseInt(a.id.split('-')[1]);
          const numB = parseInt(b.id.split('-')[1]);
          return numA - numB;
        });
      }
      
      // Write to static directory
      const outputPath = path.join(staticDir, 'roadmap-data.json');
      fs.writeFileSync(outputPath, JSON.stringify(roadmapData, null, 2));
      
      console.log(`✅ Generated roadmap-data.json with ${roadmapData.items.length} ROAD items`);
      
      return roadmapData;
    },
    
    async contentLoaded({ content, actions }) {
      // Data is already written to static directory
    },
  };
};

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}
