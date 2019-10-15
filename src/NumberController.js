import Controller from './Controller';

export default class NumberController extends Controller {

	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._initInput();

		this.min( min );
		this.max( max );

		const stepExplicit = step !== undefined;
		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

		this.updateDisplay();

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

	updateDisplay() {

		const value = this.getValue();

		if ( this._hasSlider ) {
			const percent = ( value - this._min ) / ( this._max - this._min );
			this.$fill.style.setProperty( 'width', percent * 100 + '%' );
		}

		if ( !this._inputFocused ) {
			this.$input.value = value;
		}

		return this;

	}

	_initInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'inputmode', 'numeric' );

		this.$widget.appendChild( this.$input );

		const onInput = () => {

			const value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			this.setValue( this._clamp( value ) );

		};

		// invoked on wheel or arrow key up/down
		const increment = delta => {

			const value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			this._snapClampSetValue( value + delta );

			// Force the input to updateDisplay when it's focused
			this.$input.value = this.getValue();

		};

		const onKeyDown = e => {
			if ( e.keyCode === 13 ) {
				this.$input.blur();
			}
			if ( e.keyCode === 38 ) {
				e.preventDefault();
				increment( this._step * this._arrowKeyMultiplier( e ) );
			}
			if ( e.keyCode === 40 ) {
				e.preventDefault();
				increment( -1 * this._step * this._arrowKeyMultiplier( e ) );
			}
		};

		const onWheel = e => {
			if ( this._inputFocused ) {
				e.preventDefault();
				increment( this._normalizeMouseWheel( e ) * this._step );
			}
		};

		const onFocus = () => {
			this._inputFocused = true;
		};

		const onBlur = () => {
			this._inputFocused = false;
			this.updateDisplay();
		};

		this.$input.addEventListener( 'focus', onFocus );
		this.$input.addEventListener( 'input', onInput );
		this.$input.addEventListener( 'blur', onBlur );
		this.$input.addEventListener( 'keydown', onKeyDown );
		this.$input.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	_initSlider() {

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

			// 2019: Android seems to take care of this automatically.
			// I'd like to remove this test if iOS ever decided to do the same.

			// If we're in a scrollable container, we should wait for
			// the first touchmove to see if the user is trying to move
			// horizontally or vertically.
			if ( this._hasScrollBar ) {

				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			} else {

				// Otherwise, we can set the value straight away on touchstart.
				setValueFromX( e.touches[ 0 ].clientX );
				this.$slider.classList.add( 'active' );
				testingForScroll = false;

			}

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			if ( testingForScroll ) {

				const dx = e.touches[ 0 ].clientX - prevClientX;
				const dy = e.touches[ 0 ].clientY - prevClientY;

				if ( Math.abs( dx ) > Math.abs( dy ) ) {

					// We moved horizontally, set the value and stop checking.
					e.preventDefault();
					setValueFromX( e.touches[ 0 ].clientX );
					this.$slider.classList.add( 'active' );
					testingForScroll = false;

				} else {

					// This was, in fact, an attempt to scroll. Abort.
					window.removeEventListener( 'touchmove', onTouchMove );
					window.removeEventListener( 'touchend', onTouchEnd );

				}

			} else {

				e.preventDefault();
				setValueFromX( e.touches[ 0 ].clientX );

			}

		};

		const onTouchEnd = () => {
			this.$slider.classList.remove( 'active' );
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		this.$slider.addEventListener( 'touchstart', onTouchStart );

		// Bind wheel listeners
		// ---------------------------------------------------------------------

		const onWheel = e => {

			if ( this._hasScrollBar ) return;

			e.preventDefault();

			const delta = this._normalizeMouseWheel( e ) * this._step;
			this._snapClampSetValue( this.getValue() + delta );

		};

		this.$slider.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	_getImplicitStep() {

		if ( this._hasMin && this._hasMax ) {
			return ( this._max - this._min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this._hasSlider && this._hasMin && this._hasMax ) {

			// If this is the first time we're hearing about min and max
			// and we haven't explicitly stated what our step is, let's
			// update that too.
			if ( !this._stepExplicit ) {
				this.step( this._getImplicitStep(), false );
			}

			this._initSlider();
			this.updateDisplay();

		}

	}

	_normalizeMouseWheel( e ) {

		let { deltaX, deltaY } = e;

		// 2019: Safari and Chrome report weird non-integral values for an actual
		// mouse with a wheel connected to a macbook, but still expose actual
		// lines scrolled via wheelDelta.
		if ( Math.floor( e.deltaY ) !== e.deltaY && e.wheelDelta ) {
			deltaX = 0;
			deltaY = -e.wheelDelta / 120;
		}

		const wheel = deltaX + -deltaY;

		return wheel;

	}

	_arrowKeyMultiplier( e ) {

		if ( this._stepExplicit ) {
			return e.shiftKey ? 10 : 1;
		} else if ( e.shiftKey ) {
			return 100;
		} else if ( e.altKey ) {
			return 1;
		}
		return 10;

	}

	_snap( value ) {

		// This would be the logical way to do things, but floating point errors.
		// return Math.round( value / this._step ) * this._step;

		// Using inverse step solves a lot of them, but not all
		// const inverseStep = 1 / this._step;
		// return Math.round( value * inverseStep ) / inverseStep;

		// Not happy about this, but haven't seen it break.
		const r = Math.round( value / this._step ) * this._step;
		return parseFloat( r.toPrecision( 15 ) );

	}

	_clamp( value ) {
		const min = this._hasMin ? this._min : -Infinity;
		const max = this._hasMax ? this._max : Infinity;
		return Math.max( min, Math.min( max, value ) );
	}

	_snapClampSetValue( value ) {
		this.setValue( this._clamp( this._snap( value ) ) );
	}

	get _hasScrollBar() {
		const root = this.parent.root.$children;
		return root.scrollHeight > root.clientHeight;
	}

	get _hasMin() {
		return this._min !== undefined;
	}

	get _hasMax() {
		return this._max !== undefined;
	}

}
