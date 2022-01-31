# Migrating

For most projects, moving from dat.gui to lil-gui should be as simple as changing
the import URL. The API is designed to be as backwards-compatible as is reasonably possible, but this
section aims to address any breaking changes.

## API Changes

- `gui.__controllers` is now `gui.controllers`.
- `gui.__folders` is now `gui.folders` and it's an array, not a map.
- `gui.remove( controller )` is now `controller.destroy()`.
- `gui.removeFolder( folder )` is now `folder.destroy()`.
- Folders are open by default.

## DOM Structure

The DOM structure of the GUI has changed, so code that interacts with dat.gui's inner DOM elements 
is likely to break. 

- `gui.__ul` is now `gui.$children`.
- `gui.__closeButton` is now `gui.$title`.
- `domElement` is still `domElement` for both Controller and GUI.

CSS class names are also different:

- `.dg.ac` is now `.lil-gui.autoPlace`.

## Color Controller Changes

There's one major difference in the way dat.gui and lil-gui handle color controllers: channel ranges
for RGB objects and RGB arrays are assumed to be in the range of `[0-255]` in dat.gui and `[0-1]` in
lil-gui. 

In general, this shouldn't have much of an impact, as it's common practice to use hex values 
and an `onChange` handler when using dat.gui with a library like three.js that expects RGB `[0-1]`.

```js
// common three.js + dat.gui color pattern
params = { color: color.getHex() };

dat_gui.addColor( params, 'color' ).onChange( v => {
    color.setHex( v ) 
} );
```

Since lil-gui and three.js agree on RGB ranges, this code can be simplified:

```js
params = { color };

lil_gui.addColor( params, 'color' );
```

The other differences in color handling are fairly minor: 

- lil-gui always writes to `#rrggbb` format for strings, even those defined as `rgb()` or `#RGB`.
- lil-gui uses the native HTML `input[type=color]` tag instead of a custom color picker.
- lil-gui doesn't support any HSL or alpha color formats.

## Removed

- "Presets" and `gui.remember()` are gone in favor of `save/load()`, which also removes 
mention of `localStorage`.
- The static `GUI.toggleHide()` method and the <key>H</key> to hide hotkey.
