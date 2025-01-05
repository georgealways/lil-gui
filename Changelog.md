# 0.20.0-dev

??.??kb, ?.??kb gzipped

- `addColor` now supports `Float32Array` and other typed arrays.

# 0.20.0

29.81kb, 8.51kb gzipped

- Improved TypeScript defintions: `gui.add` & `addColor` ensure that the property exists on the target object. ([#146](https://github.com/georgealways/lil-gui/pull/146))
- Fixed an issue where `step()` did not work as expected when min or max was not divisible by step. ([#142](https://github.com/georgealways/lil-gui/pull/142))
- Folder headers now use the `<button>` element. ([#137](https://github.com/georgealways/lil-gui/pull/137))

# 0.19.2

29.87kb, 8.51kb gzipped

- Fixed an issue where stepped number controllers emitted extraneous `onChange` events.
- Spellcheck is now disabled for string controllers.
- `name()` and `title()` will no longer render DOM elements if passed an HTML string.

# 0.19.1

29.80kb, 8.49kb gzipped

- Fixed a CSS regression in Firefox for Android. ([#122](https://github.com/georgealways/lil-gui/issues/122))

# 0.19.0

29.77kb, 8.48kb gzipped

- Calling `options()` on an option controller will no longer create a new controller at the end of the GUI.
- Checkboxes can now be toggled by clicking their label.
- Added `exports` field to package.json.
- Removed unused CSS.

# 0.18.2

30.06kb, 8.51kb gzipped

- Fixed a bug that caused decimals to be rendered with commas in certain locales.
- Fixed a bug where `new GUI({ touchStyles: false })` did not apply to folders.
- Fixed a bug where the `.force-touch-styles` class did not apply to folders.
- Fixed a bug that captured key events after clicking a folder header.
- Fixed a bug where number controllers ignored the numpad enter key.

# 0.18.1

29.89kb, 8.47kb gzipped

- Fixed errors in TypeScript definitions. ([#93](https://github.com/georgealways/lil-gui/issues/93#issuecomment-1450399004))

# 0.18.0

29.89kb, 8.47kb gzipped

- Added `gui.onOpenClose()`, which allows you to observe when a folder is opened or closed.
- Passing `{ closeFolders: true }` to GUI's constructor will close folders by default.
- Function controllers will now fire their `onChange` handler after a button press.
- CSS: Moved `--title-height` declaration from `.title` to `.lil-gui`.
- Improved compatibility with tree shaking bundlers.

# 0.17.0

29.53kb, 8.38kb gzipped

- Added `decimals()` to number controllers for limiting display precision. ([#44](https://github.com/georgealways/lil-gui/pull/44))
- Added `show()` and `hide()` to controllers. ([#60](https://github.com/georgealways/lil-gui/pull/60))
- Fixed a bug where typing in a number field did not respect `step`. ([#63](https://github.com/georgealways/lil-gui/pull/63))
- Improved touch-scrolling for scrollable GUI's with many sliders. 

# 0.16.1

29.21kb, 8.33kb gzipped

- Improved performance for GUI's that make heavy use of `listen()`. ([#36](https://github.com/georgealways/lil-gui/pull/36))
- Eliminated console warnings about passive event listeners. ([#42](https://github.com/georgealways/lil-gui/pull/42))

# 0.16.0

29.05kb, 8.28kb gzipped

- Added `gui.show()` and `hide()`.

# 0.15.0

29.07kb, 8.26kb gzipped

- Typing in the GUI will no longer trigger global key listeners. ([#27](https://github.com/georgealways/lil-gui/pull/27))
- Fixed a bug that caused sliders to disappear when outside of min/max. ([#21](https://github.com/georgealways/lil-gui/issues/21))
- Improved compression for the minified stylesheet.
([#26](https://github.com/georgealways/lil-gui/pull/26))
- CSS fixes for Safari.

# 0.14.0

29.04kb, 8.31kb gzipped

- Added `gui.onFinishChange` for symmetry with `gui.onChange`.
- Added a `d.ts` file for TypeScript users.
- Fixed a bug that stopped iOS users from typing negative numbers. ([#16](https://github.com/georgealways/lil-gui/pull/16))
- Minor CSS fixes.

# 0.13.0

28.56kb, 8.24kb gzipped

- Added support for `onFinishChange`.
- The error message when `gui.add` fails is easier to read.
- `gui.load` ignores empty objects instead of failing.
- Fixed a bug that caused mouse wheels to change values too slowly.
- Reverted `listen()` fix from 0.11.0. ([Note](https://github.com/georgealways/lil-gui/pull/11/files#r748852628))

# 0.12.0

28.11kb, 8.24kb gzipped

- Added support for dragging number fields vertically.
- Fixed a bug that stopped you from entering decimals in number fields on mobile.
- Fixed a bug that stopped screen readers from reading names in `BooleanController`.
- Removed unused CSS and JS.

# 0.11.0

28.12kb, 8.17kb gzipped

- Added `controllers` and `folders` array to `GUI`.
- Added `controllersRecursive` and `foldersRecursive` methods to `GUI`.
- Fixed a bug that allowed disabled controllers to be focused via keyboard.
- Fixed a bug that caused controllers to lose interactivity after calling `listen()`.
- Removed `getControllers()` and `getFolders()`.

# 0.10.0

27.44kb, 8.04kb gzipped

- Restored hover effects for all widgets.
- Remove `import/export` in favor of `save/load`, which respects folder hierarchy
and prevents name collisions between folders.
- Remove automatic docking styles for mobile.
