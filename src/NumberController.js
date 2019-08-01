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

    _createInput() {

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'number' );

        this.$input.addEventListener( 'change', () => {

            // Test if the string is a valid number
            let value = parseFloat( this.$input.value );
            if ( isNaN( value ) ) return;

            // Input boxes clamp to max and min (if they're defined), but they
            // don't snap to step, so you can be as precise as you want.
            value = this._clamp( value );

            // Set the value, but don't call onFinishedChange 
            this.setValue( value, false );

        } );

        this.$input.addEventListener( 'blur', () => {
            this._callOnFinishedChange();
        } );

        this.$input.addEventListener( 'keydown', e => {
            if ( e.keyCode === 13 ) {
                this._callOnFinishedChange();
            }
        } );

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
            // Using the inverse step avoids float precision issues.
            const inverseStep = 1 / this.__step;
            value = Math.round( value * inverseStep ) / inverseStep;

            // Set the value, but don't call onFinishedChange
            this.setValue( value, false );

        };

        // Bind mouse listeners

        this.$slider.addEventListener( 'mousedown', e => {
            setValue( e.clientX, false );
            window.addEventListener( 'mousemove', mouseMove );
            window.addEventListener( 'mouseup', mouseUp );
        } );

        const mouseMove = e => {
            setValue( e.clientX, false );
        };

        const mouseUp = () => {
            this._callOnFinishedChange();
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
                    setValue( e.touches[ 0 ].clientX );
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
            window.removeEventListener( 'touchmove', touchMove );
            window.removeEventListener( 'touchend', touchEnd );
        };

    }

    min( min ) {
        this.__min = min;
        this.$input.setAttribute( 'min', min );
        this._onUpdateMinMax();
        return this;
    }

    max( max ) {
        this.__max = max;
        this.$input.setAttribute( 'max', max );
        this._onUpdateMinMax();
        return this;
    }

    step( step, explicit = true ) {
        this.__step = step;
        this.__stepExplicit = explicit;
        this.$input.setAttribute( 'step', step );
        return this;
    }

    updateDisplay() {

        const value = this.getValue();

        if ( this.__hasSlider ) {
            const percent = ( this.getValue() - this.__min ) / ( this.__max - this.__min );
            this.$fill.style.setProperty( 'width', percent * 100 + '%' );
        }

        this.$input.value = value;

    }

    _getImplicitStep() {

        if ( this.__min !== undefined && this.__max !== undefined ) {
            return ( this.__max - this.__min ) / 100;
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

    _clamp( value ) {
        const min = this.__min === undefined ? -Infinity : this.__min;
        const max = this.__max === undefined ? Infinity : this.__max;
        return Math.max( min, Math.min( max, value ) );
    }

}