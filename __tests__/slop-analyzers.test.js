/**
 * Tests for slop-analyzers.js
 * Multi-pass analysis functions for slop detection
 */

const {
  analyzeDocCodeRatio,
  findMatchingBrace,
  countNonEmptyLines
} = require('../lib/patterns/slop-analyzers');

describe('slop-analyzers', () => {
  describe('analyzeDocCodeRatio', () => {
    describe('basic functionality', () => {
      it('should detect excessive JSDoc (ratio > 3x)', () => {
        const code = `
/**
 * Add two numbers together
 * @param {number} a - The first number to add
 * @param {number} b - The second number to add
 * @returns {number} The sum of a and b
 * @example
 * add(1, 2) // returns 3
 * add(5, 10) // returns 15
 */
function add(a, b) {
  return a + b;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
        expect(violations[0].ratio).toBeGreaterThan(3.0);
        expect(violations[0].docLines).toBeGreaterThan(violations[0].codeLines * 3);
      });

      it('should not flag acceptable doc/code ratio', () => {
        const code = `
/**
 * Add two numbers
 * @param a First number
 * @param b Second number
 */
function add(a, b) {
  const sum = a + b;
  console.log('Sum:', sum);
  return sum;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(0);
      });

      it('should skip small functions below minFunctionLines', () => {
        const code = `
/**
 * Very detailed documentation
 * that is much longer
 * than the tiny function
 * it documents
 * @param x Input
 */
function tiny(x) {
  return x;
}`;

        // With minFunctionLines: 3, should skip 1-line function
        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 3 });
        expect(violations.length).toBe(0);
      });

      it('should use default options when not provided', () => {
        const code = `
/**
 * Overly documented function
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 * Line 5
 * Line 6
 * Line 7
 * Line 8
 * Line 9
 * Line 10
 */
function foo() {
  const a = 1;
  const b = 2;
  return a + b;
}`;

        // Default: minFunctionLines: 3, maxRatio: 3.0
        const violations = analyzeDocCodeRatio(code);
        expect(violations.length).toBe(1);
      });
    });

    describe('function pattern matching', () => {
      it('should detect excessive docs on arrow functions', () => {
        const code = `
/**
 * Super long documentation
 * Line 1 of many
 * Line 2 of many
 * Line 3 of many
 * Line 4 of many
 * Line 5 of many
 * Line 6 of many
 * Line 7 of many
 * Line 8 of many
 * Line 9 of many
 * Line 10 of many
 */
const process = (data) => {
  return data;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
      });

      it('should detect excessive docs on async functions', () => {
        const code = `
/**
 * Detailed async function docs
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 * Line 5
 * Line 6
 * Line 7
 * Line 8
 * Line 9
 * Line 10
 */
async function fetchData() {
  return await fetch('/api');
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
      });

      it('should detect excessive docs on exported functions', () => {
        const code = `
/**
 * Exported function with lots of docs
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 * Line 5
 * Line 6
 * Line 7
 * Line 8
 * Line 9
 * Line 10
 */
export function helper() {
  return 42;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
      });

      it('should detect excessive docs on async arrow functions', () => {
        const code = `
/**
 * Async arrow function docs
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 * Line 5
 * Line 6
 * Line 7
 * Line 8
 */
const getData = async (id) => {
  return id;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
      });
    });

    describe('multiple functions', () => {
      it('should detect violations in multiple functions', () => {
        const code = `
/**
 * First function with excessive docs
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 */
function first() {
  return 1;
}

/**
 * Second function with acceptable docs
 */
function second() {
  const a = 1;
  const b = 2;
  const c = 3;
  return a + b + c;
}

/**
 * Third function with excessive docs
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 * Line 5
 * Line 6
 * Line 7
 */
function third() {
  return 3;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(2);
      });

      it('should report correct line numbers for each violation', () => {
        // Code starts at line 1 with the JSDoc comment
        const code = `/**
 * Doc 1
 * Doc 2
 * Doc 3
 * Doc 4
 * Doc 5
 */
function a() {
  return 1;
}

/**
 * Doc 1
 * Doc 2
 * Doc 3
 * Doc 4
 * Doc 5
 */
function b() {
  return 2;
}`;

        // 6 doc lines / 1 code line = 6.0 > 3.0 for each function
        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(2);
        // First JSDoc starts at line 1
        expect(violations[0].line).toBe(1);
        // Second JSDoc starts at line 12 (after 11 lines of first function block)
        expect(violations[1].line).toBe(12);
      });
    });

    describe('edge cases', () => {
      it('should handle empty content', () => {
        const violations = analyzeDocCodeRatio('');
        expect(violations).toEqual([]);
      });

      it('should handle content with no functions', () => {
        const code = `
// Just some comments
const x = 42;
console.log(x);
`;
        const violations = analyzeDocCodeRatio(code);
        expect(violations).toEqual([]);
      });

      it('should handle content with no JSDoc', () => {
        const code = `
// Regular comment
function foo() {
  return 42;
}`;
        const violations = analyzeDocCodeRatio(code);
        expect(violations).toEqual([]);
      });

      it('should handle nested braces in function body', () => {
        const code = `
/**
 * Complex function docs
 * Line 1
 * Line 2
 * Line 3
 * Line 4
 * Line 5
 * Line 6
 * Line 7
 * Line 8
 * Line 9
 * Line 10
 * Line 11
 * Line 12
 * Line 13
 */
function complex() {
  if (true) {
    const obj = { a: 1 };
  }
  return obj;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
        // Function body has 4 lines, doc has 14 lines (14/4 = 3.5 > 3.0)
        expect(violations[0].codeLines).toBe(4);
      });

      it('should handle string literals with braces', () => {
        const code = `
/**
 * Function with strings
 * Extra docs line 1
 * Extra docs line 2
 * Extra docs line 3
 * Extra docs line 4
 * Extra docs line 5
 * Extra docs line 6
 * Extra docs line 7
 * Extra docs line 8
 * Extra docs line 9
 */
function withStrings() {
  const a = "{ not a brace }";
  const b = '} also not }';
  return a + b;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        // Should correctly parse despite braces in strings
        // 10 doc lines / 3 code lines = 3.33 > 3.0
        expect(violations.length).toBe(1);
        expect(violations[0].codeLines).toBe(3);
      });

      it('should handle template literals with expressions', () => {
        const code = `
/**
 * Template literal function
 * Lots of documentation here
 * More documentation
 * Even more docs
 * Line 5
 * Line 6
 * Line 7
 */
function withTemplate() {
  const x = \`Value: \${1 + 2}\`;
  return x;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 3.0, minFunctionLines: 1 });
        // 8 doc lines / 2 code lines = 4.0 > 3.0
        expect(violations.length).toBe(1);
        expect(violations[0].codeLines).toBe(2);
      });
    });

    describe('ratio calculation', () => {
      it('should calculate ratio correctly', () => {
        const code = `
/**
 * Doc line 1
 * Doc line 2
 * Doc line 3
 * Doc line 4
 * Doc line 5
 * Doc line 6
 */
function foo() {
  const a = 1;
  const b = 2;
  return a + b;
}`;

        const violations = analyzeDocCodeRatio(code, { maxRatio: 1.0, minFunctionLines: 1 });
        expect(violations.length).toBe(1);
        expect(violations[0].docLines).toBe(6);
        expect(violations[0].codeLines).toBe(3);
        expect(violations[0].ratio).toBe(2); // 6/3 = 2
      });
    });
  });

  describe('findMatchingBrace', () => {
    it('should find matching brace for simple function', () => {
      const content = '{ return 1; }';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(12);
    });

    it('should handle nested braces', () => {
      const content = '{ if (x) { return 1; } return 2; }';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(33);
    });

    it('should skip braces in strings', () => {
      const content = '{ const s = "{ not }"; return s; }';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(33);
    });

    it('should skip braces in single quotes', () => {
      const content = "{ const s = '{ not }'; return s; }";
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(33);
    });

    it('should skip braces in template literals', () => {
      const content = '{ const s = `{ not }`; return s; }';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(33);
    });

    it('should handle template expressions', () => {
      const content = '{ const s = `Value: ${x + 1}`; return s; }';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(41); // Index of final }
    });

    it('should return -1 for unmatched brace', () => {
      const content = '{ return 1;';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(-1);
    });

    it('should respect 5000 char limit', () => {
      const content = '{ ' + 'x'.repeat(6000) + ' }';
      const result = findMatchingBrace(content, 0);
      // Should not find the closing brace beyond 5000 chars
      expect(result).toBe(-1);
    });

    it('should handle escaped quotes', () => {
      const content = '{ const s = "escaped \\"quote\\" here"; return s; }';
      const result = findMatchingBrace(content, 0);
      expect(result).toBe(48); // Index of final }
    });
  });

  describe('countNonEmptyLines', () => {
    it('should count non-empty lines', () => {
      expect(countNonEmptyLines('a\nb\nc')).toBe(3);
    });

    it('should skip empty lines', () => {
      expect(countNonEmptyLines('a\n\nb\n\nc')).toBe(3);
    });

    it('should skip whitespace-only lines', () => {
      expect(countNonEmptyLines('a\n  \nb\n\t\nc')).toBe(3);
    });

    it('should handle empty string', () => {
      expect(countNonEmptyLines('')).toBe(0);
    });

    it('should handle single line', () => {
      expect(countNonEmptyLines('hello')).toBe(1);
    });

    it('should handle only whitespace', () => {
      expect(countNonEmptyLines('   \n\t\n  ')).toBe(0);
    });
  });

  describe('ReDoS safety', () => {
    const MAX_SAFE_TIME = 100;

    it('analyzeDocCodeRatio should handle large inputs safely', () => {
      // Create a file with many functions
      let code = '';
      for (let i = 0; i < 100; i++) {
        code += `
/**
 * Function ${i}
 */
function func${i}() {
  return ${i};
}
`;
      }

      const start = Date.now();
      analyzeDocCodeRatio(code);
      expect(Date.now() - start).toBeLessThan(MAX_SAFE_TIME * 10); // Allow more time for many functions
    });

    it('findMatchingBrace should handle deeply nested content', () => {
      // Create deeply nested braces
      let content = '{';
      for (let i = 0; i < 100; i++) {
        content += ' { ';
      }
      for (let i = 0; i < 100; i++) {
        content += ' } ';
      }
      content += '}';

      const start = Date.now();
      findMatchingBrace(content, 0);
      expect(Date.now() - start).toBeLessThan(MAX_SAFE_TIME);
    });

    it('should handle malicious input with alternating quotes', () => {
      const content = '{ ' + '"\'`'.repeat(1000) + ' }';

      const start = Date.now();
      findMatchingBrace(content, 0);
      expect(Date.now() - start).toBeLessThan(MAX_SAFE_TIME);
    });
  });
});
