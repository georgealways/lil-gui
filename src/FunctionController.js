import Controller from './Controller';

/**
 * @template [T=Record<string, unknown>]
 * @template {keyof T} [K=keyof T]
 * @extends {Controller<T, K>}
 */
export default class FunctionController extends Controller {

	/**
	 * @param {GUI} parent
	 * @param {T} object
	 * @param {K} property
	 */
	constructor( parent, object, property ) {

		super( parent, object, property, 'function' );

		// Buttons are the only case where widget contains name
		this.$button = document.createElement( 'button' );
		this.$button.appendChild( this.$name );
		this.$widget.appendChild( this.$button );

		this.$button.addEventListener( 'click', e => {
			e.preventDefault();
			this.getValue().call( this.object );
			this._callOnChange();
		} );

		// enables :active pseudo class on mobile
		this.$button.addEventListener( 'touchstart', () => {}, { passive: true } );

		this.$disable = this.$button;

	}

}
