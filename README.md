# Design-AII-CandEx

Prototype repo for **AI Interview Candidate Experience** designs. Components here
are structured to be copy-pasted into `vscode/www/react` with minimal changes.

## Live preview

[https://kgupta-eightfold.github.io/AII_Candidate-UX_Local/](https://kgupta-eightfold.github.io/AII_Candidate-UX_Local/)

Deployed automatically on every push to `main` via GitHub Actions.

---

## Prerequisites

- **Node.js** >= 20.19 (recommend v22 LTS)
- **npm** >= 10

If using nvm:

```bash
nvm use 22
```

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

---

## Repo Organization

Each Figma design gets its own top-level folder under `src/`:

```
src/
├── main.tsx                           # Entry point (shared)
├── ai-interview-candex/               # Figma: AI Interview Candidate Experience
│   ├── App.tsx
│   ├── components/
│   ├── screens/
│   ├── context/
│   ├── styles/
│   └── i18n/
├── <another-design>/                  # Future Figma projects go here
│   └── ...
```

When adding a **new Figma design**, create a new top-level folder under `src/`
with the same subfolders (`components/`, `screens/`, `context/`, `styles/`, `i18n/`).
Then add path aliases in `vite.config.ts` and `tsconfig.app.json`.

---

## Component Folder Convention

Every component and screen lives in its own folder:

```
ComponentName/
  index.tsx                    # Re-export only (1-2 lines)
  ComponentName.tsx            # Main component file
  componentName.module.scss    # SCSS module (camelCase filename)
  constants.ts                 # (optional) Extracted constants
  types.ts                     # (optional) TypeScript types
```

### Key rules

| Rule | Detail |
|------|--------|
| One component per folder | No loose `.tsx` files in `components/` or `screens/` |
| SCSS module per component | `componentName.module.scss` — kebab-case in SCSS, camelCase in JS |
| Index is a re-export | `export { default } from './ComponentName'` — no logic |
| i18n all text | Wrap user-facing strings with `i18nUtils.gettext()` |
| Use `classnames` | For conditional CSS classes, not template literals |
| No plain CSS imports | Only `.module.scss` and library CSS (Octuple) |

---

## Designer Vibe-Coding Guide

When using an AI tool (Cursor, Claude, Copilot, etc.) to generate new components,
include these instructions in your prompt so the generated code follows the repo
conventions.

### Prompt template

Copy and paste this into your AI tool's system prompt or instructions:

```
You are building a React component in the Design-AII-CandEx prototype repo.

Follow these conventions EXACTLY:

1. FOLDER STRUCTURE
   Create a folder for the component:
   ComponentName/
     index.tsx              → export { default } from './ComponentName'
     ComponentName.tsx      → all logic and JSX
     componentName.module.scss → scoped styles

2. SCSS MODULES
   - Import: import styles from './componentName.module.scss'
   - Use: className={styles.myClass}
   - Conditional: className={classnames(styles.foo, { [styles.bar]: isActive })}
   - In SCSS, write class names in kebab-case (.my-class)
   - They become camelCase in JS automatically (styles.myClass)

3. i18n
   - import { i18nUtils } from '@i18n'
   - Wrap ALL user-visible text: i18nUtils.gettext('Button label')
   - Do NOT wrap: CSS classes, HTML attributes, console.log, URLs, icon paths

4. IMPORTS
   - i18n: import { i18nUtils } from '@i18n'
   - Context: import { useInterview } from '@context/InterviewContext'
   - Sibling files: import styles from './componentName.module.scss'
   - Other components: import TopBar from '../TopBar'
   - Octuple: import { Button } from '@eightfold.ai/octuple'
   - classnames: import classnames from 'classnames'

5. NO plain .css imports. Only .module.scss files.
6. NO hardcoded user-facing strings without i18nUtils.gettext().
7. Extract repeated constants (label maps, config arrays) into constants.ts.

Refer to VERIFY.md for the full checklist to validate your output.
```

### After generating code

1. Run the verification script from `VERIFY.md` to check structure
2. Run `npx tsc -b --noEmit` for TypeScript errors
3. Run `npx vite build` to confirm the build passes
4. Visually check the component in the browser

---

## Related Docs

- **[PORTING_GUIDE.md](./PORTING_GUIDE.md)** — How to copy components from this
  repo into `vscode/www/react`
- **[VERIFY.md](./VERIFY.md)** — Automated checks to validate code structure
  and conventions
