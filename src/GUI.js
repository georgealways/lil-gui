/**
 * @module GUI
 */

import Controller from './Controller.js';
import BooleanController from './BooleanController.js';
import ColorController from './ColorController.js';
import FunctionController from './FunctionController.js';
import NumberController from './NumberController.js';
import OptionController from './OptionController.js';
import StringController from './StringController.js';

import styles from '../build/lil-gui.css';

import _injectStyles from './utils/injectStyles.js';
let stylesInjected = false;

export default class GUI {

	/**
	 * @typedef GUIOptions
	 *
	 * @property {boolean} [autoPlace=true]
	 * Adds the GUI to `document.body` and applies fixed positioning.
	 *
	 * @property {boolean} [injectStyles=true]
	 * Injects the default stylesheet as the first child of `document.head`.
	 * Pass false when using your own stylesheet.
	 *
	 * @property {string} [title='Controls']
	 * Name to display in the title bar.
	 *
	 * @property {number} [width] todoc
	 * @property {number} [mobileMaxHeight=200] todoc
	 * @property {number} [mobileBreakpoint=600] todoc
	 * @property {boolean} [collapses=true] todoc
	 * @property {string} [queryKey]
	 * If defined, the GUI will be hidden unless the specified string is found in `location.search`.
	 * You can use this to hide the GUI until you visit `url.com/?debug` for example.
	 *
	 * @property {GUI} [parent] todoc
	 */

	/**
	 * todoc
	 * @param {GUIOptions} [options]
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		injectStyles = autoPlace,
		title = 'Controls',
		width,
		queryKey,
		mobileMaxHeight = 200,
		mobileBreakpoint = 600,
		collapses = true
	} = {} ) {

		/**
		 * todoc
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * todoc
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * todoc
		 * @type {Array<GUI|Controller>}
		 */
		this.children = [];

		/**
		 * todoc
		 * @type {boolean}
		 */
		this._closed = false;

		/**
		 * The outermost container `div`.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * todoc
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( collapses ? 'button' : 'div' );
		this.$title.classList.add( 'title' );

		if ( collapses ) {
			this.domElement.classList.add( 'collapses' );
			this.$title.addEventListener( 'click', () => {
				this.open( this._closed );
			} );
		}

		/**
		 * todoc
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		if ( this.parent ) {

			this.parent.children.push( this );
			this.parent.$children.appendChild( this.domElement );

		} else {

			this.domElement.classList.add( 'root' );

			if ( width ) {
				this.domElement.style.setProperty( '--width', width + 'px' );
			}

			if ( !stylesInjected && injectStyles ) {
				_injectStyles( styles );
				stylesInjected = true;
			}

			if ( autoPlace ) {

				this.domElement.classList.add( 'autoPlace' );
				document.body.appendChild( this.domElement );

			}

			this.mobileMaxHeight = mobileMaxHeight;
			this._initMobileMaxHeight();

			this._onResize = () => {
				this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
				this.domElement.classList.toggle( 'mobile', window.innerWidth < mobileBreakpoint );
			};
			this._onResize();

			window.addEventListener( 'resize', this._onResize );

		}

		if ( queryKey && !new RegExp( `\\b${queryKey}\\b` ).test( location.search ) ) {
			this.domElement.style.display = 'none';
		}

		this.title = title;

	}

	/**
	 * todoc
	 */
	add( object, property, $1, max, step ) {

		const initialValue = object[ property ];

		if ( initialValue === undefined ) {

			throw new Error( `Property "${property}" of ${object} is undefined.` );

		}

		const initialType = typeof initialValue;

		const numArgs = arguments.length;
		const lastArg = arguments[ numArgs - 1 ];
		const onChangeShorthand = numArgs > 2 && typeof lastArg === 'function';

		let controller;

		if ( !onChangeShorthand && ( Array.isArray( $1 ) || Object( $1 ) === $1 ) ) {

			controller = new GUI.OptionController( this, object, property, $1 );

		} else if ( initialType === 'boolean' ) {

			controller = new GUI.BooleanController( this, object, property );

		} else if ( initialType === 'string' ) {

			controller = new GUI.StringController( this, object, property );

		} else if ( initialType === 'function' ) {

			controller = new GUI.FunctionController( this, object, property );

		} else if ( initialType === 'number' ) {

			controller = new GUI.NumberController( this, object, property, $1, max, step );

		} else {

			throw new Error( `No suitable controller type for ${initialValue}` );

		}

		if ( onChangeShorthand ) {
			controller.onChange( lastArg );
		}

		return controller;

	}

	/**
	 * todoc
	 * @param {object} object todoc
	 * @param {string} property todoc
	 * @returns {Controller}
	 */
	addColor( object, property ) {
		return new ColorController( this, object, property );
	}

	/**
	 * todoc
	 * @param {string} title todoc
	 * @param {boolean} [collapses=true] todoc
	 * @returns {GUI}
	 */
	addFolder( title, collapses = true ) {
		return new GUI( { parent: this, title, collapses } );
	}

	/**
	 * Opens a GUI or folder. GUI and folders are open by default.
	 * @param {boolean} [open=true] Pass false to close
	 * @returns {GUI} self
	 * @example
	 * gui.open(); // open
	 * gui.open( false ); // close
	 * gui.open( gui._closed ); // toggle
	 */
	open( open = true ) {
		this._closed = !open;
		this.domElement.classList.toggle( 'closed', this._closed );
		return this;
	}

	/**
	 * todoc
	 * @returns {GUI} self
	 */
	close() {
		this._closed = true;
		this.domElement.classList.add( 'closed' );
		return this;
	}

	/**
	 * todoc
	 */
	destroy() {

		if ( this.parent ) {
			this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		}

		if ( this.domElement.parentElement ) {
			this.domElement.parentElement.removeChild( this.domElement );
		}

		Array.from( this.children ).forEach( c => c.destroy() );

		if ( this._onResize ) {
			window.removeEventListener( 'resize', this._onResize );
		}

	}

	/**
	 * todoc
	 * @param {Function} callback todoc
	 * @param {boolean} [recursive=false] todoc
	 */
	forEachController( callback, recursive = false ) {
		this.children.forEach( c => {
			if ( c instanceof Controller ) {
				callback( c );
			} else if ( recursive && c instanceof GUI ) {
				c.forEachController( callback, true );
			}
		} );
	}

	get title() {
		return this._title;
	}

	set title( title ) {
		this._title = title;
		this.$title.innerHTML = title;
	}

	_initMobileMaxHeight() {

		let prevClientY;

		const onTouchStart = e => {
			if ( e.touches.length > 1 ) return;
			prevClientY = e.touches[ 0 ].clientY;
			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );
		};

		const onTouchMove = e => {
			e.preventDefault();
			const deltaY = e.touches[ 0 ].clientY - prevClientY;
			prevClientY = e.touches[ 0 ].clientY;
			this.mobileMaxHeight -= deltaY;
		};

		const onTouchEnd = () => {
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		this.$title.addEventListener( 'touchstart', onTouchStart );

	}

	get mobileMaxHeight() {
		return this._mobileMaxHeight;
	}

	set mobileMaxHeight( v ) {
		this._mobileMaxHeight = v;
		this.domElement.style.setProperty( '--mobile-max-height', v + 'px' );
	}

}

GUI.BooleanController = BooleanController;
GUI.ColorController = ColorController;
GUI.FunctionController = FunctionController;
GUI.NumberController = NumberController;
GUI.OptionController = OptionController;
GUI.StringController = StringController;
