# Guide

**lil-gui** gives you an interface for changing the properties of any JavaScript object at runtime.
It's intended as a drop-in replacement for dat.gui, implemented with more modern web standards.

## Installation

You can install lil-gui with npm for use with a bundler.

```sh
$ npm install lil-gui --save-dev
```

```js
import { GUI } from 'lil-gui';
```

For quick sketches, you can import lil-gui directly from a CDN.

```html
<script type="module">
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui/dist/lil-gui.esm.min.js';
</script>
```

The library is also available in UMD format under the namespace `lil`.

```html
<script src="https://cdn.jsdelivr.net/npm/lil-gui"></script>
<script>
const GUI = lil.GUI;
</script>
```

## Adding Controllers

This code creates an input that lets you change this page's title.

```js
const gui = new GUI();
gui.add( document, 'title' );
```

lil-gui will choose an appropriate controller type based on the property's value when it was added
to the GUI. Since `document.title` was a string, a text field was created.

Here are some more of the variable types you can control:

```js
obj = {
	myBoolean: true,
	myString: 'lil-gui',
	myNumber: 1,
	myFunction: function() { alert( 'hi' ) }
}

gui.add( obj, 'myBoolean' ); 	// checkbox
gui.add( obj, 'myString' ); 	// text field
gui.add( obj, 'myNumber' ); 	// number field
gui.add( obj, 'myFunction' ); 	// button
```

## Numbers and Sliders

Numbers can be constrained to an accepted input range using `min()`, `max()` and `step()`.

```js
obj = { hasMin: 1, hasMax: 99, hasStep: 50 }

gui.add( obj, 'hasMin' ).min( 0 );
gui.add( obj, 'hasMax' ).max( 100 );
gui.add( obj, 'hasStep' ).step( 10 );
```

Number controllers with a minimum and a maximum automatically become sliders. You can use an 
abbreviated syntax to define them both at once.

```js
obj = { number1: 1, number2: 50 }

gui.add( obj, 'number1', 0, 1 ); // min, max
gui.add( obj, 'number2', 0, 100, 10 ); // min, max, step
```

## Dropdowns

You can create a dropdown for any data type by providing an array of accepted values. If you pass an
object, its keys will be used as labels for the options.

```js
obj = { size: 'Medium', speed: 1 }

gui.add( obj, 'size', [ 'Small', 'Medium', 'Large' ] )
gui.add( obj, 'speed', { Slow: 0.1, Normal: 1, Fast: 5 } )
```

## Colors

lil-gui recognizes colors in a number of formats: CSS strings, RGB objects or integer hex values to 
name a few. You can use `addColor()` to create a color picker for controlling these values. lil-gui
writes updated color values in the format they were authored.

```js
obj = {
	color1: '#AA00FF',
	color2: '#a0f',
	color3: 'rgb(170, 0, 255)',
	color4: 0xaa00ff
}

gui.addColor( obj, 'color1' );
gui.addColor( obj, 'color2' );
gui.addColor( obj, 'color3' );
gui.addColor( obj, 'color4' );
```

### RGB Objects & Arrays

Some libraries use objects or arrays of RGB values to describe colors. These can also be controlled 
by `addColor()`. The color channels are assumed to be between 0 and 1, but you can also set your 
own range. Color objects and arrays are never replaced—only their components are modified.

```js
obj = {
	colorObject: { r: 0.667, g: 0, b: 1 },
	colorArray: [ 0.667, 0, 1 ]
}

gui.addColor( obj, 'colorObject' );
gui.addColor( obj, 'colorArray' );
```

### RGB Channel Ranges

The channel range for RGB objects and arrays can be overriden per controller by passing a third 
parameter to `addColor()`. If your colors are coming out too dark, you might need to set this to 255.

```js
obj = {
	colorObject: { r: 170, g: 0, b: 255 },
	colorArray: [ 170, 0, 255 ]
}

gui.addColor( obj, 'colorObject', 255 );
gui.addColor( obj, 'colorArray', 255 );
```

## Folders

todo

```js
params = { scale: 1 };
position = { x: 0, y: 0, z: 0 };

const gui = new GUI();
gui.add( params, 'scale', 0, 1 );

// folder has all the same methods as GUI
const folder = gui.addFolder( 'Position' );
folder.add( position, 'x' );
folder.add( position, 'y' );
folder.add( position, 'z' );
```

## Change Events

todo onChange

```js
gui.add( params, 'foo' ).onChange( value => {
	console.log( value );
} );

// apply the same handler to every controller
gui.onChange( e => {

	e.object     // object that was modified
	e.property   // string, name of property
	e.value      // new value of controller
	e.controller // controller that was modified

} );
```

### Listening and Updating

If a value controlled by the GUI is changed in code anywhere outside of the GUI, the new value won't
be reflected by the controller's display. You can call `listen()` to update the controller's display
every frame.

```js
gui.add( params, 'feedback', -1, 1 )
   .listen()
   .disable();

animate() {
	params.feedback = Math.sin( Date.now() / 1000 );
}
```

You can also call `controller.updateDisplay()` at any time to manage this behavior yourself.

## Saving

Using `gui.export()` you can create an object that saves the current value of all properties
added to the GUI. You can pass that object to `gui.import()` to restore the saved values.

The following creates a GUI that can save a preset. Press the Save Preset button, then modify any
controller. Pressing the Recall Preset button restores the values you saved.

```js
let saved = {};

const obj = {
	value1: 'original',
	value2: 1996,
	save() {
		// save current values to an object
		saved = gui.export();
		loadButton.enable();
	},
	load() {
		gui.import( saved );
	}
}

gui.add( obj, 'value1' );
gui.add( obj, 'value2' );

gui.add( obj, 'save' )
   .name( 'Save Preset' );

const loadButton = 
	gui.add( obj, 'load' )
	   .name( 'Recall Preset' )
	   .disable();
```

### Name Collisions

`export()` will throw an error if the GUI contains more than one controller or folder with the same
name. You can avoid these collisions by renaming the controllers with `name()`.

```js
gui.add( position, 'x' ).name( 'position.x' );
gui.add( rotation, 'x' ).name( 'rotation.x' );
```

### Save Object Format

The following is an example of an object returned by `gui.export()`. The object will be JSON 
compatible. It can be saved to disk, *unless* you're using non-primitive data types in a dropdown (color objects and arrays are fine).

```js
{
	controllers: {
		value1: 'hey',
		value2: 9000,
	},
	// if GUI has folders ...
	folders: [
		{ controllers, folders },
		{ controllers, folders }
		...
	]
}
```

Both export and import accept a `recursive` parameter, which by default is true. Use 
`export( false )` and `import( data, false )` to ignore any folders within the GUI. The exported 
object will contain an empty folders array.

## Styling

todo

```js
// todo: width, --name-width, other css vars, mobileBreakpoint
```