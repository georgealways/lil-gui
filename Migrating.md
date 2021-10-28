# Migrating

For most projects, moving from dat.gui to lil-gui should be as simple as changing
the import URL. The API is designed to be as backwards-compatible as is reasonably possible, but this
section aims to address any breaking changes.

## DOM Structure

The DOM structure of the GUI has changed, so code that interacts with dat.gui's inner DOM elements 
is likely to break. 

- `gui.__ul` is now `gui.$children`.
- `gui.__closeButton` is now `gui.$title`.
- `domElement` is still `domElement` for both Controller and GUI.

CSS class names are also different:

- `.dg.ac` becomes `.lil-gui.autoPlace`

## Iterating Over Controllers and Folders

An instance of dat.gui stores its controllers and folders in two properties: a `__controllers` array 
and a `__folders` object. lil-gui stores both in a mixed array called `gui.children`. 

lil-gui provides two methods to make it easier to iterate over the folders or controllers in a GUI:

```js
// todo getFolders/Children() example
```

You should be able to replace any appearances of dat.gui's `gui.__controllers` with 
`gui.getControllers( false )`. Code that interacts with dat.gui's `__folders` will be different however,
as that property is an object/map instead of an array.

You may want to store these results of these methods in a variable: both methods iterate over GUI's 
children with an `instanceof` check per call.

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

- lil-gui uses the native HTML `input[type=color]` tag instead of a custom color picker.
- lil-gui doesn't support any HSL color formats.

## Removing Controllers and Folders

The two methods for removing a GUI's children have been renamed and moved.

- `gui.remove( controller )` => `controller.destroy()`
- `gui.removeFolder( folder )` => `folder.destroy()`

## Other Changes

- **Changed:** Folders are open by default.
- **Removed:** "Presets" and `gui.remember()` are gone in favor of `save/load()`, which also removes 
mentions of `localStorage`.
- **Removed:** `gui.hide/show/hideAll()` and the <key>H</key> to hide hotkey.
- **Removed:** `onFinishChange`. The method is left as an `onChange` synonym for backwards 
compatibility.