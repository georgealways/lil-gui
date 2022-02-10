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
- Removed some dead CSS and JS.

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
