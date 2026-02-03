/**
 * BDD Test Result Types
 */

export interface BDDStep {
  keyword: string;
  text: string;
}

export interface BDDScenario {
  name: string;
  tags: string[];
  steps: BDDStep[];
  status: 'passed' | 'failed' | 'pending';
  duration?: string;
  error?: string;
}

export interface BDDFile {
  file: string;
  feature: string;
  description: string;
  tags: string[];
  scenarios: BDDScenario[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
  lastRun: string;
}

export interface BDDResults {
  bdd: BDDFile[];
}

// Cucumber JSON Report Types
export interface CucumberTag {
  name: string;
}

export interface CucumberStepResult {
  status: string;
  duration?: number;
  error_message?: string;
}

export interface CucumberStep {
  keyword: string;
  name: string;
  result?: CucumberStepResult;
}

export interface CucumberElement {
  type: string;
  name: string;
  tags: CucumberTag[];
  steps: CucumberStep[];
}

export interface CucumberFeature {
  uri: string;
  name: string;
  description: string;
  tags: CucumberTag[];
  elements: CucumberElement[];
}
