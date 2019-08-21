/**
 * 
 */
export class Controller {

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

		this.name( property );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

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
		this.$name.innerHTML = name;
		return this;
	}

	/**
	 * 
	 * @param {function} fnc 
	 * @chainable 
	 * 
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 */
	onChange( fnc ) {
		/**
		 * @type {function}
		 */
		this.__onChange = fnc;
		return this;
	}

	onFinishChange( fnc ) {
		this.__onFinishChange = fnc;
		return this;
	}

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

	/**
	 * Enables or sets the enabled state of this controller.
	 * @param {boolean} [enable]
	 * @chainable 
	 * @example
	 * controller.enable();
	 * controller.enable( false ); // disable
	 * controller.enable( controller.__disabled ); // toggle
	 */
	enable( enable = true ) {
		this.__disabled = !enable;
		this.domElement.classList.toggle( 'disabled', this.__disabled );
		return this;
	}

	/**
	 * Disables this controller.
	 * @chainable `this`
	 */
	disable() {
		this.__disabled = true;
		this.domElement.classList.add( 'disabled' );
		return this;
	}

	/**
	 * @returns {any} `this.object[ this.property ]`
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * 
	 */
	updateDisplay() {}

	/**
	 * 
	 */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ) );
		this.parent.$children.removeChild( this.domElement );
	}

}