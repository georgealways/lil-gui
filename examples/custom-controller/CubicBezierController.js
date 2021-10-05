import { Controller } from '../../dist/lil-gui.esm.js';

export default class CubicBezierController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'my-cubic-bezier' );

		const svgNS = 'http://www.w3.org/2000/svg';

		this.$svg = document.createElementNS( svgNS, 'svg' );
		this.$path = document.createElementNS( svgNS, 'path' );
		this.$line1 = document.createElementNS( svgNS, 'line' );
		this.$line2 = document.createElementNS( svgNS, 'line' );
		this.$handle1 = document.createElementNS( svgNS, 'circle' );
		this.$handle2 = document.createElementNS( svgNS, 'circle' );

		this.$svg.setAttribute( 'viewBox', '0 0 1 1' );

		this.$handle1.setAttribute( 'r', 0.05 );
		this.$handle2.setAttribute( 'r', 0.05 );

		this.$line1.setAttribute( 'x1', 0 );
		this.$line1.setAttribute( 'y1', 0 );

		this.$line2.setAttribute( 'x1', 1 );
		this.$line2.setAttribute( 'y1', 1 );

		this.$svg.appendChild( this.$line1 );
		this.$svg.appendChild( this.$line2 );
		this.$svg.appendChild( this.$path );
		this.$svg.appendChild( this.$handle1 );
		this.$svg.appendChild( this.$handle2 );

		this.$widget.appendChild( this.$svg );

		const onDrag = ( target, callback ) => {

			const clamp = x => Math.max( 0, Math.min( 1, x ) );

			const set = ( { clientX, clientY } ) => {
				const rect = this.$svg.getBoundingClientRect();
				const x = inverseLerp( clientX, rect.left, rect.right );
				const y = inverseLerp( clientY, rect.bottom, rect.top );
				callback( clamp( x ), clamp( y ) );
			};

			const onMouseDown = e => {
				onMouseMove( e );
				window.addEventListener( 'mousemove', onMouseMove );
				window.addEventListener( 'mouseup', onMouseUp );
			};

			const onMouseMove = e => {
				e.preventDefault();
				set( e );
			};

			const onMouseUp = () => {
				window.removeEventListener( 'mousemove', onMouseMove );
				window.removeEventListener( 'mouseup', onMouseUp );
			};

			target.addEventListener( 'mousedown', onMouseDown );

			const onTouchStart = e => {
				if ( e.touches.length > 1 ) return;
				onTouchMove( e );
				window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
				window.addEventListener( 'touchend', onTouchEnd );
			};

			const onTouchMove = e => {
				e.preventDefault();
				set( e.touches[ 0 ] );
			};

			const onTouchEnd = () => {
				window.removeEventListener( 'touchmove', onTouchMove );
				window.removeEventListener( 'touchend', onTouchEnd );
			};

			target.addEventListener( 'touchstart', onTouchStart );

		};

		onDrag( this.$handle1, ( x, y ) => {
			const c = this.getValue();
			c.x1 = x;
			c.y1 = y;
			this._callOnChange();
			this.updateDisplay();
		} );

		onDrag( this.$handle2, ( x, y ) => {
			const c = this.getValue();
			c.x2 = x;
			c.y2 = y;
			this._callOnChange();
			this.updateDisplay();
		} );

		this.updateDisplay();

	}

	updateDisplay() {
		const c = this.getValue();
		this.$path.setAttribute( 'd', `M 0 0 C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, 1 1` );
		this.$handle1.setAttribute( 'cx', c.x1 );
		this.$handle1.setAttribute( 'cy', c.y1 );
		this.$handle2.setAttribute( 'cx', c.x2 );
		this.$handle2.setAttribute( 'cy', c.y2 );
		this.$line1.setAttribute( 'x2', c.x1 );
		this.$line1.setAttribute( 'y2', c.y1 );
		this.$line2.setAttribute( 'x2', c.x2 );
		this.$line2.setAttribute( 'y2', c.y2 );
	}

}

function inverseLerp( t, a, b ) {
	return ( t - a ) / ( b - a );
}
