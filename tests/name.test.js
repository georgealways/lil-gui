import assert from 'assert';

import GUI from '..';

export default () => {

	const gui = new GUI();
	const name = 'david';
	const controller = gui.add( { x: 0 }, 'x' ).name( name );

	assert.strictEqual( controller.$name.innerHTML, name, 'name sets innerHTML' );

};
