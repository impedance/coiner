# UI Migration Plan: Porting "Finance Focus Room" Design to "Coiner"

## Overview
The goal is to replace the current UI of the `coiner` project (React Native/Expo) with the "correct" UI from the `finance-focus-room` project (React Web). We will prioritize the visual layout, color palette, and component structure of the source, while maintaining the mobile-specific logic and data-binding of the target.

---

## 📂 Source Directory Reference (Where to gather UI info)
In the **`finance-focus-room`** project, refer to these locations:
- **Design Tokens**: `src/index.css` (Look for `@layer base` and CSS variables like `--primary`, `--background`).
- **Core Components**: `src/components/budget/` (This contains the logic for `BudgetHeader`, `SystemBucketCard`, and `CategoryBudgetCard`).
- **Mock Data**: `src/data/mockBudget.ts` (Use this to understand labels and the "buckets" logic).

---

## 🛑 Critical Concepts for Junior Developers

1.  **Platform Translation**: You cannot copy `div` or `span`. 
    - Use `<View>` for `div`/containers.
    - Use `<Text>` for any text content.
    - Use `<ScrollView>` for long lists or horizontal carousels.
2.  **Tailwind ➡️ StyleSheet**: The source uses Tailwind (e.g., `bg-background`). You must translate these to the `Colors` object in `src/theme/colors.ts`.
3.  **Data Hooks**: `coiner` uses `useDataSelection()` and `usePlanning()`. The UI components should receive data from these hooks, not the mock data from the source project.

---

## Phase 1: Global Theme Update
**Goal**: Change the "skin" of the app.

- [ ] **Colors**: Update `src/theme/colors.ts`.
    - `background`: `#0d0f14` (Dark Navy/Black)
    - `primary`: `#31c4a0` (Teal Green)
    - `card`: `#1a1c24` (Slightly lighter grey)
    - `text`: `#ffffff`
- [ ] **Typography**: Ensure fonts match the premium feel (Inter/Outfit).

## Phase 2: Core Components Implementation
**Goal**: Build the "Lego bricks" of the new UI.

### 1. Simple Header (`BudgetHeader.tsx`)
Match the source structure:
- Total Balance (Large text)
- Row with: "Unallocated" and "Month" indicator.
- CSS Translation: `flex flex-col` -> `flexDirection: 'column'`.

### 2. Horizontal Buckets (`BucketCard.tsx`)
The source has a horizontal list of "system buckets" (Emergency, Buffer, etc.). 
- **Mapping**: In `coiner`, map these to your **Accounts** (Cash, Bank, Savings).
- Implement using a horizontal `<ScrollView showsHorizontalScrollIndicator={false}>`.
- Cards should have the teal accent if they are the "primary" or "active" account.

### 3. Category List (`CategoryCard.tsx`)
- Implement the "Progress Bar" using `View` with absolute positioning or a dedicated component.
- Ensure the progress bar color is the `primary` teal.

## Phase 3: Screen Integration (`app/(tabs)/index.tsx`)
**Goal**: Assemble the bricks on the main "Today" screen.

- [ ] Replace the existing `TodayScreen` content.
- [ ] Implement the Floating Action Button (FAB) using `TouchableOpacity` with `position: 'absolute'`.

---

## 🎯 Pareto Verification (The 80/20 Rule)
*Focus on the 20% of elements that create 80% of the "Finance Focus" feel.*

### 1. The "Big Three" Visual Check
- **Correct Colors**: Does the app look dark? Is the teal color correct?
- **Layout Flow**: Do we see Header -> Buckets -> Categories in that order?
- **Spacing**: Use standard 16px/20px padding (match the source).

### 2. Functional Pareto Tests (Smoke Tests)
- **Data Display**: Does the "Total Balance" show a real number from `accounts`?
- **Navigation**: Does the FAB correctly trigger the transaction screen?
- **Responsiveness**: Does the horizontal bucket list scroll on a mobile screen?

---

## 🛠 Troubleshooting & Logic Check
- **Logic Check**: `finance-focus-room` uses Web `lucide-react`. `coiner` uses `@expo/vector-icons`. **DO NOT** use lucide labels; map them to Ionicons or FontAwesome.
- **Error Prevention**: Ensure `unallocatedMoney` handle cases where data might be null/undefined to avoid app crashes.
