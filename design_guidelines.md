# School Scheduling App - Design Guidelines

## Design Approach
**System**: Material Design-inspired approach optimized for data-heavy productivity applications
**Rationale**: This is a utility-focused tool requiring efficient data entry, clear information hierarchy, and strong visual feedback for schedule conflicts and assignments.

## Typography System
- **Primary Font**: Inter (Google Fonts) - excellent for data-dense interfaces
- **Hierarchy**:
  - Page Headers: text-2xl font-semibold
  - Section Headers: text-lg font-medium  
  - Body/Labels: text-sm font-normal
  - Data/Times: text-sm font-mono (for schedule grids)
  - Buttons/Actions: text-sm font-medium

## Spacing System
Use Tailwind units of **2, 4, 6, and 8** for consistency:
- Component padding: p-4 or p-6
- Section spacing: gap-6 or gap-8
- Grid gaps: gap-2 or gap-4
- Card margins: m-4
- Container padding: px-6 py-8

## Layout Structure

### Main Application Shell
- **Left Sidebar** (w-64): Fixed navigation with main sections (Dashboard, Teachers, Classes, Timetables, Settings)
- **Main Content Area**: max-w-7xl with responsive padding, scrollable content
- **Top Bar**: Page title, breadcrumbs, and primary action button (e.g., "Generate Timetable")

### Key Interface Sections

**Dashboard View**:
- Stats cards in 3-column grid (lg:grid-cols-3 gap-6): Total teachers, Total classes, Unassigned periods
- Recent conflicts panel with warning indicators
- Quick action cards for common tasks

**Teacher Availability Interface**:
- Teacher profile card (left column, w-80): Photo placeholder, name, subjects taught, contact info
- Availability grid (main area): 7-day week columns, time slot rows (15-30 min increments)
- Interactive cells with checkbox or toggle states
- Bulk selection tools above grid (Select All Morning, Select All Afternoon)

**Timetable View**:
- Class selector dropdown (top)
- Weekly grid layout: Days as columns, periods as rows
- Each cell shows: Subject name, Teacher name, Room number
- Color-coded by subject (system-assigned, avoid manual color selection)
- Conflict indicators (red border/icon) for double-bookings

**Class Management**:
- Table view with sortable columns: Class name, Grade level, Students count, Required subjects
- Inline editing capabilities
- Add/Edit forms in slide-over panel (right side, w-96)

## Component Library

### Cards
- Background: white with subtle shadow (shadow-sm)
- Padding: p-6
- Border radius: rounded-lg
- Hover state: shadow-md transition

### Data Tables
- Striped rows for readability
- Sticky header row
- Row hover: subtle background change
- Action buttons (edit/delete) appear on row hover

### Forms
- Label above input pattern
- Input height: h-10
- Focus states: ring-2 with offset
- Error states: red border with error message below
- Multi-select dropdowns for subject/teacher assignment

### Schedule Grid Component
- Header row: Days of week (font-medium)
- Header column: Time slots
- Cell dimensions: min-h-16 to accommodate subject + teacher info
- Empty cells: dashed border with "+" icon on hover
- Filled cells: solid border, organized content layout
- Drag-and-drop capability for manual adjustments

### Buttons
- Primary: Solid fill, medium weight text
- Secondary: Outline style
- Danger: For delete/remove actions
- Icon buttons: Circular, p-2, for quick actions in tables

### Conflict Indicators
- Warning badge: Yellow background, exclamation icon
- Error badge: Red background, X icon
- Tooltip on hover explaining the conflict

### Navigation
- Sidebar items: px-4 py-2, icon + label
- Active state: background accent, font-medium
- Grouped by function (Management, Scheduling, Reports)

## Interaction Patterns

### Timetable Generation
- Modal dialog (max-w-lg) with generation options
- Progress indicator during algorithm processing
- Success state with "View Timetable" CTA
- Conflict summary if issues found

### Availability Input
- Click to toggle cell state (available/unavailable)
- Click-and-drag for bulk selection
- Visual feedback during selection
- Save confirmation toast notification

### Data Entry Optimization
- Keyboard shortcuts for common actions
- Tab navigation through forms
- Autosave indicators
- Undo/redo capabilities for timetable edits

## No Animations
Minimal motion - only use for:
- Toast notifications (slide-in from top-right)
- Modal/drawer entry (subtle fade + slide)
- Loading spinners for async operations

Keep all transitions under 200ms for snappy feel.

## Icons
**Library**: Heroicons (outline style for general UI, solid for filled states)
- Calendar, Clock for schedule elements
- Users, UserGroup for teacher/class icons
- ExclamationTriangle for conflicts
- Check, X for status indicators

## Images
**No hero images** - this is an application interface, not a marketing site. 
**Profile placeholders**: Use initials in colored circles for teacher avatars (where photos not provided).