import Controller from './Controller';

/**
 * @template [T=Record<string, unknown>]
 * @template {keyof T} [K=keyof T]
 * @extends {Controller<T, K>}
 */
export default class BooleanController extends Controller {

	/**
	 * @param {GUI} parent
	 * @param {T} object
	 * @param {K} property
	 */
	constructor( parent, object, property ) {

		super( parent, object, property, 'boolean', 'label' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$widget.appendChild( this.$input );

		this.$input.addEventListener( 'change', () => {
			this.setValue( this.$input.checked );
			this._callOnFinishChange();
		} );

		this.$disable = this.$input;

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.checked = this.getValue();
		return this;
	}

}
