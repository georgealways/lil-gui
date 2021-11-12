import assert from 'assert';
import GUI from '..';

export default () => {

	// make sure load calls onFinishChange and returns self

	const gui = new GUI();

	const tracker = new assert.CallTracker();

	{
		const ctrl = gui.add( { x: 0 }, 'x' ).onFinishChange( tracker.calls( 1 ) );
		assert.strictEqual( ctrl.load( 90 ), ctrl, 'load returns this' );
	}
	{
		const ctrl = gui.add( { x: false }, 'x' ).onFinishChange( tracker.calls( 1 ) );
		assert.strictEqual( ctrl.load( true ), ctrl, 'load returns this' );
	}
	{
		const ctrl = gui.add( { x: 'foo' }, 'x' ).onFinishChange( tracker.calls( 1 ) );
		assert.strictEqual( ctrl.load( 'bar' ), ctrl, 'load returns this' );
	}
	{
		const ctrl = gui.add( { x: 'foo' }, 'x', [ 'bar', 'baz' ] ).onFinishChange( tracker.calls( 1 ) );
		assert.strictEqual( ctrl.load( 'bar' ), ctrl, 'load returns this' );
	}
	{
		const obj = { x: [ 0, 1, 0 ] };
		const ctrl = gui.addColor( obj, 'x' ).onFinishChange( tracker.calls( 1 ) );
		assert.strictEqual( ctrl.load( '#ff00ff' ), ctrl, 'load returns this' );
	}

	tracker.verify();

};
