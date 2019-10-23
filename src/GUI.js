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
	 * Automatically adds the GUI to document.body. On desktop, the GUI will be fixed to the top
	 * right of the page. On mobile, the GUI will be fixed to the bottom of the page.
	 *
	 * @param {HTMLElement} [options.container]
	 * Adds the GUI to this DOM element. This overrides `autoPlace`.
	 *
	 * @param {boolean} [options.injectStyles=true]
	 * Injects the default stylesheet into the page upon creation of the first GUI.
	 * Pass false when using your own stylesheet.
	 *
	 * @param {string} [options.title=Controls]
	 * Name to display in the title bar.
	 *
	 * @param {number} [options.width]
	 * Specify a width in pixels that will be applied with an inline style. You can also add more
	 * room for names with `.lil-gui { --name-width: 55% }` or make the GUI wider on desktop
	 * with `.lil-gui { --width: 500px }`.
	 *
	 * @param {number} [options.mobileBreakpoint=500]
	 * Applies mobile styles to an `autoPlace` GUI when the window's width is less than this value.
	 *
	 * @param {number} [options.mobileHeight=170]
	 * Starting height of a GUI with mobile styles.
	 *
	 * @param {GUI} [options.parent]
	 * Adds this GUI as a child or "folder" in another GUI.
	 * Usually this is done for you by `addFolder()`.
	 *
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		mobileBreakpoint = 500,
		mobileHeight = 170,
		container,
		injectStyles = true,
		title = 'Controls',
		width
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
		 * The element that contains children.
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

			// Allows you to change the height on mobile by dragging the title
			this._initTitleDrag();

		}

		this._setMobileHeight( mobileHeight );

		this._onResize = () => {

			// toggle mobile class via JS (as opposed to media query)
			// makes the breakpoint configurable via constructor
			this.domElement.classList.toggle( 'mobile', window.innerWidth <= mobileBreakpoint );

			// Call during resize with stored value to make sure it stays within bounds
			this._setMobileHeight( this._mobileHeight );

		};

		window.addEventListener( 'resize', this._onResize );
		this._onResize();

		if ( width ) {
			this.domElement.style.setProperty( '--width', width + 'px' );
		}

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

		this.$title.setAttribute( 'aria-expanded', !this._closed );
		this.domElement.classList.toggle( 'closed', this._closed );

		return this;

	}

	/**
	 * todoc
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
	 * todoc
	 * @param {string} title
	 * @returns {this}
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

		let prevClientY, moved;

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			// Only resizeable when open with mobile class
			const classList = this.domElement.classList;
			const resizeable = classList.contains( 'mobile' ) && !classList.contains( 'closed' );
			if ( !resizeable ) return;

			// Prevent default in case this is a drag, otherwise we'll call click() manually on touchend
			e.preventDefault();
			prevClientY = e.touches[ 0 ].clientY;
			moved = false;

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			e.preventDefault();
			moved = true;

			const deltaY = e.touches[ 0 ].clientY - prevClientY;
			prevClientY = e.touches[ 0 ].clientY;

			this._setMobileHeight( this._mobileHeight - deltaY );

		};

		const onTouchEnd = () => {

			if ( !moved ) {
				this.$title.click();
			}

			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );

		};

		this.$title.addEventListener( 'touchstart', onTouchStart );

		// todo: this fixes a bug on iOS that causes touch events to leak into $title when trying to
		// scroll $children, resizing the GUI when you don't mean to. i have no idea why.
		this.$children.addEventListener( 'touchmove', function(){} );

	}

	_setMobileHeight( v ) {
		// todo: should probably be a lower bound here too
		this._mobileHeight = Math.min( window.innerHeight, v );
		this.domElement.style.setProperty( '--mobile-height', v + 'px' );
	}

}
