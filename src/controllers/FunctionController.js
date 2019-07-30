import { Controller } from '../Controller.js';

export class FunctionController extends Controller {

    constructor( params ) {

        super( { ...params, className: 'function' } );

        this.domElement.addEventListener( 'click', () => {
            this.getValue()();
        } );

    }

}