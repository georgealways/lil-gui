import Controller from './Controller.js';

export default class NumberController extends Controller {

	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._createInput();

		this.min( min );
		this.max( max );

		const stepExplicit = step !== undefined;
		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

		this.updateDisplay();

	}

	updateDisplay() {

		const value = this.getValue();

		if ( this._hasSlider ) {
			const percent = ( value - this._min ) / ( this._max - this._min );
			this.$fill.style.setProperty( 'width', percent * 100 + '%' );
		}

		if ( !this._inputFocused ) {
			this.$input.value = value;
		}

	}

	_createInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'inputmode', 'numeric' );

		this.$widget.appendChild( this.$input );

		const onInput = () => {

			const value = parseFloat( this.$input.value );
			if ( isNaN( value ) ) return;

			// Set the value, but don't call onFinishedChange
			this.setValue( this._clamp( value ), false );

		};

		// invoked on mousewheel or arrow key up/down
		const increment = delta => {

			const value = parseFloat( this.$input.value );
			if ( isNaN( value ) ) return;

			this._snapClampSetValue( value + delta );

			// Force the input to updateDisplay because it's focused
			this.$input.value = this.getValue();

		};

		const onKeyDown = e => {
			if ( e.keyCode === 13 ) {
				this.$input.blur();
			}
			if ( e.keyCode === 38 ) {
				e.preventDefault();
				increment( this._step * ( e.shiftKey ? 100 : e.altKey ? 1 : 10 ) );
			}
			if ( e.keyCode === 40 ) {
				e.preventDefault();
				increment( -1 * this._step * ( e.shiftKey ? 100 : e.altKey ? 1 : 10 ) );
			}
		};

		const onMouseWheel = e => {
			if ( this._inputFocused ) {
				e.preventDefault();
				increment( ( e.deltaX + -e.deltaY ) * this._step );
			}
		};

		const onFocus = () => {
			this._inputFocused = true;
		};

		const onBlur = () => {
			this._inputFocused = false;
			this._callOnFinishedChange();
			this.updateDisplay();
		};

		this.$input.addEventListener( 'focus', onFocus );
		this.$input.addEventListener( 'input', onInput );
		this.$input.addEventListener( 'blur', onBlur );
		this.$input.addEventListener( 'keydown', onKeyDown );
		this.$input.addEventListener( 'wheel', onMouseWheel, { passive: false } );

	}

	_createSlider() {

		this._hasSlider = true;

		// Build DOM
		// ---------------------------------------------------------------------

		this.$slider = document.createElement( 'div' );
		this.$slider.classList.add( 'slider' );

		this.$fill = document.createElement( 'div' );
		this.$fill.classList.add( 'fill' );

		this.$slider.appendChild( this.$fill );
		this.$widget.insertBefore( this.$slider, this.$input );

		this.domElement.classList.add( 'hasSlider' );

		// Map clientX to value
		// ---------------------------------------------------------------------

		const map = ( v, a, b, c, d ) => {
			return ( v - a ) / ( b - a ) * ( d - c ) + c;
		};

		const setValueFromX = clientX => {
			const rect = this.$slider.getBoundingClientRect();
			let value = map( clientX, rect.left, rect.right, this._min, this._max );
			this._snapClampSetValue( value );
		};

		// Bind mouse listeners
		// ---------------------------------------------------------------------

		const mouseDown = e => {
			setValueFromX( e.clientX );
			this.$slider.classList.add( 'active' );
			window.addEventListener( 'mousemove', mouseMove );
			window.addEventListener( 'mouseup', mouseUp );
		};

		const mouseMove = e => {
			setValueFromX( e.clientX );
		};

		const mouseUp = () => {
			this._callOnFinishedChange();
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'mousemove', mouseMove );
			window.removeEventListener( 'mouseup', mouseUp );
		};

		this.$slider.addEventListener( 'mousedown', mouseDown );

		// Bind touch listeners
		// ---------------------------------------------------------------------

		let testingForScroll = false, prevClientX, prevClientY;

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			// For the record: as of 2019, Android seems to take care of this
			// automatically. I'd like to remove this whole test if iOS ever 
			// decided to do the same.

			const root = this.parent.root.$children;
			const scrollbarPresent = root.scrollHeight > root.clientHeight;

			if ( !scrollbarPresent ) {

				// If we're not in a scrollable container, we can set the value
				// straight away on touchstart.
				setValueFromX( e.touches[ 0 ].clientX );
				this.$slider.classList.add( 'active' );
				testingForScroll = false;

			} else {

				// Otherwise, we should wait for a for the first touchmove to
				// see if the user is trying to move horizontally or vertically.
				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			}

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			if ( !testingForScroll ) {

				e.preventDefault();
				setValueFromX( e.touches[ 0 ].clientX );

			} else {

				const dx = e.touches[ 0 ].clientX - prevClientX;
				const dy = e.touches[ 0 ].clientY - prevClientY;

				if ( Math.abs( dx ) > Math.abs( dy ) ) {

					// We moved horizontally, set the value and stop checking.
					setValueFromX( e.touches[ 0 ].clientX );
					this.$slider.classList.add( 'active' );
					testingForScroll = false;

				} else {

					// This was, in fact, an attempt to scroll. Abort.
					window.removeEventListener( 'touchmove', onTouchMove );
					window.removeEventListener( 'touchend', onTouchEnd );

				}

			}

		};

		const onTouchEnd = () => {
			this._callOnFinishedChange();
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		this.$slider.addEventListener( 'touchstart', onTouchStart );

		// Bind wheel listeners
		// ---------------------------------------------------------------------

		const onMouseWheel = e => {
			e.preventDefault();
			const delta = ( e.deltaX + -e.deltaY ) * ( this._max - this._min ) / 1000;
			this._snapClampSetValue( this.getValue() + delta );
		};

		this.$slider.addEventListener( 'wheel', onMouseWheel, { passive: false } );

	}

	min( min ) {
		this._min = min;
		this._onUpdateMinMax();
		return this;
	}

	max( max ) {
		this._max = max;
		this._onUpdateMinMax();
		return this;
	}

	step( step, explicit = true ) {
		this._step = step;
		this._stepExplicit = explicit;
		return this;
	}

	_getImplicitStep() {

		if ( this._hasMin() && this._hasMax() ) {
			return ( this._max - this._min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this._hasSlider && this._hasMin() && this._hasMax() ) {

			// If this is the first time we're hearing about min and max
			// and we haven't explicitly stated what our step is, let's
			// update that too.
			if ( !this._stepExplicit ) {
				this.step( this._getImplicitStep(), false );
			}

			this._createSlider();
			this.updateDisplay();

		}

	}

	_hasMin() {
		return this._min !== undefined;
	}

	_hasMax() {
		return this._max !== undefined;
	}

	_snap( value ) {

		// // This would be the logical way to do things, but floating point errors.
		// return Math.round( value / this._step ) * this._step;

		// // The inverse step strategy solves most floating point precision issues,
		// // but not all of them ... 
		// const inverseStep = 1 / this._step;
		// return Math.round( value * inverseStep ) / inverseStep;

		const r = Math.round( value / this._step ) * this._step;
		return parseFloat( r.toPrecision( 15 ) ); // o_O ?

	}

	_clamp( value ) {
		const min = this._hasMin() ? this._min : -Infinity;
		const max = this._hasMax() ? this._max : Infinity;
		return Math.max( min, Math.min( max, value ) );
	}

	_snapClampSetValue( value ) {
		this.setValue( this._clamp( this._snap( value ) ) );
	}

}