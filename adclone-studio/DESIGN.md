---
name: AdClone Studio
description: Uzbek product-video editing workspace with a synchronized four-scene preview.
colors:
  bg: "#f7f8fa"
  surface: "#fff"
  ink: "#262c2c"
  muted: "#707779"
  line: "#e8ebec"
  green: "#d7f594"
  dark: "#232b2b"
  primary-text: "#2b3928"
  primary-hover: "#caee81"
  secondary-hover: "#f1f5ee"
  secondary-text: "#616c62"
  placeholder: "#656d67"
  field-border: "#dfe4e2"
  focus: "#7c9364"
  field-focus: "#9db783"
  field-focus-halo: "#e5efd9"
  nav-text: "#bec7c1"
  nav-hover: "#303a36"
  nav-active: "#3a453d"
  nav-active-text: "#e5f5cf"
  export: "#28352d"
  export-hover: "#3c4e3a"
  lilac: "#ded7f5"
  lilac-ink: "#4b3f67"
  mint: "#dfebd8"
  mint-ink: "#405438"
  night: "#313936"
  night-ink: "#edf4e8"
  scene-hook: "#ede7f7"
  scene-problem: "#f8edde"
  scene-solution: "#e5eee0"
  scene-cta: "#e6edf7"
  chapter-hook: "#e8e2f1"
  chapter-problem: "#f1e6d7"
  chapter-solution: "#e2ebda"
  chapter-cta: "#e2e8f1"
  connected: "#eaf2e0"
  connected-text: "#527138"
  pending: "#f4eee4"
  pending-text: "#8c6a36"
  error: "#fff0ec"
  error-text: "#9b392d"
  modal-backdrop: "#16251d80"
typography:
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-1.05px"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 750
    letterSpacing: "-0.4px"
  small-title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 750
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  script-body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
    lineHeight: 1.7
  button:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
    fontWeight: 750
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "10px"
    fontWeight: 700
  navigation-label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "9px"
    fontWeight: 700
    letterSpacing: "1.6px"
rounded:
  chapter: "4px"
  chip: "5px"
  compact: "7px"
  control: "8px"
  notice: "9px"
  media: "10px"
  preview-stage: "13px"
  panel: "14px"
  pill: "20px"
  circle: "50%"
spacing:
  4: "4px"
  6: "6px"
  8: "8px"
  10: "10px"
  12: "12px"
  15: "15px"
  16: "16px"
  18: "18px"
  20: "20px"
  22: "22px"
  24: "24px"
  28: "28px"
  37: "37px"
components:
  confirmation-dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "28px"
    width: "min(420px, calc(100vw - 36px))"
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.primary-text}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-hover}"
  button-export:
    backgroundColor: "{colors.export}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    width: "100%"
  button-export-hover:
    backgroundColor: "{colors.export-hover}"
  button-icon:
    rounded: "{rounded.compact}"
    width: "34px"
    height: "34px"
  button-text:
    textColor: "#526b40"
    padding: "3px 0"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 13px"
    width: "100%"
  navigation:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.nav-text}"
    width: "222px"
    padding: "34px 18px 18px"
  navigation-active:
    backgroundColor: "{colors.nav-active}"
    textColor: "{colors.nav-active-text}"
    rounded: "{rounded.control}"
    padding: "13px"
  status-pending:
    backgroundColor: "{colors.pending}"
    textColor: "{colors.pending-text}"
    rounded: "{rounded.chip}"
    padding: "6px 8px"
  status-connected:
    backgroundColor: "{colors.connected}"
    textColor: "{colors.connected-text}"
    rounded: "{rounded.chip}"
    padding: "6px 8px"
  editor-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  scene-hook:
    backgroundColor: "{colors.scene-hook}"
    rounded: "{rounded.compact}"
    width: "30px"
    height: "30px"
  chapter-hook:
    backgroundColor: "{colors.chapter-hook}"
    rounded: "{rounded.chapter}"
    height: "32px"
  chapter-problem:
    backgroundColor: "{colors.chapter-problem}"
    rounded: "{rounded.chapter}"
    height: "32px"
  chapter-solution:
    backgroundColor: "{colors.chapter-solution}"
    rounded: "{rounded.chapter}"
    height: "32px"
  chapter-cta:
    backgroundColor: "{colors.chapter-cta}"
    rounded: "{rounded.chapter}"
    height: "32px"
---

# Design System: AdClone Studio

## Overview

**Creative North Star: "Operate"**

Operate is the implementation-derived direction for AdClone Studio: dark forest navigation frames a warm white working area, with lime actions and restrained pastel chapter markers. It is a compact, practical editing workspace whose visual hierarchy keeps the product, script, and resulting vertical video together. The name describes the implemented system; it is not a claim of subjective user approval.

The distinctive interaction is a four-scene script connected to a synchronized chapter timeline. Numbered script rows, time ranges, matching chapter colors, and a live 9:16 preview make editing concrete. The Uzbek interface uses clear product language and visible service states. PRODUCT.md records the confirmed customer SaaS direction, Vercel + Supabase target, and keyless local trial; those commitments inform truthful status labels, not a separate visual theme.

This document records the current code in `src/app/globals.css`, `src/components/Studio.tsx`, and the local font setup in `src/app/layout.tsx`. The YAML above is normative for the extracted tokens. Descriptive names for literal CSS values are documentation aliases, not newly added CSS variables. Existing root names are retained where used; the declared but unused purple root value is not promoted into the working palette.

**Key Characteristics:**

- Dark forest navigation, white panels, and a lightly tinted workspace.
- Lime creation actions and a darker export action.
- Locally served Manrope with compact labels and Lucide outline icons.
- Four editable scenes synchronized with the preview chapter timeline.
- Border-led surfaces, limited shadows, and explicit keyboard focus.

## Colors

The application combines green-tinted dark chrome with restrained neutral surfaces; pastel color belongs to scenes and video appearance choices.

### Primary

- **Lime action** (`green`): primary creation buttons and the tilted brand mark. `primary-text` keeps dark lettering on the lime surface; `primary-hover` records the creation-button hover.
- **Forest export** (`export`, `export-hover`): the full-width export action below the preview, visually distinct from creation controls.

### Secondary

- **Lavender, mint, and night** (`lilac`, `mint`, `night`, with corresponding ink tokens): the three video theme swatches and project thumbnails. These choices affect content appearance while the workspace remains consistent.
- **Chapter colors** (`scene-*` and `chapter-*`): paired lavender, warm sand, pale green, and pale blue markers for Hook, Muammo, Yechim, and CTA. The script number and timeline use related, intentionally different surface values.

### Neutral

- **Workspace / surface** (`bg`, `surface`): a lightly tinted page canvas and white panels.
- **Forest navigation** (`dark`): fixed sidebar, supported by dedicated default, hover, and active navigation colors.
- **Primary / secondary text** (`ink`, `muted`, `secondary-text`): primary copy, default secondary copy, and the stronger secondary-text override used by time ranges, preview metadata, footnotes, and integration descriptions.
- **Quiet borders and input states** (`line`, `field-border`, `placeholder`, `focus`, `field-focus`, `field-focus-halo`): surface separation and readable interaction states.
- **Service feedback** (`connected*`, `pending*`, `error*`): explicit labels pair with green, warm amber, and pale red state treatments.

The sidecar's tonal ramps are synthesized inspection aids. They are not additional production palette tokens.

## Typography

**Display and body font:** locally served Manrope, with sans-serif fallback. The application imports the installed 400, 500, 600, 700, and 800 faces through `@fontsource/manrope`. Lucide supplies the outline icon vocabulary.

The hierarchy is compact and typography-led. Strong, tightly tracked headings introduce the task; small semibold labels support a dense editor without competing with the preview.

- **Headline:** page headings use the headline token. Responsive CSS varies them from 24–33px depending on viewport, with 25px on narrow phones.
- **Title:** panel headings use the title token; ordinary subheadings use small-title. The preview heading is smaller on desktop and increases on phones.
- **Body:** the base body token establishes the interface. Descriptions commonly use 12px with generous line height.
- **Script body:** editable scene copy uses the script-body token, increasing to 12px on large screens and phones.
- **Label:** field labels use the label token. Scene time ranges use tabular numerals. Navigation section labels are uppercase with the navigation-label tracking.
- **Controls:** standard buttons use the button token. Text actions and metadata are intentionally smaller.

Do not introduce a second editorial or display face into this documented system.

## Layout

The desktop shell has a fixed sidebar (222px), a top bar (70px), and a content area with a maximum width of 1540px. Default main padding is 32px vertically at the top and 37px horizontally. The import surface spans the working width above the studio.

The studio is a flexible editor plus a 300px preview column, separated by a 28px gap. The preview stays sticky (22px from the top). The framed video keeps a 9:16 aspect ratio; composition and export use 1080 × 1920 at 30 fps. Panels use generous internal groups around compact individual controls: editor heading padding is 22px 24px 20px, and default tab content is 22px 24px 15px.

Responsive breakpoints are observed CSS, not a proposed grid:

- At 1500px and wider, the preview grows to 345px and the column gap to 34px.
- At 1200px and below, the sidebar is 194px and the preview is 255px.
- At 980px and below, the sidebar is 180px and the preview is 220px.
- At 800px and below, the sidebar becomes a 205px off-canvas drawer with a close action and scrim; main content loses its left offset.
- At 650px and below, the studio becomes one column. Preview and export appear before the editor, with the preview capped at 370px. The import action becomes full width.

Spacing is not a strict mathematical scale; the frontmatter lists reused values actually present in the CSS. Keep related controls close and preserve separation between the import, editor, preview, and page-level regions.

## Elevation & Depth

The system uses tonal separation and light borders for ordinary surfaces. Shadows are localized to the video frame, selected duration segment, toggle thumb, open mobile drawer, and modal confirmation. They communicate media framing, selection, or overlap.

### Shadow Vocabulary

- **Video frame:** `0 8px 24px #32294019`.
- **Selected duration:** `0 2px 5px #26391c0c`.
- **Toggle thumb:** `0 1px 2px #23322420`.
- **Mobile navigation drawer:** `15px 0 45px #1722183d`.
- **Confirmation dialog:** `0 16px 70px #1b302b38`, above the translucent modal-backdrop color.
- **Field focus halo:** `0 0 0 3px #e5efd9`; this is an interaction indicator rather than resting elevation.

No gradient or glass treatment is part of the application shell.

## Shapes

Soft rectangular geometry establishes the hierarchy. Large editor, import, settings, and account surfaces use the panel radius; standard controls use the control radius; scene number badges and script fields use compact corners. Video and image framing use media corners. Small chips and chapter segments use tighter radii.

Circular status dots, avatars, and caption-color choices complement rectangular controls. The toggle uses a pill track. The brand mark is a gently rotated square. Panel borders are thin and subdued; rounded media and list containers clip their contents.

## Components

### Buttons

Primary creation buttons combine lime with dark text, a compact icon, and a strong label. Secondary buttons use a white surface and a thin border. Export uses a forest surface with white text and a small credit badge. Text actions use restrained green text and underline on hover. Icon buttons use compact square hit areas and accessible names.

The default primary and secondary controls have a minimum height of 40px. Export is at least 44px and grows on phones. Global keyboard focus is a 3px outline with 3px offset. Disabled buttons reduce opacity to .48 and use a not-allowed cursor. Do not infer an unimplemented pressed animation from these styles.

### Chips

Service chips display a short text state on warm amber or pale green. The small format chip and export credit badge are informational. Selected duration controls use a white inset segment with a small shadow; selection remains explicit in both state and label.

### Cards / Containers

The editor and import surfaces use white backgrounds, quiet borders, and the panel radius. The editor clips its tab row and lightly tinted footer. Project rows use a divided list; export jobs use separate bordered rows. Ordinary panels remain flat.

### Inputs / Fields

Text inputs and textareas use white backgrounds, a thin field border, the control radius, and 11px 13px padding. Focus changes the border and adds the field halo. Final placeholder and secondary-text overrides take precedence over earlier declarations.

The URL input is borderless inside the import surface; its parent receives a 2px focus-within outline with 5px offset. Scene textareas use compact corners, comfortable line height, and vertical resizing. Errors appear in an explicit notice with text and an alert role.

### Navigation

The sidebar uses forest chrome with restrained text and Lucide icons. Hover introduces a slightly lighter forest surface; the active item adds a stronger background, light text, and a lime icon. Navigation section labels are small uppercase markers. A lime new-project action sits above the links.

On mobile, the menu button opens a drawer with a scrim and close button. The closed drawer is hidden, not merely positioned outside the viewport.

### Confirmation dialog

Potentially destructive or discarding actions use a native HTML dialog opened with `showModal()`. The white surface reuses the panel radius, ink color, and 28px padding. Its width is capped at 420px with 36px total viewport clearance. The modal-backdrop token dims the workspace; the confirmation shadow establishes the top layer. Message text uses 13px Manrope, a 1.8 line height, and the stronger secondary-text color.

The heading names the confirmation, followed by the action-specific message. A split action row pairs secondary “Bekor qilish” with lime primary “Davom etish.” Cancel receives initial focus, Escape cancels, and dismissal restores the previously focused element. Keep the native modal behavior and these keyboard safeguards when extending the component.

Customer SaaS settings retain the same integration rows and status chips while hiding technical key and deployment instructions when authentication is configured. This is a content-visibility distinction, not a separate visual system.

### Four-scene script and chapter timeline

The signature interaction consists of numbered scene rows with editable copy and time ranges, plus four chapter buttons below the live preview. Labels are Hook, Muammo, Yechim, and CTA. Clicking a row number or chapter seeks the player to that scene's boundary. Player frame updates mark the current scene number with an outline and the active chapter with a bottom bar.

Chapter widths are a visual 1 / 1 / 1.4 / 1 ratio in the current CSS; they are not a proportional duration chart. Scene timing comes from the project boundaries, and script edits update the shared preview composition. Preserve this distinction when extending the editor.

### Themes, toggles, and motion

Video themes are selected using large lavender, mint, or night swatches with a checkmark and visible outline. Caption-color controls use circular choices with the same redundant selected cues. Toggles combine track color and thumb position.

Motion is limited to functional feedback: 150ms input-border and toggle-thumb transitions, a 200ms drawer translation, a 500ms progress width transition, and a loading spinner. Reduced-motion CSS removes transitions, smooth scrolling, and the spinner animation. No additional motion language is established by this document.

## Do's and Don'ts

### Do:

- Do retain the dark navigation, pale workspace, and white panel hierarchy.
- Do use lime for primary creation actions and forest for MP4 export.
- Do preserve the four scene colors, labels, time ranges, and synchronized active states.
- Do use locally served Manrope and Lucide outline icons with accessible names on icon-only actions.
- Do apply the final secondary-text and placeholder overrides, visible focus, and reduced-motion behavior.
- Do label sample content, keyless mode, provider availability, and render state truthfully.

### Don't:

- Don't describe this implementation-derived direction as a user-approved visual choice.
- Don't turn the pastel video themes into the global application chrome.
- Don't add ambient shadows to every panel; use borders and tonal separation for ordinary surfaces.
- Don't rely on color alone for chapters, selection, errors, or service availability.
- Don't replace the synchronized chapter controls with a decorative timeline.
- Don't imply that unconfigured AI providers or billing are active.
