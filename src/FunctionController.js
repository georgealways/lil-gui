import { Controller } from './Controller.js';

export class FunctionController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'function' );

        this.$button = document.createElement( 'div' );
        this.$button.classList.add( 'button' );

        this.$button.innerHTML = 'Fire';

        this.$button.addEventListener( 'click', () => {
            this.getValue()();
        } );

        this.$widget.appendChild( this.$button );

    }

}