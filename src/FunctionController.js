import { Controller } from './Controller.js';

export class FunctionController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'function' );

        this.domElement.addEventListener( 'click', () => {
            this.getValue()();
        } );

    }

}