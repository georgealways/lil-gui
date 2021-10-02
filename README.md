# lil-gui

Makes a floating panel for controllers on the web. Works as a drop-in replacement for [dat.gui](https://github.com/dataarts/dat.gui).

```js
import GUI from 'lil-gui'; 

const gui = new GUI();

const myObject = {
	myBoolean: true,
	myFunction: function() { ... },
	myString: 'lil-gui',
	myNumber: 1
};

// Controller types are inferred from property values
gui.add( myObject, 'myBoolean' );  // checkbox
gui.add( myObject, 'myFunction' ); // button
gui.add( myObject, 'myString' );   // text field
gui.add( myObject, 'myNumber' );   // number field

// Add sliders to number fields by passing min and max
gui.add( myObject, 'myNumber', 0, 1 );
gui.add( myObject, 'myNumber', 0, 100, 1 ); // explicit step

// Create dropdowns by passing an array or object of named values
gui.add( myObject, 'myNumber', [ 0, 1, 2 ] );
gui.add( myObject, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 } );

// chainable methods
gui.add( myObject, 'myProperty' )
	.name( 'Custom Name' )
	.onChange( value => {
		console.log( value );
	} );

const colorFormats = {
	string: '#ffffff',
	int: 0xffffff,
	object: { r: 1, g: 1, b: 1 },
	array: [ 1, 1, 1 ]
};

gui.addColor( colorFormats, 'string' );
```

