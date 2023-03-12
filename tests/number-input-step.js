import assert from 'assert';
import { GUI } from '../dist/lil-gui.esm.min.js';

export default () => {

	const gui = new GUI();
	const obj = { x: 0 };

	let ctrl = gui.add( obj, 'x' );

	ctrl.$input.value = '1.23456789';
	ctrl.$input.$callEventListener( 'input' );
	ctrl.$input.blur();

	assert.strictEqual( obj.x, 1.23456789, 'All precision retained when typing with an undefined step' );
	assert.equal( ctrl.$input.value, 1.23456789, 'All precision retained when typing with an undefined step' );

	ctrl = gui.add( obj, 'x' ).step( 1 );

	ctrl.$input.value = '1.9';
	ctrl.$input.$callEventListener( 'input' );
	ctrl.$input.blur();

	assert.strictEqual( obj.x, 2, 'Numbers typed in the field are rounded to step' );
	assert.equal( ctrl.$input.value, 2, 'Numbers typed in the field are rounded to step' );

};
