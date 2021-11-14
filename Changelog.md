# 0.13.0

28.74kb, 8.27kb gzipped

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
- Added `controllersRecursive` and `controllersRecursive` methods to `GUI`.
- Fixed a bug that allowed disabled controllers to be focused via keyboard.
- Fixed a bug that caused controllers to lose interactivity after calling `listen()`.
- Removed `getControllers()` and `getFolders()`.

# 0.10.0

27.44kb, 8.04kb gzipped

- Restored hover effects for all widgets.
- Remove `import/export` in favor of `save/load`, which respects folder hierarchy
and prevents name collisions between folders.
- Remove automatic docking styles for mobile.