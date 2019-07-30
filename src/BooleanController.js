import { Controller } from './Controller.js';

export class BooleanController extends Controller {

    constructor( params ) {

        super( params, 'boolean', 'label' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'checkbox' );

        this.$widget.appendChild( this.$input );

        this.$input.addEventListener( 'change', () => {
            this.setValue( this.$input.checked );
        } );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.checked = this.getValue();
    }

}