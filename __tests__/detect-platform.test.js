/**
 * Tests for detect-platform.js
 */

const path = require('path');
const fs = require('fs');

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    access: jest.fn(),
    readFile: jest.fn()
  }
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  exec: jest.fn()
}));

const { execSync } = require('child_process');

// Import after mocking
const {
  detect,
  detectAsync,
  invalidateCache,
  detectCI,
  detectDeployment,
  detectProjectType,
  detectPackageManager,
  detectBranchStrategy,
  detectMainBranch
} = require('../lib/platform/detect-platform');

describe('detect-platform', () => {
  beforeEach(() => {
    // Clear all mocks and cache before each test
    jest.clearAllMocks();
    invalidateCache();
    fs.existsSync.mockReturnValue(false);
  });

  describe('detectCI', () => {
    it('should detect github-actions when .github/workflows exists', () => {
      fs.existsSync.mockImplementation((path) => path === '.github/workflows');
      expect(detectCI()).toBe('github-actions');
    });

    it('should detect gitlab-ci when .gitlab-ci.yml exists', () => {
      fs.existsSync.mockImplementation((path) => path === '.gitlab-ci.yml');
      expect(detectCI()).toBe('gitlab-ci');
    });

    it('should detect circleci when .circleci/config.yml exists', () => {
      fs.existsSync.mockImplementation((path) => path === '.circleci/config.yml');
      expect(detectCI()).toBe('circleci');
    });

    it('should detect jenkins when Jenkinsfile exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'Jenkinsfile');
      expect(detectCI()).toBe('jenkins');
    });

    it('should detect travis when .travis.yml exists', () => {
      fs.existsSync.mockImplementation((path) => path === '.travis.yml');
      expect(detectCI()).toBe('travis');
    });

    it('should return null when no CI config found', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detectCI()).toBeNull();
    });
  });

  describe('detectDeployment', () => {
    it('should detect railway when railway.json exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'railway.json');
      expect(detectDeployment()).toBe('railway');
    });

    it('should detect vercel when vercel.json exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'vercel.json');
      expect(detectDeployment()).toBe('vercel');
    });

    it('should detect netlify when netlify.toml exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'netlify.toml');
      expect(detectDeployment()).toBe('netlify');
    });

    it('should detect fly when fly.toml exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'fly.toml');
      expect(detectDeployment()).toBe('fly');
    });

    it('should return null when no deployment config found', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detectDeployment()).toBeNull();
    });
  });

  describe('detectProjectType', () => {
    it('should detect nodejs when package.json exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'package.json');
      expect(detectProjectType()).toBe('nodejs');
    });

    it('should detect python when requirements.txt exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'requirements.txt');
      expect(detectProjectType()).toBe('python');
    });

    it('should detect python when pyproject.toml exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'pyproject.toml');
      expect(detectProjectType()).toBe('python');
    });

    it('should detect rust when Cargo.toml exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'Cargo.toml');
      expect(detectProjectType()).toBe('rust');
    });

    it('should detect go when go.mod exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'go.mod');
      expect(detectProjectType()).toBe('go');
    });

    it('should detect java when pom.xml exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'pom.xml');
      expect(detectProjectType()).toBe('java');
    });

    it('should return unknown when no project file found', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detectProjectType()).toBe('unknown');
    });
  });

  describe('detectPackageManager', () => {
    it('should detect pnpm when pnpm-lock.yaml exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'pnpm-lock.yaml');
      expect(detectPackageManager()).toBe('pnpm');
    });

    it('should detect yarn when yarn.lock exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'yarn.lock');
      expect(detectPackageManager()).toBe('yarn');
    });

    it('should detect npm when package-lock.json exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'package-lock.json');
      expect(detectPackageManager()).toBe('npm');
    });

    it('should detect bun when bun.lockb exists', () => {
      fs.existsSync.mockImplementation((path) => path === 'bun.lockb');
      expect(detectPackageManager()).toBe('bun');
    });

    it('should return null when no lockfile found', () => {
      fs.existsSync.mockReturnValue(false);
      expect(detectPackageManager()).toBeNull();
    });
  });

  describe('detectMainBranch', () => {
    it('should return main branch from git symbolic-ref', () => {
      execSync.mockReturnValue('refs/remotes/origin/main\n');
      expect(detectMainBranch()).toBe('main');
    });

    it('should fallback to main if symbolic-ref fails but main exists', () => {
      execSync
        .mockImplementationOnce(() => { throw new Error('not found'); })
        .mockImplementationOnce(() => 'abc123');
      expect(detectMainBranch()).toBe('main');
    });

    it('should fallback to master if main does not exist', () => {
      execSync.mockImplementation(() => { throw new Error('not found'); });
      expect(detectMainBranch()).toBe('master');
    });
  });

  describe('detect (main function)', () => {
    it('should return cached result on subsequent calls', () => {
      fs.existsSync.mockImplementation((path) => path === 'package.json');
      execSync.mockReturnValue('refs/remotes/origin/main\n');

      const result1 = detect();
      const result2 = detect();

      expect(result1).toBe(result2); // Same reference (cached)
      expect(result1.projectType).toBe('nodejs');
    });

    it('should refresh cache when forceRefresh is true', () => {
      fs.existsSync.mockReturnValue(false);
      execSync.mockReturnValue('refs/remotes/origin/main\n');

      const result1 = detect();
      expect(result1.projectType).toBe('unknown');
      
      // Change the mock and force refresh
      fs.existsSync.mockImplementation((path) => path === 'Cargo.toml');
      invalidateCache(); // Clear internal file cache too
      const result2 = detect(true);

      expect(result2.projectType).toBe('rust');
    });

    it('should include timestamp in result', () => {
      execSync.mockReturnValue('refs/remotes/origin/main\n');
      const result = detect();
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('invalidateCache', () => {
    it('should force new detection on next call', () => {
      fs.existsSync.mockReturnValue(false);
      execSync.mockReturnValue('refs/remotes/origin/main\n');

      detect();
      invalidateCache();
      
      // Change the mock
      fs.existsSync.mockImplementation((path) => path === 'go.mod');
      
      const result = detect();
      expect(result.projectType).toBe('go');
    });
  });
});
