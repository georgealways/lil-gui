/**
 * @module GUI
 */

import GUIItem from './GUIItem.js';

import BooleanController from './BooleanController.js';
import ColorController from './ColorController.js';
import FunctionController from './FunctionController.js';
import NumberController from './NumberController.js';
import OptionController from './OptionController.js';
import StringController from './StringController.js';
import Header from './Header.js';

import injectStyles from './utils/injectStyles.js';
import styles from '../build/lil-gui.css';
injectStyles( styles );

/**
 * Class description
 */
export default class GUI extends GUIItem {

	/**
	 * 
	 * @param {Object=} options
	 * @param {GUI=} options.parent
	 */
	constructor( {
		parent,
		title = 'Controls',
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
		 * @type {Array}
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
		 * @type {boolean}
		 */
		this.__closed = false;

		/**
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'button' );
		this.$title.classList.add( 'title' );
		this.$title.addEventListener( 'click', () => {
			this.open( this.__closed );
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

		this.title( title );

	}

	/**
	 * Adds a controller. 
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @param {*=} $1 
	 * @param {*=} $2 
	 * @param {*=} $3 
	 * @returns {Controller}
	 * 
	 * @example 
	 * gui.add( { myBoolean: false }, 'myBoolean' );
	 * 
	 * @example
	 * gui.add( { myNumber: 0 }, 'myNumber', 0, 100, 1 );
	 * 
	 * @example
	 * gui.add( { myOptions: 'small' }, 'myOptions', [ 'big', 'medium', 'small' ] );
	 * gui.add( { myOptions: 0 }, 'myOptions', { Label1: 0, Label2: 1, Label3: 2 } );
	 */
	add( object, property, $1, $2, $3 ) {

		const initialValue = object[ property ];

		if ( initialValue === undefined ) {

			throw new Error( `Property "${property}" of ${object} is undefined.` );

		}

		if ( Array.isArray( $1 ) || Object( $1 ) === $1 ) {

			return new OptionController( this, object, property, $1 );

		} else if ( typeof initialValue == 'boolean' ) {

			return new BooleanController( this, object, property );

		} else if ( typeof initialValue == 'string' ) {

			return new StringController( this, object, property );

		} else if ( typeof initialValue == 'function' ) {

			return new FunctionController( this, object, property );

		} else if ( typeof initialValue == 'number' ) {

			return new NumberController( this, object, property, $1, $2, $3 );

		} else {

			throw new Error( `No suitable controller type for ${initialValue}` );

		}

	}

	/**
	 * 
	 * @param {*} object 
	 * @param {string} property 
	 * @returns {Controller}
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
	 * @param {string} title 
	 * @returns {GUI}
	 */
	addFolder( title ) {
		return new GUI( { title, parent: this } );
	}

	/**
	 * 
	 * @param {string} title 
	 * @chainable
	 */
	title( title ) {
		/**
		 * @type {string}
		 */
		this.__title = title;
		this.$title.innerHTML = title;
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
	 * Opens or closes a GUI or folder.
	 * 
	 * @param {boolean=} open Pass false to close
	 * @chainable
	 * @example
	 * folder.open(); // open
	 * folder.open( false ); // closed
	 * folder.open( folder.__closed ); // toggle
	 */
	open( open = true ) {
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

		Array.from( this.children ).forEach( c => c.destroy() );

		if ( this._onResize ) {
			window.removeEventListener( 'resize', this._onResize );
		}

	}

}