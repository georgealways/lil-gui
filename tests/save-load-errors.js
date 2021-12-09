import assert from 'assert';
import GUI from '..';

export default () => {

	let gui = new GUI();
	const foo = 'bar';

	const a = { foo }, b = { foo };
	gui.add( a, 'foo' );
	gui.add( b, 'foo' );

	assert.throws( () => gui.save(), Error, 'throws error if controller names collide' );

	gui = new GUI();
	gui.addFolder( 'foo' );
	gui.addFolder( 'foo' );

	assert.throws( () => gui.save(), Error, 'throws error if folder names collide' );

	gui = new GUI();
	gui.add( { foo }, 'foo' );

	const f1 = gui.addFolder( 'foo' );
	f1.add( { foo }, 'foo' );

	const f2 = f1.addFolder( 'foo' );
	f2.add( { foo }, 'foo' );

	assert.doesNotThrow( () => gui.save(), Error, "doesn't throw error if names collide across folders" );

	assert.doesNotThrow( () => gui.load( {} ), 'does nothing with an empty object' );

};
