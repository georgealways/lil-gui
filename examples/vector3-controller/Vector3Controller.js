import { Controller } from '../../dist/lil-gui.esm.js';

/**
 * 11/2021: Made to have a simpler custom controller example than examples/xy-controller.
 * Still not psyched: the niceties you'd expect from a number controller are missing.
 * Up and down arrows, numeric input mode for mobile ... all would either have to be
 * duplicated or abstracted (ew) from NumberController. The fieldset thing is correct but weird.
 */
export default class Vector3Controller extends Controller {

	constructor( parent, object, property ) {

		// The fourth parameter defines the CSS class our controller will use
		// The fifth parameter defines the HTML tag our $widget will be (usually div)
		// Using fieldset here allows us to disable multiple inputs with one attribute
		super( parent, object, property, 'vector3', 'fieldset' );

		this.$inputX = document.createElement( 'input' );
		this.$inputY = document.createElement( 'input' );
		this.$inputZ = document.createElement( 'input' );

		const makeOnInput = component => e => {

			const value = parseFloat( e.target.value );

			if ( isNaN( value ) ) return;

			const vector = this.getValue();
			vector[ component ] = value;

			// These would usually be taken care of by setValue, but we have to call
			// them manually after manipulating a non-primitive data type.
			this._callOnChange();
			this.updateDisplay();

		};

		this.$inputX.addEventListener( 'input', makeOnInput( 'x' ) );
		this.$inputY.addEventListener( 'input', makeOnInput( 'y' ) );
		this.$inputZ.addEventListener( 'input', makeOnInput( 'z' ) );

		// Really only needed so that values re-appear if user deletes input contents before blur
		this.updateDisplay = this.updateDisplay.bind( this );
		this.$inputX.addEventListener( 'blur', this.updateDisplay );
		this.$inputY.addEventListener( 'blur', this.updateDisplay );
		this.$inputZ.addEventListener( 'blur', this.updateDisplay );

		this.$widget.append( this.$inputX, this.$inputY, this.$inputZ );

		// A controller constructor should end with this to reflect initial values
		this.updateDisplay();

	}

	updateDisplay() {
		const vector = this.getValue();
		this.$inputX.value = vector.x;
		this.$inputY.value = vector.y;
		this.$inputZ.value = vector.z;
	}

	// We have to override the load method when using an object type.
	// If we don't, object types will be overwritten on load, destroying references.
	load( v ) {
		const vector = this.getValue();
		vector.x = v.x;
		vector.y = v.y;
		vector.z = v.z;
	}

}

