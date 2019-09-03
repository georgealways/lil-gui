/**
 * @module Controller
 */

/**
 * Classdesc? Where are you getting this intel. who told you.  
 */
class Controller {

	constructor( parent, object, property, className, tagName = 'div' ) {

		/**
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * @type {Object}
		 */
		this.object = object;

		/**
		 * @type {string}
		 */
		this.property = property;

		/**
		 * @type {boolean}
		 */
		this._disabled = false;

		/**
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( tagName );
		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		/**
		 * @type {HTMLElement}
		 */
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		/**
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

		this.name( property );

	}

	/**
	 * 
	 * @param {string} name
	 * @returns {Controller} self
	 * @chainable 
	 */
	name( name ) {
		/**
		 * @type {string}
		 */
		this._name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * 
	 * @param {function} callback 
	 * @returns {Controller} self
	 * @chainable 
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 */
	onChange( callback ) {
		/**
		 * @type {function}
		 */
		this._onChange = callback;
		return this;
	}

	onFinishChange( fnc ) {
		this._onFinishChange = fnc;
		return this;
	}

	/**
	 * I'm not sure if I'm keeping this.
	 * @param {*} options 
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	setValue( value, finished = true ) {
		this.object[ this.property ] = value;
		this._onSetValue( finished );
	}

	/**
	 * Enables this controller.
	 * @returns {Controller} self
	 * @chainable 
	 */
	enable() {
		this._disabled = false;
		this.domElement.classList.remove( 'disabled' );
		return this;
	}

	/**
	 * Disables this controller.
	 * @returns {Controller} self
	 * @chainable
	 */
	disable() {
		this._disabled = true;
		this.domElement.classList.add( 'disabled' );
		return this;
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 * 
	 * @example 
	 * const controller = gui.add( object, 'property' );
	 * controller.destroy();
	 * 
	 * @example
	 * // Won't destroy all the controllers because c.destroy() modifies gui.children
	 * gui.children.forEach( c => c.destroy() );
	 * 
	 * // Make a copy of the array first if you actually want to do that
	 * Array.from( gui.children ).forEach( c => c.destroy() );
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

	_onSetValue( finished = true ) {
		this._callOnChange();
		if ( finished ) this._callOnFinishedChange();
		this.updateDisplay();
	}

	_callOnChange() {
		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}
	}

	_callOnFinishedChange() {
		if ( this._onFinishChange !== undefined ) {
			this._onFinishChange.call( this, this.getValue() );
		}
	}

	getValue() {
		return this.object[ this.property ];
	}

	// /**
	//  * Sets the minimum value. Only works on number controllers.
	//  * @param {number} min
	//  * @returns {Controller} self
	//  * @chainable
	//  */
	// min( min ) {
	// 	return this;
	// }

	// /**
	//  * Sets the maximum value. Only works on number controllers.
	//  * @param {number} max
	//  * @returns {Controller} self
	//  * @chainable
	//  */
	// max( max ) {
	// 	return this;
	// }

	// /**
	//  * Sets the step. Only works on number controllers.
	//  * @param {number} step
	//  * @returns {Controller} self
	//  * @chainable
	//  */
	// step( step ) {
	// 	return this;
	// }

	/**
	 * Updates the display to keep it in sync with the current value of 
	 * `this.object[ this.property ]`. Useful for updating your controllers if 
	 * their values have been modified outside of the GUI.
	 * @chainable
	 */
	updateDisplay() {
		return this;
	}

	listen() {
		// eslint-disable-next-line no-console
		console.warn( 'fyi, listen() doesn\'t do anything right now' );
		return this;
	}

}

class BooleanController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'boolean', 'label' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );

		this.$widget.appendChild( this.$input );

		this.$input.addEventListener( 'change', () => {
			this.setValue( this.$input.checked );
		} );

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.checked = this.getValue();
	}

}

class ColorController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$widget.appendChild( this.$input );
		this.$widget.appendChild( this.$display );

		this._format = getColorFormat( this.getValue() );

		this.$input.addEventListener( 'change', () => {

			if ( this._format.isPrimitive ) {

				const newValue = this._format.fromHexString( this.$input.value );
				this.setValue( newValue );

			} else {

				this._format.fromHexString( this.$input.value, this.getValue() );
				this._onSetValue();

			}

		} );

		this.$input.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$input.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this._format.toHexString( this.getValue() );
		this.$display.style.backgroundColor = this.$input.value;
	}

}

const STRING = {
	isPrimitive: true,
	match: v => typeof v == 'string',
	fromHexString: string => string,
	toHexString: value => value
};

const INT = {
	isPrimitive: true,
	match: v => typeof v == 'number',
	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
	isPrimitive: false,
	match: Array.isArray,
	fromHexString( string, target ) {
		const int = INT.fromHexString( string );
		target[ 0 ] = ( int >> 16 & 255 ) / 255;
		target[ 1 ] = ( int >> 8 & 255 ) / 255;
		target[ 2 ] = ( int & 255 ) / 255;
	},
	toHexString( [ r, g, b ] ) {
		const int = ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
		return INT.toHexString( int );
	}
};

const OBJECT = {
	isPrimitive: false,
	match: v => Object( v ) === v,
	fromHexString( string, target ) {
		const int = INT.fromHexString( string );
		target.r = ( int >> 16 & 255 ) / 255;
		target.g = ( int >> 8 & 255 ) / 255;
		target.b = ( int & 255 ) / 255;
	},
	toHexString( { r, g, b } ) {
		const int = ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
		return INT.toHexString( int );
	}
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}

class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function', 'button' );

		// this.$button = document.createElement( 'button' );
		// this.$button.innerHTML = this._name;

		this.domElement.addEventListener( 'click', () => {
			this.getValue()();
		} );

		// this.$widget.appendChild( this.$button );

	}

}

/**
 * @module NumberController
 */
class NumberController extends Controller {

	/**
	 * 
	 * @extends module:Controller Putting this here tricks jsdoc, but leaves intellisense alone
	 * @param {*} parent 
	 * @param {*} object 
	 * @param {*} property 
	 * @param {*} min 
	 * @param {*} max 
	 * @param {*} step 
	 */
	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._createInput();

		this.min( min );
		this.max( max );

		const stepExplicit = step !== undefined;
		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

		this.updateDisplay();

	}

	/**
	 * I'm technically an override.
	 */
	updateDisplay() {

		const value = this.getValue();

		if ( this._hasSlider ) {
			const percent = ( value - this._min ) / ( this._max - this._min );
			this.$fill.style.setProperty( 'width', percent * 100 + '%' );
		}

		if ( !this._inputFocused ) {
			this.$input.value = value;
		}
	}

	_createInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'inputmode', 'numeric' );

		this.$widget.appendChild( this.$input );

		const onInput = () => {

			const value = parseFloat( this.$input.value );
			if ( isNaN( value ) ) return;

			// Set the value, but don't call onFinishedChange
			this.setValue( this._clamp( value ), false );

		};

		// invoked on mousewheel or arrow key up/down
		const increment = delta => {

			const value = parseFloat( this.$input.value );
			if ( isNaN( value ) ) return;

			this._snapClampSetValue( value + delta );

			// Force the input to updateDisplay because it's focused
			this.$input.value = this.getValue();

		};

		const onKeyDown = e => {
			if ( e.keyCode === 13 ) {
				this.$input.blur();
			}
			if ( e.keyCode === 38 ) {
				e.preventDefault();
				increment( this._step * ( e.shiftKey ? 100 : e.altKey ? 1 : 10 ) );
			}
			if ( e.keyCode === 40 ) {
				e.preventDefault();
				increment( -1 * this._step * ( e.shiftKey ? 100 : e.altKey ? 1 : 10 ) );
			}
		};

		const onWheel = e => {
			if ( this._inputFocused ) {
				e.preventDefault();
				increment( this._normalizeMouseWheel( e ) * this._step );
			}
		};

		const onFocus = () => {
			this._inputFocused = true;
		};

		const onBlur = () => {
			this._inputFocused = false;
			this._callOnFinishedChange();
			this.updateDisplay();
		};

		this.$input.addEventListener( 'focus', onFocus );
		this.$input.addEventListener( 'input', onInput );
		this.$input.addEventListener( 'blur', onBlur );
		this.$input.addEventListener( 'keydown', onKeyDown );
		this.$input.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	_createSlider() {

		this._hasSlider = true;

		// Build DOM
		// ---------------------------------------------------------------------

		this.$slider = document.createElement( 'div' );
		this.$slider.classList.add( 'slider' );

		this.$fill = document.createElement( 'div' );
		this.$fill.classList.add( 'fill' );

		this.$slider.appendChild( this.$fill );
		this.$widget.insertBefore( this.$slider, this.$input );

		this.domElement.classList.add( 'hasSlider' );

		// Map clientX to value
		// ---------------------------------------------------------------------

		const map = ( v, a, b, c, d ) => {
			return ( v - a ) / ( b - a ) * ( d - c ) + c;
		};

		const setValueFromX = clientX => {
			const rect = this.$slider.getBoundingClientRect();
			let value = map( clientX, rect.left, rect.right, this._min, this._max );
			this._snapClampSetValue( value );
		};

		// Bind mouse listeners
		// ---------------------------------------------------------------------

		const mouseDown = e => {
			setValueFromX( e.clientX );
			this.$slider.classList.add( 'active' );
			window.addEventListener( 'mousemove', mouseMove );
			window.addEventListener( 'mouseup', mouseUp );
		};

		const mouseMove = e => {
			setValueFromX( e.clientX );
		};

		const mouseUp = () => {
			this._callOnFinishedChange();
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'mousemove', mouseMove );
			window.removeEventListener( 'mouseup', mouseUp );
		};

		this.$slider.addEventListener( 'mousedown', mouseDown );

		// Bind touch listeners
		// ---------------------------------------------------------------------

		let testingForScroll = false, prevClientX, prevClientY;

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			// For the record: as of 2019, Android seems to take care of this
			// automatically. I'd like to remove this whole test if iOS ever 
			// decided to do the same.

			if ( this._hasScrollBar ) {

				// If we're in a scrollable container, we should wait for 
				// the first touchmove to see if the user is trying to move 
				// horizontally or vertically.
				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			} else {

				// Otherwise, we can set the value straight away on touchstart.
				setValueFromX( e.touches[ 0 ].clientX );
				this.$slider.classList.add( 'active' );
				testingForScroll = false;

			}

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			if ( testingForScroll ) {

				const dx = e.touches[ 0 ].clientX - prevClientX;
				const dy = e.touches[ 0 ].clientY - prevClientY;

				if ( Math.abs( dx ) > Math.abs( dy ) ) {

					// We moved horizontally, set the value and stop checking.
					setValueFromX( e.touches[ 0 ].clientX );
					this.$slider.classList.add( 'active' );
					testingForScroll = false;

				} else {

					// This was, in fact, an attempt to scroll. Abort.
					window.removeEventListener( 'touchmove', onTouchMove );
					window.removeEventListener( 'touchend', onTouchEnd );

				}

			} else {

				e.preventDefault();
				setValueFromX( e.touches[ 0 ].clientX );

			}

		};

		const onTouchEnd = () => {
			this._callOnFinishedChange();
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		this.$slider.addEventListener( 'touchstart', onTouchStart );

		// Bind wheel listeners
		// ---------------------------------------------------------------------

		const onWheel = e => {

			// Ignore mousewheel on the slider if we're in a scrollable container
			if ( this._hasScrollBar ) return;

			e.preventDefault();
			const delta = this._normalizeMouseWheel( e ) * this._step;
			this._snapClampSetValue( this.getValue() + delta );

		};

		this.$slider.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	/**
	 * I'm new.
	 * @param {*} min 
	 */
	min( min ) {
		this._min = min;
		this._onUpdateMinMax();
		return this;
	}

	max( max ) {
		this._max = max;
		this._onUpdateMinMax();
		return this;
	}

	step( step, explicit = true ) {
		this._step = step;
		this._stepExplicit = explicit;
		return this;
	}

	_getImplicitStep() {

		if ( this._hasMin && this._hasMax ) {
			return ( this._max - this._min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this._hasSlider && this._hasMin && this._hasMax ) {

			// If this is the first time we're hearing about min and max
			// and we haven't explicitly stated what our step is, let's
			// update that too.
			if ( !this._stepExplicit ) {
				this.step( this._getImplicitStep(), false );
			}

			this._createSlider();
			this.updateDisplay();

		}

	}

	get _hasScrollBar() {
		const root = this.parent.root.$children;
		return root.scrollHeight > root.clientHeight;
	}

	get _hasMin() {
		return this._min !== undefined;
	}

	get _hasMax() {
		return this._max !== undefined;
	}

	_normalizeMouseWheel( e ) {

		let { deltaX, deltaY } = e;

		// when e.deltaY is giving back non-integral values, it's usually
		// a usb mouse plugged into a trackpad laptop. in that case fall back
		// to wheel delta.
		if ( Math.floor( e.deltaY ) !== e.deltaY && e.wheelDelta ) {
			deltaX = 0;
			deltaY = -e.wheelDelta / 120;
		}

		const wheel = deltaX + -deltaY;

		return wheel;

	}

	_snap( value ) {

		// // This would be the logical way to do things, but floating point errors.
		// return Math.round( value / this._step ) * this._step;

		// // The inverse step strategy solves most floating point precision issues,
		// // but not all of them ... 
		// const inverseStep = 1 / this._step;
		// return Math.round( value * inverseStep ) / inverseStep;

		const r = Math.round( value / this._step ) * this._step;
		return parseFloat( r.toPrecision( 15 ) ); // o_O ?

	}

	_clamp( value ) {
		const min = this._hasMin ? this._min : -Infinity;
		const max = this._hasMax ? this._max : Infinity;
		return Math.max( min, Math.min( max, value ) );
	}

	_snapClampSetValue( value ) {
		this.setValue( this._clamp( this._snap( value ) ) );
	}

}

class OptionController extends Controller {

	constructor( parent, object, property, options ) {

		super( parent, object, property, 'option' );

		this.$select = document.createElement( 'select' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this._values = Array.isArray( options ) ? options : Object.values( options );
		this._names = Array.isArray( options ) ? options : Object.keys( options );

		this._names.forEach( name => {
			const $option = document.createElement( 'option' );
			$option.innerHTML = name;
			this.$select.appendChild( $option );
		} );

		this.$select.addEventListener( 'change', () => {
			this.setValue( this._values[ this.$select.selectedIndex ] );
		} );

		this.$select.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$select.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this.$widget.appendChild( this.$select );
		this.$widget.appendChild( this.$display );

		this.updateDisplay();

	}

	updateDisplay() {
		const value = this.getValue();
		const index = this._values.indexOf( value );
		this.$select.selectedIndex = index;
		this.$display.innerHTML = index === -1 ? value : this._names[ index ];
	}

}

class StringController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'string' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );

		this.$input.addEventListener( 'input', () => {
			this.setValue( this.$input.value, false );
		} );

		this.$input.addEventListener( 'blur', () => {
			this._callOnFinishedChange();
		} );

		this.$input.addEventListener( 'keydown', e => {
			if ( e.keyCode === 13 ) {
				this._callOnFinishedChange();
			}
		} );

		this.$widget.appendChild( this.$input );

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this.getValue();
	}

}

class Header {

	constructor( parent, name ) {

		this.parent = parent;

		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'header' );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

		this.name( name );

	}

	name( name ) {
		this._name = name;
		this.domElement.innerHTML = name;
	}

	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

}

function injectStyles( cssContent ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}

var styles = "@font-face{font-family:\"lil-gui\";src:url(\"data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAASkAAsAAAAABzgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPQAAAFZr2336Y21hcAAAAYQAAAB5AAAByLssMi9nbHlmAAACAAAAALIAAAD0z0XwmmhlYWQAAAK0AAAAJwAAADZfcj24aGhlYQAAAtwAAAAYAAAAJAC5AGtobXR4AAAC9AAAAA4AAAAYAfQAAGxvY2EAAAMEAAAADgAAAA4A1gCUbWF4cAAAAxQAAAAeAAAAIAESAB5uYW1lAAADNAAAASIAAAIK9SUU/XBvc3QAAARYAAAASwAAAGO9vtJleJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQIZpzAwMrAwGDP4AYk+aC0AQMLgyQDAxMDKzMDVhCQ5prC4KA4VV2YIQXI5QSTDAyMIAIA9GEFuwAAAHic7ZFBCoMwEEXfmKQUcecJXAxuPIl4nq68Rq8irryancnYgnfoDy/wP2ECf4ACJGMyMsiK4HpZKjVPtDXPzOY7njTk4a2b7nqM/XnC3f0k9vp73DU2K/uP8uCvrt7L5Yq3GHjvugXWGboHvic9At/V2AeUD/TJFTYAAAB4nD2PYQrCMAyFk3RWijB1dO1WGMKEDZkgjLKCILuA+yEOvP9NTCcuEHgveR8kQBDrCTMQbABGtPm2LWPdnTs4F7e4ZF7whh1AaBtZoTYjDn7qhJSiE8GhSPpEoCO55j184Mj5uvEjto0f+hMavUdpSJDWJBIqEAuqWLBluqCE+88/+KqFv+EPDkO/8DVRHuksY4gMXtmyYMvDfOVnmOJHoQ022ItVaa1Ko9Kz+gIOtBCUAAB4nGNgZGBgAGKmPQF28fw2Xxm4GVIYsIEQhnAgycHABOIAAJJkBBIAeJxjYGRgYEhhYICTIQyMDKiADQAcegEleJxjYACCFEwMABWUAfUAAAAAAAAAEgAqAEoAagB6AAB4nGNgZGBgYGMQYmBiAAEQyQWEDAz/wXwGAArcATEAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HQQ5AMBAF0PloNRFHcaqZaYhmpini+hYsvd2jjl6gfxEdegwIiBgpSfMqflvKl/G5uc3Zi2hbuPihMn3zqhZ4Vd6JHgdmEqcA\") format(\"woff\")}.lil-gui{font-family:var(--font-family);font-size:var(--font-size);line-height:1;font-weight:normal;font-style:normal;text-align:left;background-color:var(--background-color);color:var(--text-color);user-select:none;-webkit-user-select:none;--width:250px;--text-color:#eee;--background-color:#1f1f1f;--widget-color:#424242;--highlight-color:#525151;--number-color:#00adff;--string-color:#1ed36f;--title-background-color:#111;--font-size:11px;--font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"Roboto\",\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\";--name-width:42%;--slider-input-width:27%;--row-height:24px;--widget-height:20px;--padding:6px;--widget-padding:0 0 0 3px;--widget-border-radius:2px;--scrollbar-width:5px;--mobile-max-height:200px}.lil-gui,.lil-gui *{box-sizing:border-box;margin:0}.lil-gui .lil-gui{--width:inherit;--text-color:inherit;--background-color:inherit;--widget-color:inherit;--highlight-color:inherit;--number-color:inherit;--string-color:inherit;--title-background-color:inherit;--font-size:inherit;--font-family:inherit;--name-width:inherit;--slider-input-width:inherit;--row-height:inherit;--widget-height:inherit;--padding:inherit;--widget-padding:inherit;--widget-border-radius:inherit;--scrollbar-width:inherit;--mobile-max-height:inherit}.lil-gui.root{width:var(--width)}.lil-gui.root>.title{background:var(--title-background-color)}.lil-gui .title{height:var(--row-height);padding:0 var(--padding);font-weight:bold;display:flex;align-items:center}.lil-gui .title:before{font-family:\"lil-gui\";align-self:flex-end;width:1em;margin-left:-0.18em}.lil-gui.collapses>.title:before{content:\"▾\"}.lil-gui.collapses.closed .children{display:none}.lil-gui.collapses.closed .title:before{content:\"▸\"}.lil-gui .lil-gui.collapses>.children{margin-left:var(--padding);border-left:2px solid var(--widget-color)}.lil-gui .header{height:var(--row-height);padding:0 var(--padding);font-weight:bold;display:flex;align-items:center}.lil-gui .header,.lil-gui .lil-gui:not(.collapses)>.title{position:relative}.lil-gui .header:after,.lil-gui .lil-gui:not(.collapses)>.title:after{content:\" \";display:block;position:absolute;left:0;right:0;bottom:.2em;height:1px;background:var(--widget-color)}.lil-gui.autoPlace{position:fixed;top:0;right:15px;z-index:1001}.lil-gui.autoPlace>.children{max-height:calc(var(--window-height) - var(--row-height));overflow-y:auto;-webkit-overflow-scrolling:touch}.lil-gui.autoPlace>.children::-webkit-scrollbar{width:var(--scrollbar-width);background:var(--background-color)}.lil-gui.autoPlace>.children::-webkit-scrollbar-corner{height:0;display:none}.lil-gui.autoPlace>.children::-webkit-scrollbar-thumb{border-radius:var(--scrollbar-width);background:var(--highlight-color)}@media(max-width: 600px){.lil-gui.autoPlace{--row-height: 38px;--widget-height: 32px;--font-size: 16px;--padding: 8px;--widget-padding: 0 0 0 5px;--scrollbar-width: 7px;right:auto;top:auto;bottom:0;left:0;width:100%}.lil-gui.autoPlace>.children{max-height:calc(var(--mobile-max-height) - var(--row-height))}}.lil-gui input{border:0;outline:none;font-family:var(--font-family);font-size:var(--font-size);border-radius:var(--widget-border-radius);height:var(--widget-height);background:var(--widget-color);color:var(--text-color);width:100%}.lil-gui input[type=text]{padding:var(--widget-padding)}.lil-gui input:focus,.lil-gui input:active{background:var(--highlight-color)}.lil-gui input[type=checkbox]{appearance:none;-webkit-appearance:none;--size: calc(0.75 * var(--widget-height));height:var(--size);width:var(--size);border-radius:var(--widget-border-radius);text-align:center}.lil-gui input[type=checkbox]:checked:before{font-family:\"lil-gui\";content:\"✓\";font-size:var(--size);line-height:var(--size)}.lil-gui button{-webkit-tap-highlight-color:transparent;outline:none;cursor:pointer;border:0;font-family:var(--font-family);font-size:var(--font-size);color:var(--text-color);background:var(--background-color);text-align:left;text-transform:none;width:100%}@media(hover: hover){.lil-gui button:hover{background:var(--widget-color)}}.lil-gui button:active{background:var(--highlight-color)}.lil-gui .display{background:var(--widget-color)}.lil-gui .display.focus,.lil-gui .display.active{background:var(--highlight-color)}.lil-gui .controller{display:flex;align-items:center;padding:0 var(--padding);height:var(--row-height)}.lil-gui .controller.disabled{opacity:.5;pointer-events:none}.lil-gui .controller .name{display:flex;align-items:center;min-width:var(--name-width);flex-shrink:0;padding-right:var(--padding);height:100%;overflow:hidden}.lil-gui .controller .widget{position:relative;display:flex;align-items:center;width:100%;height:100%}.lil-gui .controller.number input{color:var(--number-color)}.lil-gui .controller.number.hasSlider input{width:var(--slider-input-width);min-width:38px;flex-shrink:0}.lil-gui .controller.number .slider{width:100%;height:var(--widget-height);margin-right:calc(var(--row-height) - var(--widget-height));background-color:var(--widget-color);border-radius:var(--widget-border-radius);overflow:hidden}.lil-gui .controller.number .slider.active{background-color:var(--highlight-color)}.lil-gui .controller.number .slider.active .fill{opacity:.95}.lil-gui .controller.number .fill{height:100%;background-color:var(--number-color)}.lil-gui .controller.string input{color:var(--string-color)}.lil-gui .controller.color input{opacity:0;position:absolute;height:var(--widget-height);width:100%}.lil-gui .controller.color .display{pointer-events:none;height:var(--widget-height);width:100%;border-radius:var(--widget-border-radius)}.lil-gui .controller.option select{opacity:0;position:absolute;max-width:100%}.lil-gui .controller.option .display{pointer-events:none;border-radius:var(--widget-border-radius);height:var(--widget-height);line-height:var(--widget-height);position:relative;max-width:100%;overflow:hidden;word-break:break-all;padding-left:.55em;padding-right:1.75em}.lil-gui .controller.option .display:after{font-family:\"lil-gui\";content:\"↕\";position:absolute;top:0;right:0;bottom:0;padding-right:.375em}.lil-gui .controller.function .widget:before{font-family:\"lil-gui\";content:\"▶\"}.lil-gui.bigSlider .hasSlider,.lil-gui .bigSlider.hasSlider{position:relative}.lil-gui.bigSlider .hasSlider .name,.lil-gui .bigSlider.hasSlider .name{position:absolute;pointer-events:none;width:auto;z-index:1;padding-left:var(--padding)}.lil-gui.bigSlider .hasSlider input,.lil-gui .bigSlider.hasSlider input{width:18%}\n";

/**
 * @module GUI
 */
injectStyles( styles );

/**
 * Class description
 */
class GUI {

	/**
	 * 
	 * @param {Object=} options
	 * @param {GUI=} options.parent
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		title = 'Controls',
		width = 250,
		mobileMaxHeight = 200,
		collapses = true
	} = {} ) {

		/** * description short @type {GUI} */
		this.parent = parent;

		/**
		 * Reference to the outermost folder, or `this` for the root GUI.
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * TODO
		 * @type {Array}
		 */
		this.children = [];

		/**
		 * @type {boolean}
		 */
		this._closed = false;

		/**
		 * The outermost container `div`.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( collapses ? 'button' : 'div' );
		this.$title.classList.add( 'title' );

		if ( collapses ) {
			this.domElement.classList.add( 'collapses' );
			this.$title.addEventListener( 'click', () => {
				this.open( this._closed );
			} );
		}

		/**
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		if ( this.parent ) {

			this.parent.children.push( this );
			this.parent.$children.appendChild( this.domElement );

		} else {

			this.domElement.classList.add( 'root' );
			this.domElement.style.setProperty( '--width', width + 'px' );

		}

		if ( autoPlace ) {

			this.domElement.classList.add( 'autoPlace' );

			this._onResize = () => {
				this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
			};

			window.addEventListener( 'resize', this._onResize );
			this._onResize();

			this.mobileMaxHeight = mobileMaxHeight;

			let prevClientY;

			const onTouchStart = e => {
				if ( e.touches.length > 1 ) return;
				prevClientY = e.touches[ 0 ].clientY;
				window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
				window.addEventListener( 'touchend', onTouchEnd );
			};

			const onTouchMove = e => {
				e.preventDefault();
				const deltaY = e.touches[ 0 ].clientY - prevClientY;
				prevClientY = e.touches[ 0 ].clientY;
				this.mobileMaxHeight -= deltaY;
			};

			const onTouchEnd = () => {
				window.removeEventListener( 'touchmove', onTouchMove );
				window.removeEventListener( 'touchend', onTouchEnd );
			};


			this.$title.addEventListener( 'touchstart', onTouchStart );

			document.body.appendChild( this.domElement );

		}


		this.title( title );


	}

	/**
	 * Adds a controller. 
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @param {*=} $1
	 * @param {*=} max 
	 * @param {*=} step 
	 * @returns {Controller}
	 * 
	 * @example 
	 * gui.add( { myBoolean: false }, 'myBoolean' );
	 * 
	 * @example
	 * gui.add( { myNumber: 0 }, 'myNumber', 0, 100, 1 );
	 * 
	 * @example
	 * gui.add( { myOptions: 'small' }, 'myOptions', [ 'big', 'medium', 'small' ] );
	 * gui.add( { myOptions: 0 }, 'myOptions', { Label1: 0, Label2: 1, Label3: 2 } );
	 */
	add( object, property, $1, max, step ) {

		const initialValue = object[ property ];

		if ( initialValue === undefined ) {

			throw new Error( `Property "${property}" of ${object} is undefined.` );

		}

		if ( Array.isArray( $1 ) || Object( $1 ) === $1 ) {

			return new OptionController( this, object, property, $1 );

		} else if ( typeof initialValue == 'boolean' ) {

			return new BooleanController( this, object, property );

		} else if ( typeof initialValue == 'string' ) {

			return new StringController( this, object, property );

		} else if ( typeof initialValue == 'function' ) {

			return new FunctionController( this, object, property );

		} else if ( typeof initialValue == 'number' ) {

			return new NumberController( this, object, property, $1, max, step );

		} else {

			throw new Error( `No suitable controller type for ${initialValue}` );

		}

	}

	/**
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @returns {Controller}
	 */
	addColor( object, property ) {
		return new ColorController( this, object, property );
	}

	/**
	 * 
	 * @param {string} name 
	 * @returns {Header}
	 */
	addHeader( name ) {
		return new Header( this, name );
	}

	/**
	 * 
	 * @param {string} title 
	 * @returns {GUI}
	 */
	addFolder( title, collapses = true ) {
		return new GUI( { parent: this, title, collapses } );
	}

	/**
	 * 
	 * @param {string} title 
	 * @chainable
	 */
	title( title ) {
		/**
		 * @type {string}
		 */
		this._title = title;
		this.$title.innerHTML = title;
		return this;
	}

	/**
	 * Opens or closes a GUI or folder.
	 * 
	 * @param {boolean=} open Pass false to close
	 * @chainable
	 * @example
	 * folder.open(); // open
	 * folder.open( false ); // closed
	 * folder.open( folder._closed ); // toggle
	 */
	open( open = true ) {
		this._closed = !open;
		this.domElement.classList.toggle( 'closed', this._closed );
		return this;
	}

	/**
	 * @chainable
	 */
	close() {
		this._closed = true;
		this.domElement.classList.add( 'closed' );
		return this;
	}

	/**
	 * 
	 */
	destroy() {

		if ( this.parent ) {
			this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		}

		this.domElement.parentElement.removeChild( this.domElement );

		Array.from( this.children ).forEach( c => c.destroy() );

		if ( this._onResize ) {
			window.removeEventListener( 'resize', this._onResize );
		}

	}

	forEachController( callback, recursive = false ) {
		this.children.forEach( c => {
			if ( c instanceof Controller ) {
				callback( c );
			} else if ( recursive && c instanceof GUI ) {
				c.forEachController( callback, true );
			}
		} );
	}

	get mobileMaxHeight() {
		return this._mobileMaxHeight;
	}

	set mobileMaxHeight( v ) {
		this._mobileMaxHeight = v;
		this.domElement.style.setProperty( '--mobile-max-height', v + 'px' );
	}

}

export default GUI;
export { BooleanController, ColorController, Controller, FunctionController, GUI, Header, NumberController, OptionController, StringController };
