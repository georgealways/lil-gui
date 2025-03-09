The following is a list of class names that have been changed to avoid conflicts with unscoped user classes. Classes like `.title` were often inadvertently targeted by user stylesheets.

- Most class names have simply been prefixed with `lg-`. Those that deviate from this pattern are marked with ⚠️
- camelCase class names have been converted to kebab-case for consistency.

If upgrading, the most common change will probably be `.lil-gui.autoPlace` -> `.lg-auto-place`.

| before | after |
| --- | --- |
| .lil-gui							| .lil-gui (no change) |
| .lil-gui-dragging			| .lg-dragging ⚠️ |
| .lil-gui-horizontal		| .lg-horizontal ⚠️ |
| .lil-gui-vertical			| .lg-vertical ⚠️ |
| .autoPlace						| .lg-auto-place ⚠️ |
| .hasSlider						| .lg-has-slider ⚠️ |
| .active								| .lg-active |
| .allow-touch-styles		| .lg-allow-touch-styles |
| .force-touch-styles		| .lg-force-touch-styles |
| .boolean							| .lg-boolean |
| .children							| .lg-children |
| .closed								| .lg-closed |
| .color								| .lg-color |
| .controller						| .lg-controller |
| .disabled							| .lg-disabled |
| .display							| .lg-display |
| .fill									| .lg-fill |
| .focus								| .lg-focus |
| .name									| .lg-name |
| .number								| .lg-number |
| .option								| .lg-option |
| .root									| .lg-root |
| .slider								| .lg-slider |
| .string								| .lg-string |
| .title								| .lg-title |
| .transition						| .lg-transition |
| .widget								| .lg-widget |
