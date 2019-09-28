/** @module GUI */

import Controller from './Controller';
import BooleanController from './BooleanController';
import ColorController from './ColorController';
import FunctionController from './FunctionController';
import NumberController from './NumberController';
import OptionController from './OptionController';
import StringController from './StringController';

import style from 'style';

import warn from './utils/warn';
import config from './config';

import _injectStyles from './utils/injectStyles';
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
	 *
	 * @property {string} [queryKey]
	 * If defined, the GUI will be hidden unless the specified string is found in `location.search`.
	 * You can use this to hide the GUI until you visit `url.com/?debug` for example.
	 *
	 * @property {GUI} [parent] todoc
	 *
	 * @property {HTMLElement} [container]
	 * Adds the GUI to this element, overrides autoPlace.
	 */

	/**
	 * todoc
	 * @param {GUIOptions} [options]
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		container,
		injectStyles = true,
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
				_injectStyles( style );
				stylesInjected = true;
			}

			if ( container ) {

				container.appendChild( this.domElement );

			} else if ( autoPlace ) {

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

		this.title( title );

	}

	/**
	 * todoc
	 * @param {object} object
	 * @param {string} property
	 * @param {number|object|Array} [$1]
	 * @param {number} [max]
	 * @param {number} [step]
	 * @returns {Controller}
	 */
	add( object, property, $1, max, step ) {

		const initialValue = object[ property ];

		if ( initialValue === undefined || initialValue === null ) {

			this._fail( property, initialValue, object );

		}

		const initialType = typeof initialValue;

		const onChange = this._onChangeShorthand( arguments );

		let controller;

		if ( !onChange && ( Array.isArray( $1 ) || Object( $1 ) === $1 ) ) {

			controller = new config.OptionController( this, object, property, $1 );

		} else if ( initialType === 'boolean' ) {

			controller = new config.BooleanController( this, object, property );

		} else if ( initialType === 'string' ) {

			controller = new config.StringController( this, object, property );

		} else if ( initialType === 'function' ) {

			controller = new config.FunctionController( this, object, property );

		} else if ( initialType === 'number' ) {

			controller = new config.NumberController( this, object, property, $1, max, step );

		} else {

			this._fail( property, initialValue, object );

		}

		if ( onChange ) {
			controller.onChange( onChange );
		}

		return controller;

	}

	_fail( property, initialValue, object ) {

		warn( `Failed to add controller for "${property}"`, initialValue, object );

	}

	/**
	 * todoc
	 * @param {object} object todoc
	 * @param {string} property todoc
	 * @param {number} [rgbScale=1] todoc
	 * @returns {Controller}
	 */
	addColor( object, property, rgbScale = 1 ) {
		const onChange = this._onChangeShorthand( arguments );
		const controller = new config.ColorController( this, object, property, rgbScale );
		if ( onChange ) {
			controller.onChange( onChange );
		}
		return controller;
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

	/**
	 * todoc
	 * @param {string} title
	 * @returns {GUI} self
	 */
	title( title ) {
		/**
		 * todoc
		 * @type {string}
		 */
		this._title = title;
		this.$title.innerHTML = title;
		return this;
	}

	_onChangeShorthand( $arguments ) {
		const numArgs = $arguments.length;
		const lastArg = $arguments[ numArgs - 1 ];
		if ( numArgs > 2 && typeof lastArg === 'function' ) {
			return lastArg;
		}
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

config.BooleanController = BooleanController;
config.ColorController = ColorController;
config.FunctionController = FunctionController;
config.NumberController = NumberController;
config.OptionController = OptionController;
config.StringController = StringController;

config.warn = true;
config.rgbScale = 1;

GUI.config = config;
