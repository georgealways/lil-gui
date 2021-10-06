# Guide

**lil-gui** gives you an interface for changing the properties of any JavaScript object at runtime.
It's intended as a drop-in replacement for dat.gui, implemented with more modern web standards.

## Installation

```js
$ npm install lil-gui

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
const myObject = {
	myBoolean: true,
	myString: 'lil-gui',
	myNumber: 1,
	myFunction: function() { alert( 'hi' ) }
};

gui.add( myObject, 'myBoolean' ); 	// checkbox
gui.add( myObject, 'myString' ); 	// text field
gui.add( myObject, 'myNumber' ); 	// number field
gui.add( myObject, 'myFunction' ); 	// button
```

## Numbers

Numbers can be constrained to an accepted input range using `min()` `max()` and `step()`.

```js
const myObject = { 
	hasMin: 1,
	hasMax: 99,
	hasStep: 50,
};

gui.add( myObject, 'hasMin' ).min( 0 );
gui.add( myObject, 'hasMax' ).max( 100 );
gui.add( myObject, 'hasStep' ).step( 10 );
```

## Sliders

Number controllers with a minimum and a maximum automatically become sliders. You can use an 
abbreviated syntax to define them both at once.

```js
gui.add( myObject, 'number1', 0, 1 ); // min, max
gui.add( myObject, 'number2', 0, 100, 10 ); // min, max, step
```

## Dropdowns

You can create a dropdown for any data type by providing an array of accepted values. If you pass an
object, its keys will be used as labels for the options.

```js
const myObject = {
	size: 'Medium',
	speed: 1,
};

gui.add( myObject, 'size', [ 'Small', 'Medium', 'Large' ] )
gui.add( myObject, 'speed', { Slow: 0.1, Normal: 1, Fast: 5 } )
```

## Colors

You can manipulate colors in multiple formats: CSS strings or integer hex values, for example.
Color controllers are created with a special method: `addColor()`.

```js
const params = {
	color1: '#AA00FF',
	color2: '#a0f',
	color3: 'rgb(170, 0, 255)',
	color4: 0xaa00ff
};

gui.addColor( params, 'color1' );
gui.addColor( params, 'color2' );
gui.addColor( params, 'color3' );
gui.addColor( params, 'color4' );
```

### RGB Objects & Arrays

Some libraries use objects or arrays of RGB values to describe colors. These can also be controlled 
by `addColor()`. By default, the color channels are assumed to be in the range of 0 to 1.

```js
const params = {
	colorObject: { r: 0.667, g: 0, b: 1 },
	colorArray: [ 0.667, 0, 1 ]
};

gui.addColor( params, 'colorObject' );
gui.addColor( params, 'colorArray' );
```

### RGB Channel Ranges

The channel range for RGB objects and arrays can be overriden on a per property basis by passing 
a third parameter to `addColor()`. If your colors are coming out too dark, you probably need to set
this to 255.

```js
const params = {
	colorObject: { r: 170, g: 0, b: 255 },
	colorArray: [ 170, 0, 255 ]
};

gui.addColor( params, 'colorObject', 255 );
gui.addColor( params, 'colorArray', 255 );
```

## Folders

todo

```js
// todo
```

## Saving

todo

```js
// todo
```

## Styling

todo

```js
// todo
```