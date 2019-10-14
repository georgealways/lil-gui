/** @module GUI */

import Controller from './Controller';
import BooleanController from './BooleanController';
import ColorController from './ColorController';
import FunctionController from './FunctionController';
import NumberController from './NumberController';
import OptionController from './OptionController';
import StringController from './StringController';

import stylesheet from 'stylesheet';
import _injectStyles from './utils/injectStyles';

let stylesInjected = false;

export default class GUI {

	/**
	 * todoc
	 * @param {object} [options]
	 * @param {boolean} [options.autoPlace=true]
	 * Adds the GUI to `document.body` and applies fixed positioning.
	 *
	 * @param {number} [options.mobileBreakpoint=500] todoc
	 * @param {number} [options.mobileMaxHeight=200] todoc
	 *
	 * @param {HTMLElement} [options.container]
	 * Adds the GUI to this DOM element, overriding autoPlace.
	 *
	 * @param {boolean} [options.injectStyles=true]
	 * Injects the default stylesheet as the first child of `document.head`.
	 * Pass false when using your own stylesheet.
	 *
	 * @param {string|false} [options.title=Controls]
	 * Name to display in the title bar. Pass `false` to hide the title bar.
	 *
	 * @param {number} [options.width] todoc
	 *
	 * @param {string} [options.queryKey]
	 * If defined, the GUI will be hidden unless the specified string is found in `location.search`.
	 * You can use this to hide the GUI until you visit `url.com/?debug` for example.
	 *
	 * @param {GUI} [options.parent] Adds this GUI as a child or "folder" in another GUI. Usually
	 * this is done for you by `gui.addFolder()`.
	 *
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		mobileBreakpoint = 500,
		mobileMaxHeight = 200,
		container,
		injectStyles = true,
		title = 'Controls',
		width,
		queryKey
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
		 * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
		 * @type {boolean}
		 */
		this._closed = false;

		/**
		 * The outermost container element.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The element that contains the title.
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'div' );
		this.$title.classList.add( 'title' );
		this.$title.addEventListener( 'click', () => {
			this.open( this._closed );
		} );

		/**
		 * The element that contains children.
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
				_injectStyles( stylesheet );
				stylesInjected = true;
			}

			if ( container ) {

				container.appendChild( this.domElement );

			} else if ( autoPlace ) {

				this.domElement.classList.add( 'autoPlace' );
				document.body.appendChild( this.domElement );

				// Allows you to change the height on mobile by dragging the title
				this._initTitleDrag();

			}

		}

		this._onResize = () => {

			// Toggles mobile class via JS (as opposed to media query) to make the breakpoint
			// configurable via constructor
			const mobile = window.innerWidth <= mobileBreakpoint;
			this.domElement.classList.toggle( 'mobile', mobile );

			// Adds a scrollbar to an autoPlace GUI
			this._setMaxHeight( mobile ? mobileMaxHeight : window.innerHeight );

		};

		window.addEventListener( 'resize', this._onResize );
		this._onResize();

		if ( queryKey && !new RegExp( `\\b${queryKey}\\b` ).test( location.search ) ) {
			this.domElement.style.display = 'none';
		}

		this.title( title );

	}

	/**
	 * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
	 * selectable values for a dropdown.
	 * @param {number} [max] Maximum value for number controllers.
	 * @param {number} [step] Step value for number controllers.
	 * @returns {Controller}
	 */
	add( object, property, $1, max, step ) {

		if ( Object( $1 ) === $1 ) {

			return new OptionController( this, object, property, $1 );

		}

		const initialValue = object[ property ];

		switch ( typeof initialValue ) {

			case 'number':

				return new NumberController( this, object, property, $1, max, step );

			case 'boolean':

				return new BooleanController( this, object, property );

			case 'string':

				return new StringController( this, object, property );

			case 'function':

				return new FunctionController( this, object, property );

		}

		// eslint-disable-next-line no-console
		console.error( `Failed to add controller for "${property}"`, initialValue, object );

	}

	/**
	 * todoc
	 * @param {object} object todoc
	 * @param {string} property todoc
	 * @param {number} rgbScale todoc
	 * @returns {Controller}
	 */
	addColor( object, property, rgbScale = 1 ) {
		return new ColorController( this, object, property, rgbScale );
	}

	/**
	 * todoc
	 * @param {string} title todoc
	 * @returns {GUI}
	 */
	addFolder( title ) {
		return new GUI( { parent: this, title } );
	}

	/**
	 * todoc
	 * @param {boolean} recursive
	 * @returns {Controller[]}
	 */
	getControllers( recursive = true ) {
		let controllers = this.children.filter( c => c instanceof Controller );
		if ( !recursive ) return controllers;
		this.getFolders( true ).forEach( f => {
			controllers = controllers.concat( f.getControllers( false ) );
		} );
		return controllers;
	}

	/**
	 * todoc
	 * @param {boolean} recursive
	 * @returns {GUI[]}
	 */
	getFolders( recursive = true ) {
		const folders = this.children.filter( c => c instanceof GUI );
		if ( !recursive ) return folders;
		let allFolders = Array.from( folders );
		folders.forEach( f => {
			allFolders = allFolders.concat( f.getFolders( true ) );
		} );
		return allFolders;
	}

	/**
	 * Resets all controllers.
	 * @param {boolean} recursive
	 * @returns {this}
	 */
	reset( recursive = true ) {
		this.getControllers( recursive ).forEach( c => c.reset() );
		return this;
	}

	/**
	 * todoc
	 * @param {object} obj
	 * @param {boolean} recursive
	 * @returns {this}
	 */
	import( obj, recursive = true ) {
		this.getControllers( recursive ).forEach( c => {
			if ( c._name in obj ) {
				c.import( obj[ c._name ] );
			}
		} );
		return this;
	}

	/**
	 * Returns an object mapping controller names to values.
	 * @param {boolean} recursive
	 * @returns {object}
	 */
	export( recursive = true ) {
		const obj = {};
		this.getControllers( recursive ).forEach( c => {
			obj[ c._name ] = c.export();
		} );
		return obj;
	}

	/**
	 * Opens a GUI or folder. GUI and folders are open by default.
	 * @param {boolean} open Pass false to close
	 * @returns {this}
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
	 * @returns {this}
	 */
	close() {
		this._closed = true;
		this.domElement.classList.add( 'closed' );
		return this;
	}

	/**
	 * todoc
	 * @param {string|false} title
	 * @returns {this}
	 */
	title( title ) {
		/**
		 * todoc
		 * @type {string|false}
		 */
		this._title = title;
		if ( title === false ) {
			this.$title.style.display = 'none';
		} else {
			this.$title.style.display = '';
			this.$title.innerHTML = title;
		}
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

	_initTitleDrag() {

		let prevClientY, initialClientY;
		const minDelta = 5;

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			const classList = this.domElement.classList;
			const resizeable = classList.contains( 'mobile' ) && !classList.contains( 'closed' );

			if ( !resizeable ) return;

			e.preventDefault();

			initialClientY = prevClientY = e.touches[ 0 ].clientY;

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {
			e.preventDefault();
			const deltaY = e.touches[ 0 ].clientY - prevClientY;
			prevClientY = e.touches[ 0 ].clientY;
			this._setMaxHeight( this._maxHeight - deltaY );
		};

		const onTouchEnd = () => {
			if ( Math.abs( initialClientY - prevClientY ) <= minDelta ) {
				this.$title.click();
			}
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		this.$title.addEventListener( 'touchstart', onTouchStart );

	}

	_setMaxHeight( v ) {
		this._maxHeight = Math.min( v, window.innerHeight );
		this.domElement.style.setProperty( '--max-height', v + 'px' );
	}

}
