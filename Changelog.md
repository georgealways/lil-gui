# 0.12.0

28.11kb, 8.24kb gzipped

- Added support for dragging number fields vertically.
- Fixed a bug that stopped you from entering decimals in number fields on mobile.
- Fixed a bug that stopped screen readers from reading names in `BooleanController`.
- Removed some dead CSS and JS.

# 0.11.0

28.12kb, 8.17kb gzipped

- Added `controllers` and `folders` aray to `GUI`.
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