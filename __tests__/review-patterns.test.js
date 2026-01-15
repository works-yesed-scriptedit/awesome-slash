/**
 * Tests for review-patterns.js
 */

const {
  reviewPatterns,
  getPatternsForFramework,
  getPatternsByCategory,
  getPatternsForFrameworkCategory,
  getAvailableFrameworks,
  getAvailableCategories,
  getCategoriesForFramework,
  hasPatternsFor,
  hasCategory,
  getPatternCount,
  getTotalPatternCount,
  searchPatterns,
  getFrameworksWithCategory
} = require('../lib/patterns/review-patterns');

describe('review-patterns', () => {
  describe('reviewPatterns', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(reviewPatterns)).toBe(true);
    });

    it('should have patterns for major frameworks', () => {
      expect(reviewPatterns).toHaveProperty('react');
      expect(reviewPatterns).toHaveProperty('vue');
      expect(reviewPatterns).toHaveProperty('angular');
      expect(reviewPatterns).toHaveProperty('django');
      expect(reviewPatterns).toHaveProperty('express');
      expect(reviewPatterns).toHaveProperty('rust');
      expect(reviewPatterns).toHaveProperty('go');
    });

    it('should have categories with arrays of patterns', () => {
      Object.values(reviewPatterns).forEach(framework => {
        Object.values(framework).forEach(category => {
          expect(Array.isArray(category)).toBe(true);
          expect(category.length).toBeGreaterThan(0);
          category.forEach(pattern => {
            expect(typeof pattern).toBe('string');
          });
        });
      });
    });
  });

  describe('getPatternsForFramework', () => {
    it('should return patterns for valid framework', () => {
      const patterns = getPatternsForFramework('react');
      expect(patterns).not.toBeNull();
      expect(patterns).toHaveProperty('hooks_rules');
      expect(patterns).toHaveProperty('state_management');
      expect(patterns).toHaveProperty('performance');
    });

    it('should be case-insensitive', () => {
      const patterns1 = getPatternsForFramework('React');
      const patterns2 = getPatternsForFramework('REACT');
      expect(patterns1).toEqual(patterns2);
    });

    it('should return null for invalid framework', () => {
      expect(getPatternsForFramework('nonexistent')).toBeNull();
    });

    it('should return null for non-string input', () => {
      expect(getPatternsForFramework(123)).toBeNull();
      expect(getPatternsForFramework(null)).toBeNull();
    });
  });

  describe('getPatternsByCategory', () => {
    it('should return Map of frameworks for a category', () => {
      const securityPatterns = getPatternsByCategory('security');
      expect(securityPatterns instanceof Map).toBe(true);
      expect(securityPatterns.has('django')).toBe(true);
      expect(securityPatterns.has('express')).toBe(true);
    });

    it('should return empty Map for non-existent category', () => {
      const patterns = getPatternsByCategory('nonexistent');
      expect(patterns instanceof Map).toBe(true);
      expect(patterns.size).toBe(0);
    });
  });

  describe('getPatternsForFrameworkCategory', () => {
    it('should return array of patterns for framework+category', () => {
      const patterns = getPatternsForFrameworkCategory('react', 'hooks_rules');
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return null for invalid framework', () => {
      expect(getPatternsForFrameworkCategory('nonexistent', 'security')).toBeNull();
    });

    it('should return null for invalid category', () => {
      expect(getPatternsForFrameworkCategory('react', 'nonexistent')).toBeNull();
    });
  });

  describe('getAvailableFrameworks', () => {
    it('should return array of framework names', () => {
      const frameworks = getAvailableFrameworks();
      expect(Array.isArray(frameworks)).toBe(true);
      expect(frameworks).toContain('react');
      expect(frameworks).toContain('vue');
      expect(frameworks).toContain('angular');
      expect(frameworks).toContain('django');
      expect(frameworks).toContain('fastapi');
      expect(frameworks).toContain('rust');
      expect(frameworks).toContain('go');
      expect(frameworks).toContain('express');
    });
  });

  describe('getAvailableCategories', () => {
    it('should return array of all category names', () => {
      const categories = getAvailableCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toContain('security');
      expect(categories).toContain('performance');
      expect(categories).toContain('error_handling');
    });
  });

  describe('getCategoriesForFramework', () => {
    it('should return categories for react', () => {
      const categories = getCategoriesForFramework('react');
      expect(categories).toContain('hooks_rules');
      expect(categories).toContain('state_management');
      expect(categories).toContain('performance');
      expect(categories).toContain('common_mistakes');
    });

    it('should return empty array for invalid framework', () => {
      const categories = getCategoriesForFramework('nonexistent');
      expect(categories).toEqual([]);
    });
  });

  describe('hasPatternsFor', () => {
    it('should return true for valid frameworks', () => {
      expect(hasPatternsFor('react')).toBe(true);
      expect(hasPatternsFor('vue')).toBe(true);
      expect(hasPatternsFor('django')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(hasPatternsFor('React')).toBe(true);
      expect(hasPatternsFor('DJANGO')).toBe(true);
    });

    it('should return false for invalid frameworks', () => {
      expect(hasPatternsFor('nonexistent')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(hasPatternsFor(123)).toBe(false);
      expect(hasPatternsFor(null)).toBe(false);
    });
  });

  describe('hasCategory', () => {
    it('should return true for existing categories', () => {
      expect(hasCategory('security')).toBe(true);
      expect(hasCategory('performance')).toBe(true);
    });

    it('should return false for non-existing categories', () => {
      expect(hasCategory('nonexistent')).toBe(false);
    });
  });

  describe('getPatternCount', () => {
    it('should return pattern count for framework', () => {
      const count = getPatternCount('react');
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should return 0 for invalid framework', () => {
      expect(getPatternCount('nonexistent')).toBe(0);
    });
  });

  describe('getTotalPatternCount', () => {
    it('should return total count across all frameworks', () => {
      const total = getTotalPatternCount();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThan(100); // We have many patterns
    });
  });

  describe('searchPatterns', () => {
    it('should find patterns containing keyword', () => {
      const results = searchPatterns('memory');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result).toHaveProperty('framework');
        expect(result).toHaveProperty('category');
        expect(result).toHaveProperty('pattern');
        expect(result.pattern.toLowerCase()).toContain('memory');
      });
    });

    it('should be case-insensitive', () => {
      const results1 = searchPatterns('memory');
      const results2 = searchPatterns('MEMORY');
      expect(results1.length).toBe(results2.length);
    });

    it('should return empty array when no matches', () => {
      const results = searchPatterns('xyznonexistentxyz');
      expect(results).toEqual([]);
    });
  });

  describe('getFrameworksWithCategory', () => {
    it('should return frameworks that have security category', () => {
      const frameworks = getFrameworksWithCategory('security');
      expect(frameworks).toContain('django');
      expect(frameworks).toContain('express');
    });

    it('should return empty array for non-existent category', () => {
      const frameworks = getFrameworksWithCategory('nonexistent');
      expect(frameworks).toEqual([]);
    });
  });
});
