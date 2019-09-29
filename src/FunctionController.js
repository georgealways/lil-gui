import Controller from './Controller';

export default class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function', 'button' );

		this.domElement.addEventListener( 'click', () => {
			this.getValue().call( this.object );
		} );

	}

}
