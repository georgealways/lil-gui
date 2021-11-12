import assert from 'assert';
import GUI from '..';

export default () => {

	const gui = new GUI();

	sliderTest( 0, 1 );
	sliderTest( 0, 3 );
	sliderTest( 0, 5 );
	sliderTest( 0, 1000 / 3 );

	function sliderTest( min, max ) {

		const target = { x: 0 };
		const controller = gui.add( target, 'x', min, max );

		const rect = controller.$slider.getBoundingClientRect();

		controller.$slider.$callEventListener( 'mousedown', {
			clientX: Math.floor( rect.left )
		} );

		assert.strictEqual( target.x, 0 );

		for ( let clientX = Math.floor( rect.left ); clientX < Math.ceil( rect.right ); clientX++ ) {

			window.$callEventListener( 'mousemove', { clientX } );

			const message = `value never has more precision than step [${min},${max}] ${controller._step} ${target.x}`;
			assert( decimals( target.x ) <= decimals( controller._step ), message );

		}

		window.$callEventListener( 'mouseup' );

	}

	function decimals( number ) {
		const parts = number.toString().split( '.' );
		return parts.length === 1 ? 0 : parts[ 1 ].length;
	}

};
