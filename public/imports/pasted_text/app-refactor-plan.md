You are a Principal Frontend Architect, Senior Product Designer, UX Lead, Design System Architect, Accessibility Specialist, and Technical Lead.

Your task is NOT to review the project.

Your task is to FIX the project.

Perform a complete implementation-focused audit and refactor of the entire application.

You must inspect every page, route, component, context, hook, state, navigation item, button, modal, table, chart, form, card, widget, and interaction.

Do not stop at reporting problems.

For every issue found:

1. Explain why it is a problem.
2. Explain the impact.
3. Provide the exact implementation plan.
4. Generate the actual code changes required.
5. Update all affected files.
6. Verify no regressions are introduced.

---

## PHASE 1 — FUNCTIONAL AUDIT

Inspect:

* All routes
* All navigation links
* All buttons
* All cards
* All CTAs
* All forms
* All modals
* All dropdowns
* All tabs
* All filters
* All charts
* All maps
* All tables

Verify:

* Every action works
* Every button has a real purpose
* No placeholder functionality exists
* No dead-end user flows exist
* No broken navigation exists
* No unreachable pages exist

Fix all issues found.

---

## PHASE 2 — UX AUDIT

Review the application as a real user.

Analyze:

* First-time user experience
* Dashboard clarity
* Information hierarchy
* Navigation complexity
* Discoverability
* Workflow efficiency
* Cognitive load
* Empty states
* Error states
* Loading states
* Success states

Fix:

* Unclear layouts
* Confusing workflows
* Redundant screens
* Weak call-to-actions
* Missing user guidance

---

## PHASE 3 — OVERVIEW DASHBOARD REDESIGN

Review Overview page deeply.

Goals:

* Make the dashboard action-oriented.
* Reduce information overload.
* Improve decision-making speed.

Implement:

1. Hero KPI section

   * Today's Collections
   * Active Requests
   * Fleet Status
   * Collection Efficiency

2. Infrastructure Network Preview

   * Use a compact version of IsometricCentersHub
   * Do NOT duplicate the full Centers page
   * Add:

     * Network Health
     * Throughput
     * Overall Load
     * Open Network Hub button

3. Reorganize sections by priority:

Priority 1:

* Critical KPIs
* Active Requests

Priority 2:

* Fleet & Network Status

Priority 3:

* Analytics & Charts

Priority 4:

* Secondary widgets

4. Remove duplicated information.

5. Ensure every widget has a clear purpose.

---

## PHASE 4 — NAVIGATION RESTRUCTURE

Current navigation is too large.

Reorganize into:

Operations

* Overview
* Pickups
* Routes
* Fleet
* Drivers

Network

* Centers
* Communities
* Partners

Insights

* Analytics
* Reports
* Performance

Administration

* Resources
* Permissions
* Audit

Engagement

* Levels
* Badges
* Leaderboards

Reduce navigation complexity.

Minimize cognitive load.

Implement breadcrumbs globally.

---

## PHASE 5 — DESIGN SYSTEM STANDARDIZATION

Create a single source of truth.

Standardize:

Buttons:

* sm = h-8
* md = h-10
* lg = h-12

Cards:

* rounded-3xl

Inputs:

* rounded-full

Icons:

* Header icons = w-6 h-6

Typography:

* Heading = 700
* Subheading = 600
* Body = 400
* Label = 500

Spacing:

* Follow 4px grid consistently

Remove all inconsistencies.

---

## PHASE 6 — DARK MODE

Audit every page.

Fix:

* Weak contrast
* Invisible inputs
* Weak hover states
* Weak focus states
* Border visibility issues
* Chart readability issues

Target WCAG AA minimum.

---

## PHASE 7 — LIGHT MODE

Review:

* Glass visibility
* Overlay strength
* Text readability
* Background contrast

Adjust overlays where needed.

Target excellent readability.

---

## PHASE 8 — EMPTY STATES

Create reusable EmptyState component.

Standard structure:

* Icon
* Title
* Description
* Primary CTA
* Optional secondary CTA

Replace all inconsistent empty states.

---

## PHASE 9 — TABLES

Create reusable DataTable system.

Standardize:

* Search
* Filters
* Pagination
* Empty state
* Loading state
* Row actions

Replace custom implementations.

---

## PHASE 10 — ANALYTICS PAGE

Current analytics page is too dense.

Refactor into tabs:

* Overview
* Performance
* Insights
* Exports

Reduce visual overload.

Improve discoverability.

---

## PHASE 11 — PERFORMANCE

Inspect:

* Large components
* Unnecessary renders
* Duplicate state
* Heavy assets
* Large images
* Non-lazy routes

Implement:

* React.memo where appropriate
* Lazy loading
* Asset optimization
* Code splitting

---

## PHASE 12 — ARCHITECTURE

Refactor oversized files.

Example:

Overview.tsx (551+ lines)

Split into:

* MetricsRow
* HeroKPISection
* InfrastructurePreview
* ActiveRequestsPanel
* WasteStreamPanel
* QuickActionsPanel

Ensure maintainability.

---

## FINAL OUTPUT

For every issue:

1. Severity
2. File affected
3. Exact code change
4. Reason
5. UX impact
6. Before
7. After

Then produce:

A. Complete implementation roadmap.
B. Files to modify.
C. Refactoring priority order.
D. Expected UX improvement.
E. Expected performance improvement.
F. Expected maintainability improvement.

Do not simply review.

Act as the lead engineer responsible for shipping the final production-ready version of the application.
