import Controller from './Controller';

export default class StringController extends Controller {

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
