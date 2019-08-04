import { Controller } from './Controller.js';
import { map } from './utils/map.js';

export class NumberController extends Controller {

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

        if ( this.__hasSlider ) {
            const percent = ( value - this.__min ) / ( this.__max - this.__min );
            this.$fill.style.setProperty( 'width', percent * 100 + '%' );
        }

        if ( !this.__inputFocused ) {
            this.$input.value = value;
        }

    }

    _createInput() {

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'text' );
        this.$input.setAttribute( 'inputmode', 'numeric' );

        this.$input.addEventListener( 'focus', () => {
            this.__inputFocused = true;
            window.addEventListener( 'mousewheel', onMouseWheel, { passive: false } );
        } );

        this.$input.addEventListener( 'input', () => {

            // Test if the string is a valid number
            let value = parseFloat( this.$input.value );
            if ( isNaN( value ) ) return;

            // Input boxes clamp to max and min if they're defined, but they
            // don't snap to step, so you can be as precise as you want.
            value = this._clamp( value );

            // Set the value, but don't call onFinishedChange 
            this.setValue( value, false );

        } );

        this.$input.addEventListener( 'blur', () => {
            this.__inputFocused = false;
            this._callOnFinishedChange();
            this.updateDisplay();
            window.removeEventListener( 'mousewheel', onMouseWheel );
        } );


        this.$input.addEventListener( 'keydown', e => {
            if ( e.keyCode === 13 ) {
                this.$input.blur();
            }
            if ( e.keyCode === 38 ) {
                e.preventDefault();
                increment( this.__step );
            }
            if ( e.keyCode === 40 ) {
                e.preventDefault();
                increment( -this.__step );
            }
        } );

        const increment = delta => {
            let value = parseFloat( this.$input.value );
            if ( isNaN( value ) ) return;
            value += delta;
            value = this._clamp( value );
            value = this._snap( value );
            this.setValue( value, false );
            // Manually update the input display because it's focused.
            this.$input.value = this.getValue();
        };

        const onMouseWheel = e => {
            if ( document.activeElement.tagName !== 'INPUT' ||
                 document.activeElement === this.$input ) {
                e.preventDefault();
                increment( ( e.deltaX + -e.deltaY ) * this.__step );
            }
        };

        this.$input.addEventListener( 'mousewheel', onMouseWheel, { passive: false } );
        this.$widget.appendChild( this.$input );

    }

    _createSlider() {

        this.__hasSlider = true;

        this.$slider = document.createElement( 'div' );
        this.$slider.classList.add( 'slider' );

        this.$fill = document.createElement( 'div' );
        this.$fill.classList.add( 'fill' );

        this.$slider.appendChild( this.$fill );
        this.$widget.insertBefore( this.$slider, this.$input );

        this.domElement.classList.add( 'hasSlider' );

        const setValue = clientX => {

            // Always poll rect because it's simpler than storing it
            const rect = this.$slider.getBoundingClientRect();

            // Map x position along slider to min and max values
            let value = map( clientX, rect.left, rect.right, this.__min, this.__max );

            // Clamp it, because it can exceed the bounding rect
            value = this._clamp( value );

            // Sliders always round to step. 
            value = this._snap( value );

            // Set the value, but don't call onFinishedChange
            this.setValue( value, false );

        };

        // Bind mouse listeners

        this.$slider.addEventListener( 'mousedown', e => {
            setValue( e.clientX, false );
            this.$slider.classList.add( 'active' );
            window.addEventListener( 'mousemove', mouseMove );
            window.addEventListener( 'mouseup', mouseUp );
        } );

        const mouseMove = e => {
            setValue( e.clientX, false );
        };

        const mouseUp = () => {
            this._callOnFinishedChange();
            this.$slider.classList.remove( 'active' );
            window.removeEventListener( 'mousemove', mouseMove );
            window.removeEventListener( 'mouseup', mouseUp );
        };

        // Bind touch listeners

        let testingForScroll = false, prevClientX, prevClientY;

        this.$slider.addEventListener( 'touchstart', e => {

            if ( e.touches.length > 1 ) return;

            const root = this.parent.root.$children;
            const scrollbarPresent = root.scrollHeight > root.clientHeight;

            if ( !scrollbarPresent ) {

                // If we're not in a scrollable container, we can set the value
                // straight away on touchstart.
                setValue( e.touches[ 0 ].clientX, false );
                this.$slider.classList.add( 'active' );
                testingForScroll = false;

            } else {

                // Otherwise, we should wait for a for the first touchmove to 
                // see if the user is trying to move horizontally or vertically.
                prevClientX = e.touches[ 0 ].clientX;
                prevClientY = e.touches[ 0 ].clientY;
                testingForScroll = true;

            }

            window.addEventListener( 'touchmove', touchMove, { passive: false } );
            window.addEventListener( 'touchend', touchEnd );

        } );

        const touchMove = e => {

            if ( !testingForScroll ) {

                e.preventDefault();
                setValue( e.touches[ 0 ].clientX );

            } else {

                const dx = e.touches[ 0 ].clientX - prevClientX;
                const dy = e.touches[ 0 ].clientY - prevClientY;

                if ( Math.abs( dx ) > Math.abs( dy ) ) {

                    // We moved horizontally, set the value and stop checking.
                    setValue( e.touches[ 0 ].clientX, false );
                    this.$slider.classList.add( 'active' );
                    testingForScroll = false;

                } else {

                    // This was, in fact, an attempt to scroll. Abort.
                    window.removeEventListener( 'touchmove', touchMove );
                    window.removeEventListener( 'touchend', touchEnd );

                }

            }

        };

        const touchEnd = () => {
            this._callOnFinishedChange();
            this.$slider.classList.remove( 'active' );
            window.removeEventListener( 'touchmove', touchMove );
            window.removeEventListener( 'touchend', touchEnd );
        };

        const increment = delta => {
            let value = this.getValue();
            value += delta;
            value = this._clamp( value );
            value = this._snap( value );
            this.setValue( value, false );
        };

        const onMouseWheel = e => {
            if ( document.activeElement.tagName !== 'INPUT' ) {
                e.preventDefault();
                increment( ( e.deltaX + -e.deltaY ) * this.__step );
            }
        };

        this.$slider.addEventListener( 'mousewheel', onMouseWheel, { passive: false } );

    }

    min( min ) {
        this.__min = min;
        this._onUpdateMinMax();
        return this;
    }

    max( max ) {
        this.__max = max;
        this._onUpdateMinMax();
        return this;
    }

    step( step, explicit = true ) {
        this.__step = step;
        this.__stepExplicit = explicit;
        return this;
    }

    _getImplicitStep() {

        if ( this.__min !== undefined && this.__max !== undefined ) {
            return ( this.__max - this.__min ) / 1000;
        }

        return 1;

    }

    _onUpdateMinMax() {

        if ( !this.__hasSlider &&
            this.__min !== undefined &&
            this.__max !== undefined ) {

            // If this is the first time we're hearing about min and max
            // and we haven't explicitly stated what our step is, let's
            // update that too.
            if ( !this.__stepExplicit ) {
                this.step( this._getImplicitStep(), false );
            }

            this._createSlider();
            this.updateDisplay();

        }

    }

    _snap( value ) {
        // Using the inverse step avoids float precision issues.
        const inverseStep = 1 / this.__step;
        return Math.round( value * inverseStep ) / inverseStep;
    }

    _clamp( value ) {
        const min = this.__min === undefined ? -Infinity : this.__min;
        const max = this.__max === undefined ? Infinity : this.__max;
        return Math.max( min, Math.min( max, value ) );
    }

}