import Controller from './Controller';

export default class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function' );

		// Buttons are the only case where widget contains name
		this.$button = document.createElement( 'button' );
		this.$button.appendChild( this.$name );
		this.$widget.appendChild( this.$button );

		this.$button.addEventListener( 'click', e => {
			e.preventDefault();
			this.getValue().call( this.object );
		} );

		// enables :active pseudo class on mobile
		this.$button.addEventListener( 'touchstart', () => {}, { passive: true } );

		this.$disable = this.$button;

	}

}
