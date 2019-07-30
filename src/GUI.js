import { BooleanController } from './controllers/BooleanController.js';
import { StringController } from './controllers/StringController.js';
import { FunctionController } from './controllers/FunctionController.js';
import { NumberController } from './controllers/NumberController.js';
import { OptionController } from './controllers/OptionController.js';
import { ColorController } from './controllers/ColorController.js';

import { isObject, isBoolean, isString, isFunction, isNumber } from './is.js';

export class GUI {

    constructor( {
        parent,
        name = 'Controls',
        autoPlace = true,
        width = 245
    } = {} ) {

        this.parent = parent;
        this.children = [];

        this.domElement = document.createElement( 'div' );
        this.domElement.classList.add( 'gui' );

        this.$children = document.createElement( 'div' );
        this.$children.classList.add( 'children' );

        this.$title = document.createElement( 'div' );
        this.$title.classList.add( 'title' );
        this.$title.addEventListener( 'click', () => {
            this.__closed ? this.open() : this.close();
        } );

        if ( this.parent ) {

            this.parent.children.push( this );
            this.parent.$children.appendChild( this.domElement );

        } else {

            this.width( width );
            this.domElement.classList.add( 'root' );

            if ( autoPlace ) {

                this.domElement.classList.add( 'autoPlace' );
                document.body.appendChild( this.domElement );

            }

        }

        this.domElement.appendChild( this.$title );
        this.domElement.appendChild( this.$children );

        this.onResize = this.onResize.bind( this );
        this.onResize();

        window.addEventListener( 'resize', this.onResize );

        this.name( name );

    }

    destroy() {

        this.children.forEach( c => c.destroy() );

        if ( this.parent ) {
            this.parent.children.splice( this.parent.children.indexOf( this ) );
            this.parent.$children.removeChild( this.domElement );
        }

        window.removeEventListener( 'resize', this.onResize );

    }

    add( object, property, $1, $2, $3 ) {

        if ( !object.hasOwnProperty( property ) ) {
            throw new Error( `${object} has no property called "${property}"` );
        }

        const initialValue = object[ property ];

        if ( initialValue === undefined ) {
            throw new Error( `Property "${property}" of ${object} is undefined.` );
        }

        const params = { object, property, parent: this };

        let controller;

        if ( Array.isArray( $1 ) || isObject( $1 ) ) {

            controller = new OptionController( params, $1 );

        } else if ( isBoolean( initialValue ) ) {

            controller = new BooleanController( params );

        } else if ( isString( initialValue ) ) {

            controller = new StringController( params );

        } else if ( isFunction( initialValue ) ) {

            controller = new FunctionController( params );

        } else if ( isNumber( initialValue ) ) {

            controller = new NumberController( params, $1, $2, $3 );

        } else {

            throw new Error( `No suitable controller type for ${initialValue}` );

        }

        return controller;

    }

    addFolder( name ) {
        return new GUI( { name, parent: this } );
    }

    addColor( object, property ) {
        return new ColorController( { object, property, parent: this } );
    }

    name( name ) {
        this.__name = name;
        this.$title.innerHTML = name;
        return this;
    }

    width( v ) {
        this.__width = v;
        if ( v === undefined ) {
            this.domElement.style.setProperty( '--width', 'auto' );
        } else {
            this.domElement.style.setProperty( '--width', v + 'px' );
        }
    }

    open( open = true ) {
        this.__closed = !open;
        this.domElement.classList.toggle( 'closed', this.__closed );
        return this;
    }

    close() {
        this.__closed = true;
        this.domElement.classList.add( 'closed' );
        return this;
    }

    onResize() {
        this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
    }

}