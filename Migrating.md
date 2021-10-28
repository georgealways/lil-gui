# Migrating

For most projects, moving from dat.gui to lil-gui should be as simple as changing
the import URL. The API was designed to be as backwards-compatible as possible, but this
section aims to address any breaking changes.

## DOM Structure

The DOM structure of the GUI has changed, so code that interacts with dat.gui's inner DOM elements 
is likely to break. 

- `gui.__ul` is now `gui.$children`.
- `gui.__closeButton` is now `gui.$title`.
- `domElement` is still `domElement` for both Controller and GUI.

CSS class names are also different:

- `.dg.ac` becomes `.lil-gui.autoPlace`

## Iterating over folders and controllers

An instance of dat.gui stores its controllers and folders in two separate properties: a 
`__controllers` array and a `__folders` object. lil-gui stores both in a mixed array called 
`gui.children`. 

lil-gui provides two methods to make it easier to iterate over the folders or controllers in a GUI.

```js
todo getFolders() / getChildren() example
```

You should be able to replace any appearances of dat.gui's `gui.__controllers` with 
`gui.getControllers( false )`. You may want to store this in a variable: both methods iterate over 
the GUI's children with an `instanceof` check on each call.

## Color Controller

There's one major difference in the way dat.gui and lil-gui handle color controllers: Channel ranges
for RGB objects and RGB arrays are assumed to be in the range of `[0-255]` in dat.gui and `[0-1]` in
lil-gui. 

In general, this shouldn't have much of an impact, as it's common practice to work use hex values 
and an `onChange` handler when using dat.gui with a library like three.js that expects RGB `[0-1]`.

```js
// common three.js + dat.gui color pattern
params = { 
    color: color.getHex()
};

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

- lil-gui uses the native HTML `input[type=color]` tag, whereas dat.gui has a custom color picker.
- dat.gui accomodates some HSL color formats. lil-gui drops support for HSL.

## Removing folders and controllers

The two methods for removing a GUI's children have been renamed and moved to the 
children.

- `gui.remove( controller )` => `controller.destroy()`
- `gui.removeFolder( folder )` => `folder.destroy()`

## Other Changes

- **Changed:** Folders are open by default.
- **Removed:** "Presets" and `gui.remember()` are gone in favor of `save/load()`, which also removes mentions of `localStorage`.
- **Removed:** `gui.hide/show/hideAll()` and the <key>H</key> to hide hotkey.
- **Removed:** `onFinishChange`. The method is left as an `onChange` synonym for backwards compatibility.