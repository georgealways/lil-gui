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
	 * Creates a panel that holds controllers.
	 * @example
	 * new GUI();
	 * new GUI( { container: document.getElementById( 'custom' ) } );
	 *
	 * @param {object} [options]
	 * @param {boolean} [options.autoPlace=true]
	 * Automatically adds the GUI to `document.body`. On desktop, the GUI will be fixed to the top
	 * right of the page. On mobile, it will be fixed to the bottom.
	 *
	 * @param {HTMLElement} [options.container]
	 * Adds the GUI to this DOM element. Sets `autoPlace` to false.
	 *
	 * @param {number} [options.width]
	 * Width of the GUI in pixels, usually set when labels become too long. Note that you can make 
	 * name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`
	 *
	 * @param {string} [options.title=Controls]
	 * Name to display in the title bar.
	 *
	 * @param {boolean} [options.injectStyles=true]
	 * Injects the default stylesheet into the page if this is the first GUI.
	 * Pass `false` to use your own stylesheet.
	 * 
	 * @param {number} [options.mobileBreakpoint=500]
	 * Browser width in pixels where mobile styles take effect. Set to zero to disable mobile styles.
	 *
	 * @param {GUI} [options.parent]
	 * Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.
	 *
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		mobileBreakpoint = 500,
		container,
		injectStyles = true,
		title = 'Controls',
		width
	} = {} ) {

		/**
		 * The GUI containing this folder, or `undefined` if this is the root GUI.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The top level GUI containing this folder, or `this` if this is the root GUI.
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * The list of controllers and folders contained by this GUI.
		 * @type {Array<GUI|Controller>}
		 */
		this.children = [];

		/**
		 * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
		 * @type {boolean}
		 * @readonly
		 */
		this._closed = false;

		/**
		 * The outermost container element.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The DOM element that contains the title.
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'div' );
		this.$title.classList.add( 'title' );
		this.$title.setAttribute( 'role', 'button' );
		this.$title.setAttribute( 'aria-expanded', true );
		this.$title.setAttribute( 'tabindex', 0 );

		this.$title.addEventListener( 'click', () => this.openAnimated( this._closed ) );
		this.$title.addEventListener( 'keydown', e => {
			if ( e.keyCode === 13 || e.keyCode === 32 ) {
				this.$title.click();
			}
		} );

		/**
		 * The DOM element that contains children.
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		this.title( title );

		if ( this.parent ) {

			this.parent.children.push( this );
			this.parent.$children.appendChild( this.domElement );

			// Stop the constructor early, everything onward only applies to root GUI's
			return;

		}

		this.domElement.classList.add( 'root' );

		// Inject stylesheet if we haven't done that yet
		if ( !stylesInjected && injectStyles ) {
			_injectStyles( stylesheet );
			stylesInjected = true;
		}

		if ( container ) {

			container.appendChild( this.domElement );

		} else if ( autoPlace ) {

			this.domElement.classList.add( 'autoPlace' );
			document.body.appendChild( this.domElement );

		}

		this._onResize = () => {

			// toggle mobile class via JS (as opposed to media query)
			// makes the breakpoint configurable via constructor
			this.domElement.classList.toggle( 'mobile', window.innerWidth <= mobileBreakpoint );

		};

		window.addEventListener( 'resize', this._onResize );
		this._onResize();

		if ( width ) {
			this.domElement.style.setProperty( '--width', width + 'px' );
		}

	}

	/**
	 * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
	 * @example
	 * // todoc
	 * 
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
	 * Adds a color controller to the GUI.
	 * @example
	 * // todoc
	 * 
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number} rgbScale Maximum value for a color channel when using an RGB color. You may 
	 * need to set this to 255 if your colors are too dark.
	 * @returns {Controller}
	 */
	addColor( object, property, rgbScale = 1 ) {
		return new ColorController( this, object, property, rgbScale );
	}

	/**
	 * Adds a folder to the GUI, which is just another GUI. This method returns 
	 * the nested GUI so you can add controllers to it.
	 * @example
	 * // todoc
	 * 
	 * @param {string} title Name to display in the folder's title bar.
	 * @returns {GUI}
	 */
	addFolder( title ) {
		return new GUI( { parent: this, title } );
	}

	/**
	 * Recalls values that were saved with `gui.export()`.
	 * @example
	 * // todoc
	 * 
	 * @param {object} obj
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
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
	 * @example
	 * // todoc

	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
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

		this.$title.setAttribute( 'aria-expanded', !this._closed );
		this.domElement.classList.toggle( 'closed', this._closed );

		return this;

	}

	/**
	 * Closes the GUI.
	 * @returns {this}
	 */
	close() {
		return this.open( false );
	}

	openAnimated( open = true ) {

		// set state immediately
		this._closed = !open;

		this.$title.setAttribute( 'aria-expanded', !this._closed );

		// wait for next frame to measure $children
		requestAnimationFrame( () => {

			// explicitly set initial height for transition
			const initialHeight = this.$children.clientHeight;
			this.$children.style.height = initialHeight + 'px';

			this.$children.classList.add( 'transition' );

			const onTransitionEnd = e => {
				if ( e.target !== this.$children ) return;
				this.$children.style.height = '';
				this.$children.classList.remove( 'transition' );
				this.$children.removeEventListener( 'transitionend', onTransitionEnd );
			};

			this.$children.addEventListener( 'transitionend', onTransitionEnd );

			// todo: this is wrong if children's scrollHeight makes for a gui taller than maxHeight
			const targetHeight = !open ? 0 : this.$children.scrollHeight;

			this.domElement.classList.toggle( 'closed', !open );

			requestAnimationFrame( () => {
				this.$children.style.height = targetHeight + 'px';
			} );

		} );

		return this;

	}

	/**
	 * Change the title of this GUI.
	 * @param {string} title
	 * @returns {this}
	 */
	 title( title ) {
		/**
		 * Current title of the GUI. Don't modify this value directly.
		 * Use the `gui.title( 'Title' )` method instead.
		 * @type {string}
		 */
		this._title = title;
		this.$title.innerHTML = title;
		return this;
	}

	/**
	 * Resets all controllers to their initial values.
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {this}
	 */
	 reset( recursive = true ) {
		this.getControllers( recursive ).forEach( c => c.reset() );
		return this;
	}
	
	/**
	 * Destroys all DOM elements and event listeners associated with this GUI
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
	 * Returns an array of controllers contained by this GUI.
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
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
	 * Returns an array of folders contained by this GUI.
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
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

}
