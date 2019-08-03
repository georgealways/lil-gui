import { Controller } from './Controller.js';

export class ColorController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'color' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'color' );

        this.$input.addEventListener( 'change', () => {
            this.setValue( this.$input.value );
        } );

        this.$display = document.createElement( 'div' );
        this.$display.classList.add( 'display' );

        this.$widget.appendChild( this.$input );
        this.$widget.appendChild( this.$display );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.value = this.getValue();
        this.$display.style.backgroundColor = this.$input.value;
    }

}