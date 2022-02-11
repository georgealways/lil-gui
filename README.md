# lil-gui

Makes a floating panel for controllers on the web. Works as a drop-in replacement for dat.gui in most projects. See [Migrating](https://lil-gui.georgealways.com/#Migrating) for a list of breaking changes.

[**Homepage**](https://lil-gui.georgealways.com/) •
[**Basic Demo**](https://lil-gui.georgealways.com/examples/basic/) •
[Examples](https://lil-gui.georgealways.com/#Examples) •
[Guide](https://lil-gui.georgealways.com/#Guide) •
[API](https://lil-gui.georgealways.com/#API) •
[GitHub](https://github.com/georgealways/lil-gui)

```js
import GUI from 'lil-gui'; 

const gui = new GUI();

const myObject = {
	myBoolean: true,
	myFunction: function() { ... },
	myString: 'lil-gui',
	myNumber: 1
};

gui.add( myObject, 'myBoolean' );  // Checkbox
gui.add( myObject, 'myFunction' ); // Button
gui.add( myObject, 'myString' );   // Text Field
gui.add( myObject, 'myNumber' );   // Number Field

// Add sliders to number fields by passing min and max
gui.add( myObject, 'myNumber', 0, 1 );
gui.add( myObject, 'myNumber', 0, 100, 2 ); // snap to even numbers

// Create dropdowns by passing an array or object of named values
gui.add( myObject, 'myNumber', [ 0, 1, 2 ] );
gui.add( myObject, 'myNumber', { Label1: 0, Label2: 1, Label3: 2 } );

// Chainable methods
gui.add( myObject, 'myProperty' )
	.name( 'Custom Name' )
	.onChange( value => {
		console.log( value );
	} );

// Create color pickers for multiple color formats
const colorFormats = {
	string: '#ffffff',
	int: 0xffffff,
	object: { r: 1, g: 1, b: 1 },
	array: [ 1, 1, 1 ]
};

gui.addColor( colorFormats, 'string' );
```

