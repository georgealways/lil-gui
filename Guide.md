# Guide

**lil-gui** gives you an interface for changing the properties of any JavaScript object at runtime.
It's intended as a drop-in replacement for [dat.gui](https://github.com/dataarts/dat.gui), 
implemented with more modern web standards and some new quality of life features.

The [Migrating](#Migrating) section lists any breaking changes between the two libraries. The changes are limited to the lesser-used portions of the API, but you should read it before moving a project to lil-gui.

If you've used dat.gui before, the beginning of this guide will be review. New features are introduced beginning in the [Change Events](/#Guide#Change-Events) section.

## Installation

You can install lil-gui with npm for use with a bundler.

```sh
$ npm install lil-gui --save-dev
```

```js
import GUI from 'lil-gui';
```

For quick sketches, you can import lil-gui directly from a CDN.

```html
<script type="module">
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@VERSION/+esm';
</script>
```

The library is also available in UMD format under the namespace `lil`.

```html
<script src="https://cdn.jsdelivr.net/npm/lil-gui@VERSION"></script>
<script>
var GUI = lil.GUI;
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

Numbers can be constrained to a range using `min()` and `max()`. You can use `step()` to round values to multiples of a given number.

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
name a few. You can use `addColor()` to create a color picker for controlling these values. 

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

lil-gui uses an `rrggbb` format for display, but it honors the original _data type_ when writing colors (numbers remain numbers, strings remain strings). However, all string-based colors are normalized to `#rrggbb` format on update.

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
parameter to `addColor()`. If your colors are coming out too bright, you might need to set this to 255.

```js
obj = {
	colorObject: { r: 170, g: 0, b: 255 },
	colorArray: [ 170, 0, 255 ]
}

gui.addColor( obj, 'colorObject', 255 );
gui.addColor( obj, 'colorArray', 255 );
```

## Folders

You can organize controllers in collapsible groups using `addFolder()`. The method returns a new GUI
instance representing the folder. You can add controllers to the folder just like you would with any GUI.

```js
// top level controller
gui.add( obj, 'scale', 0, 1 );

// nested controllers
const folder = gui.addFolder( 'Position' );
folder.add( obj, 'x' );
folder.add( obj, 'y' );
folder.add( obj, 'z' );
```

## Change Events

If you want to call a function every time a controller is changed, you can pass it to the controller's
`onChange` method. The new value will be passed to your function after every change (so long as it
originates from that controller and not from code elsewhere).

```js
gui.add( params, 'foo' ).onChange( value => {
	console.log( value );
} );
```

The `onFinishChange` handler fires after a controller changes and loses focus. This comes in handy if you're using a slow function with a controller that produces continuous change events (like numbers or colors for example). 

```js
gui.add( params, 'mySlider', 0, 1 ).onFinishChange( complexFunction );
```

### Global Change Handlers

GUI also provides an `onChange` handler that fires after changes to any of its children.
These handlers receive an event object with details about the controller that was modified.

```js
gui.onChange( event => {

	event.object     // object that was modified
	event.property   // string, name of property
	event.value      // new value of controller
	event.controller // controller that was modified

} );
```

`GUI.onChange` events bubble upward. A handler applied to the root GUI will fire after every change. 
Handlers applied to folders will only be called after changes to that folder or its descendents.

`GUI.onFinishChange` works just like `GUI.onChange`, but it only fires at the end of change events.

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

Using `gui.save()` you can create an object that saves the current value of all properties
added to the GUI. You can pass that object to `gui.load()` to restore the saved values.

The following creates a GUI that can save a preset. Press the savePreset button, then modify any
controller. Pressing the loadPreset button restores the values you saved.

```js
let preset = {};

const obj = {
	value1: 'original',
	value2: 1996,
	savePreset() {
		// save current values to an object
		preset = gui.save();
		loadButton.enable();
	},
	loadPreset() {
		gui.load( preset );
	}
}

gui.add( obj, 'value1' );
gui.add( obj, 'value2' );

gui.add( obj, 'savePreset' );

const loadButton = 
	gui.add( obj, 'loadPreset' )
	   .disable();
```

### Save Object Format

The following is an example of an object returned by `gui.save()`. The object will be JSON compatible. 
It can be saved to disk, *unless* you're using non-primitive data types in a dropdown (color objects 
and arrays are fine).

```js
{
	controllers: {
		value1: 'original',
		value2: 1996,
	},
	folders: {
		// if GUI has folders ...
		folderName1: { controllers, folders },
		folderName2: { controllers, folders }
		...
	}
}
```

Both save and load accept a `recursive` parameter, which is true by default. Use `save( false )` and 
`load( data, false )` to ignore any folders within the GUI. The saved object will contain an empty 
folders object.

### Name Collisions

`save()` will throw an error if the GUI contains more than one controller or folder with the same
name. You can avoid these collisions by renaming the controllers with `name()`.

```js
gui.add( position, 'x' ).name( 'position.x' );
gui.add( rotation, 'x' ).name( 'rotation.x' );
```

## Styling

By default, the GUI is added to `document.body` and attached to the top right of the window with
fixed positioning. You can add the GUI to a different element by passing a `container` parameter to
the constructor.

```js
const gui = new GUI( { container: $('#gui') } );
```

### Width and Long Names

The GUI can be made wider by passing a pixel width to the constructor. This is usually done when 
controller names are too long to fit within the panel.

```js
const gui = new GUI( { width: 400 } );
```

The library provides a few ways to manage this using CSS variables as well.

```
.lil-gui { 
	--width: 400px;
	--name-width: 65%;
}
```

The `--width` property does the same thing as the one in the constructor, but allows us to use any valid 
CSS value. Adjusting `--name-width` allows you to increase the size of names relative to controllers,
which might be better than enlarging the entire panel.

### CSS Variables and Custom Stylesheets

lil-gui exposes a number of CSS variables that allow you to customize colors and dimensions. You can
see an exhaustive list of these variables in the [Kitchen Sink](https://lil-gui.georgealways.com/examples/kitchen-sink) demo.

```
.lil-gui { 
	--background-color: #000;
	--widget-color: #0af;
	--padding: 2px;
}
```

If you want to start a new stylesheet from scratch, the default styles can be left out entirely with 
the `injectStyles` parameter.

```js
new GUI( { injectStyles: false } );
```

### Touch Styles

Controllers are larger on touch devices to make them easier to use. By default, these styles are 
applied using a CSS query `@media (pointer: coarse)`. You can disable this behavior with the `touchStyles` parameter.

```js
gui = new GUI( { touchStyles: false } );
gui.domElement.classList.add( 'force-touch-styles' );
```

You can then apply these styles at a time of your choosing by adding the `.force-touch-styles` CSS class 
to the GUI's root element.
