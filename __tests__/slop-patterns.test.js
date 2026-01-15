/**
 * Tests for slop-patterns.js
 */

const {
  slopPatterns,
  getPatternsForLanguage,
  getPatternsForLanguageOnly,
  getUniversalPatterns,
  getPatternsBySeverity,
  getPatternsByAutoFix,
  getPatternsByCriteria,
  getAvailableLanguages,
  getAvailableSeverities,
  hasLanguage,
  isFileExcluded
} = require('../lib/patterns/slop-patterns');

describe('slop-patterns', () => {
  describe('slopPatterns', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(slopPatterns)).toBe(true);
    });

    it('should have pattern definitions with required fields', () => {
      Object.entries(slopPatterns).forEach(([name, pattern]) => {
        expect(pattern).toHaveProperty('severity');
        expect(pattern).toHaveProperty('autoFix');
        expect(pattern).toHaveProperty('description');
        expect(['critical', 'high', 'medium', 'low']).toContain(pattern.severity);
      });
    });

    it('should have valid regex patterns', () => {
      Object.entries(slopPatterns).forEach(([name, pattern]) => {
        if (pattern.pattern !== null) {
          expect(pattern.pattern).toBeInstanceOf(RegExp);
        }
      });
    });
  });

  describe('getPatternsForLanguage', () => {
    it('should return javascript patterns plus universal patterns', () => {
      const patterns = getPatternsForLanguage('javascript');
      expect(patterns).toHaveProperty('console_debugging');
      expect(patterns).toHaveProperty('empty_catch_js');
      // Should also include universal patterns
      expect(patterns).toHaveProperty('placeholder_text');
    });

    it('should return python patterns plus universal patterns', () => {
      const patterns = getPatternsForLanguage('python');
      expect(patterns).toHaveProperty('python_debugging');
      expect(patterns).toHaveProperty('empty_except_py');
    });

    it('should return rust patterns plus universal patterns', () => {
      const patterns = getPatternsForLanguage('rust');
      expect(patterns).toHaveProperty('rust_debugging');
    });

    it('should return only universal patterns for unknown language', () => {
      const patterns = getPatternsForLanguage('cobol');
      const universalPatterns = getUniversalPatterns();
      expect(Object.keys(patterns)).toEqual(Object.keys(universalPatterns));
    });
  });

  describe('getPatternsForLanguageOnly', () => {
    it('should return only javascript-specific patterns', () => {
      const patterns = getPatternsForLanguageOnly('javascript');
      expect(patterns).toHaveProperty('console_debugging');
      expect(patterns).not.toHaveProperty('placeholder_text'); // universal
    });
  });

  describe('getUniversalPatterns', () => {
    it('should return patterns with language: null', () => {
      const patterns = getUniversalPatterns();
      expect(patterns).toHaveProperty('placeholder_text');
      expect(patterns).toHaveProperty('old_todos');
      expect(patterns).toHaveProperty('trailing_whitespace');
    });
  });

  describe('getPatternsBySeverity', () => {
    it('should return critical severity patterns', () => {
      const patterns = getPatternsBySeverity('critical');
      expect(Object.keys(patterns).length).toBeGreaterThan(0);
      Object.values(patterns).forEach(pattern => {
        expect(pattern.severity).toBe('critical');
      });
    });

    it('should return high severity patterns', () => {
      const patterns = getPatternsBySeverity('high');
      expect(patterns).toHaveProperty('placeholder_text');
      expect(patterns).toHaveProperty('empty_catch_js');
    });

    it('should return empty object for invalid severity', () => {
      const patterns = getPatternsBySeverity('invalid');
      expect(Object.keys(patterns).length).toBe(0);
    });
  });

  describe('getPatternsByAutoFix', () => {
    it('should return patterns with remove autoFix', () => {
      const patterns = getPatternsByAutoFix('remove');
      expect(Object.keys(patterns).length).toBeGreaterThan(0);
      Object.values(patterns).forEach(pattern => {
        expect(pattern.autoFix).toBe('remove');
      });
    });

    it('should return patterns with flag autoFix', () => {
      const patterns = getPatternsByAutoFix('flag');
      expect(Object.keys(patterns).length).toBeGreaterThan(0);
    });
  });

  describe('getPatternsByCriteria', () => {
    it('should filter by language and severity', () => {
      const patterns = getPatternsByCriteria({
        language: 'javascript',
        severity: 'high'
      });
      
      Object.values(patterns).forEach(pattern => {
        expect(pattern.severity).toBe('high');
        expect([null, 'javascript']).toContain(pattern.language);
      });
    });

    it('should return all patterns when no criteria specified', () => {
      const patterns = getPatternsByCriteria({});
      expect(Object.keys(patterns).length).toBe(Object.keys(slopPatterns).length);
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return array of languages', () => {
      const languages = getAvailableLanguages();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages).toContain('javascript');
      expect(languages).toContain('python');
      expect(languages).toContain('rust');
      expect(languages).toContain('universal');
    });
  });

  describe('getAvailableSeverities', () => {
    it('should return array of severity levels', () => {
      const severities = getAvailableSeverities();
      expect(Array.isArray(severities)).toBe(true);
      expect(severities).toContain('critical');
      expect(severities).toContain('high');
      expect(severities).toContain('medium');
      expect(severities).toContain('low');
    });
  });

  describe('hasLanguage', () => {
    it('should return true for existing languages', () => {
      expect(hasLanguage('javascript')).toBe(true);
      expect(hasLanguage('python')).toBe(true);
      expect(hasLanguage('universal')).toBe(true);
    });

    it('should return false for non-existing languages', () => {
      expect(hasLanguage('cobol')).toBe(false);
      expect(hasLanguage('fortran')).toBe(false);
    });
  });

  describe('isFileExcluded', () => {
    it('should exclude test files when pattern matches', () => {
      expect(isFileExcluded('app.test.js', ['*.test.*'])).toBe(true);
      expect(isFileExcluded('app.spec.ts', ['*.spec.*'])).toBe(true);
    });

    it('should not exclude non-matching files', () => {
      expect(isFileExcluded('app.js', ['*.test.*'])).toBe(false);
      expect(isFileExcluded('index.ts', ['*.spec.*'])).toBe(false);
    });

    it('should handle multiple patterns', () => {
      const excludes = ['*.test.*', '*.spec.*', 'README.*'];
      expect(isFileExcluded('app.test.js', excludes)).toBe(true);
      expect(isFileExcluded('README.md', excludes)).toBe(true);
      expect(isFileExcluded('app.js', excludes)).toBe(false);
    });

    it('should return false for empty exclude patterns', () => {
      expect(isFileExcluded('any-file.js', [])).toBe(false);
      expect(isFileExcluded('any-file.js', null)).toBe(false);
    });
  });

  describe('Secret Detection Patterns', () => {
    it('should detect hardcoded secrets', () => {
      const pattern = slopPatterns.hardcoded_secrets.pattern;
      expect(pattern.test('password = "mysecretpass123"')).toBe(true);
      expect(pattern.test('api_key: "abcdefghij123456"')).toBe(true);
      expect(pattern.test('token = `verysecrettoken`')).toBe(true);
    });

    it('should detect JWT tokens', () => {
      const pattern = slopPatterns.jwt_tokens.pattern;
      const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      expect(pattern.test(jwt)).toBe(true);
    });

    it('should detect OpenAI API keys', () => {
      const pattern = slopPatterns.openai_api_key.pattern;
      expect(pattern.test('sk-abcdefghijklmnopqrstuvwxyz123456789012')).toBe(true);
    });

    it('should detect GitHub tokens', () => {
      const pattern = slopPatterns.github_token.pattern;
      expect(pattern.test('ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')).toBe(true);
    });

    it('should detect AWS credentials', () => {
      const pattern = slopPatterns.aws_credentials.pattern;
      expect(pattern.test('AKIAIOSFODNN7EXAMPLE')).toBe(true);
    });

    it('should detect private keys', () => {
      const pattern = slopPatterns.private_key.pattern;
      expect(pattern.test('-----BEGIN RSA PRIVATE KEY-----')).toBe(true);
      expect(pattern.test('-----BEGIN PRIVATE KEY-----')).toBe(true);
    });
  });
});
