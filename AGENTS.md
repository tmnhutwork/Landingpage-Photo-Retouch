# UI/UX & Design Guidelines for Agent

This workspace uses the **UI/UX Pro Max** design intelligence system for all interface and landing page development.

## Active Skills

### 1. UI/UX Pro Max Suite (`.agents/skills/`)
- `ui-ux-pro-max`: AI-powered design intelligence with 79 UI styles, 192 color palettes, 74 font pairings, 119 UX guidelines, and 25 chart types across 22 tech stacks.
- `design-system`: Design system generation, spacing/color tokens, and GSAP motion dials.
- `design`: UI/UX layout, responsive patterns, component design.
- `ui-styling`: Aesthetic rules, modern CSS, visual hierarchy.
- `banner-design`: Promotional banners, hero graphics, visual assets.
- `brand`: Brand identity, color philosophy, typography harmony.
- `slides`: Presentation decks and visual narrative.

### 2. Anthropic Design Plugin (`.agents/plugins/anthropic-design/` & `.agents/skills/`)
- `accessibility-review`: WCAG 2.1 AA audits (contrast, keyboard navigation, touch targets, screen reader behavior).
- `design-critique`: Structured multi-dimension critique (first impression, usability, visual hierarchy, consistency).
- `design-handoff`: Developer handoff specifications (measurements, tokens, component states, responsive breakpoints).
- `ux-copy`: Microcopy, CTA wording, error messages, empty states, and onboarding flows.
- `user-research`: Planning & conducting user research (interviews, usability testing, surveys, card sorting).
- `research-synthesis`: Synthesizing research data, transcripts, and feedback into themes & actionable insights.
- `design-system-management`: Component library auditing, documentation, and system extensions.
### 3. Figma to Code Suite (`.agents/skills/`)
- `figma-implement-design`: Translates Figma designs into production-ready application code with 1:1 visual fidelity using structured workflows, design tokens, and screenshot visual parity.
- `figma`: Core Figma MCP integration skill to fetch design context, variables, screenshots, and assets, with prompt patterns and configuration guides.
## Core Design Principles & Priority Hierarchy

When designing, building, reviewing, or fixing interfaces, follow this 1→10 priority order:

| Priority | Category | Key Checks | Anti-Patterns to Avoid |
|:---|:---|:---|:---|
| 1 | **Accessibility (CRITICAL)** | Contrast ratio ≥ 4.5:1, Alt text, keyboard navigability, semantic ARIA labels | Removing focus rings, icon-only buttons without accessible labels |
| 2 | **Touch & Interaction (CRITICAL)** | Min tap target 44×44px, ≥8px spacing, immediate feedback | Relying on hover-only interactions, instant state changes (0ms) |
| 3 | **Performance (HIGH)** | WebP/AVIF formats, lazy loading images, reserved layout space (CLS < 0.1) | Layout thrashing, unoptimized heavy assets |
| 4 | **Style Selection (HIGH)** | Cohesive visual language, SVG icons (Phosphor/Lucide), never emoji as icons | Mixing conflicting styles (e.g. flat + skeuomorphic randomly) |
| 5 | **Layout & Responsive (HIGH)** | Mobile-first breakpoints, proper viewport meta, zero horizontal scroll | Horizontal overflow, fixed px container widths |
| 6 | **Typography & Color (MEDIUM)** | Base font size 16px, line-height 1.5, semantic CSS variables/tokens | Body text < 12px, gray-on-gray low contrast, raw hardcoded hex |
| 7 | **Animation (MEDIUM)** | Context-aware durations (150–300ms), spatial continuity, respect `prefers-reduced-motion` | Same slow duration for all transitions, animating width/height |
| 8 | **Forms & Feedback (MEDIUM)** | Visible labels, inline errors near fields, clear helper text | Placeholder-as-label, generic errors only at top |
| 9 | **Navigation Patterns (HIGH)** | Predictable back behavior, bottom navigation ≤ 5 items, clear visual hierarchy | Cluttered navigation, hidden essential links |
| 10 | **Data & Visual Polish (LOW)** | Clear chart legends, tooltips, accessible color distinctions | Relying solely on color to differentiate data |

## Reference Documentation
For complete rule catalogs and checklists:
- Quick Reference: [.agents/skills/ui-ux-pro-max/references/quick-reference.md](file:///d:/Nhut/Internal%20Project/Landing%20Page%20Photo%20Retouch/.agents/skills/ui-ux-pro-max/references/quick-reference.md)
- Pro Rules & Checklist: [.agents/skills/ui-ux-pro-max/references/pro-rules.md](file:///d:/Nhut/Internal%20Project/Landing%20Page%20Photo%20Retouch/.agents/skills/ui-ux-pro-max/references/pro-rules.md)
