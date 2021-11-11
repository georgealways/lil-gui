import Controller from './Controller';

export default class OptionController extends Controller {

	constructor( parent, object, property, options ) {

		super( parent, object, property, 'option' );

		this.$select = document.createElement( 'select' );
		this.$select.setAttribute( 'aria-labelledby', this.$name.id );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this._values = Array.isArray( options ) ? options : Object.values( options );
		this._names = Array.isArray( options ) ? options : Object.keys( options );

		this._names.forEach( name => {
			const $option = document.createElement( 'option' );
			$option.innerHTML = name;
			this.$select.appendChild( $option );
		} );

		this.$select.addEventListener( 'change', () => {
			this.setValue( this._values[ this.$select.selectedIndex ] );
			this._callOnFinishChange();
		} );

		this.$select.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$select.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this.$widget.appendChild( this.$select );
		this.$widget.appendChild( this.$display );

		this.$disable = this.$select;

		this.updateDisplay();

	}

	updateDisplay() {
		const value = this.getValue();
		const index = this._values.indexOf( value );
		this.$select.selectedIndex = index;
		this.$display.innerHTML = index === -1 ? value : this._names[ index ];
		return this;
	}

}
