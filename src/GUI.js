import { BooleanController } from './BooleanController.js';
import { ColorController } from './ColorController.js';
import { FunctionController } from './FunctionController.js';
import { NumberController } from './NumberController.js';
import { OptionController } from './OptionController.js';
import { StringController } from './StringController.js';

import { isObject, isBoolean, isString, isFunction, isNumber } from './utils/is.js';

import { injectStyles } from './utils/injectStyles.js';

import styles from './GUI.css';

injectStyles( styles, 'https://github.com/abc/xyz/blob/master/build/xyz.css' );

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

            this.root = this.parent.root;

            this.parent.children.push( this );
            this.parent.$children.appendChild( this.domElement );

        } else {

            this.root = this;

            this.width( width );
            this.domElement.classList.add( 'root' );

            if ( autoPlace ) {

                this.domElement.classList.add( 'autoPlace' );
                document.body.appendChild( this.domElement );

                this._onResize = () => {
                    this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
                };

                window.addEventListener( 'resize', this._onResize );
                this._onResize();

            }

        }

        this.domElement.appendChild( this.$title );
        this.domElement.appendChild( this.$children );

        this.name( name );

    }

    destroy() {

        this.children.forEach( c => c.destroy() );
        this.domElement.parentElement.removeChild( this.domElement );

        if ( this.parent ) {
            this.parent.children.splice( this.parent.children.indexOf( this ) );
        }

        if ( this._onResize ) {
            window.removeEventListener( 'resize', this._onResize );
        }

    }

    add( object, property, $1, $2, $3 ) {

        if ( !object.hasOwnProperty( property ) ) {
            throw new Error( `${object} has no property called "${property}"` );
        }

        const initialValue = object[ property ];

        if ( initialValue === undefined ) {
            throw new Error( `Property "${property}" of ${object} is undefined.` );
        }

        let controller;

        if ( Array.isArray( $1 ) || isObject( $1 ) ) {

            controller = new OptionController( this, object, property, $1 );

        } else if ( isBoolean( initialValue ) ) {

            controller = new BooleanController( this, object, property );

        } else if ( isString( initialValue ) ) {

            controller = new StringController( this, object, property );

        } else if ( isFunction( initialValue ) ) {

            controller = new FunctionController( this, object, property );

        } else if ( isNumber( initialValue ) ) {

            controller = new NumberController( this, object, property, $1, $2, $3 );

        } else {

            throw new Error( `No suitable controller type for ${initialValue}` );

        }

        return controller;

    }

    addFolder( name ) {
        return new GUI( { name, parent: this } );
    }

    addColor( object, property ) {
        return new ColorController( this, object, property );
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

}