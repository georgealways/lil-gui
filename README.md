# @georgealways/gui

Blah

```js
import { GUI } from '@georgealways/gui';

const object = {
    number: 0.5,
    boolean: true,
    string: 'string',
    options: 3,
    button: function() { alert( 'sup' ) },
    color: { r: 0, g: 0.5, b: 1 }
};

const gui = new GUI();

gui.add( object, 'number', 0, 1 );
gui.add( object, 'boolean' );
gui.add( object, 'string' );
gui.add( object, 'options', { One: 1, Two: 2, Three: 3 } );
gui.add( object, 'button' );
gui.addColor( object, 'color' );
```

Controller types are inferred by the property's initial value.

# Basic Usage

## Sliders

Numbers with min and max become sliders.

```js
gui.add( object, 'property', min, max, step );
```

## Dropdowns

Limit options to a list of selectable values by passing an Array or an Object to `gui.add`.

```js
gui.add( object, 'property', [ 'a', 'b', 'c' ] );
gui.add( object, 'property', { 'Label 1': 1, 'Label 2': 2, 'Label 3': 3 } );
```

## Color Pickers

Use `gui.addColor` to create a color picker.

```js
const colors = {
    string: '#ffffff',
    number: 0xffffff,
    object: { r: 1, g: 1, b: 1 }
}

gui.addColor( colors, 'string' );
gui.addColor( colors, 'number' );
gui.addColor( colors, 'object' );
```

## Headers

```js
gui.addHeader( 'Specular' );
gui.add( uniforms.specularStrength, 'value' ).name( 'Strength' );
gui.add( uniforms.specularPower, 'value' ).name( 'Power' );
gui.addColor( uniforms.specularColor, 'value' ).name( 'Color' );
```
