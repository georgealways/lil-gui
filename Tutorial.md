# Tutorial

Basic usage todo

```js
const gui = new GUI();

const myObject = {
	myBoolean: true,
	myString: 'lil-gui',
	myNumber: 1,
	myFunction: function() { alert( 'hi' ) }
};

gui.add( myObject, 'myBoolean' );
gui.add( myObject, 'myString' );
gui.add( myObject, 'myNumber' );
gui.add( myObject, 'myFunction' );
```

## Sliders

todo

```js
// todo
```

## Dropdowns

todo

```js
// todo
```

## Colors

todo

```js
params = {
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

todo

```js
params = {
	colorObject: { r: 0.667, g: 0, b: 1 },
	colorArray: [ 0.667, 0, 1 ]
};

gui.addColor( params, 'colorObject' );
gui.addColor( params, 'colorArray' );
```

todo

```js
params = {
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

## Styling

todo

```js
// todo
```

## Saving

todo

```js
// todo
```
