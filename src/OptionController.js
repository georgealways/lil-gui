import { Controller } from './Controller.js';

export class OptionController extends Controller {

    constructor( params, options ) {

        super( params, 'option', 'label' );

        this.$select = document.createElement( 'select' );

        this.__values = Array.isArray( options ) ? options : Object.values( options );

        const names = Array.isArray( options ) ? options : Object.keys( options );

        names.forEach( ( name, index ) => {
            const $option = document.createElement( 'option' );
            $option.setAttribute( 'value', index );
            $option.innerHTML = name;
            this.$select.appendChild( $option );
        } );

        this.$select.addEventListener( 'change', () => {
            const index = parseInt( this.$select.value );
            this.setValue( this.__values[ index ] );
        } );

        this.$widget.appendChild( this.$select );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$select.value = this.__values.indexOf( this.getValue() );
    }

}