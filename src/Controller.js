/**
 * @module Controller
 */

/**
 * Classdesc? Where are you getting this intel. who told you.  
 */
export default class Controller {

	constructor( parent, object, property, className, tagName = 'div' ) {

		/**
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * @type {Object}
		 */
		this.object = object;

		/**
		 * @type {string}
		 */
		this.property = property;

		/**
		 * @type {boolean}
		 */
		this.__disabled = false;

		/**
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( tagName );
		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		/**
		 * @type {HTMLElement}
		 */
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		/**
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

		this.name( property );

	}

	/**
	 * 
	 * @param {string} name
	 * @returns {Controller} self
	 * @chainable 
	 */
	name( name ) {
		/**
		 * @type {string}
		 */
		this.__name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * 
	 * @param {function} callback 
	 * @returns {Controller} self
	 * @chainable 
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 */
	onChange( callback ) {
		/**
		 * @type {function}
		 */
		this.__onChange = callback;
		return this;
	}

	onFinishChange( fnc ) {
		this.__onFinishChange = fnc;
		return this;
	}

	/**
	 * I'm not sure if I'm keeping this.
	 * @param {*} options 
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this.__name );
		this.destroy();
		return controller;
	}

	setValue( value, finished = true ) {
		this.object[ this.property ] = value;
		this._onSetValue( finished );
	}

	/**
	 * Enables this controller.
	 * @returns {Controller} self
	 * @chainable 
	 */
	enable() {
		this.__disabled = false;
		this.domElement.classList.remove( 'disabled' );
		return this;
	}

	/**
	 * Disables this controller.
	 * @returns {Controller} self
	 * @chainable
	 */
	disable() {
		this.__disabled = true;
		this.domElement.classList.add( 'disabled' );
		return this;
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 * 
	 * @example 
	 * const controller = gui.add( object, 'property' );
	 * controller.destroy();
	 * 
	 * @example
	 * // Won't destroy all the controllers because c.destroy() modifies gui.children
	 * gui.children.forEach( c => c.destroy() );
	 * 
	 * // Make a copy of the array first if you actually want to do that
	 * Array.from( gui.children ).forEach( c => c.destroy() );
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

	_onSetValue( finished = true ) {
		this._callOnChange();
		if ( finished ) this._callOnFinishedChange();
		this.updateDisplay();
	}

	_callOnChange() {
		if ( this.__onChange !== undefined ) {
			this.__onChange.call( this, this.getValue() );
		}
	}

	_callOnFinishedChange() {
		if ( this.__onFinishChange !== undefined ) {
			this.__onFinishChange.call( this, this.getValue() );
		}
	}

	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {Controller} self
	 * @chainable
	 */
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {Controller} self
	 * @chainable
	 */
	max( max ) {
		return this;
	}

	/**
	 * Sets the step. Only works on number controllers.
	 * @param {number} step
	 * @returns {Controller} self
	 * @chainable
	 */
	step( step ) {
		return this;
	}

	/**
	 * Updates the display to keep it in sync with the current value of 
	 * `this.object[ this.property ]`. Useful for updating your controllers if 
	 * their values have been modified outside of the GUI.
	 * @chainable
	 */
	updateDisplay() {
		return this;
	}

	listen() {
		// eslint-disable-next-line no-console
		console.warn( 'fyi, listen() doesn\'t do anything right now' );
		return this;
	}

}