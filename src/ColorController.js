import { Controller } from './Controller.js';
import { getColorFormat } from './utils/getColorFormat.js';

export class ColorController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$widget.appendChild( this.$input );
		this.$widget.appendChild( this.$display );

		this.__colorFormat = getColorFormat( this.getValue() );

		this.$input.addEventListener( 'change', () => {

			if ( this.__colorFormat.isPrimitive ) {

				const newValue = this.__colorFormat.fromHexString( this.$input.value );
				this.setValue( newValue );

			} else {

				const target = this.getValue();
				this.__colorFormat.fromHexString( this.$input.value, target );
				this._onSetValue();

			}

		} );

		this.updateDisplay();


	}

	updateDisplay() {
		this.$input.value = this.__colorFormat.toHexString( this.getValue() );
		this.$display.style.backgroundColor = this.$input.value;
	}

}