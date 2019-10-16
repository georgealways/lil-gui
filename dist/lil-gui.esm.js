/**
 * lil-gui
 * @version 0.9.0
 * @author George Michael Brower
 * @license MIT
 */

/**
 * Base class for all controllers.
 */
class Controller {

	constructor( parent, object, property, className, tagName = 'div' ) {

		/**
		 * The GUI this controller belongs to.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The object this controller will modify.
		 * @type {object}
		 */
		this.object = object;

		/**
		 * The name of the property to control.
		 * @type {string}
		 */
		this.property = property;

		/**
		 * Used to determine if the controller is disabled.
		 * @type {boolean}
		 */
		this._disabled = false;

		/**
		 * The value when the controller is created.
		 * @type {any}
		 */
		this.initialValue = this.getValue();

		/**
		 * The outermost container element.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( tagName );
		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		/**
		 * The element that contains the controller's name.
		 * @type {HTMLElement}
		 */
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		/**
		 * The element that contains the controller's "widget", like a checkbox or a slider.
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

		this._listenCallback = this._listenCallback.bind( this );

		this.name( property );

	}

	/**
	 * Sets the name of the controller and its label in the GUI.
	 * @param {string} name
	 * @returns {this}
	 */
	name( name ) {
		/**
		 * Used to access the controller's name.
		 * @type {string}
		 */
		this._name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * Pass a function to be called whenever the value is modified by this controller.
	 * The function receives the new value as its first parameter and `this` will be bound to the
	 * controller.
	 * @param {Function} callback todoc
	 * @returns {this}
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 *
	 * const controller = gui.add( object, 'property' )
	 * 	.onChange( function() {
	 * 		console.assert(this === controller);
	 * 	} );
	 */
	onChange( callback ) {
		/**
		 * A function that will be called whenever the value is modified via the GUI.
		 * The function receives the new value as its first parameter and `this` will be bound to
		 * the controller.
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	onFinishChange( callback ) {
		return this.onChange( callback );
	}

	/**
	 * Sets the controller back to its initial value.
	 * @returns {this}
	 */
	reset() {
		this.setValue( this.initialValue );
		return this;
	}

	/**
	 * Enables this controller.
	 * @param {boolean} enabled
	 * @returns {this}
	 * @example
	 * controller.enable();
	 * controller.enable( false ); // disable
	 * controller.enable( controller._disabled ); // toggle
	 */
	enable( enabled = true ) {
		this._disabled = !enabled;
		this.domElement.classList.toggle( 'disabled', this._disabled );
		return this;
	}

	/**
	 * Disables this controller.
	 * @param {boolean} disabled
	 * @returns {this}
	 * @example
	 * controller.disable();
	 * controller.disable( false ); // enable
	 * controller.disable( !controller._disabled ); // toggle
	 */
	disable( disabled = true ) {
		this._disabled = disabled;
		this.domElement.classList.toggle( 'disabled', this._disabled );
		return this;
	}

	/**
	 * Destroys this controller and adds a new option controller.
	 * @param {object|Array} options
	 * @returns {Controller}
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {this}
	 */
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {this}
	 */
	max( max ) {
		return this;
	}

	/**
	 * Sets the step. Only works on number controllers.
	 * @param {number} step
	 * @returns {this}
	 */
	step( step ) {
		return this;
	}

	/**
	 * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening, and use
	 * `controller._listening` to access the listening state.
	 * @param {boolean} listen
	 * @returns {this}
	 */
	listen( listen = true ) {

		/**
		 * Used to determine if the controller is listening.  Use `controller.listen(true|false)` to
		 * change the listening state.
		 * @type {boolean}
		 */
		this._listening = listen;

		if ( this._listenCallbackID !== undefined ) {
			cancelAnimationFrame( this._listenCallbackID );
			this._listenCallbackID = undefined;
		}

		if ( this._listening ) {
			this._listenCallback();
		}

		return this;

	}

	_listenCallback() {
		this._listenCallbackID = requestAnimationFrame( this._listenCallback );
		this.updateDisplay();
	}

	/**
	 * Returns `object[ property ]`.
	 * @returns {any}
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * todoc
	 * @param {any} value
	 * @returns {this}
	 */
	setValue( value ) {
		this.object[ this.property ] = value;
		this._callOnChange();
		this.updateDisplay();
		return this;
	}

	_callOnChange() {
		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}
	}

	/**
	 * Updates the display to keep it in sync with the current value. Useful for updating your
	 * controllers when their values have been modified outside of the GUI.
	 * @returns {this}
	 */
	updateDisplay() {
		return this;
	}

	import( value ) {
		this.setValue( value );
		return this;
	}

	export() {
		return this.getValue();
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
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
		return this;
	}

}

function normalizeColorString( string ) {

	let match, result;

	if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {

		result = match[ 2 ];

	} else if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {

		result = parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );

	} else if ( match = string.match( /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i ) ) {

		result = match[ 1 ] + match[ 1 ] + match[ 2 ] + match[ 2 ] + match[ 3 ] + match[ 3 ];

	}

	if ( result ) {
		return '#' + result;
	}

	return false;

}

const STRING = {
	isPrimitive: true,
	match: v => typeof v === 'string',
	fromHexString: normalizeColorString,
	toHexString: normalizeColorString
};

const INT = {
	isPrimitive: true,
	match: v => typeof v === 'number',
	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
	isPrimitive: false,
	match: Array.isArray,
	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target[ 0 ] = ( int >> 16 & 255 ) / 255 * rgbScale;
		target[ 1 ] = ( int >> 8 & 255 ) / 255 * rgbScale;
		target[ 2 ] = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( [ r, g, b ], rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const OBJECT = {
	isPrimitive: false,
	match: v => Object( v ) === v,
	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target.r = ( int >> 16 & 255 ) / 255 * rgbScale;
		target.g = ( int >> 8 & 255 ) / 255 * rgbScale;
		target.b = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( { r, g, b }, rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}

class ColorController extends Controller {

	constructor( parent, object, property, rgbScale ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );
		this.$input.setAttribute( 'tabindex', -1 );

		this.$text = document.createElement( 'input' );
		this.$text.setAttribute( 'type', 'text' );
		this.$text.setAttribute( 'spellcheck', 'false' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$display.appendChild( this.$input );
		this.$widget.appendChild( this.$display );
		this.$widget.appendChild( this.$text );

		this._format = getColorFormat( this.initialValue );
		this._rgbScale = rgbScale;

		this._initialValueHexString = this.export();
		this._textFocused = false;

		this.$input.addEventListener( 'change', () => {
			this._setValueFromHexString( this.$input.value );
		} );

		this.$input.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$input.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this.$text.addEventListener( 'input', () => {
			const tryParse = normalizeColorString( this.$text.value );
			if ( tryParse ) {
				this._setValueFromHexString( tryParse );
			}
		} );

		this.$text.addEventListener( 'focus', () => {
			this._textFocused = true;
			this.$text.select();
		} );

		this.$text.addEventListener( 'blur', () => {
			this._textFocused = false;
			this.updateDisplay();
		} );

		this.updateDisplay();

	}

	reset() {
		this._setValueFromHexString( this._initialValueHexString );
		return this;
	}

	_setValueFromHexString( value ) {

		if ( this._format.isPrimitive ) {

			const newValue = this._format.fromHexString( value );
			this.setValue( newValue );

		} else {

			this._format.fromHexString( value, this.getValue(), this._rgbScale );
			this._callOnChange();
			this.updateDisplay();

		}

	}

	export() {
		return this._format.toHexString( this.getValue(), this._rgbScale );
	}

	import( value ) {
		this._setValueFromHexString( value );
		return this;
	}

	updateDisplay() {
		this.$input.value = this._format.toHexString( this.getValue(), this._rgbScale );
		if ( !this._textFocused ) {
			this.$text.value = this.$input.value.substring( 1 );
		}
		this.$display.style.backgroundColor = this.$input.value;
	}

}

class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function', 'button' );

		this.domElement.addEventListener( 'click', () => {
			this.getValue().call( this.object );
		} );

	}

}

class NumberController extends Controller {

	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._initInput();

		this.min( min );
		this.max( max );

		const stepExplicit = step !== undefined;
		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

		this.updateDisplay();

	}

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

	updateDisplay() {

		const value = this.getValue();

		if ( this._hasSlider ) {
			const percent = ( value - this._min ) / ( this._max - this._min );
			this.$fill.style.setProperty( 'width', percent * 100 + '%' );
		}

		if ( !this._inputFocused ) {
			this.$input.value = value;
		}

		return this;

	}

	_initInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'inputmode', 'numeric' );

		this.$widget.appendChild( this.$input );

		const onInput = () => {

			const value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			this.setValue( this._clamp( value ) );

		};

		// invoked on wheel or arrow key up/down
		const increment = delta => {

			const value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			this._snapClampSetValue( value + delta );

			// Force the input to updateDisplay when it's focused
			this.$input.value = this.getValue();

		};

		const onKeyDown = e => {
			if ( e.keyCode === 13 ) {
				this.$input.blur();
			}
			if ( e.keyCode === 38 ) {
				e.preventDefault();
				increment( this._step * this._arrowKeyMultiplier( e ) );
			}
			if ( e.keyCode === 40 ) {
				e.preventDefault();
				increment( -1 * this._step * this._arrowKeyMultiplier( e ) );
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
			this.updateDisplay();
		};

		this.$input.addEventListener( 'focus', onFocus );
		this.$input.addEventListener( 'input', onInput );
		this.$input.addEventListener( 'blur', onBlur );
		this.$input.addEventListener( 'keydown', onKeyDown );
		this.$input.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	_initSlider() {

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

			// 2019: Android seems to take care of this automatically.
			// I'd like to remove this test if iOS ever decided to do the same.

			// If we're in a scrollable container, we should wait for
			// the first touchmove to see if the user is trying to move
			// horizontally or vertically.
			if ( this._hasScrollBar ) {

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
					e.preventDefault();
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
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		this.$slider.addEventListener( 'touchstart', onTouchStart );

		// Bind wheel listeners
		// ---------------------------------------------------------------------

		const onWheel = e => {

			if ( this._hasScrollBar ) return;

			e.preventDefault();

			const delta = this._normalizeMouseWheel( e ) * this._step;
			this._snapClampSetValue( this.getValue() + delta );

		};

		this.$slider.addEventListener( 'wheel', onWheel, { passive: false } );

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

			this._initSlider();
			this.updateDisplay();

		}

	}

	_normalizeMouseWheel( e ) {

		let { deltaX, deltaY } = e;

		// 2019: Safari and Chrome report weird non-integral values for an actual
		// mouse with a wheel connected to a macbook, but still expose actual
		// lines scrolled via wheelDelta.
		if ( Math.floor( e.deltaY ) !== e.deltaY && e.wheelDelta ) {
			deltaX = 0;
			deltaY = -e.wheelDelta / 120;
		}

		const wheel = deltaX + -deltaY;

		return wheel;

	}

	_arrowKeyMultiplier( e ) {

		if ( this._stepExplicit ) {
			return e.shiftKey ? 10 : 1;
		} else if ( e.shiftKey ) {
			return 100;
		} else if ( e.altKey ) {
			return 1;
		}
		return 10;

	}

	_snap( value ) {

		// This would be the logical way to do things, but floating point errors.
		// return Math.round( value / this._step ) * this._step;

		// Using inverse step solves a lot of them, but not all
		// const inverseStep = 1 / this._step;
		// return Math.round( value * inverseStep ) / inverseStep;

		// Not happy about this, but haven't seen it break.
		const r = Math.round( value / this._step ) * this._step;
		return parseFloat( r.toPrecision( 15 ) );

	}

	_clamp( value ) {
		const min = this._hasMin ? this._min : -Infinity;
		const max = this._hasMax ? this._max : Infinity;
		return Math.max( min, Math.min( max, value ) );
	}

	_snapClampSetValue( value ) {
		this.setValue( this._clamp( this._snap( value ) ) );
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
		return this;
	}

}

class StringController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'string' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );

		this.$input.addEventListener( 'input', () => {
			this.setValue( this.$input.value );
		} );

		this.$input.addEventListener( 'keydown', e => {
			if ( e.keyCode === 13 ) {
				this.$input.blur();
			}
		} );

		this.$widget.appendChild( this.$input );

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this.getValue();
		return this;
	}

}

const stylesheet = `.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  background-color: var(--background-color);
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --widget-color: #424242;
  --highlight-color: #525151;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Lucida Grande", "Segoe UI", Roboto, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace, "Droid Sans Fallback";
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --name-width: 45%;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size:calc(0.75 * var(--widget-height));
  --title-height: calc(var(--widget-height) + var(--spacing));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
}
.lil-gui.root {
  width: var(--width, 250px);
  display: flex;
  flex-direction: column;
}
.lil-gui.root > .title {
  background: var(--title-background-color);
}
.lil-gui.root > .children {
  overflow: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--highlight-color);
}
.lil-gui .lil-gui {
  --background-color:inherit;
  --text-color:inherit;
  --title-background-color:inherit;
  --widget-color:inherit;
  --highlight-color:inherit;
  --number-color:inherit;
  --string-color:inherit;
  --font-size:inherit;
  --font-family:inherit;
  --font-family-mono:inherit;
  --padding:inherit;
  --spacing:inherit;
  --widget-height:inherit;
  --name-width:inherit;
  --slider-input-width:inherit;
  --color-input-width:inherit;
  --slider-input-min-width:inherit;
  --color-input-min-width:inherit;
  --folder-indent:inherit;
  --widget-padding:inherit;
  --widget-border-radius:inherit;
  --checkbox-size:inherit;
}
.lil-gui.mobile {
  --widget-height: 32px;
  --padding: 8px;
  --spacing: 8px;
  --font-size: 15px;
  --folder-indent: 12px;
  --widget-padding: 0 0 0 5px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 65px;
  --color-input-min-width: 65px;
  width: 100%;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}
.lil-gui.autoPlace.mobile {
  max-height: var(--max-height, 170px);
  top: auto;
  right: auto;
  bottom: 0;
  left: 0;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.lil-gui .controller .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background-color: var(--widget-color);
  border-radius: var(--widget-border-radius);
  overflow: hidden;
}
.lil-gui .controller.number .slider.active {
  background-color: var(--highlight-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: 2px solid var(--number-color);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  position: relative;
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.function {
  background: none;
}
@media (hover: hover) {
  .lil-gui .controller.function:hover .name {
    background: var(--highlight-color);
  }
}
.lil-gui .controller.function:active .name {
  background: var(--text-color);
  color: var(--background-color);
}
.lil-gui .controller.function .name {
  display: block;
  padding: 0;
  text-align: center;
  width: 100%;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
}
.lil-gui .controller.function .widget {
  display: none;
}

.lil-gui .title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  line-height: calc(var(--title-height) - 2px);
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed > .children:not(.transition) {
  display: none;
}
.lil-gui .children.transition {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  overflow: hidden;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui .lil-gui:not(.closed) > .title {
  border-bottom: 1px solid var(--widget-color);
}
.lil-gui:not(.closed) + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .controller {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}

.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
.lil-gui input[type=text] {
  padding: var(--widget-padding);
}
.lil-gui input:focus, .lil-gui input:active {
  background: var(--highlight-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  -webkit-appearance: none;
  height: var(--checkbox-size);
  width: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
.lil-gui button {
  -webkit-tap-highlight-color: transparent;
  outline: none;
  cursor: pointer;
  border: 0;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  text-align: left;
  width: 100%;
  text-transform: none;
}
.lil-gui .display {
  background: var(--widget-color);
}
.lil-gui .display.focus, .lil-gui .display.active {
  background: var(--highlight-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAQ4AAsAAAAABqAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPQAAAFZr2333Y21hcAAAAYQAAABuAAABssJQk9tnbHlmAAAB9AAAAF8AAACEIZ5WI2hlYWQAAAJUAAAAJwAAADZfcj23aGhlYQAAAnwAAAAYAAAAJAC5AGpobXR4AAAClAAAAA4AAAAUAZAAAGxvY2EAAAKkAAAADAAAAAwARABkbWF4cAAAArAAAAAeAAAAIAERABJuYW1lAAAC0AAAASIAAAIK9SUU/XBvc3QAAAP0AAAAQgAAAFiCDrX0eJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQIYJzAwMrAwGDP4AYk+aC0AQMLgyQDAxMDKzMDVhCQ5prC4KA4VV2YIQXI5QSTDAyMIAIA82gFuAAAAHic7ZGxDYAwDAQvISCE6JiAIkrDEBmIil3YJVVWAztOwRC8dZH9ily8gREYhEMI4C4cqlNc1/yBpfmBLPPCjMfvdyyxpu154Nt3Oflnpb2XHbp74tfa3tynoOkZmnYshiRGrIZeJ20G4QWoQBFzAAB4nGNgYgABH4YwBiYGVgYGe0ZxUXZ1SRCwkZQUkZQEyTKC1dgyuIJUmLOrm6ub2yqyS0mxq4BJqLw7gyVYXt1c3FxcDSwjiCwfwuCLkNcU5+RT4pQU4+RT5gQAe+sKMgB4nGNgZGBgAOKTAv9nx/PbfGXgZkhhwAZCGMKAJAcDE4gDAMWSBTgAeJxjYGRgYEhhYICTIQyMDKiAFQAceQEkeJxjYACCFFQMAA4kAZEAAAAAAAAAEgAiADIAQnicY2BkYGBgZWBjYGIAARDJBYQMDP/BfAYACZUBJAAAeJxd0E1Kw0AcBfCXfmIDRRBdicxKF9L0Y9kDtPsuAi7TdJKmTDNhMi3UE3gCT+ApPIB4LF/Df2NmSPKbNy8DCYBb/CDAdQQYNvfr6NBDcZcai3v0vbiPEI/iAfMX8QiviMQh7vDGE4LeDZMxjLhDv4u79Ie4R3+K+3jAl3jA/Fs8QoxfcYjn4MkUZpKfio3OTyZxspJHrF1d2FLNo5kka11ql3i9U9uLqs/5wvtMZc4e1cqWXhtjVeXsQac+2ntfLafTTPIotUd+QcFrghwnagPdyCCBa+39X8VsOtSURQmFOf/RrNVZs1M2vQSezx17W1x4r3FmZ8HUI+M6Y8fiSK2a865tw2mZVM3egUnKPMK+eavCElPOrNWP2OJJf3XUWN4AAHicY2BigABGBuyAlZGJkZmRhZGVkY2BI6UovyAlvzyPNy0/JyW1SDc5J784NYUbyssvSM1jTc5ITc5mYAAAYLAPMAAA") format("woff");
}`;

function _injectStyles( cssContent ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}

let stylesInjected = false;

class GUI {

	/**
	 * todoc
	 * @param {object} [options]
	 * @param {boolean} [options.autoPlace=true]
	 * Adds the GUI to `document.body` and applies fixed positioning.
	 *
	 * @param {number} [options.mobileBreakpoint=500] todoc
	 * @param {number} [options.mobileMaxHeight=170] todoc
	 *
	 * @param {HTMLElement} [options.container]
	 * Adds the GUI to this DOM element, overriding autoPlace.
	 *
	 * @param {boolean} [options.injectStyles=true]
	 * Injects the default stylesheet as the first child of `document.head`.
	 * Pass false when using your own stylesheet.
	 *
	 * @param {string|false} [options.title=Controls]
	 * Name to display in the title bar. Pass `false` to hide the title bar.
	 *
	 * @param {number} [options.width] todoc
	 *
	 * @param {string} [options.queryKey]
	 * If defined, the GUI will be hidden unless the specified string is found in `location.search`.
	 * You can use this to hide the GUI until you visit `url.com/?debug` for example.
	 *
	 * @param {GUI} [options.parent] Adds this GUI as a child or "folder" in another GUI. Usually
	 * this is done for you by `gui.addFolder()`.
	 *
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		mobileBreakpoint = 500,
		mobileMaxHeight = 170,
		container,
		injectStyles = true,
		title = 'Controls',
		width,
		queryKey
	} = {} ) {

		/**
		 * todoc
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * todoc
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * todoc
		 * @type {Array<GUI|Controller>}
		 */
		this.children = [];

		/**
		 * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
		 * @type {boolean}
		 */
		this._closed = false;

		/**
		 * The outermost container element.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The element that contains the title.
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'div' );
		this.$title.classList.add( 'title' );
		this.$title.addEventListener( 'click', () => {
			this.openAnimated( this._closed );
		} );

		/**
		 * The element that contains children.
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

			if ( width ) {
				this.domElement.style.setProperty( '--width', width + 'px' );
			}

			if ( !stylesInjected && injectStyles ) {
				_injectStyles( stylesheet );
				stylesInjected = true;
			}

			if ( container ) {

				container.appendChild( this.domElement );

			} else if ( autoPlace ) {

				this.domElement.classList.add( 'autoPlace' );
				document.body.appendChild( this.domElement );

				// Allows you to change the height on mobile by dragging the title
				this._initTitleDrag();

			}

			this._onResize = () => {

				// Toggles mobile class via JS (as opposed to media query) to make the breakpoint
				// configurable via constructor
				const mobile = window.innerWidth <= mobileBreakpoint;
				this.domElement.classList.toggle( 'mobile', mobile );

				// Adds a scrollbar to an autoPlace GUI
				this._setMaxHeight( mobile ? mobileMaxHeight : window.innerHeight );

			};

			window.addEventListener( 'resize', this._onResize );
			this._onResize();

		}

		if ( queryKey && !new RegExp( `\\b${queryKey}\\b` ).test( location.search ) ) {
			this.domElement.style.display = 'none';
		}

		this.title( title );

	}

	/**
	 * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
	 * selectable values for a dropdown.
	 * @param {number} [max] Maximum value for number controllers.
	 * @param {number} [step] Step value for number controllers.
	 * @returns {Controller}
	 */
	add( object, property, $1, max, step ) {

		if ( Object( $1 ) === $1 ) {

			return new OptionController( this, object, property, $1 );

		}

		const initialValue = object[ property ];

		switch ( typeof initialValue ) {

			case 'number':

				return new NumberController( this, object, property, $1, max, step );

			case 'boolean':

				return new BooleanController( this, object, property );

			case 'string':

				return new StringController( this, object, property );

			case 'function':

				return new FunctionController( this, object, property );

		}

		console.error( `Failed to add controller for "${property}"`, initialValue, object );

	}

	/**
	 * todoc
	 * @param {object} object todoc
	 * @param {string} property todoc
	 * @param {number} rgbScale todoc
	 * @returns {Controller}
	 */
	addColor( object, property, rgbScale = 1 ) {
		return new ColorController( this, object, property, rgbScale );
	}

	/**
	 * todoc
	 * @param {string} title todoc
	 * @returns {GUI}
	 */
	addFolder( title ) {
		return new GUI( { parent: this, title } );
	}

	/**
	 * todoc
	 * @param {boolean} recursive
	 * @returns {Controller[]}
	 */
	getControllers( recursive = true ) {
		let controllers = this.children.filter( c => c instanceof Controller );
		if ( !recursive ) return controllers;
		this.getFolders( true ).forEach( f => {
			controllers = controllers.concat( f.getControllers( false ) );
		} );
		return controllers;
	}

	/**
	 * todoc
	 * @param {boolean} recursive
	 * @returns {GUI[]}
	 */
	getFolders( recursive = true ) {
		const folders = this.children.filter( c => c instanceof GUI );
		if ( !recursive ) return folders;
		let allFolders = Array.from( folders );
		folders.forEach( f => {
			allFolders = allFolders.concat( f.getFolders( true ) );
		} );
		return allFolders;
	}

	/**
	 * Resets all controllers.
	 * @param {boolean} recursive
	 * @returns {this}
	 */
	reset( recursive = true ) {
		this.getControllers( recursive ).forEach( c => c.reset() );
		return this;
	}

	/**
	 * todoc
	 * @param {object} obj
	 * @param {boolean} recursive
	 * @returns {this}
	 */
	import( obj, recursive = true ) {
		this.getControllers( recursive ).forEach( c => {
			if ( c._name in obj ) {
				c.import( obj[ c._name ] );
			}
		} );
		return this;
	}

	/**
	 * Returns an object mapping controller names to values.
	 * @param {boolean} recursive
	 * @returns {object}
	 */
	export( recursive = true ) {
		const obj = {};
		this.getControllers( recursive ).forEach( c => {
			obj[ c._name ] = c.export();
		} );
		return obj;
	}

	/**
	 * Opens a GUI or folder. GUI and folders are open by default.
	 * @param {boolean} open Pass false to close
	 * @returns {this}
	 * @example
	 * gui.open(); // open
	 * gui.open( false ); // close
	 * gui.open( gui._closed ); // toggle
	 */
	open( open = true ) {

		this._closed = !open;
		this.domElement.classList.toggle( 'closed', this._closed );
		return this;
	}

	/**
	 * todoc
	 * @returns {this}
	 */
	close() {
		return this.open( false );
	}

	openAnimated( open = true ) {

		this._closed = !open;

		requestAnimationFrame( () => {

			this.$children.style.height = this.$children.clientHeight + 'px';

			const onTransitionEnd = e => {
				if ( e.target !== this.$children ) return;
				this.$children.style.height = '';
				this.$children.classList.remove( 'transition' );
				this.$children.removeEventListener( 'transitionend', onTransitionEnd );
			};

			this.$children.addEventListener( 'transitionend', onTransitionEnd );
			this.$children.classList.add( 'transition' );

			// todo: this is wrong if children's scrollHeight makes for a gui taller than maxHeight
			const targetHeight = !open ? 0 : this.$children.scrollHeight;

			this.domElement.classList.toggle( 'closed', !open );

			requestAnimationFrame( () => {
				this.$children.style.height = targetHeight + 'px';
			} );

		} );

		return this;

	}

	/**
	 * todoc
	 * @param {string|false} title
	 * @returns {this}
	 */
	title( title ) {
		/**
		 * todoc
		 * @type {string|false}
		 */
		this._title = title;
		if ( title === false ) {
			this.$title.style.display = 'none';
		} else {
			this.$title.style.display = '';
			this.$title.innerHTML = title;
		}
		return this;
	}

	/**
	 * todoc
	 */
	destroy() {

		if ( this.parent ) {
			this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		}

		if ( this.domElement.parentElement ) {
			this.domElement.parentElement.removeChild( this.domElement );
		}

		Array.from( this.children ).forEach( c => c.destroy() );

		if ( this._onResize ) {
			window.removeEventListener( 'resize', this._onResize );
		}

	}

	_initTitleDrag() {

		let prevClientY, moved;

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			// Only resizeable when open with mobile class
			const classList = this.domElement.classList;
			const resizeable = classList.contains( 'mobile' ) && !classList.contains( 'closed' );
			if ( !resizeable ) return;

			// Prevent default in case this is a drag, otherwise we'll call click() manually on touchend
			e.preventDefault();
			prevClientY = e.touches[ 0 ].clientY;
			moved = false;

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			e.preventDefault();
			moved = true;

			const deltaY = e.touches[ 0 ].clientY - prevClientY;
			prevClientY = e.touches[ 0 ].clientY;

			this._setMaxHeight( this._maxHeight - deltaY );

		};

		const onTouchEnd = () => {

			if ( !moved ) {
				this.$title.click();
			}

			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );

		};

		this.$title.addEventListener( 'touchstart', onTouchStart );

	}

	_setMaxHeight( v ) {
		this._maxHeight = Math.min( v, window.innerHeight );
		this.domElement.style.setProperty( '--max-height', v + 'px' );
	}

}

export default GUI;
export { BooleanController, ColorController, Controller, FunctionController, GUI, NumberController, OptionController, StringController };
