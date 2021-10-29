import { Controller } from '../../dist/lil-gui.esm.js';

/**
 * Creates a 2D XY controller for an object with properties { x, y } in the
 * range of 0 to 1. Note that this is a lot of effort for something that could
 * be accomplished with two sliders, but it aims to demonstrate extending the
 * GUI with a custom data type.
 */
export default class XYController extends Controller {

	constructor( parent, object, property ) {

		// The fourth parameter defines the CSS class our controller will use
		super( parent, object, property, 'xy' );

		// This controller will use an SVG to make a custom widget
		const svgNS = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS( svgNS, 'svg' );
		svg.setAttribute( 'viewBox', '0 0 1 1' );

		// Make some axes
		const axisX = document.createElementNS( svgNS, 'line' );
		axisX.setAttribute( 'x1', 0 );
		axisX.setAttribute( 'x2', 1 );
		axisX.setAttribute( 'y1', 0.5 );
		axisX.setAttribute( 'y2', 0.5 );
		svg.appendChild( axisX );

		const axisY = document.createElementNS( svgNS, 'line' );
		axisY.setAttribute( 'y1', 0 );
		axisY.setAttribute( 'y2', 1 );
		axisY.setAttribute( 'x1', 0.5 );
		axisY.setAttribute( 'x2', 0.5 );
		svg.appendChild( axisY );

		// Make the circle that indicates the value
		// Keep a reference as we'll need to move it when the value changes
		this.$handle = document.createElementNS( svgNS, 'circle' );
		this.$handle.setAttribute( 'r', 0.05 );
		svg.appendChild( this.$handle );

		// Controller HTML elements should go inside $widget
		this.$widget.appendChild( svg );

		// Sets value from mouse or touch event
		const setFromPoint = e => {

			const rect = svg.getBoundingClientRect();
			const x = inverseLerp( e.clientX, rect.left, rect.right );
			const y = inverseLerp( e.clientY, rect.bottom, rect.top );

			// We can't use this.setValue since this controller is for a non-primitive data type
			// (most custom controllers will be: lil-gui takes care of primitive data types).
			// setValue would overwrite the object and destroy references.

			// Instead we'll usually be modifying properties of the target object.
			const v = this.getValue();
			v.x = clamp( x );
			v.y = clamp( y );

			// These would usually be taken care of by setValue, but we have to call them ourself
			// after manipulating the object.
			this._callOnChange();
			this.updateDisplay();

		};

		const inverseLerp = ( t, a, b ) => ( t - a ) / ( b - a );
		const clamp = x => Math.max( 0, Math.min( 1, x ) );

		// Bind event listeners for mouse

		const onMouseDown = e => {
			onMouseMove( e );
			window.addEventListener( 'mousemove', onMouseMove );
			window.addEventListener( 'mouseup', onMouseUp );
		};

		const onMouseMove = e => {
			e.preventDefault();
			setFromPoint( e );
		};

		const onMouseUp = () => {
			window.removeEventListener( 'mousemove', onMouseMove );
			window.removeEventListener( 'mouseup', onMouseUp );
		};

		svg.addEventListener( 'mousedown', onMouseDown );

		// Bind event listeners for touch

		const onTouchStart = e => {
			if ( e.touches.length > 1 ) return;
			onTouchMove( e );
			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );
		};

		const onTouchMove = e => {
			e.preventDefault();
			setFromPoint( e.touches[ 0 ] );
		};

		const onTouchEnd = () => {
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		svg.addEventListener( 'touchstart', onTouchStart );

		// A controller constructor should end with this to reflect initial values
		this.updateDisplay();

	}

	updateDisplay() {
		const v = this.getValue();
		this.$handle.setAttribute( 'cx', v.x );
		this.$handle.setAttribute( 'cy', v.y );
	}

	// We have to override the load method when using an object type.
	// If we don't, object types will be overwritten on load, destroying references.
	load( value ) {
		const v = this.getValue();
		v.x = value.x;
		v.y = value.y;
	}

}

