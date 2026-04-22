# Verification Instructions

Use this file to verify that code in this repo follows the correct structure
and conventions. Run through these checks after adding or modifying components.

---

## 1. Folder Structure Check

Every component and screen MUST live in its own folder with this structure:

```
ComponentName/
  index.tsx                    # Re-export only (1-2 lines)
  ComponentName.tsx            # Main component file
  componentName.module.scss    # SCSS module (camelCase filename)
  constants.ts                 # (optional) Extracted constants
  types.ts                     # (optional) TypeScript types
```

### Verify:
- [ ] No loose `.tsx` files directly in `components/` or `screens/` (every component is in a folder)
- [ ] Every component folder has an `index.tsx` or `index.ts`
- [ ] Every component folder has a `.module.scss` file
- [ ] SCSS module filename matches component name in camelCase (e.g., `TopBar/` -> `topBar.module.scss`)
- [ ] Index files contain ONLY re-exports, no logic

### Commands to check:
```bash
# Should return nothing (no loose .tsx files outside folders)
find src/*/components src/*/screens -maxdepth 1 -name "*.tsx" -type f

# Every component folder should have an index file
for dir in src/*/components/*/  src/*/screens/*/; do
  [ -f "${dir}index.tsx" ] || [ -f "${dir}index.ts" ] || echo "MISSING INDEX: $dir"
done

# Every component folder should have a .module.scss file
for dir in src/*/components/*/  src/*/screens/*/; do
  ls "${dir}"*.module.scss >/dev/null 2>&1 || echo "MISSING SCSS MODULE: $dir"
done
```

---

## 2. No Plain CSS Imports

Components must NOT import plain `.css` files. Only `.module.scss` and global
library CSS (like Octuple) are allowed.

### Verify:
- [ ] No `import './something.css'` or `import '../styles/something.css'` in any component
- [ ] Only `main.tsx` may import library CSS (`@eightfold.ai/octuple/lib/octuple.css`)

### Command:
```bash
# Should return nothing (or only main.tsx importing octuple.css)
grep -r "import.*\.css" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "octuple.css"
```

---

## 3. i18n Wrapping

ALL user-facing text strings must be wrapped with `i18nUtils.gettext()`.

### Verify:
- [ ] Every component imports `i18nUtils` from `@i18n`
- [ ] No hardcoded text in JSX that a user would see (labels, buttons, headings, placeholders, tooltips)
- [ ] Template literals with visible text use `i18nUtils.gettext()` on the parts

### What counts as "user-facing":
- Button labels, headings, paragraphs, tooltips, placeholders
- Error messages, success messages, status labels
- Navigation items, menu items, tab labels

### What does NOT need wrapping:
- CSS class names, HTML attributes (id, data-*, aria-*)
- Console.log messages, variable names, URLs
- Figma node IDs, icon paths, video filenames

### Command:
```bash
# Check that @i18n is imported in component files (should match most .tsx files)
grep -rL "@i18n" src/*/components/*/[A-Z]*.tsx src/*/screens/*/[A-Z]*.tsx 2>/dev/null
# Files in the output are MISSING i18n imports - investigate each one
```

---

## 4. SCSS Module Usage

Components must use SCSS modules, not global class strings.

### Verify:
- [ ] Components import styles: `import styles from './componentName.module.scss'`
- [ ] JSX uses `styles.className` or `classnames(styles.x, ...)`, not string literals
- [ ] Only `:global()` wrapped classes may appear as string literals in JSX
- [ ] `classnames` library is used for conditional classes (not template string concatenation)

### Acceptable patterns:
```tsx
// Good - SCSS module
className={styles.topBar}
className={classnames(styles.topBar, { [styles.active]: isActive })}

// Good - global class (shared across components, wrapped in :global in SCSS)
className="screen active"
className="techqna-content"

// Bad - hardcoded class that should be in a module
className="top-bar"
className={`top-bar ${isActive ? 'active' : ''}`}
```

---

## 5. Design Grouping

Each Figma design must be in its own top-level folder under `src/`.

### Verify:
- [ ] Components are NOT directly under `src/components/` — they're under `src/<design-name>/components/`
- [ ] Each design folder has: `components/`, `screens/`, `context/`, `styles/`, `i18n/`
- [ ] Path aliases in `vite.config.ts` and `tsconfig.app.json` point to the correct design folder

### Command:
```bash
# List all design folders
ls -d src/*/components 2>/dev/null | sed 's|src/||;s|/components||'
```

---

## 6. TypeScript Check

The codebase must compile without errors.

### Command:
```bash
npx tsc -b --noEmit
```

- [ ] Zero errors
- [ ] No `any` types used (prefer explicit types or `unknown`)

---

## 7. Build Check

The Vite build must succeed.

### Command:
```bash
npx vite build
```

- [ ] Build completes without errors
- [ ] Only expected warnings (chunk size from Octuple is acceptable)

---

## 8. Import Path Check

Components should use path aliases for cross-cutting imports and relative paths
for sibling files.

### Rules:
| Import type                        | Use                                        |
|------------------------------------|--------------------------------------------|
| i18n                               | `@i18n` (alias)                            |
| Context                            | `@context/InterviewContext` (alias)         |
| Sibling in same component folder   | `./fileName` (relative)                    |
| Another component                  | `../../components/Name` (relative)         |
| SCSS module                        | `./componentName.module.scss` (relative)   |

### Command:
```bash
# Should NOT see direct paths to i18n or context folders
grep -r "from '\.\./.*i18n" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules
grep -r "from '\.\./.*context" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v "@context"
```

---

## Full Verification Script

Run all checks at once:

```bash
#!/bin/bash
set -e
echo "=== 1. TypeScript check ==="
npx tsc -b --noEmit && echo "PASS" || echo "FAIL"

echo ""
echo "=== 2. Vite build ==="
npx vite build >/dev/null 2>&1 && echo "PASS" || echo "FAIL"

echo ""
echo "=== 3. No plain CSS imports ==="
PLAIN_CSS=$(grep -r "import.*\.css" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | grep -v "node_modules" | grep -v "main.tsx" || true)
[ -z "$PLAIN_CSS" ] && echo "PASS" || echo "FAIL: $PLAIN_CSS"

echo ""
echo "=== 4. No loose component files ==="
LOOSE=$(find src/*/components src/*/screens -maxdepth 1 -name "*.tsx" -type f 2>/dev/null || true)
[ -z "$LOOSE" ] && echo "PASS" || echo "FAIL: $LOOSE"

echo ""
echo "=== 5. All folders have index files ==="
MISSING_INDEX=""
for dir in src/*/components/*/  src/*/screens/*/; do
  [ -f "${dir}index.tsx" ] || [ -f "${dir}index.ts" ] || MISSING_INDEX="$MISSING_INDEX $dir"
done
[ -z "$MISSING_INDEX" ] && echo "PASS" || echo "FAIL:$MISSING_INDEX"

echo ""
echo "=== 6. All folders have SCSS modules ==="
MISSING_SCSS=""
for dir in src/*/components/*/  src/*/screens/*/; do
  ls "${dir}"*.module.scss >/dev/null 2>&1 || MISSING_SCSS="$MISSING_SCSS $dir"
done
[ -z "$MISSING_SCSS" ] && echo "PASS" || echo "FAIL:$MISSING_SCSS"

echo ""
echo "=== Done ==="
```
