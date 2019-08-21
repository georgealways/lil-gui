import { isObject, isBoolean, isString, isFunction, isNumber } from './utils/is.js';

import { GUIItem } from './GUIItem.js';

import { BooleanController } from './BooleanController.js';
import { ColorController } from './ColorController.js';
import { FunctionController } from './FunctionController.js';
import { NumberController } from './NumberController.js';
import { OptionController } from './OptionController.js';
import { StringController } from './StringController.js';
import { Header } from './Header.js';

import { injectStyles } from './utils/injectStyles.js';

import styles from '../build/lil-gui.css';

injectStyles( styles, 'https://github.com/abc/xyz/blob/master/build/xyz.css' );

/**
 * @typicalname gui
 * @extends GUIItem
 */
export class GUI extends GUIItem {

	/**
	 * 
	 * @param {Object=} params
	 * @param {GUI=} params.parent
	 * @param {string=} params.name=Controls
	 * @param {boolean=} params.autoPlace=true
	 * @param {number=} params.width=250
	 */ 
	constructor( {
		parent,
		name = 'Controls',
		autoPlace = true,
		width = 250
	} = {} ) {

		super( parent, 'div' );

		/**
         * Reference to the outermost GUI, `this` for the root GUI.
         * @type {GUI}
         */
		this.root = parent ? parent.root : this;

		/**
		 * List of items in this GUI.
		 * @type {Array<GUIItem>}
		 */
		this.children = [];

		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The `div` that contains child elements.
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		/**
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'div' );
		this.$title.classList.add( 'title' );
		this.$title.setAttribute( 'tabindex', 0 );
		this.$title.addEventListener( 'click', () => {
			this.__closed ? this.open() : this.close();
		} );

		if ( !this.parent ) {

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

	/**
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @param {*} $1 
	 * @param {*} $2 
	 * @param {*} $3 
	 * @returns {Controller}
	 */
	add( object, property, $1, $2, $3 ) {

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

	/**
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @returns {ColorController}
	 */
	addColor( object, property ) {
		return new ColorController( this, object, property );
	}

	/**
	 * 
	 * @param {string} name 
	 * @returns {Header}
	 */
	addHeader( name ) {
		return new Header( this, name );
	}

	/**
	 * 
	 * @param {string} name 
	 * @returns {GUI}
	 */
	addFolder( name ) {
		return new GUI( { name, parent: this } );
	}

	/**
	 * 
	 * @param {string} name 
	 * @chainable
	 */
	name( name ) {
		/**
		 * @type {string}
		 */
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

	/**
	 * 
	 * @param {boolean} [open]
	 * @chainable 
	 */
	open( open = true ) {
		/**
		 * @type {boolean}
		 */
		this.__closed = !open;
		this.domElement.classList.toggle( 'closed', this.__closed );
		return this;
	}

	/**
	 * @chainable
	 */
	close() {
		this.__closed = true;
		this.domElement.classList.add( 'closed' );
		return this;
	}

	/**
	 * 
	 */
	destroy() {

		super.destroy();

		this.children.forEach( c => c.destroy() );

		if ( this._onResize ) {
			window.removeEventListener( 'resize', this._onResize );
		}

	}

}