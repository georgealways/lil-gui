// lil-gui@0.2.2
/**
 * @module Controller
 */

/**
 * todoc
 */
class Controller {

	constructor( parent, object, property, className, tagName = 'div' ) {

		/**
		 * todoc
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * todoc
		 */
		this.object = object;

		/**
		 * todoc
		 * @type {string}
		 */
		this.property = property;

		/**
		 * Used to determine if the controller is disabled.
		 * @type {boolean}
		 * @readonly
		 */
		this._disabled = false;

		/**
		 * todoc
		 */
		this.initialValue = this.getValue();

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

		this._listenCallback = this._listenCallback.bind( this );

		this.name( property );

	}

	/**
	 * todoc
	 * @param {string} name
	 * @returns {Controller} self
	 */
	name( name ) {
		/**
		 * @type {string}
		 * @readonly
		 */
		this._name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * todoc
	 * @param {Function} callback todoc
	 * @returns {Controller} self
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 *
	 * @example
	 * controller = gui.add( object, 'property' ).onChange(function() {
	 * 	console.assert(this === controller);
	 * } );
	 */
	onChange( callback ) {
		/**
		 * @type {Function}
		 * @readonly
		 */
		this._onChange = callback;
		return this;
	}

	onFinishChange( callback ) {
		// eslint-disable-next-line no-console
		console.warn( 'onFinishChange() is synonymous with onChange()' );
		return this.onChange( callback );
	}

	/**
	 * Destroys this controller and adds a new option controller
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
	 * todoc
	 * @param {*} value
	 * @returns {Controller} self
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
	 * todoc
	 * @returns {Controller} self
	 */
	reset() {
		this.setValue( this.initialValue );
		return this;
	}

	/**
	 * Enables this controller.
	 * @param {boolean} [enabled=true]
	 * @returns {Controller} self
	 */
	enable( enabled = true ) {
		this._disabled = !enabled;
		this.domElement.classList.toggle( 'disabled', this._disabled );
		return this;
	}

	/**
	 * Disables this controller.
	 * @returns {Controller} self
	 */
	disable() {
		this._disabled = true;
		this.domElement.classList.add( 'disabled' );
		return this;
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 * @example
	 * const controller = gui.add( object, 'property' );
	 * controller.destroy();
	 *
	 * @example
	 * // Won't destroy all the controllers because c.destroy() modifies gui.children
	 * gui.forEachController( c => c.destroy() );
	 *
	 * // Make a copy of the array first if you actually want to do that
	 * Array.from( gui.children ).forEach( c => c.destroy() );
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

	/**
	 * todoc
	 * @returns {*} value
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {Controller} self
	 */
	// eslint-disable-next-line no-unused-vars
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {Controller} self
	 */
	// eslint-disable-next-line no-unused-vars
	max( max ) {
		return this;
	}

	/**
	 * Sets the step. Only works on number controllers.
	 * @param {number} step
	 * @returns {Controller} self
	 */
	// eslint-disable-next-line no-unused-vars
	step( step ) {
		return this;
	}

	/**
	 * Updates the display to keep it in sync with `getValue()`. Useful for updating
	 * your controllers when their values have been modified outside of the GUI.
	 * @returns {Controller} self
	 */
	updateDisplay() {
		return this;
	}

	/**
	 * todoc
	 * @param {boolean} [listen=true]
	 * @returns {Controller} self
	 */
	listen( listen = true ) {

		/**
		 * @type {boolean}
		 * @readonly
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
				this._callOnChange();
				this.updateDisplay();

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

		this.domElement.addEventListener( 'click', () => {
			this.getValue()();
		} );

	}

}

class NumberController extends Controller {

	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._createInput();

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

	}

	_createInput() {

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

			this._createSlider();
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
	}

}

var styles = "@font-face{font-family:\"lil-gui\";src:url(\"data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAR4AAsAAAAABvgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPQAAAFZr2336Y21hcAAAAYQAAAB5AAAByLssMi9nbHlmAAACAAAAAIcAAAC0x1h5PGhlYWQAAAKIAAAAJwAAADZfcj23aGhlYQAAArAAAAAYAAAAJAC5AGtobXR4AAACyAAAAA4AAAAYAfQAAGxvY2EAAALYAAAADgAAAA4ApgB0bWF4cAAAAugAAAAeAAAAIAESABhuYW1lAAADCAAAASIAAAIK9SUU/XBvc3QAAAQsAAAASwAAAGO9vtJleJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQIZpzAwMrAwGDP4AYk+aC0AQMLgyQDAxMDKzMDVhCQ5prC4KA4VV2YIQXI5QSTDAyMIAIA9GEFuwAAAHic7ZFBCoMwEEXfmKQUcecJXAxuPIl4nq68Rq8irryancnYgnfoDy/wP2ECf4ACJGMyMsiK4HpZKjVPtDXPzOY7njTk4a2b7nqM/XnC3f0k9vp73DU2K/uP8uCvrt7L5Yq3GHjvugXWGboHvic9At/V2AeUD/TJFTYAAAB4nE3MzQrCMBAE4NmkJgShINSGDXjwhwbpTcSlYOlJemkPovj+jyIJos5hLt8wUEiZ8ILCAhjIr23klCtzxZyU8uaOB5aAxMZsqKoHupznVhujWy2BdHEqNAVlvvset/QoNkqUfmtDsIfcHx/RZY/ixTdZVv/+xPzzo3flznHtyr17A6a9DcsAeJxjYGRgYABioe+OHvH8Nl8ZuBlSGLCBEIYwIMnBwATiAACesgRXAHicY2BkYGBIYWCAkyEMjAyogA0AHHoBJXicY2AAghRMDAAVlAH1AAAAAAAAABIAKgA6AEoAWgAAeJxjYGRgYGBj4GFgYgABEMkFhAwM/8F8BgAKRgErAAB4nF3QTUrDQBwF8Jd+YgNFEF2JzEoX0vRj2QO0+y4CLtN0kqZMM2EyLdQTeAJP4Ck8gHgsX8N/Y2ZI8ps3LwMJgFv8IMB1BBg29+vo0ENxlxqLe/S9uI8Qj+IB8xfxCK+IxCHu8MYTgt4NkzGMuEO/i7v0h7hHf4r7eMCXeMD8WzxCjF9xiOfgyRRmkp+Kjc5PJnGykkesXV3YUs2jmSRrXWqXeL1T24uqz/nC+0xlzh7VypZeG2NV5exBpz7ae18tp9NM8ii1R35BwWuCHCdqA93IIIFr7f1fxWw61JRFCYU5/9Gs1VmzUza9BJ7PHXtbXHivcWZnwdQj4zpjx+JIrZrzrm3DaZlUzd6BSco8wr55q8ISU86s1Y/Y4kl/ddRY3gAAeJxtx0EOQDAQBdD5aDURR3GqmWmIZqYp4voWLL3do45eoH8RHXoMCIgYKUnzKn5bypfxubnN2YtoW7j4oTJ986oWeFXeiR4HZhKnAA==\") format(\"woff\")}.lil-gui{font-family:var(--font-family);font-size:var(--font-size);line-height:1;font-weight:normal;font-style:normal;text-align:left;background-color:var(--background-color);color:var(--text-color);user-select:none;-webkit-user-select:none;--width: 250px;--scrollbar-width: 5px;--mobile-max-height: 200px;--background-color:#1f1f1f;--text-color:#eee;--title-background-color:#111;--widget-color:#424242;--highlight-color:#525151;--number-color:#00adff;--string-color:#1ed36f;--font-size:11px;--font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"Roboto\",\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\",\"Segoe UI Symbol\";--name-width:42%;--slider-input-width:27%;--row-height:24px;--widget-height:20px;--padding:6px;--folder-indent:8px;--widget-padding:0 0 0 3px;--widget-border-radius:2px}.lil-gui,.lil-gui *{box-sizing:border-box;margin:0}.lil-gui.root{width:var(--width)}.lil-gui.root>.title{background:var(--title-background-color)}.lil-gui .lil-gui{--background-color:inherit;--text-color:inherit;--title-background-color:inherit;--widget-color:inherit;--highlight-color:inherit;--number-color:inherit;--string-color:inherit;--font-size:inherit;--font-family:inherit;--name-width:inherit;--slider-input-width:inherit;--row-height:inherit;--widget-height:inherit;--padding:inherit;--folder-indent:inherit;--widget-padding:inherit;--widget-border-radius:inherit}.lil-gui .title{height:var(--row-height);padding:1px var(--padding) 2px;font-weight:bold}.lil-gui .title:before{font-family:\"lil-gui\"}.lil-gui.collapses>.title:before{content:\"▾\"}.lil-gui.collapses.closed .children{display:none}.lil-gui.collapses.closed .title:before{content:\"▸\"}.lil-gui .lil-gui.collapses>.children{margin-left:var(--folder-indent);border-left:2px solid var(--widget-color)}.lil-gui .lil-gui:not(.collapses)>.title{line-height:var(--row-height);position:relative}.lil-gui .lil-gui:not(.collapses)>.title:after{content:\" \";display:block;position:absolute;left:0;right:0;bottom:.2em;height:1px;background:var(--widget-color)}.lil-gui.collapses>.children:empty:before{content:\"Empty\";padding:0 var(--padding);display:block;height:var(--row-height);font-style:italic;line-height:var(--row-height);opacity:.5}.lil-gui.autoPlace{position:fixed;top:0;right:15px;z-index:1001}.lil-gui.autoPlace>.children{max-height:calc(var(--window-height) - var(--row-height));overflow-y:auto;-webkit-overflow-scrolling:touch}.lil-gui.autoPlace>.children::-webkit-scrollbar{width:var(--scrollbar-width);background:var(--background-color)}.lil-gui.autoPlace>.children::-webkit-scrollbar-corner{height:0;display:none}.lil-gui.autoPlace>.children::-webkit-scrollbar-thumb{border-radius:var(--scrollbar-width);background:var(--highlight-color)}@media(max-width: 600px){.lil-gui.autoPlace{--row-height: 38px;--widget-height: 32px;--font-size: 16px;--padding: 8px;--folder-indent: 12px;--widget-padding: 0 0 0 5px;--scrollbar-width: 7px;right:auto;top:auto;bottom:0;left:0;width:100%}.lil-gui.autoPlace>.children{max-height:calc(var(--mobile-max-height) - var(--row-height))}}.lil-gui input{border:0;outline:none;font-family:var(--font-family);font-size:var(--font-size);border-radius:var(--widget-border-radius);height:var(--widget-height);background:var(--widget-color);color:var(--text-color);width:100%}.lil-gui input[type=text]{padding:var(--widget-padding)}.lil-gui input:focus,.lil-gui input:active{background:var(--highlight-color)}.lil-gui input[type=checkbox]{appearance:none;-webkit-appearance:none;--size: calc(0.75 * var(--widget-height));height:var(--size);width:var(--size);border-radius:var(--widget-border-radius);text-align:center}.lil-gui input[type=checkbox]:checked:before{font-family:\"lil-gui\";content:\"✓\";font-size:var(--size);line-height:var(--size)}.lil-gui button{-webkit-tap-highlight-color:transparent;outline:none;cursor:pointer;border:0;font-family:var(--font-family);font-size:var(--font-size);color:var(--text-color);background:var(--background-color);text-align:left;text-transform:none;width:100%}@media(hover: hover){.lil-gui button:hover{background:var(--widget-color)}}.lil-gui button:active{background:var(--highlight-color)}.lil-gui .display{background:var(--widget-color)}.lil-gui .display.focus,.lil-gui .display.active{background:var(--highlight-color)}.lil-gui .controller{display:flex;align-items:center;padding:0 var(--padding);height:var(--row-height)}.lil-gui .controller.disabled{opacity:.5;pointer-events:none}.lil-gui .controller .name{display:flex;align-items:center;min-width:var(--name-width);flex-shrink:0;padding-right:var(--padding);height:100%;overflow:hidden}.lil-gui .controller .widget{position:relative;display:flex;align-items:center;width:100%;height:100%}.lil-gui .controller.number input{color:var(--number-color)}.lil-gui .controller.number.hasSlider input{width:var(--slider-input-width);min-width:38px;flex-shrink:0}.lil-gui .controller.number .slider{width:100%;height:var(--widget-height);margin-right:calc(var(--row-height) - var(--widget-height));background-color:var(--widget-color);border-radius:var(--widget-border-radius);overflow:hidden}.lil-gui .controller.number .slider.active{background-color:var(--highlight-color)}.lil-gui .controller.number .slider.active .fill{opacity:.95}.lil-gui .controller.number .fill{height:100%;background-color:var(--number-color)}.lil-gui .controller.string input{color:var(--string-color)}.lil-gui .controller.color input{opacity:0;position:absolute;height:var(--widget-height);width:100%}.lil-gui .controller.color .display{pointer-events:none;height:var(--widget-height);width:100%;border-radius:var(--widget-border-radius)}.lil-gui .controller.option select{opacity:0;position:absolute;max-width:100%}.lil-gui .controller.option .display{pointer-events:none;border-radius:var(--widget-border-radius);height:var(--widget-height);line-height:var(--widget-height);position:relative;max-width:100%;overflow:hidden;word-break:break-all;padding-left:.55em;padding-right:1.75em}.lil-gui .controller.option .display:after{font-family:\"lil-gui\";content:\"↕\";position:absolute;top:0;right:0;bottom:0;padding-right:.375em}.lil-gui .controller.function .widget:before{font-family:\"lil-gui\";content:\"▶\"}\n";

/**
 * @module GUI
 */

let stylesInjected = false;

function inject( cssContent ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	// inject as the first (lowest priority) style sheet so you can override
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}

class GUI {

	/**
	 * @typedef GUIOptions
	 *
	 * @property {GUI} [parent]
	 *
	 * @property {boolean} [autoPlace=true]
	 * Adds the GUI to `document.body` and applies fixed positioning.
	 *
	 * @property {boolean} [injectStyles=true]
	 * Injects the default stylesheet as the first child of `document.head`. Pass false when using your own stylesheet.
	 *
	 * @property {string} [title='Controls']
	 * Name to display in the title bar.
	 *
	 * @property {number} [width] todoc
	 * @property {number} [mobileMaxHeight=200] todoc
	 * @property {boolean} [collapses=true] todoc
	 */

	/**
	 * todoc
	 * @param {GUIOptions} [options]
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		injectStyles = autoPlace,
		title = 'Controls',
		width,
		mobileMaxHeight = 200,
		collapses = true
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
		 * todoc
		 * @type {boolean}
		 * @readonly
		 */
		this._closed = false;

		/**
		 * The outermost container `div`.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * todoc
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
		 * todoc
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

		}

		if ( !stylesInjected && injectStyles ) {
			inject( styles );
			stylesInjected = true;
		}

		if ( autoPlace ) {

			this.domElement.classList.add( 'autoPlace' );

			this._onResize = () => {
				this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
			};

			window.addEventListener( 'resize', this._onResize );
			this._onResize();

			// resizeable mobile
			{
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
			}

			document.body.appendChild( this.domElement );

		}

		this.title = title;

	}

	/**
	 * todoc
	 * @param {object} object todoc
	 * @param {string} property todoc
	 * @param {number|object|Array} [$1] todoc
	 * @param {number} [max] todoc
	 * @param {number} [step] todoc
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
	 * todoc
	 * @param {object} object todoc
	 * @param {string} property todoc
	 * @returns {Controller}
	 */
	addColor( object, property ) {
		return new ColorController( this, object, property );
	}

	/**
	 * todoc
	 * @param {string} title todoc
	 * @param {boolean} [collapses=true] todoc
	 * @returns {GUI}
	 */
	addFolder( title, collapses = true ) {
		return new GUI( { parent: this, title, collapses } );
	}

	/**
	 * Opens a GUI or folder. GUI and folders are open by default.
	 * @param {boolean} [open=true] Pass false to close
	 * @returns {GUI} self
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
	 * @returns {GUI} self
	 */
	close() {
		this._closed = true;
		this.domElement.classList.add( 'closed' );
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

	/**
	 * todoc
	 * @param {Function} callback todoc
	 * @param {boolean} [recursive=false] todoc
	 */
	forEachController( callback, recursive = false ) {
		this.children.forEach( c => {
			if ( c instanceof Controller ) {
				callback( c );
			} else if ( recursive && c instanceof GUI ) {
				c.forEachController( callback, true );
			}
		} );
	}

	get title() {
		return this._title;
	}

	set title( title ) {
		this._title = title;
		this.$title.innerHTML = title;
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
export { BooleanController, ColorController, Controller, FunctionController, GUI, NumberController, OptionController, StringController };
