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

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {Controller} self
	 * @chainable
	 */
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {Controller} self
	 * @chainable
	 */
	max( max ) {
		return this;
	}

	/**
	 * Sets the step. Only works on number controllers.
	 * @param {number} step
	 * @returns {Controller} self
	 * @chainable
	 */
	step( step ) {
		return this;
	}

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
				increment( this._step * ( e.shiftKey ? 100 : 10 ) );
			}
			if ( e.keyCode === 40 ) {
				e.preventDefault();
				increment( -1 * this._step * ( e.shiftKey ? 100 : 10 ) );
			}
		};

		const onMouseWheel = e => {
			if ( this._inputFocused ) {
				e.preventDefault();
				increment( ( e.deltaX + -e.deltaY ) * this._step );
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
		this.$input.addEventListener( 'wheel', onMouseWheel, { passive: false } );

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

			const root = this.parent.root.$children;
			const scrollbarPresent = root.scrollHeight > root.clientHeight;

			if ( !scrollbarPresent ) {

				// If we're not in a scrollable container, we can set the value
				// straight away on touchstart.
				setValueFromX( e.touches[ 0 ].clientX );
				this.$slider.classList.add( 'active' );
				testingForScroll = false;

			} else {

				// Otherwise, we should wait for a for the first touchmove to
				// see if the user is trying to move horizontally or vertically.
				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			}

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			if ( !testingForScroll ) {

				e.preventDefault();
				setValueFromX( e.touches[ 0 ].clientX );

			} else {

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

		const onMouseWheel = e => {
			e.preventDefault();
			const delta = ( e.deltaX + -e.deltaY ) * ( this._max - this._min ) / 1000;
			this._snapClampSetValue( this.getValue() + delta );
		};

		this.$slider.addEventListener( 'wheel', onMouseWheel, { passive: false } );

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

	_getImplicitStep() {

		if ( this._hasMin() && this._hasMax() ) {
			return ( this._max - this._min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this._hasSlider && this._hasMin() && this._hasMax() ) {

			// Consider gui.add( ... ).step( 0.1 ).min( 0 ).max( 1 )
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

	_hasMin() {
		return this._min !== undefined;
	}

	_hasMax() {
		return this._max !== undefined;
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
		const min = this._hasMin() ? this._min : -Infinity;
		const max = this._hasMax() ? this._max : Infinity;
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

function injectStyles( cssContent, fallbackURL ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const head = document.querySelector( 'head' );
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		head.insertBefore( injected, before );
	} else {
		head.appendChild( injected );
	}
}

var styles = "@font-face{font-family:\"lil-gui\";src:url(\"data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAARoAAsAAAAABtgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPQAAAFZr2333Y21hcAAAAYQAAABuAAABssJQk9tnbHlmAAAB9AAAAJgAAADID53niWhlYWQAAAKMAAAAJwAAADZfcj22aGhlYQAAArQAAAAYAAAAJAC5AGpobXR4AAACzAAAAA4AAAAUAZAAAGxvY2EAAALcAAAADAAAAAwAZgCWbWF4cAAAAugAAAAeAAAAIAERAB9uYW1lAAADCAAAASIAAAIK9SUU/XBvc3QAAAQsAAAAOQAAAEqHPh3zeJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQIYJzAwMrAwGDP4AYk+aC0AQMLgyQDAxMDKzMDVhCQ5prC4KA4VV2YIQXI5QSTDAyMIAIA82gFuAAAAHic7ZGxDYAwDAQvISCE6JiAIkrDEBmIil3YJVVWAztOwRC8dZH9ily8gREYhEMI4C4cqlNc1/yBpfmBLPPCjMfvdyyxpu154Nt3Oflnpb2XHbp74tfa3tynoOkZmnYshiRGrIZeJ20G4QWoQBFzAAB4nEWOzQrCMBCEZzdRyaXSmDQNgkKrLZ6EUpuL0JM3xYu+/6vYrYhzmv35hgFDdMcTjAUwUvCrNoouMeYxypXmnyveyIFUNf1IbdMP3Z4Kt6bljhU7x0pzSVTyVmnyjrWaRln9+BE3WOHP9IXT0M18fVBU0ERtLOnZHtkLb62Eev53eOEhLVObQgqnYLLKxMJktfkAKz0NFXicY2BkYGAA4kf5XM7x/DZfGbgZUhiwgRCGUCDJwcAE4gAAodQEYgB4nGNgZGBgSGFggJMhDIwMqIAVABx5ASR4nGNgAIIUVAwADiQBkQAAAAAAAAASADIAVABkeJxjYGRgYGBlEGZgYgABEMkFhAwM/8F8BgAK2gExAAB4nF3QTUrDQBwF8Jd+YgNFEF2JzEoX0vRj2QO0+y4CLtN0kqZMM2EyLdQTeAJP4Ck8gHgsX8N/Y2ZI8ps3LwMJgFv8IMB1BBg29+vo0ENxlxqLe/S9uI8Qj+IB8xfxCK+IxCHu8MYTgt4NkzGMuEO/i7v0h7hHf4r7eMCXeMD8WzxCjF9xiOfgyRRmkp+Kjc5PJnGykkesXV3YUs2jmSRrXWqXeL1T24uqz/nC+0xlzh7VypZeG2NV5exBpz7ae18tp9NM8ii1R35BwWuCHCdqA93IIIFr7f1fxWw61JRFCYU5/9Gs1VmzUza9BJ7PHXtbXHivcWZnwdQj4zpjx+JIrZrzrm3DaZlUzd6BSco8wr55q8ISU86s1Y/Y4kl/ddRY3gAAeJxjYGKAAEYG7ICVkYmRmZGFkZWRjYEjpSi/ICW/PI8tOSe/ODWFJb8gNY81OSM1OZuBAQCfaQnQAAAA\") format(\"woff\")}.lil-gui{--font-size: 11px;--line-height: 1;--name-width: 40%;--slider-input-width: 27%;--row-height: 24px;--widget-height: 20px;--bg-color: #1a1a1a;--fg-color: #eee;--widget-fg-color: #eee;--widget-bg-color: #3c3c3c;--widget-fg-color-focus: #fff;--widget-bg-color-focus: #4d4d4d;--number-color: #00adff;--string-color: #1ed36f;--title-bg-color: #111;--header-rule-color: rgba(255, 255, 255, 0.1);--folder-rule-color: #444;--padding: 0.55em;--widget-padding: 0 0 0 0.25em;--widget-border-radius: 2px;--scrollbar-width: 0.375em;--mobile-max-height: 200px;--font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", \"Roboto\", \"Helvetica Neue\", Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";--icons-font-family: \"lil-gui\";font-family:var(--font-family);font-size:var(--font-size);line-height:var(--line-height);font-weight:normal;font-style:normal;text-align:left;background-color:var(--bg-color);color:var(--fg-color);user-select:none;-webkit-user-select:none}.lil-gui,.lil-gui *{box-sizing:border-box;margin:0}.lil-gui.root{width:var(--width, auto)}.lil-gui.root>.title{background:var(--title-bg-color)}.lil-gui.root>.children:not(:empty){padding:calc(0.5 * var(--padding)) 0}.lil-gui .title{height:var(--row-height);padding:0 var(--padding);line-height:var(--row-height);font-weight:600;cursor:pointer}.lil-gui .title:before{font-family:var(--icons-font-family);content:\"▾\";width:1em;vertical-align:middle}.lil-gui.closed .children{display:none}.lil-gui.closed .title:before{content:\"▸\"}.lil-gui:not(.root)>.children{margin-left:.75em;border-left:2px solid var(--folder-rule-color)}.lil-gui .header{height:var(--row-height);padding:0 var(--padding);font-weight:600;border-bottom:1px solid var(--header-rule-color);margin-bottom:calc(0.5 * var(--padding));display:flex;align-items:center}.lil-gui.autoPlace{position:fixed;top:0;right:15px;z-index:1001}.lil-gui.autoPlace>.children{max-height:calc(var(--window-height) - var(--row-height));overflow-y:auto;-webkit-overflow-scrolling:touch}.lil-gui.autoPlace>.children::-webkit-scrollbar{width:var(--scrollbar-width);background:var(--bg-color)}.lil-gui.autoPlace>.children::-webkit-scrollbar-corner{height:0;display:none}.lil-gui.autoPlace>.children::-webkit-scrollbar-thumb{border-radius:var(--scrollbar-width);background:var(--widget-bg-color)}@media(max-width: 600px){.lil-gui{--row-height: 38px;--widget-height: 32px;--font-size: 16px}.lil-gui.autoPlace{right:auto;top:auto;bottom:0;left:0;width:100%}.lil-gui.autoPlace>.children{max-height:var(--mobile-max-height)}}.lil-gui input{border:0;outline:none;font-family:var(--font-family);font-size:var(--font-size);border-radius:var(--widget-border-radius);height:var(--widget-height);background:var(--widget-bg-color);color:var(--widget-fg-color);width:100%}.lil-gui input[type=text]{padding:var(--widget-padding)}.lil-gui input[type=checkbox]{appearance:none;-webkit-appearance:none;--size: calc(0.75 * var(--widget-height));height:var(--size);width:var(--size);border-radius:var(--widget-border-radius);text-align:center}.lil-gui input[type=checkbox]:checked:before{font-family:var(--icons-font-family);content:\"✓\";font-size:var(--size);line-height:var(--size)}.lil-gui button{outline:none;cursor:pointer;border:0;font-size:var(--font-size);color:var(--widget-fg-color);background:var(--bg-color);font-weight:600;text-align:left;text-transform:none;width:100%}.lil-gui button:hover{background:#000}.lil-gui button .name{width:100%}.lil-gui .display{background:var(--widget-bg-color)}.lil-gui .display.focus,.lil-gui .display.active{background:var(--widget-bg-color-focus);color:var(--widget-fg-color-focus)}.lil-gui input:focus,.lil-gui input:active,.lil-gui button:focus,.lil-gui button:active{background:var(--widget-bg-color-focus);color:var(--widget-fg-color-focus)}.lil-gui .controller{display:flex;align-items:center;padding:0 var(--padding);height:var(--row-height)}.lil-gui .controller.disabled{opacity:.5;pointer-events:none}.lil-gui .controller .name{display:flex;align-items:center;width:var(--name-width);height:100%;flex-shrink:0;overflow:hidden}.lil-gui .controller .widget{display:flex;align-items:center;width:100%;height:100%}.lil-gui .controller.number input:not(:focus){color:var(--number-color)}.lil-gui .controller.number.hasSlider input{width:var(--slider-input-width);min-width:0}.lil-gui .controller.number .slider{width:calc( 100% - var(--slider-input-width ) );height:var(--widget-height);margin-right:calc(var(--padding) - 2px);background-color:var(--widget-bg-color);border-radius:var(--widget-border-radius);overflow:hidden}.lil-gui .controller.number .fill{height:100%;background-color:var(--number-color)}.lil-gui .controller.string input:not(:focus){color:var(--string-color)}.lil-gui .controller.color .widget{position:relative}.lil-gui .controller.color input{opacity:0;position:absolute;height:var(--widget-height);width:100%}.lil-gui .controller.color .display{pointer-events:none;height:var(--widget-height);width:100%;border-radius:var(--widget-border-radius)}.lil-gui .controller.option .widget{position:relative}.lil-gui .controller.option select{opacity:0;position:absolute;max-width:100%}.lil-gui .controller.option .display{pointer-events:none;border-radius:var(--widget-border-radius);height:var(--widget-height);line-height:var(--widget-height);padding-left:var(--padding);position:relative;max-width:100%;overflow:hidden;word-break:break-all;padding-right:1.75em}.lil-gui .controller.option .display:after{font-family:var(--icons-font-family);content:\"↕\";position:absolute;display:flex;align-items:center;top:0;right:0;bottom:0;padding-right:.375em}.lil-gui.solarized,.lil-gui.solarized .lil-gui{--bg-color: #fdf6e3;--fg-color: #657b83;--widget-fg-color: #657b83;--widget-bg-color: #eee8d5;--widget-fg-color-focus: #eee8d5;--widget-bg-color-focus: #657b83;--number-color: #268bd2;--string-color: #859900;--title-bg-color: #eee8d5;--header-rule-color: #eee8d5;--folder-rule-color: #eee8d5}\n";

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
		title = 'Controls',
		autoPlace = true,
		width = 250
	} = {} ) {

		/**
		 * The GUI this folder is nested in, or `undefined` for the root GUI.
		 * @type {GUI}
		 */
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
		 * The outermost container `div`.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The clickable title that collapses a GUI.
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'button' );
		this.$title.classList.add( 'title' );
		this.$title.addEventListener( 'click', () => {
			this.open( this._closed );
		} );

		/**
		 * The `div` that contains child elements.
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		/**
		 * @type {boolean}
		 */
		this._closed = false;

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		if ( this.parent ) {

			this.parent.children.push( this );
			this.parent.$children.appendChild( this.domElement );

		} else {

			this.domElement.classList.add( 'root' );

			if ( autoPlace ) {

				this.domElement.classList.add( 'autoPlace' );
				document.body.appendChild( this.domElement );

				this._onResize = () => {
					this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
				};

				window.addEventListener( 'resize', this._onResize );
				this._onResize();

			}

		}

		this.title( title );
		this.width( width );

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
	addFolder( title ) {
		return new GUI( { title, parent: this } );
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

	width( v ) {
		this._width = v;
		if ( v === undefined ) {
			this.domElement.style.setProperty( '--width', 'auto' );
		} else {
			this.domElement.style.setProperty( '--width', v + 'px' );
		}
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

}

export default GUI;
export { BooleanController, ColorController, Controller, FunctionController, GUI, Header, NumberController, OptionController, StringController };
