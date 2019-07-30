import { Controller } from './Controller.js';

export class ColorController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'color', 'label' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'color' );

        this.$widget.appendChild( this.$input );

        this.$input.addEventListener( 'change', () => {
            this.setValue( this.$input.value );
        } );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.value = this.getValue();
    }

}