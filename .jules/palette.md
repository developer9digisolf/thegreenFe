## 2025-05-15 - [Keyboard Accessibility for Div-based Buttons]
**Learning:** In complex POS interfaces where interactive elements are implemented as styled `div`s (e.g., service items or package cards), adding `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler (for Enter/Space) is a necessary pattern to ensure full keyboard accessibility.
**Action:** Always check for `onClick` handlers on non-interactive elements and supplement them with the ARIA role and keyboard event listeners.

## 2025-05-15 - [Focus Visibility in Custom Themes]
**Learning:** Custom UI themes often override default browser focus states. Explicitly defining `*:focus-visible` ensures that keyboard users have clear visual feedback without affecting mouse users' experience.
**Action:** Include a global `focus-visible` style when working with custom-styled design systems that lack clear focus indicators.
