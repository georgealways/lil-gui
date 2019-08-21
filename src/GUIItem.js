/**
 * @typicalname item
 */
export class GUIItem {

	constructor( parent, tagName = 'div' ) {

		/**
         * @type {GUI}
         */
		this.parent = parent;


		/**
         * @type {HTMLElement}
         */
		this.domElement = document.createElement( tagName );

		if ( this.parent ) {
			this.parent.children.push( this );
			this.parent.$children.appendChild( this.domElement );
		}

		/**
         * @type {boolean}
         */
		this.__disabled = false;

	}

	/**
	 * Enables or sets the enabled state of this item.
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
	 * Disables this item.
	 * @chainable
	 */
	disable() {
		this.__disabled = true;
		this.domElement.classList.add( 'disabled' );
		return this;
	}

	/**
     * 
     */
	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ) );
		this.parent.$children.removeChild( this.domElement );
	}

}