# Quick Start - Test in 5 Minutes

The fastest way to test awesome-slash manually.

---

## 1. Quick Infrastructure Test (30 seconds)

```bash
# Clone the repo
git clone https://github.com/avifenesh/awesome-slash.git
cd awesome-slash

# Test platform detection (should detect this repo)
node lib/platform/detect-platform.js
```

**Expected Output**:
```json
{
  "ci": null,
  "deployment": null,
  "projectType": "nodejs",
  "branchStrategy": "single-branch",
  "mainBranch": "main"
}
```

✅ If you see this, infrastructure works!

---

## 2. Quick Pattern Test (30 seconds)

```bash
# Test slop detection on this repo
echo "Finding slop in our own code..."
git grep -n "console\.log" lib/*.js
```

**Expected**: Should find 2 console.log statements (intentional for CLI output)

```bash
# Test pattern libraries load correctly
node -e "
const slop = require('./lib/patterns/slop-patterns.js');
const review = require('./lib/patterns/review-patterns.js');
console.log('✓ Slop patterns:', Object.keys(slop.slopPatterns).length);
console.log('✓ Review frameworks:', review.getAvailableFrameworks().length);
"
```

**Expected**:
```
✓ Slop patterns: 18
✓ Review frameworks: 8
```

✅ If you see this, pattern libraries work!

---

## 3. Create Test Project (1 minute)

```bash
# Create a simple test project
mkdir ~/test-slash-commands
cd ~/test-slash-commands

# Initialize git
git init
git checkout -b feature/test

# Create a file with intentional issues
cat > app.js << 'EOF'
function calculateTotal(items) {
  console.log("Debug: calculating total");  // Should be removed
  // TODO: Add error handling

  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }

  return total;
}

module.exports = { calculateTotal };
EOF

# Commit it
git add app.js
git commit -m "Initial commit"

# Create package.json to be detected as Node.js project
cat > package.json << 'EOF'
{
  "name": "test-project",
  "version": "1.0.0",
  "scripts": {
    "test": "echo 'No tests yet'"
  }
}
EOF

git add package.json
git commit -m "Add package.json"
```

---

## 4. Test Platform Detection (30 seconds)

```bash
# From your test project
node /path/to/awesome-slash/lib/platform/detect-platform.js
```

**Replace `/path/to/awesome-slash` with actual path**, for example:
- macOS/Linux: `~/awesome-slash/`
- Windows: `C:/Users/YourName/awesome-slash/`

**Expected Output**:
```json
{
  "projectType": "nodejs",
  "branchStrategy": "single-branch",
  "mainBranch": "feature/test"
}
```

✅ If detected as nodejs, it works!

---

## 5. Test Slop Detection (1 minute)

```bash
# Run slop detection manually
echo "=== Slop Found ==="
git grep -n "console\.log"
git grep -n "TODO"

# Count issues
echo ""
echo "Console.log statements: $(git grep -c "console\.log" | wc -l)"
echo "TODO comments: $(git grep -c "TODO" | wc -l)"
```

**Expected Output**:
```
=== Slop Found ===
app.js:2:  console.log("Debug: calculating total");
app.js:3:  // TODO: Add error handling

Console.log statements: 1
TODO comments: 1
```

✅ Pattern detection works!

---

## 6. Test with Claude Code (2 minutes)

**If you have Claude Code installed:**

### Option A: Test Infrastructure Only

In Claude Code chat:
```
I have the awesome-slash repository. Can you test if the platform
detection works by running:
node /path/to/awesome-slash/lib/platform/detect-platform.js
```

Replace path with your actual path.

### Option B: Simulate `/deslop-around` manually

In Claude Code chat:
```
I want to test the /deslop-around command logic. Please:

1. Run: git grep -n "console\.log" app.js
2. Run: git grep -n "TODO" app.js
3. Tell me what slop you found
4. Show me how to remove the console.log (don't modify yet)
```

Claude should:
1. Find the console.log on line 2
2. Find the TODO on line 3
3. Suggest removing both
4. Show the Edit command it would use

---

## What to Test Next

Once basic tests work, you can test full commands:

### Quick Command Tests

1. **Test `/deslop-around` logic**:
```bash
# See what would be removed
git grep -n "console\.log\|TODO"
```

2. **Test `/next-task` logic**:
```bash
# If you have gh CLI
gh issue list
# Commands will fetch and prioritize these
```

3. **Test `/project-review` logic**:
```bash
# Create a file with security issue
cat > bad-code.js << 'EOF'
function getUser(id) {
  const query = `SELECT * FROM users WHERE id = ${id}`;  // SQL injection!
  return db.query(query);
}
EOF

git add bad-code.js
# Project review would flag this as critical security issue
```

---

## Troubleshooting Quick Tests

### "Cannot find module" error

**Problem**: Node can't find the pattern libraries

**Solution**: Use absolute paths:
```bash
# macOS/Linux
node ~/awesome-slash/lib/platform/detect-platform.js

# Windows
node C:/Users/YourName/awesome-slash/lib/platform/detect-platform.js
```

### "git: command not found"

**Problem**: Git not installed or not in PATH

**Solution**:
```bash
# Check if git is installed
which git

# If not found, install git first
```

### No output from detection

**Problem**: Not in a git repository

**Solution**:
```bash
# Make sure you're in a git repo
git status

# If not, initialize one
git init
```

---

## Success Checklist

After 5 minutes, you should have:

- [x] ✅ Cloned awesome-slash repo
- [x] ✅ Verified platform detection works
- [x] ✅ Verified pattern libraries load
- [x] ✅ Created test project
- [x] ✅ Detected test project correctly
- [x] ✅ Found slop in test project

**If all checked, you're ready to test full commands!**

See [MANUAL_TESTING.md](./MANUAL_TESTING.md) for complete command testing.

---

## Next Steps

1. **Test on your real project**:
```bash
cd ~/your-actual-project
node /path/to/awesome-slash/lib/platform/detect-platform.js
```

2. **Test slop detection on real code**:
```bash
git grep -n "console\.log"
git grep -n "TODO"
```

3. **Use commands in Claude Code** - See MANUAL_TESTING.md for details

---

## Quick Reference

```bash
# Detection
node lib/platform/detect-platform.js

# Tool verification
node lib/platform/verify-tools.js

# Find slop
git grep -n "console\.log\|TODO\|FIXME"

# Count slop
git grep "console\.log" | wc -l

# Test pattern library
node -e "console.log(require('./lib/patterns/slop-patterns.js').slopPatterns)"
```

---

**Total Time**: ~5 minutes ⏱️

**Result**: Verified infrastructure works ✅

**Next**: Test full commands with Claude Code 🚀
