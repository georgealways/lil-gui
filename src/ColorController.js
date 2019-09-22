import Controller from './Controller.js';

import getColorFormat from './utils/getColorFormat.js';

export default class ColorController extends Controller {

	constructor( parent, object, property ) {

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
		this.$text.value = this.$input.value.substring( 1 );
		this.$display.style.backgroundColor = this.$input.value;
	}

}
