import Controller from './Controller';

export default class BooleanController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'boolean' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );

		this.$widget.appendChild( this.$input );

		this.$widget.addEventListener( 'click', () => {
			this.$input.select();
			this.$input.click();
		} );

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
