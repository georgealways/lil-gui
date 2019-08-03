import { Controller } from './Controller.js';

export class BooleanController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'boolean' );

        this.$checkbox = document.createElement( 'div' );
        this.$checkbox.classList.add( 'checkbox' );

        this.$widget.appendChild( this.$checkbox );

        this.domElement.addEventListener( 'click', () => {
            this.setValue( !this.getValue() );
        } );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$checkbox.classList.toggle( 'checked', this.getValue() );
    }

}