import assert from 'assert';
import GUI,
{
	GUI as _GUI,
	BooleanController,
	StringController,
	FunctionController,
	NumberController,
	OptionController
} from '..';

export default () => {

	assert.strictEqual( GUI, _GUI, 'GUI is available as both default and named export' );

	const gui = new GUI();

	function testControllerType( controller, type ) {
		assert( controller instanceof type );
		assert.strictEqual( controller, controller.disable() );
		assert.strictEqual( controller, controller.enable() );
		assert.strictEqual( controller, controller.listen() );
		assert.strictEqual( controller, controller.max() );
		assert.strictEqual( controller, controller.min() );
		assert.strictEqual( controller, controller.name( 'hi' ) );
		assert.strictEqual( controller, controller.onChange( function() { } ) );
		assert.strictEqual( controller, controller.onFinishChange( function() { } ) );
		assert.strictEqual( controller, controller.reset() );
		assert.strictEqual( controller, controller.setValue() );
		assert.strictEqual( controller, controller.step() );
		assert.strictEqual( controller, controller.updateDisplay() );
	}

	testControllerType( gui.add( { x: false }, 'x' ), BooleanController );

	testControllerType( gui.add( { x: 0 }, 'x' ), NumberController );
	testControllerType( gui.add( { x: function() { } }, 'x' ), FunctionController );
	testControllerType( gui.add( { x: '' }, 'x' ), StringController );
	testControllerType( gui.add( { x: '' }, 'x', [ '', 'a' ] ), OptionController );

};
