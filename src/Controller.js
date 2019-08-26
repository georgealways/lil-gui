/**
 * @module Controller
 */
import GUIItem from './GUIItem.js';

/**
 * Classdesc? Where are you getting this intel. who told you.  
 */
export default class Controller extends GUIItem {

	constructor( parent, object, property, className, tagName = 'div' ) {

		super( parent, tagName );

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
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		/**
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		this.name( property );

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
	 * @param {function} callback 
	 * @chainable 
	 * 
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
	 * @returns {any} `this.object[ this.property ]`
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * 
	 */
	updateDisplay() {}

	listen() {
		// eslint-disable-next-line no-console
		console.warn( 'fyi, listen() doesn\'t do anything right now' );
		return this;
	}

}