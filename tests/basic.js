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

	// test each controller type for methods & chainability

	function testControllerType( type, controller ) {
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

	// make sure gui.add creates the right controller type

	testControllerType( BooleanController,	gui.add( { x: false }, 'x' ) );
	testControllerType( NumberController,	gui.add( { x: 0 }, 'x' ) );
	testControllerType( FunctionController,	gui.add( { x() {} }, 'x' ) );
	testControllerType( StringController,	gui.add( { x: '' }, 'x' ) );
	testControllerType( OptionController,	gui.add( { x: '' }, 'x', [ '', 'a' ] ) );

	// make sure sliders show up with min and max

	const controller1 = gui.add( { x: 0 }, 'x' );
	const controller2 = gui.add( { x: 0 }, 'x', 0 );
	const controller3 = gui.add( { x: 0 }, 'x', 0, 1 );

	assert.strictEqual( controller1.$slider, undefined, 'no sliders without range' );
	assert.strictEqual( controller2.$slider, undefined, 'no sliders without range' );

	assert( controller3.$slider, 'min and max creates slider' );

	// name()

	const name = 'david';
	const controller4 = gui.add( { x: 0 }, 'x' ).name( name );

	assert.strictEqual( controller4.$name.innerHTML, name, 'name sets innerHTML' );

	// make sure title click isn't throwing errors

	assert.doesNotThrow( () => new GUI().openAnimated() );

};
