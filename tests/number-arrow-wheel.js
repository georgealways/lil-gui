import assert from 'assert';
import GUI from '..';

export default () => {

	const gui = new GUI();

	let controller;

	// $input

	controller = gui.add( { x: 0 }, 'x' );
	controller.$input.$callEventListener( 'keydown', { code: 'ArrowUp' } );
	assert.strictEqual( controller.getValue(), 1, 'no params: one arrow key = 1' );

	controller = gui.add( { x: 0 }, 'x', 0, 1 );
	controller.$input.$callEventListener( 'keydown', { code: 'ArrowUp' } );
	assert.strictEqual( controller.getValue(), 0.01, 'implicit step: 100 arrow keys = full range' );

	controller = gui.add( { x: 0 }, 'x', 0, 1 );
	controller.$input.$callEventListener( 'keydown', { code: 'ArrowUp', shiftKey: true } );
	assert.strictEqual( controller.getValue(), 0.1, 'implicit step: 10 shift arrow keys = full range' );

	controller = gui.add( { x: 0 }, 'x', 0, 1 );
	controller.$input.$callEventListener( 'keydown', { code: 'ArrowUp', altKey: true } );
	assert.strictEqual( controller.getValue(), 0.001, 'implicit step: 1000 alt arrow keys = full range' );

	controller = gui.add( { x: 0 }, 'x' ).step( 1 );
	controller.$input.$callEventListener( 'keydown', { code: 'ArrowUp' } );
	assert.strictEqual( controller.getValue(), 1, 'explicit step: 1 arrow key = 1 step' );

	controller = gui.add( { x: 0 }, 'x' ).step( 1 );
	controller.$input.$callEventListener( 'keydown', { code: 'ArrowUp', shiftKey: true } );
	assert.strictEqual( controller.getValue(), 10, 'explicit step: 1 shift arrow key = 10 step' );

	// todo: down arrow

	controller = gui.add( { x: 0 }, 'x' ).step( 1 );
	controller.$input.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
	assert.strictEqual( controller.getValue(), 0, 'mousewheel on input only works when input is focused' );

	controller.$input.$callEventListener( 'focus' );
	controller.$input.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
	assert.strictEqual( controller.getValue(), 1, 'explicit step: 1 line = 1 step' );

	// $slider

	controller = gui.add( { x: 0 }, 'x', 0, 1 );
	controller.$slider.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
	assert.strictEqual( controller.getValue(), 0.001, 'implicit step: 100 lines = full range' );

	controller = gui.add( { x: 0 }, 'x', 0, 1, 0.1 );
	controller.$slider.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
	assert.strictEqual( controller.getValue(), 0.1, 'explicit step: 1 line = 1 step' );

	// make sure a focused input updates while wheeling slider

	const original = 3;

	const obj = { x: original };
	const c = gui.add( obj, 'x', 0, 100 );

	// focus input
	c.$input.focus();

	// modify value, don't blur
	c.$input.value = 30;
	c.$input.$callEventListener( 'input' );

	// mousewheel slider
	c.$slider.$callEventListener( 'wheel', { deltaY: 50, deltaX: 0 } );

	assert.notStrictEqual( obj.x, original, 'value changed' );
	assert.strictEqual( c.$input.value, obj.x, 'input still updates while focused' );

};
