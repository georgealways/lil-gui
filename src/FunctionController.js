import { Controller } from './Controller.js';

export class FunctionController extends Controller {

    constructor( params ) {

        super( params, 'function' );

        this.domElement.addEventListener( 'click', () => {
            this.getValue()();
        } );

    }

}