import { Controller } from '../Controller.js';

export class StringController extends Controller {

    constructor( params ) {

        super( { ...params, className: 'string', tagName: 'label' } );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'text' );

        this.$input.addEventListener( 'input', () => {
            this.setValue( this.$input.value, false );
        } );

        this.$input.addEventListener( 'blur', () => {
            this._changeFinished();
        } );

        this.$input.addEventListener( 'keydown', e => {
            if ( e.keyCode === 13 ) {
                this._changeFinished();
            }
        } );

        this.$widget.appendChild( this.$input );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.value = this.getValue();
    }

}