import Controller from './Controller.js';

export default class FunctionController extends Controller {

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