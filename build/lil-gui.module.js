class GUIItem {

	constructor( parent, tagName = 'div' ) {

		/**
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( tagName );

		if ( this.parent ) {
			this.parent.children.push( this );
			this.parent.$children.appendChild( this.domElement );
		}

		/**
		 * @type {boolean}
		 */
		this.__disabled = false;

	}

	/**
	 * Enables or sets the enabled state of this item.
	 * @param {boolean} [enable]
	 * @chainable
	 * @example
	 * controller.enable();
	 * controller.enable( false ); // disable
	 * controller.enable( controller.__disabled ); // toggle
	 */
	enable( enable = true ) {
		this.__disabled = !enable;
		this.domElement.classList.toggle( 'disabled', this.__disabled );
		return this;
	}

	/**
	 * Disables this item.
	 * @chainable
	 */
	disable() {
		this.__disabled = true;
		this.domElement.classList.add( 'disabled' );
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
	}

}

/**
 * @module Controller
 */

/**
 * Classdesc? Where are you getting this intel. who told you.  
 */
class Controller extends GUIItem {

	constructor( parent, object, property, className, tagName = 'div' ) {

		super( parent, tagName );

		/**
		 * @type {Object}
		 */
		this.object = object;

		/**
		 * @type {string}
		 */
		this.property = property;

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

		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

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
		this.__name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * 
	 * @param {function} callback 
	 * @returns {Controller} self
	 * @chainable 
	 * 
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 */
	onChange( callback ) {
		/**
		 * @type {function}
		 */
		this.__onChange = callback;
		return this;
	}

	onFinishChange( fnc ) {
		this.__onFinishChange = fnc;
		return this;
	}

	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this.__name );
		this.destroy();
		return controller;
	}

	setValue( value, finished = true ) {
		this.object[ this.property ] = value;
		this._onSetValue( finished );
	}

	_onSetValue( finished = true ) {
		this._callOnChange();
		if ( finished ) this._callOnFinishedChange();
		this.updateDisplay();
	}

	_callOnChange() {
		if ( this.__onChange !== undefined ) {
			this.__onChange.call( this, this.getValue() );
		}
	}

	_callOnFinishedChange() {
		if ( this.__onFinishChange !== undefined ) {
			this.__onFinishChange.call( this, this.getValue() );
		}
	}

	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * TODO
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

class ColorController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$widget.appendChild( this.$input );
		this.$widget.appendChild( this.$display );

		this.__format = getColorFormat( this.getValue() );

		this.$input.addEventListener( 'change', () => {

			if ( this.__format.isPrimitive ) {

				const newValue = this.__format.fromHexString( this.$input.value );
				this.setValue( newValue );

			} else {

				this.__format.fromHexString( this.$input.value, this.getValue() );
				this._onSetValue();

			}

		} );

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this.__format.toHexString( this.getValue() );
		this.$display.style.backgroundColor = this.$input.value;
	}

}

class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function', 'button' );

		// this.$button = document.createElement( 'button' );
		// this.$button.innerHTML = this.__name;

		this.domElement.addEventListener( 'click', () => {
			this.getValue()();
		} );

		// this.$widget.appendChild( this.$button );

	}

}

function map( v, a, b, c, d ) {
	return ( v - a ) / ( b - a ) * ( d - c ) + c;
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

		if ( this.__hasSlider ) {
			const percent = ( value - this.__min ) / ( this.__max - this.__min );
			this.$fill.style.setProperty( 'width', percent * 100 + '%' );
		}

		if ( !this.__inputFocused ) {
			this.$input.value = value;
		}

	}

	_createInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'inputmode', 'numeric' );

		this.$input.addEventListener( 'focus', () => {
			this.__inputFocused = true;
		} );

		this.$input.addEventListener( 'input', () => {

			// Test if the string is a valid number
			let value = parseFloat( this.$input.value );
			if ( isNaN( value ) ) return;

			// Input boxes clamp to max and min if they're defined, but they
			// don't snap to step, so you can be as precise as you want.
			value = this._clamp( value );

			// Set the value, but don't call onFinishedChange
			this.setValue( value, false );

		} );

		this.$input.addEventListener( 'blur', () => {
			this.__inputFocused = false;
			this._callOnFinishedChange();
			this.updateDisplay();
		} );


		this.$input.addEventListener( 'keydown', e => {
			if ( e.keyCode === 13 ) {
				this.$input.blur();
			}
			if ( e.keyCode === 38 ) {
				e.preventDefault();
				increment( this.__step * ( e.shiftKey ? 10 : 1 ) );
			}
			if ( e.keyCode === 40 ) {
				e.preventDefault();
				increment( -1 * this.__step * ( e.shiftKey ? 10 : 1 ) );
			}
		} );

		const increment = delta => {
			let value = parseFloat( this.$input.value );
			if ( isNaN( value ) ) return;
			value += delta;
			value = this._clamp( value );
			value = this._snap( value );
			this.setValue( value, false );
			// Manually update the input display because it's focused.
			this.$input.value = this.getValue();
		};

		const onMouseWheel = e => {
			e.preventDefault();
			increment( ( e.deltaX + -e.deltaY ) * this.__step );
		};

		this.$input.addEventListener( 'wheel', onMouseWheel, { passive: false } );
		this.$widget.appendChild( this.$input );

	}

	_createSlider() {

		this.__hasSlider = true;

		this.$slider = document.createElement( 'div' );
		this.$slider.classList.add( 'slider' );

		this.$fill = document.createElement( 'div' );
		this.$fill.classList.add( 'fill' );

		this.$slider.appendChild( this.$fill );
		this.$widget.insertBefore( this.$slider, this.$input );

		this.domElement.classList.add( 'hasSlider' );

		const setValue = clientX => {

			// Always poll rect because it's simpler than storing it
			const rect = this.$slider.getBoundingClientRect();

			// Map x position along slider to min and max values
			let value = map( clientX, rect.left, rect.right, this.__min, this.__max );

			// Clamp it, because it can exceed the bounding rect
			value = this._clamp( value );

			// Sliders always round to step.
			value = this._snap( value );

			// Set the value, but don't call onFinishedChange
			this.setValue( value, false );

		};

		// Bind mouse listeners

		this.$slider.addEventListener( 'mousedown', e => {
			setValue( e.clientX);
			this.$slider.classList.add( 'active' );
			window.addEventListener( 'mousemove', mouseMove );
			window.addEventListener( 'mouseup', mouseUp );
		} );

		const mouseMove = e => {
			setValue( e.clientX);
		};

		const mouseUp = () => {
			this._callOnFinishedChange();
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'mousemove', mouseMove );
			window.removeEventListener( 'mouseup', mouseUp );
		};

		// Bind touch listeners

		let testingForScroll = false, prevClientX, prevClientY;

		this.$slider.addEventListener( 'touchstart', e => {

			if ( e.touches.length > 1 ) return;

			const root = this.parent.root.$children;
			const scrollbarPresent = root.scrollHeight > root.clientHeight;

			if ( !scrollbarPresent ) {

				// If we're not in a scrollable container, we can set the value
				// straight away on touchstart.
				setValue( e.touches[ 0 ].clientX);
				this.$slider.classList.add( 'active' );
				testingForScroll = false;

			} else {

				// Otherwise, we should wait for a for the first touchmove to
				// see if the user is trying to move horizontally or vertically.
				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			}

			window.addEventListener( 'touchmove', touchMove, { passive: false } );
			window.addEventListener( 'touchend', touchEnd );

		} );

		const touchMove = e => {

			if ( !testingForScroll ) {

				e.preventDefault();
				setValue( e.touches[ 0 ].clientX );

			} else {

				const dx = e.touches[ 0 ].clientX - prevClientX;
				const dy = e.touches[ 0 ].clientY - prevClientY;

				if ( Math.abs( dx ) > Math.abs( dy ) ) {

					// We moved horizontally, set the value and stop checking.
					setValue( e.touches[ 0 ].clientX);
					this.$slider.classList.add( 'active' );
					testingForScroll = false;

				} else {

					// This was, in fact, an attempt to scroll. Abort.
					window.removeEventListener( 'touchmove', touchMove );
					window.removeEventListener( 'touchend', touchEnd );

				}

			}

		};

		const touchEnd = () => {
			this._callOnFinishedChange();
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'touchmove', touchMove );
			window.removeEventListener( 'touchend', touchEnd );
		};

		const increment = delta => {
			let value = this.getValue();
			value += delta;
			value = this._clamp( value );
			value = this._snap( value );
			this.setValue( value, false );
		};

		const onMouseWheel = e => {
			e.preventDefault();
			increment( ( e.deltaX + -e.deltaY ) * ( this.__max - this.__min ) / 1000 );
		};

		this.$slider.addEventListener( 'wheel', onMouseWheel, { passive: false } );

	}

	min( min ) {
		this.__min = min;
		this._onUpdateMinMax();
		return this;
	}

	max( max ) {
		this.__max = max;
		this._onUpdateMinMax();
		return this;
	}

	step( step, explicit = true ) {
		this.__step = step;
		this.__stepExplicit = explicit;
		return this;
	}

	_getImplicitStep() {

		if ( this.__min !== undefined && this.__max !== undefined ) {
			return ( this.__max - this.__min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this.__hasSlider &&
			this.__min !== undefined &&
			this.__max !== undefined ) {

			// If this is the first time we're hearing about min and max
			// and we haven't explicitly stated what our step is, let's
			// update that too.
			if ( !this.__stepExplicit ) {
				this.step( this._getImplicitStep(), false );
			}

			this._createSlider();
			this.updateDisplay();

		}

	}

	_snap( value ) {
		// Using the inverse step avoids float precision issues.
		const inverseStep = 1 / this.__step;
		return Math.round( value * inverseStep ) / inverseStep;
	}

	_clamp( value ) {
		const min = this.__min === undefined ? -Infinity : this.__min;
		const max = this.__max === undefined ? Infinity : this.__max;
		return Math.max( min, Math.min( max, value ) );
	}

}

class OptionController extends Controller {

	constructor( parent, object, property, options ) {

		super( parent, object, property, 'option' );

		this.$select = document.createElement( 'select' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.__values = Array.isArray( options ) ? options : Object.values( options );
		this.__names = Array.isArray( options ) ? options : Object.keys( options );

		this.__names.forEach( name => {
			const $option = document.createElement( 'option' );
			$option.innerHTML = name;
			this.$select.appendChild( $option );
		} );

		this.$select.addEventListener( 'change', () => {
			this.setValue( this.__values[ this.$select.selectedIndex ] );
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
		const index = this.__values.indexOf( value );
		this.$select.selectedIndex = index;
		this.$display.innerHTML = index === -1 ? value : this.__names[ index ];
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

class Header extends GUIItem {

	constructor( parent, name ) {

		super( parent );

		this.domElement.classList.add( 'header' );

		this.name( name );

	}

	name( name ) {
		this.__name = name;
		this.domElement.innerHTML = name;
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

var styles = "@font-face{font-family:\"lil-gui\";src:url(\"data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAARoAAsAAAAABtgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPQAAAFZr2333Y21hcAAAAYQAAABuAAABssJQk9tnbHlmAAAB9AAAAJgAAADID53niWhlYWQAAAKMAAAAJwAAADZfcj22aGhlYQAAArQAAAAYAAAAJAC5AGpobXR4AAACzAAAAA4AAAAUAZAAAGxvY2EAAALcAAAADAAAAAwAZgCWbWF4cAAAAugAAAAeAAAAIAERAB9uYW1lAAADCAAAASIAAAIK9SUU/XBvc3QAAAQsAAAAOQAAAEqHPh3zeJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQIYJzAwMrAwGDP4AYk+aC0AQMLgyQDAxMDKzMDVhCQ5prC4KA4VV2YIQXI5QSTDAyMIAIA82gFuAAAAHic7ZGxDYAwDAQvISCE6JiAIkrDEBmIil3YJVVWAztOwRC8dZH9ily8gREYhEMI4C4cqlNc1/yBpfmBLPPCjMfvdyyxpu154Nt3Oflnpb2XHbp74tfa3tynoOkZmnYshiRGrIZeJ20G4QWoQBFzAAB4nEWOzQrCMBCEZzdRyaXSmDQNgkKrLZ6EUpuL0JM3xYu+/6vYrYhzmv35hgFDdMcTjAUwUvCrNoouMeYxypXmnyveyIFUNf1IbdMP3Z4Kt6bljhU7x0pzSVTyVmnyjrWaRln9+BE3WOHP9IXT0M18fVBU0ERtLOnZHtkLb62Eev53eOEhLVObQgqnYLLKxMJktfkAKz0NFXicY2BkYGAA4kf5XM7x/DZfGbgZUhiwgRCGUCDJwcAE4gAAodQEYgB4nGNgZGBgSGFggJMhDIwMqIAVABx5ASR4nGNgAIIUVAwADiQBkQAAAAAAAAASADIAVABkeJxjYGRgYGBlEGZgYgABEMkFhAwM/8F8BgAK2gExAAB4nF3QTUrDQBwF8Jd+YgNFEF2JzEoX0vRj2QO0+y4CLtN0kqZMM2EyLdQTeAJP4Ck8gHgsX8N/Y2ZI8ps3LwMJgFv8IMB1BBg29+vo0ENxlxqLe/S9uI8Qj+IB8xfxCK+IxCHu8MYTgt4NkzGMuEO/i7v0h7hHf4r7eMCXeMD8WzxCjF9xiOfgyRRmkp+Kjc5PJnGykkesXV3YUs2jmSRrXWqXeL1T24uqz/nC+0xlzh7VypZeG2NV5exBpz7ae18tp9NM8ii1R35BwWuCHCdqA93IIIFr7f1fxWw61JRFCYU5/9Gs1VmzUza9BJ7PHXtbXHivcWZnwdQj4zpjx+JIrZrzrm3DaZlUzd6BSco8wr55q8ISU86s1Y/Y4kl/ddRY3gAAeJxjYGKAAEYG7ICVkYmRmZGFkZWRjYEjpSi/ICW/PI8tOSe/ODWFJb8gNY81OSM1OZuBAQCfaQnQAAAA\") format(\"woff\")}.lil-gui{--bg-color: #1a1a1a;--fg-color: #eee;--widget-fg-color: #eee;--widget-bg-color: #3c3c3c;--widget-fg-color-focus: #fff;--widget-bg-color-focus: #4d4d4d;--number-color: #00adff;--string-color: #1ed36f;--title-bg-color: #111;--header-rule-color: rgba(255, 255, 255, 0.1);--folder-rule-color: #444;--font-family: system-ui, sans-serif;--font-size: 11px;--line-height: 1;--name-width: 40%;--row-height: 24px;--widget-height: 20px;--padding: 0.55em;--widget-padding: 0 0 0 0.25em;--widget-border-radius: 2px;--scrollbar-width: 0.375em;--icons-font-family: \"lil-gui\";width:var(--width, auto);text-align:left;font-size:var(--font-size);line-height:var(--line-height);font-family:var(--font-family);font-weight:normal;font-style:normal;background-color:var(--bg-color);color:var(--fg-color);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;user-select:none;-webkit-user-select:none}.lil-gui,.lil-gui *{box-sizing:border-box;margin:0}.lil-gui.autoPlace{position:fixed;top:0;right:15px;z-index:1001}.lil-gui.autoPlace>.children{max-height:calc(var(--window-height) - var(--row-height));overflow-y:auto;-webkit-overflow-scrolling:touch}.lil-gui.autoPlace>.children::-webkit-scrollbar{width:var(--scrollbar-width);background:var(--bg-color)}.lil-gui.autoPlace>.children::-webkit-scrollbar-corner{height:0;display:none}.lil-gui.autoPlace>.children::-webkit-scrollbar-thumb{border-radius:var(--scrollbar-width);background:var(--widget-bg-color)}@media(max-width: 600px){.lil-gui{--row-height: 38px;--widget-height: 32px;--font-size: 16px}.lil-gui.autoPlace{right:auto;top:auto;bottom:0;left:0;width:100%}.lil-gui.autoPlace>.children{max-height:200px}}.lil-gui input{border:0;outline:none;font-family:var(--font-family);font-size:var(--font-size);border-radius:var(--widget-border-radius);height:var(--widget-height);background:var(--widget-bg-color);color:var(--widget-fg-color);width:100%}.lil-gui input[type=text]{padding:var(--widget-padding)}.lil-gui input[type=checkbox]{appearance:none;-webkit-appearance:none;--size: calc(.75*var(--widget-height));height:var(--size);width:var(--size);border-radius:var(--widget-border-radius);text-align:center}.lil-gui input[type=checkbox]:checked:before{font-family:var(--icons-font-family);content:\"✓\";font-size:var(--size);line-height:var(--size)}.lil-gui button{outline:none;cursor:pointer;border:0;font-size:var(--font-size);color:var(--widget-fg-color);background:var(--bg-color);font-weight:bold;text-align:left;text-transform:none;width:100%}.lil-gui button .name{width:100%}.lil-gui input:focus,.lil-gui input:active,.lil-gui button:focus,.lil-gui button:active{background:var(--widget-bg-color-focus);color:var(--widget-fg-color-focus)}.lil-gui .display{background:var(--widget-bg-color)}.lil-gui .display.focus,.lil-gui .display.active{background:var(--widget-bg-color-focus);color:var(--widget-fg-color-focus)}.lil-gui .title{height:var(--row-height);padding:0 var(--padding);line-height:var(--row-height);font-weight:bold;cursor:pointer}.lil-gui .title:before{font-family:var(--icons-font-family);content:\"▾\";width:1em;vertical-align:middle}.lil-gui.closed .children{display:none}.lil-gui.closed .title:before{content:\"▸\"}.lil-gui.root>.title{background:var(--title-bg-color)}.lil-gui.root>.children:not(:empty){padding:calc(.5*var(--padding)) 0}.lil-gui:not(.root)>.children{margin-left:.75em;border-left:2px solid var(--folder-rule-color)}.lil-gui:not(.root)>.children .header{padding-left:0;margin-left:var(--padding)}.lil-gui .header{height:var(--row-height);padding:0 var(--padding);font-weight:bold;border-bottom:1px solid var(--header-rule-color);margin-bottom:calc(.5*var(--padding));display:flex;align-items:center}.lil-gui .controller{display:flex;align-items:center;padding:0 var(--padding);height:var(--row-height)}.lil-gui .controller.disabled{opacity:.5;pointer-events:none}.lil-gui .controller .name{display:flex;align-items:center;width:var(--name-width);height:100%;flex-shrink:0;overflow:hidden}.lil-gui .controller .widget{display:flex;align-items:center;width:100%;height:100%}.lil-gui .controller.number input:not(:focus){color:var(--number-color)}.lil-gui .controller.number.hasSlider input{width:33%;min-width:0}.lil-gui .controller.number .slider{width:100%;height:var(--widget-height);margin-right:calc(var(--padding) - 2px);background-color:var(--widget-bg-color);border-radius:var(--widget-border-radius);overflow:hidden}.lil-gui .controller.number .fill{height:100%;background-color:var(--number-color)}.lil-gui .controller.string input:not(:focus){color:var(--string-color)}.lil-gui .controller.color .widget{position:relative}.lil-gui .controller.color input{opacity:0;position:absolute;height:var(--widget-height);width:100%}.lil-gui .controller.color .display{pointer-events:none;height:var(--widget-height);width:100%;border-radius:var(--widget-border-radius)}.lil-gui .controller.option .widget{position:relative}.lil-gui .controller.option select{opacity:0;position:absolute;max-width:100%}.lil-gui .controller.option .display{pointer-events:none;border-radius:var(--widget-border-radius);height:var(--widget-height);line-height:var(--widget-height);padding-left:var(--padding);position:relative;max-width:100%;overflow:hidden;word-break:break-all;padding-right:1.75em}.lil-gui .controller.option .display:after{font-family:var(--icons-font-family);content:\"↕\";position:absolute;display:flex;align-items:center;top:0;right:0;bottom:0;padding-right:.375em}.lil-gui.solarized,.lil-gui.solarized .lil-gui{--bg-color: #fdf6e3;--fg-color: #657b83;--widget-fg-color: #657b83;--widget-bg-color: #eee8d5;--widget-fg-color-focus: #eee8d5;--widget-bg-color-focus: #657b83;--number-color: #268bd2;--string-color: #859900;--title-bg-color: #eee8d5;--header-rule-color: #eee8d5;--folder-rule-color: #eee8d5}\n";

/**
 * @module GUI
 */
injectStyles( styles );

/**
 * Class description
 */
class GUI extends GUIItem {

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

		super( parent, 'div' );

		/**
		 * Reference to the outermost GUI, `this` for the root GUI.
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * List of items in this GUI.
		 * @type {Array}
		 */
		this.children = [];

		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The `div` that contains child elements.
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		/**
		 * @type {boolean}
		 */
		this.__closed = false;

		/**
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'button' );
		this.$title.classList.add( 'title' );
		this.$title.addEventListener( 'click', () => {
			this.open( this.__closed );
		} );

		if ( !this.parent ) {

			this.width( width );
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

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		this.title( title );

	}

	/**
	 * Adds a controller. 
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @param {*=} $1 
	 * @param {*=} $2 
	 * @param {*=} $3 
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
	add( object, property, $1, $2, $3 ) {

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

			return new NumberController( this, object, property, $1, $2, $3 );

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
		this.__title = title;
		this.$title.innerHTML = title;
		return this;
	}

	width( v ) {
		this.__width = v;
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
	 * folder.open( folder.__closed ); // toggle
	 */
	open( open = true ) {
		this.__closed = !open;
		this.domElement.classList.toggle( 'closed', this.__closed );
		return this;
	}

	/**
	 * @chainable
	 */
	close() {
		this.__closed = true;
		this.domElement.classList.add( 'closed' );
		return this;
	}

	/**
	 * 
	 */
	destroy() {

		super.destroy();

		Array.from( this.children ).forEach( c => c.destroy() );

		if ( this._onResize ) {
			window.removeEventListener( 'resize', this._onResize );
		}

	}

}

export default GUI;
export { BooleanController, ColorController, Controller, FunctionController, GUI, Header, NumberController, OptionController, StringController };
