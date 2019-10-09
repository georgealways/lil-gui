/** @module Controller */

/**
 * todoc
 */
export default class Controller {

	constructor( parent, object, property, className, tagName = 'div' ) {

		/**
		 * The controller belongs to this GUI.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The object this controller is targeting.
		 * @type {any}
		 */
		this.object = object;

		/**
		 * The name of the property this controller is targeting.
		 * @type {string}
		 */
		this.property = property;

		/**
		 * Used to determine if the controller is disabled.
		 * @type {boolean}
		 */
		this._disabled = false;

		/**
		 * The value of `object[ property ]` when the controller is created.
		 * @type {any}
		 */
		this.initialValue = this.getValue();

		/**
		 * The outermost wrapper element for the controller.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( tagName );
		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		/**
		 * The element that contains the controller's name.
		 * @type {HTMLElement}
		 */
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		/**
		 * The element that contains the controller's "widget", like a checkbox or a slider.
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

		this._listenCallback = this._listenCallback.bind( this );

		this.name( property );

	}

	/**
	 * Sets the name of the controller and its label in the GUI.
	 * @param {string} name
	 * @returns {this}
	 */
	name( name ) {
		/**
		 * Used to access the controller's name.
		 * @type {string}
		 */
		this._name = name;
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * Pass a function to be called whenever the value is modified by this controller.
	 * The function takes the current value as its only parameter and `this` will
	 * be bound to the controller.
	 * @param {Function} callback todoc
	 * @returns {this}
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 *
	 * controller = gui.add( object, 'property' ).onChange(function() {
	 * 	console.assert(this === controller);
	 * } );
	 */
	onChange( callback ) {
		/**
		 * A function that will be called whenever the value is modified via the GUI.
		 * The function takes the current value as its only parameter and `this` will be bound to
		 * the controller.
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	onFinishChange( callback ) {
		return this.onChange( callback );
	}

	/**
	 * Sets `object[ property ]` to `value`, calls `_onChange()` and then `updateDisplay()`.
	 * @param {*} value
	 * @returns {this}
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
	 * Returns `object[ property ]`.
	 * @returns {any}
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * Shorthand for `setValue( initialValue )`.
	 * @returns {this}
	 */
	reset() {
		this.setValue( this.initialValue );
		return this;
	}

	/**
	 * Enables this controller.
	 * @param {boolean} enabled
	 * @returns {this}
	 * @example
	 * controller.enable();
	 * controller.enable( false ); // disable
	 * controller.enable( controller._disabled ); // toggle
	 */
	enable( enabled = true ) {
		this._disabled = !enabled;
		this.domElement.classList.toggle( 'disabled', this._disabled );
		return this;
	}

	/**
	 * Disables this controller.
	 * @param {boolean} disabled
	 * @returns {this}
	 * @example
	 * controller.disable();
	 * controller.disable( false ); // enable
	 * controller.disable( !controller._disabled ); // toggle
	 */
	disable( disabled = true ) {
		this._disabled = disabled;
		this.domElement.classList.toggle( 'disabled', this._disabled );
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
	 * gui.forEachController( c => c.destroy() );
	 *
	 * // Make a copy of the array first if you actually want to do that
	 * Array.from( gui.children ).forEach( c => c.destroy() );
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

	/**
	 * Destroys this controller and adds a new option controller.
	 * The `gui.add( object, property, options )` syntax is preferred.
	 * @param {object|Array} options
	 * @returns {Controller}
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {this}
	 */
	// eslint-disable-next-line no-unused-vars
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {this}
	 */
	// eslint-disable-next-line no-unused-vars
	max( max ) {
		return this;
	}

	/**
	 * Sets the step. Only works on number controllers.
	 * @param {number} step
	 * @returns {this}
	 */
	// eslint-disable-next-line no-unused-vars
	step( step ) {
		return this;
	}

	/**
	 * Updates the display to keep it in sync with `getValue()`. Useful for updating your
	 * controllers when their values have been modified outside of the GUI.
	 * @returns {this}
	 */
	updateDisplay() {
		return this;
	}

	export() {
		return this.getValue();
	}

	import( value ) {
		this.setValue( value );
		return this;
	}

	/**
	 * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening, and use
	 * `controller._listening` to access the listening state.
	 * @param {boolean} listen
	 * @returns {this}
	 */
	listen( listen = true ) {

		/**
		 * Used to determine if the controller is listening.  Use `controller.listen(true|false)` to
		 * change the listening state.
		 * @type {boolean}
		 */
		this._listening = listen;

		if ( this._listenCallbackID !== undefined ) {
			cancelAnimationFrame( this._listenCallbackID );
			this._listenCallbackID = undefined;
		}

		if ( this._listening ) {
			this._listenCallback();
		}

		return this;

	}

	_listenCallback() {
		this._listenCallbackID = requestAnimationFrame( this._listenCallback );
		this.updateDisplay();
	}

}
