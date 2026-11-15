# SkillSpring

SkillSpring is a responsive, local-first learning and productivity app built with semantic HTML, CSS, and vanilla JavaScript. It brings together the learning quiz and discovery approach from TASK 3, the calendar/task planning ideas from TASK 2 and TASK 4, product catalog filtering from TASK 4, and the portfolio-style presentation from earlier projects.

## Features

- Browse six short learning paths; search, filter by topic, and sort by duration or title.
- Open a learning path and mark it complete. Completion progress is saved in this browser.
- Add, complete, delete, and filter personal tasks. Tasks persist in this browser.
- Take a five-question interactive quiz with answer explanations, answer review, and a saved personal best.
- Send a validated feedback note in the demo; personal details are not transmitted or stored.
- Toggle light/dark themes, with the system preference used on first visit.
- Responsive navigation, keyboard-friendly controls, visible focus, live status updates, and reduced-motion support.
- Course illustrations are small local SVGs and load lazily; no third-party fonts, image services, frameworks, APIs, or runtime dependencies are used.

## Run locally

Open `index.html` directly in a modern browser, or serve this folder using VS Code Live Server or another static HTTP server. There is no build or install step.

## Performance and compatibility

- One stylesheet and one deferred JavaScript file keep the initial request count low.
- Local SVG illustrations avoid external network latency and are loaded with `loading="lazy"` and `decoding="async"`.
- No libraries, web fonts, analytics, or remote API calls are required.
- Responsive layouts cover small phones through wide desktop screens; controls reflow at 700px and 460px.
- Standard HTML, CSS, and JavaScript APIs are used, with a fallback for browsers without `HTMLDialogElement.showModal()`.
- `prefers-reduced-motion` is honored. The sticky header uses a solid-color fallback if backdrop filtering is unavailable.

## Manual test checklist

1. Open `index.html` in current Chrome, Firefox, and Safari. Also check a mobile browser or device emulator.
2. Verify no horizontal overflow at 320px, 375px, 768px, 1024px, and 1440px widths. Open/close the mobile menu with touch and keyboard.
3. Search learning paths, change categories and sort order, open a path, mark it complete, then refresh to check saved progress.
4. Add, complete, filter, and delete tasks; refresh and confirm the task list persists.
5. Complete and restart the quiz; confirm answer feedback, review, and personal-best persistence.
6. Toggle the theme and refresh. Check keyboard focus, skip navigation, and reduced-motion settings.
7. Test the feedback form with missing and malformed values, then submit a valid message and confirm it is not sent or saved.
8. Test with storage disabled or unavailable; the app should still work for the current visit and display a save warning.

## Data and limitations

All task, course-completion, theme, and quiz-best data stays in browser `localStorage` on the current device and origin. This is a front-end demonstration: there are no accounts, server sync, full course lessons, checkout, or backend services. Clearing browser data removes saved progress.
