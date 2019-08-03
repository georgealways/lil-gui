import { Controller } from './Controller.js';

export class OptionController extends Controller {

    constructor( parent, object, property, options ) {

        super( parent, object, property, 'option' );

        this.$select = document.createElement( 'select' );

        this.$display = document.createElement( 'div' );
        this.$display.classList.add( 'display' );

        this.__values = Array.isArray( options ) ? options : Object.values( options );
        this.__names = Array.isArray( options ) ? options : Object.keys( options );

        this.__names.forEach( ( name, index ) => {
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
        this.$widget.appendChild( this.$display );

        this.domElement.addEventListener( 'click', e => {
            e.stopPropagation();
            this.$select.click();
        } );

        this.updateDisplay();

    }

    updateDisplay() {
        const value = this.getValue();
        const index = this.__values.indexOf( value );
        this.$select.value = index;
        this.$display.innerHTML = index === -1 ? value : this.__names[ index ];
    }

}