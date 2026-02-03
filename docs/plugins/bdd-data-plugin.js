/**
 * BDD Data Plugin for Docusaurus
 * 
 * Parses docs/changes/CHANGE-*.md files for test_results and generates static/bdd-data.json
 * Also parses feature files to get full scenario details
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

module.exports = function bddDataPlugin(context, options) {
  return {
    name: 'bdd-data-plugin',
    
    async loadContent() {
      const changesDir = path.join(context.siteDir, 'changes');
      const staticDir = path.join(context.siteDir, 'static');
      
      // Ensure static directory exists
      if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir, { recursive: true });
      }
      
      const bddData = {
        tests: [],
        generatedAt: new Date().toISOString()
      };
      
      // Find all CHANGE files
      if (fs.existsSync(changesDir)) {
        const changeFiles = glob.sync(path.join(changesDir, 'CHANGE-*.md'));
        
        for (const filePath of changeFiles) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const { data } = matter(content);
            
            const changeId = path.basename(filePath, '.md');
            
            // Extract test_results from frontmatter
            if (data.test_results && data.test_results.bdd) {
              bddData.tests.push({
                changeId,
                roadId: data.road_id,
                title: data.title,
                date: data.date,
                ...data.test_results.bdd
              });
            }
            // Also check for compliance.bdd_check data as fallback
            else if (data.compliance && data.compliance.bdd_check) {
              const bddCheck = data.compliance.bdd_check;
              
              // Only add if not already added via test_results
              if (!bddData.tests.find(t => t.changeId === changeId)) {
                bddData.tests.push({
                  changeId,
                  roadId: data.road_id,
                  title: data.title,
                  date: data.date,
                  total: bddCheck.scenarios || 0,
                  passed: bddCheck.passed || 0,
                  failed: (bddCheck.scenarios || 0) - (bddCheck.passed || 0),
                  status: bddCheck.status
                });
              }
            }
          } catch (err) {
            console.warn('Error parsing ' + filePath + ':', err.message);
          }
        }
        
        // Sort by date descending (newest first)
        bddData.tests.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      
      // Write bdd-data.json to static directory
      const outputPath = path.join(staticDir, 'bdd-data.json');
      fs.writeFileSync(outputPath, JSON.stringify(bddData, null, 2));
      
      console.log('✅ Generated bdd-data.json with ' + bddData.tests.length + ' BDD test result(s)');
      
      return bddData;
    },
    
    async contentLoaded({ content, actions }) {
      // Data is already written to static directory in loadContent
      // This hook can be used for additional processing if needed
    },
  };
};
