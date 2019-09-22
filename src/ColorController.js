import Controller from './Controller.js';

import getColorFormat from './utils/getColorFormat.js';
import normalizeColorString from './utils/normalizeColorString.js';

export default class ColorController extends Controller {

	constructor( parent, object, property, rgbScale ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );

		this.$text = document.createElement( 'input' );
		this.$text.setAttribute( 'type', 'text' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$display.appendChild( this.$input );
		this.$widget.appendChild( this.$text );
		this.$widget.appendChild( this.$display );

		this._format = getColorFormat( this.getValue() );

		this._rgbScale = rgbScale;

		const set = value => {

			if ( this._format.isPrimitive ) {

				const newValue = this._format.fromHexString( value );
				this.setValue( newValue );

			} else {

				this._format.fromHexString( value, this.getValue(), this._rgbScale );
				this._callOnChange();
				this.updateDisplay();

			}

		};

		this.$input.addEventListener( 'change', () => {

			set( this.$input.value );

		} );

		this.$input.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$input.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this._textFocused = false;

		this.$text.addEventListener( 'input', () => {
			const tryParse = normalizeColorString( this.$text.value );
			if ( tryParse ) {
				set( tryParse );
			}
		} );

		this.$text.addEventListener( 'focus', () => {
			this._textFocused = true;
		} );

		this.$text.addEventListener( 'blur', () => {
			this._textFocused = false;
			this.updateDisplay();
		} );

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this._format.toHexString( this.getValue(), this._rgbScale );
		if ( !this._textFocused ) {
			this.$text.value = this.$input.value.substring( 1 );
		}
		this.$display.style.backgroundColor = this.$input.value;
	}

}
