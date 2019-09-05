/**
 * @module Controller
 */

/**
 *
 */
export default class Controller {

	constructor( parent, object, property, className, tagName = 'div' ) {

		/**
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * @type {object}
		 */
		this.object = object;

		/**
		 * @type {string}
		 */
		this.property = property;

		/**
		 * @type {boolean}
		 */
		this._disabled = false;

		/**
		 *
		 */
		this.initialValue = this.getValue();

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
	 */
	name( name ) {
		/**
		 * @type {string}
		 */
		this._name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 *
	 * @param {Function} callback
	 * @returns {Controller} self
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 */
	onChange( callback ) {
		/**
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	onFinishChange( callback ) {
		// eslint-disable-next-line no-console
		console.warn( 'onFinishChange() is synonymous with onChange()' );
		this._onChange = callback;
		return this;
	}

	/**
	 * I'm not sure if I'm keeping this.
	 * @param {*} options
	 * @returns {Controller} newController
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	/**
	 *
	 * @param {*} value
	 * @returns {Controller} self
	 */
	setValue( value ) {
		this.object[ this.property ] = value;
		this._callOnChange();
		this.updateDisplay();
		return this;
	}

	_callOnChange() {
		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}
	}

	/**
	 * @returns {Controller} self
	 */
	reset() {
		this.setValue( this.initialValue );
		return this;
	}

	/**
	 * Enables this controller.
	 * @param {boolean} [enabled=false]
	 * @returns {Controller} self
	 */
	enable( enabled = true ) {
		this._disabled = !enabled;
		this.domElement.classList.toggle( 'disabled', this._disabled );
		return this;
	}

	/**
	 * Disables this controller.
	 * @returns {Controller} self
	 */
	disable() {
		this._disabled = true;
		this.domElement.classList.add( 'disabled' );
		return this;
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 * @example
	 * const controller = gui.add( object, 'property' );
	 * controller.destroy();
	 *
	 * @example
	 * // Won't destroy all the controllers because c.destroy() modifies gui.children
	 * gui.forEachControler( c => c.destroy() );
	 *
	 * // Make a copy of the array first if you actually want to do that
	 * Array.from( gui.children ).forEach( c => c.destroy() );
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

	/**
	 *
	 * @returns {*} value
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {Controller} self
	 */
	// eslint-disable-next-line no-unused-vars
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {Controller} self
	 */
	// eslint-disable-next-line no-unused-vars
	max( max ) {
		return this;
	}

	/**
	 * Sets the step. Only works on number controllers.
	 * @param {number} step
	 * @returns {Controller} self
	 */
	// eslint-disable-next-line no-unused-vars
	step( step ) {
		return this;
	}

	/**
	 * Updates the display to keep it in sync with the current value of
	 * `this.object[ this.property ]`. Useful for updating your controllers if
	 * their values have been modified outside of the GUI.
	 * @returns {Controller} self
	 */
	updateDisplay() {
		return this;
	}

	listen() {
		// eslint-disable-next-line no-console
		console.warn( 'listen() is currently unimplemented' );
		return this;
	}

}
