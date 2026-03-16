# Учи с движение — Project Overview

React + Vite + TypeScript educational web app that uses MediaPipe pose detection to create movement-based games for students in a classroom setting.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4
- **Pose Detection**: MediaPipe Tasks Vision (BlazePose)
- **Database/Auth**: Firebase (Firestore + Anonymous Auth), localStorage fallback
- **Animations**: Motion (Framer Motion v12)
- **Icons**: Lucide React
- **Camera**: react-webcam

## Game Types

| Game | Description | Controls |
|------|-------------|----------|
| `active_choice` | Choose from 3 movement pairs, hold movement to answer | lean_lr / tpose_squat / arms_squat |
| `quick_reaction` | Jump = option 1, Squat = option 2 | Vertical movement |
| `directional` | Point with left/right arm, hold to confirm | Arm extension |
| `catcher` | Move hands to catch falling objects into categories | Hand swipe |
| `pointer_zones` | Point with right wrist at zones/balloons, dwell 1.5s to answer | Right wrist position tracking |

### pointer_zones variants
- **circles**: Teacher places circular zones on a background image by clicking. Student wrist enters zone → progress ring fills → answer registered.
- **balloons**: Auto-positioned floating balloon zones with labels. Student points at correct balloon. No teacher image needed.

## Project Structure

```
src/
├── App.tsx                    # Main app, scenario selection, game routing
├── types.ts                   # TypeScript interfaces (Scenario, ScenarioItem, etc.)
├── constants.ts               # DEFAULT_SCENARIOS (11 built-in), GAMES, SUBJECT_TAGS
├── firebase.ts                # Firebase init (anonymous auth + Firestore)
├── hooks/
│   └── useScenarios.ts        # Scenarios CRUD with Firestore/localStorage fallback
└── components/
    ├── ActiveChoiceGame.tsx   # Lean + action confirmation game
    ├── CatcherGame.tsx        # Falling object catcher (uses gameDuration from scenario)
    ├── DirectionalGame.tsx    # Point left/right arm game (index-based, not 'west'/'east')
    ├── QuickReactionGame.tsx  # Jump/squat reaction game
    ├── GameOver.tsx           # End screen with ★★★ star rating
    ├── PoseDetector.tsx       # MediaPipe wrapper with skeleton overlay
    └── TeacherDashboard.tsx   # PIN-protected admin dashboard
```

## Authentication — Two-Level PIN System

- **Teacher PIN** (default: `1234`): Grants access to create/edit/delete custom scenarios
- **Admin PIN** (default: `admin`): Grants elevated access to approve/reject pending scenarios and change both PINs
- Both PINs stored in Firestore `settings/pins` document with `localStorage` fallback
- `src/hooks/usePins.ts`: Hook that loads/saves both PINs from Firestore with localStorage fallback
- Anonymous Firebase auth attempted on PIN success for Firestore sync
- If anon auth fails → localStorage fallback (local scenarios only)
- Entering Admin PIN at the teacher login screen also grants admin mode directly

## Scenario Approval Workflow

- New custom scenarios created by teachers get `approved: false`
- `scenarios` from `useScenarios()` only returns `!isCustom || approved !== false` (for game display)
- `pendingScenarios` from `useScenarios()` returns unapproved custom scenarios (for admin view)
- Admin opens "Чакащи одобрение" tab in the dashboard to approve/reject
- Default (built-in) scenarios always visible; custom scenarios need admin approval
- `approveScenario(id)` sets `approved: true` in Firestore/localStorage

## Teacher Dashboard Features

- **Scenario management**: Create, edit, delete, duplicate
- **Pending badge**: Orange "Чака одобрение" badge on unapproved custom scenarios
- **JSON export**: Per-scenario download or bulk export of all custom scenarios
- **JSON import**: Import scenario files shared by other teachers
- **Answer validation**: Live warning if answer doesn't match any option
- **Game hints**: Per-game-type tips while building a scenario
- **Subject tags**: Math, Language, Science, Geography, Ecology, General
- **gameDuration**: Configurable timer for Catcher game (20-300s)
- **Filter by game type**: Tabs to filter scenario list
- **Background thumbnails**: Visual preview of scenario background
- **Admin button** in header (visible to non-admin teachers): opens admin PIN modal
- **Admin tabs**: Сценарии | Чакащи одобрение (with count badge) + Смени Admin ПИН button

## Default Scenarios (11 built-in)

| ID | Title | Type | Subject |
|----|-------|------|---------|
| math-basic | Събиране и изваждане | active_choice | math |
| math-multiply | Таблица за умножение | active_choice | math |
| geo-capitals | Столици на страни | active_choice | geography |
| qr-even-odd | Четно или Нечетно | quick_reaction | math |
| qr-spelling | Правопис – Е или О | quick_reaction | language |
| qr-animal-plant | Животно или Растение? | quick_reaction | science |
| dir-geography | Страни на света | directional | geography |
| dir-math-compare | По-голямо или По-малко? | directional | math |
| sorting-grammar | Езиков ловец | catcher | language |
| team-ocean | Еко патрул | catcher | ecology |
| catcher-math-ops | Четно или Нечетно (Ловец) | catcher | math |

## Important Design Notes

- **DirectionalGame**: Answer matching uses `options[0]` (left arm) / `options[1]` (right arm). The answer field must exactly match one of the two options (not 'west'/'east').
- **QuickReactionGame**: Jump = `options[0]`, Squat = `options[1]`. Answer must match one option.
- **CatcherGame**: Uses `scenario.gameDuration ?? 60` seconds. Supports 2 categories only.
- **ActiveChoiceGame**: Left lean = `options[0]`, right lean = `options[1]`. Multiple confirm interaction types supported.

## Development

```bash
npm install
npm run dev   # Runs on port 5000 at 0.0.0.0
```

## Deployment

Static site:
- Build: `npm run build`
- Output: `dist/`
