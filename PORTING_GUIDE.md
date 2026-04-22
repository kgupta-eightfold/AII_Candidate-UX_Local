# Porting Guide: Design-AII-CandEx to vscode/www/react

This guide documents how to port components and screens from this design prototype
into the production `vscode/www/react` codebase.

---

## Repo Structure

This repo organizes designs by **Figma project**. Each Figma design gets its own
top-level folder under `src/`:

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
├── <future-design>/                   # Another Figma project would go here
│   └── ...
```

When porting, you copy from `src/<design-name>/components/` or `src/<design-name>/screens/`.

---

## Quick Steps

1. **Copy the component folder** (e.g., `src/ai-interview-candex/components/TopBar/`)
   into `vscode/www/react/src/apps/<your-app>/components/TopBar/`

2. **Update imports** (see table below)

3. **Map CSS custom properties** to Octuple tokens (see section below)

4. **Wire up state** — replace `useInterview()` with your app's Redux store

5. **Verify** the component renders correctly in the target app

---

## Component Folder Convention

Each component follows this pattern:

```
ComponentName/
  index.tsx                    # Re-export only
  ComponentName.tsx            # All logic and JSX
  componentName.module.scss    # Scoped styles (SCSS module)
  constants.ts                 # (optional) Component-specific constants
  types.ts                     # (optional) TypeScript interfaces
```

**Key rules:**
- One component per folder
- SCSS module named in camelCase: `topBar.module.scss`
- Index file is a one-liner: `export { default } from './TopBar';`
- Constants (label maps, config arrays) live in `constants.ts`

---

## Import Changes When Porting

| This repo (Design-AII-CandEx)        | Target repo (vscode/www/react)               |
|---------------------------------------|-----------------------------------------------|
| `import { i18nUtils } from '@i18n'`  | `import { i18nUtils } from '@ef/i18n'`       |
| `import classnames from 'classnames'`| `import classnames from 'classnames'`         |
| `import styles from './x.module.scss'`| `import styles from './x.module.scss'`        |
| `import { useInterview } from '@context/InterviewContext'` | Wire to Redux store |
| `@eightfold.ai/octuple` components   | Same — no change needed                      |
| `@mdi/js` icon paths                 | Same — no change needed                      |

**SCSS imports inside `.module.scss` files:**

| This repo                             | Target repo                                   |
|---------------------------------------|-----------------------------------------------|
| CSS custom properties (`var(--bg-base)`) | Map to Octuple tokens or define in app      |
| No `@import` needed for variables     | `@import '~styles/Constants';`               |

---

## i18n Convention

All user-facing strings are wrapped with `i18nUtils.gettext()`:

```tsx
// Design-AII-CandEx (dummy pass-through)
import { i18nUtils } from '@i18n';
<span>{i18nUtils.gettext('Start interview')}</span>

// vscode/www/react (real translations)
import { i18nUtils } from '@ef/i18n';
<span>{i18nUtils.gettext('Start interview')}</span>
```

The `gettext()` function is the primary translation wrapper. For plurals, use `ngettext()`:
```tsx
i18nUtils.ngettext('1 question', '%d questions', count)
```

**When porting:** The only change is the import path (`@i18n` -> `@ef/i18n`).
The strings inside `gettext()` become the translation keys automatically.

---

## SCSS Modules

Both repos use CSS/SCSS modules with the same pattern:

```tsx
import styles from './topBar.module.scss';

// Usage
<div className={styles.topBar}>
<div className={classnames(styles.topBar, { [styles.codingTopBar]: isCoding })}>
```

**Vite (this repo)** and **Webpack (target repo)** both support `.module.scss` natively.
No changes needed to the import or usage pattern.

**Class name convention:**
- SCSS file uses kebab-case: `.top-bar { ... }`
- JS access is camelCase: `styles.topBar`
- This is automatic via Vite's `localsConvention: 'camelCaseOnly'`
- Webpack in vscode/www/react uses the same convention

**Global classes:**
Some classes are wrapped in `:global()` because they're shared across components.
When porting, check if the target app already defines these globally or if you need
to include them.

---

## CSS Custom Property Mapping

This repo defines custom properties in `global.scss` `:root`. Map them to Octuple tokens:

| Design-AII-CandEx                  | Octuple equivalent (vscode/www/react)         |
|-------------------------------------|-----------------------------------------------|
| `var(--bg-base)`                    | Define in app or use `var(--background-color)` |
| `var(--text-primary)`               | `var(--text-primary-color)`                   |
| `var(--text-secondary)`             | `var(--text-secondary-color)`                 |
| `var(--bg-card-border)`             | `var(--border-color)`                         |
| `var(--radius-card)`                | `var(--border-radius-xl)`                     |
| `var(--font-main)`                  | Inherits from Octuple ConfigProvider          |

**Note:** Not all tokens have 1:1 mappings. Custom interview-specific tokens
(e.g., `--blur-blue`, `--accent-ring`) should be defined in the target app's
root styles or component-level SCSS.

---

## State Management

This repo uses React Context (`useInterview()`) for state management.
The production app uses Redux.

**When porting:**
1. Remove the `useInterview()` import
2. Replace `state.xxx` reads with Redux selectors:
   ```tsx
   // Before
   const { state, dispatch } = useInterview();
   const screen = state.screen;

   // After
   const dispatch = useDispatch();
   const screen = useSelector((s: RootState) => s.interview.screen);
   ```
3. Replace `dispatch({ type: 'ACTION' })` with Redux action creators

---

## What NOT to Port

These are prototype-specific and should not be copied:

| File/Component              | Reason                                         |
|----------------------------|-------------------------------------------------|
| `BrandMenu`               | Dev-only view switcher for prototyping          |
| `InterviewScreenStack`    | Route switching — use app's router instead      |
| `InterviewContext.tsx`     | State management — use Redux in target app      |
| `App.tsx`                  | Root composition — target app has its own       |
| `main.tsx`                 | Entry point — target app has its own            |
| `global.scss`             | Design tokens — map to Octuple tokens instead   |

---

## Porting Checklist

For each component you port:

- [ ] Copy the entire component folder from `src/ai-interview-candex/components/` or `screens/`
- [ ] Change `@i18n` import to `@ef/i18n`
- [ ] Replace `useInterview()` with Redux hooks
- [ ] Map CSS custom properties to Octuple tokens
- [ ] Add `@import '~styles/Constants';` to SCSS if using global SCSS variables
- [ ] Verify `:global()` classes exist in target app or add them
- [ ] Check that `@eightfold.ai/octuple` version is compatible
- [ ] Check that `@mdi/js` icons used are available
- [ ] Run the target app and visually verify the component

---

## File Structure Overview

```
src/
├── main.tsx                                    # Entry point
├── ai-interview-candex/                        # Figma: AI Interview CandEx
│   ├── App.tsx                                 # Root composition
│   ├── i18n/
│   │   └── index.ts                            # Dummy i18n (pass-through)
│   ├── styles/
│   │   └── global.scss                         # Fonts, tokens, resets
│   ├── context/
│   │   └── InterviewContext.tsx                 # Prototype state (DO NOT port)
│   ├── components/
│   │   ├── TopBar/                             # Top navigation bar
│   │   ├── BottomControls/                     # Interview control toolbar
│   │   ├── BrandMenu/                          # DEV ONLY - view switcher
│   │   ├── DeviceMenu/                         # Camera/mic/speaker picker
│   │   ├── DeviceMenuPopup/                    # Dropdown wrapper for DeviceMenu
│   │   ├── SelfVideoPanel/                     # Draggable self-view video
│   │   ├── FloatingParticipants/               # Participant video grid
│   │   ├── AvatarArea/                         # AI interviewer avatar with rings
│   │   ├── SectionTransitionCard/              # "Next section" transition card
│   │   ├── TranscriptPanel/                    # Side panel with transcript
│   │   ├── SystemCheckModal/                   # Pre-interview system check
│   │   ├── InterviewScreenStack/               # Screen crossfade (DO NOT port)
│   │   └── interview/
│   │       ├── InterviewBackground/            # Blur backdrop
│   │       └── InterviewMainBand/              # Layout wrapper
│   └── screens/
│       ├── LandingScreen/                      # Entry page
│       ├── ConversationalScreen/               # Screening round
│       ├── TechQnAScreen/                      # Technical Q&A round
│       ├── CodingScreen/                       # Coding exercise
│       ├── WhiteboardScreen/                   # Systems design
│       ├── BreakScreen/                        # Break between sections
│       ├── EmailScreen/                        # Gmail-like email view
│       ├── EndInterviewScreen/                 # Interview completion
│       └── FeedbackFormScreen/                 # Post-interview feedback
```
