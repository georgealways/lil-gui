class Controller {

    constructor( parent, object, property, className, tagName = 'div' ) {

        this.parent = parent;

        this.object = object;
        this.property = property;

        this.domElement = document.createElement( tagName );
        this.domElement.classList.add( 'controller' );
        this.domElement.classList.add( className );

        this.$name = document.createElement( 'div' );
        this.$name.classList.add( 'name' );

        this.$widget = document.createElement( 'div' );
        this.$widget.classList.add( 'widget' );

        this.domElement.appendChild( this.$name );
        this.domElement.appendChild( this.$widget );

        this.name( property );

        this.parent.children.push( this );
        this.parent.$children.appendChild( this.domElement );

    }

    destroy() {
        this.parent.children.splice( this.parent.children.indexOf( this ) );
        this.parent.$children.removeChild( this.domElement );
    }

    name( name ) {
        this.__name = name;
        this.$name.innerHTML = name;
        return this;
    }

    onChange( fnc ) {
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
        this._callOnChange();
        if ( finished ) this._callOnFinishedChange();
        this.updateDisplay();
    }

    mutateValue( values, finished = true ) {
        Object.assign( this.getValue(), values );
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

    enable( enable = true ) {
        this.__disabled = !enable;
        this.domElement.classList.toggle( 'disabled', this.__disabled );
    }

    disable() {
        this.__disabled = true;
        this.domElement.classList.add( 'disabled' );
    }

    getValue() {
        return this.object[ this.property ];
    }

    updateDisplay() {}

}

class BooleanController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'boolean', 'label' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'checkbox' );

        this.$widget.appendChild( this.$input );

        this.$input.addEventListener( 'change', () => {
            this.setValue( this.$input.checked );
        } );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.checked = this.getValue();
    }

}

const isFunction = val => typeof val === 'function';
const isString = val => typeof val === 'string';
const isBoolean = val => typeof val === 'boolean';
const isNumber = val => typeof val === 'number';
const isObject = val => Object( val ) === val;

/**
 * @typedef ColorFormat
 * @property {boolean} isPrimitive false for Array and Object formats
 * @property {function(*):boolean} match returns true if a value matches this format
 * @property {function(string):*} fromHexString converts from #FFFFFF to this format
 * @property {function(*):string} toHexString converts from this format to #FFFFFF
 */

const STRING = {
    isPrimitive: true,
    match: isString,
    fromHexString: string => string,
    toHexString: value => value
};

const INT = {
    isPrimitive: true,
    match: isNumber,
    fromHexString: string => parseInt( string.substring( 1 ), 16 ),
    toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
    isPrimitive: false,
    match: Array.isArray,
    fromHexString( string ) {
        const int = INT.fromHexString( string );
        return [
            ( int >> 16 & 255 ) / 0xff,
            ( int >> 8 & 255 ) / 0xff,
            ( int & 255 ) / 0xff
        ];
    },
    toHexString( [ r, g, b ] ) {
        const int = ( r * 0xff ) << 16
                  ^ ( g * 0xff ) << 8
                  ^ ( b * 0xff ) << 0;
        return INT.toHexString( int );
    }
};

const OBJECT = {
    isPrimitive: false,
    match: isObject,
    fromHexString( string ) {
        const int = INT.fromHexString( string );
        return {
            r: ( int >> 16 & 255 ) / 0xff,
            g: ( int >> 8 & 255 ) / 0xff,
            b: ( int & 255 ) / 0xff
        };
    },
    toHexString( { r, g, b } ) {
        const int = ( r * 0xff ) << 16
                  ^ ( g * 0xff ) << 8
                  ^ ( b * 0xff ) << 0;
        return INT.toHexString( int );
    }
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

/**
 * @returns {ColorFormat}
 */
function getColorFormat( value ) {
    return FORMATS.find( format => format.match( value ) );
}

class ColorController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'color' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'color' );

        this.$display = document.createElement( 'div' );
        this.$display.classList.add( 'display' );

        this.$widget.appendChild( this.$input );
        this.$widget.appendChild( this.$display );

        this.__colorFormat = getColorFormat( this.getValue() );

        this.$input.addEventListener( 'change', () => {
            const newValue = this.__colorFormat.fromHexString( this.$input.value );
            if ( this.__colorFormat.isPrimitive ) {
                this.setValue( newValue );
            } else {
                this.mutateValue( newValue );
            }
        } );

        this.updateDisplay();


    }

    updateDisplay() {
        this.$input.value = this.__colorFormat.toHexString( this.getValue() );
        this.$display.style.backgroundColor = this.$input.value;
    }

}

class FunctionController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'function' );

        this.$button = document.createElement( 'button' );
        this.$button.innerHTML = 'Fire';

        this.$button.addEventListener( 'click', () => {
            this.getValue()();
        } );

        this.$widget.appendChild( this.$button );

    }

}

const map = ( v, a, b, c, d ) => ( v - a ) / ( b - a ) * ( d - c ) + c;

class NumberController extends Controller {

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
        } );


        this.$input.addEventListener( 'keydown', e => {
            console.log( e );
            if ( e.keyCode === 13 ) {
                this.$input.blur();
            }
            if ( e.keyCode === 38 ) {
                e.preventDefault();
                increment( this.__step * ( e.shiftKey ? 10 : 1 ) );
            }
            if ( e.keyCode === 40 ) {
                e.preventDefault();
                increment( -1 * this.__step * ( e.shiftKey ? 10 : 1 ) );
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
            e.preventDefault();
            increment( ( e.deltaX + -e.deltaY ) * this.__step );
        };

        this.$input.addEventListener( 'wheel', onMouseWheel, { passive: false } );
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
            setValue( e.clientX);
            this.$slider.classList.add( 'active' );
            window.addEventListener( 'mousemove', mouseMove );
            window.addEventListener( 'mouseup', mouseUp );
        } );

        const mouseMove = e => {
            setValue( e.clientX);
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
                setValue( e.touches[ 0 ].clientX);
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
                    setValue( e.touches[ 0 ].clientX);
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
            e.preventDefault();
            increment( ( e.deltaX + -e.deltaY ) * ( this.__max - this.__min ) / 1000 );
        };

        this.$slider.addEventListener( 'wheel', onMouseWheel, { passive: false } );

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

class OptionController extends Controller {

    constructor( parent, object, property, options ) {

        super( parent, object, property, 'option' );

        this.$select = document.createElement( 'select' );

        this.$display = document.createElement( 'div' );
        this.$display.classList.add( 'display' );

        this.__values = Array.isArray( options ) ? options : Object.values( options );
        this.__names = Array.isArray( options ) ? options : Object.keys( options );

        this.__names.forEach( name => {
            const $option = document.createElement( 'option' );
            $option.innerHTML = name;
            this.$select.appendChild( $option );
        } );

        this.$select.addEventListener( 'change', () => {
            this.setValue( this.__values[ this.$select.selectedIndex ] );
        } );

        this.$select.addEventListener( 'focus', () => {
            this.$display.classList.add( 'focus' );
        } );

        this.$select.addEventListener( 'blur', () => {
            this.$display.classList.remove( 'focus' );
        } );

        this.$widget.appendChild( this.$select );
        this.$widget.appendChild( this.$display );

        this.updateDisplay();

    }

    updateDisplay() {
        const value = this.getValue();
        const index = this.__values.indexOf( value );
        this.$select.selectedIndex = index;
        this.$display.innerHTML = index === -1 ? value : this.__names[ index ];
    }

}

class StringController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'string' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'text' );

        this.$input.addEventListener( 'input', () => {
            this.setValue( this.$input.value, false );
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

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.value = this.getValue();
    }

}

class Header {

    constructor( parent, name ) {

        this.parent = parent;

        this.domElement = document.createElement( 'div' );
        this.domElement.classList.add( 'header' );

        this.parent.children.push( this );
        this.parent.$children.appendChild( this.domElement );

        this.name( name );

    }

    name( name ) {
        this.__name = name;
        this.domElement.innerHTML = name;
    }

    destroy() {
        this.parent.children.splice( this.parent.children.indexOf( this ) );
        this.parent.$children.removeChild( this.domElement );
    }

}

function injectStyles( cssContent, fallbackURL ) {
    const injected = document.createElement( 'style' );
    injected.type = 'text/css';
    injected.innerHTML = cssContent;
    const head = document.getElementsByTagName( 'head' )[ 0 ];
    try {
        head.appendChild( injected );
    } catch ( e ) {
        console.warn( `Failed to inject styles. Manually include the stylesheet at ${fallbackURL}` );
    }
}

var styles = "@charset \"UTF-8\";\n@font-face {\n  font-family: \"gui-icons\";\n  src: url(\"data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAR0AAsAAAAABvAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAADsAAABUIIslek9TLzIAAAFEAAAAPQAAAFZr2333Y21hcAAAAYQAAABuAAABssJQk9tnbHlmAAAB9AAAAJgAAADID6HkjWhlYWQAAAKMAAAAJgAAADZfcj22aGhlYQAAArQAAAAYAAAAJAC5AGpobXR4AAACzAAAAA4AAAAUAZAAAGxvY2EAAALcAAAADAAAAAwAZgCWbWF4cAAAAugAAAAeAAAAIAERAB9uYW1lAAADCAAAAS4AAAIi1kTvxHBvc3QAAAQ4AAAAOQAAAEqHPh3zeJxjYGRgYOBiMGCwY2BycfMJYeDLSSzJY5BiYGGAAJA8MpsxJzM9kYEDxgPKsYBpDiBmg4gCACY7BUgAeJxjYGQIYJzAwMrAwGDP4AYk+aC0AQMLgyQDAxMDKzMDVhCQ5prC4KA4VV2YIQXI5QSTDAyMIAIA82gFuAAAAHic7ZGxDYAwDAQvISCE6JiAIkrDEBmIil3YJVVWAztOwRC8dZH9ily8gREYhEMI4C4cqlNc1/yBpfmBLPPCjMfvdyyxpu154Nt3Oflnpb2XHbp74tfa3tynoOkZmnYshiRGrIZeJ20G4QWoQBFzAAB4nEWOzQrCMBCEZzfRkkvFmDQNgkKrLZ6EUhoEoSdvelLf/1XsVsQ5zf58w4AhuuMJxgIYKfisjaJLjHmMcqX554o31kCqmn6ktumHbk+FW9Fyx4qdY6W5JCp5qzR5x1pNo6x+/IgbrPBn+sJp6Ga+PigqaKI2lvRsj+yFt1ZCPf87vPCQlqlNIYVTMHllYmHy2nwALu8NGnicY2BkYGAAYgX1qNp4fpuvDNwMKQzYQAhDKJDkYGACcQCJzgPiAAB4nGNgZGBgSGFggJMhDIwMqIAVABx5ASR4nGNgAIIUVAwADiQBkQAAAAAAAAASADIAVABkeJxjYGRgYGBlEGZgYgABEMkFhAwM/8F8BgAK2gExAAB4nG2QS07DMBRFb/pDtBKqQEJiZjFggpp+Bh10Ae28g87T1ElTJXHkuJW6AVbAGlgDK2DIGlgKN+apA8CW7POO73PkABjiAwGaEeDar81o4YrVD7dJQ+EO+UG4iwEehXv0I+E+njEXHuAOEW8IOs1tt3DCLdzgRbhN/yrcIb8Jd3GPd+Ee/adwHxt8CQ/wFMzTYzbKYlPWa50e88he6gtstK0zU6ppOLm4lS61jZzeqe1Z1ad05lyiEmsKtTSl03luVGXNQccu3DtXLcbjRHwYmwIpjsj45gwxDErUWEN7m/PF9p/zv2bDDss987XCFCEm/+RWzJU+G/EPauyY3eLMtcaJ+RmtQ8I6YcagIC19b5POOQ1N5c8ONDF9iL3vqrDAmDP5lQ/914tvdMhgegAAeJxjYGKAAEYG7ICVkYmRmZGFkZWRjYEjpSi/ICW/PI8tOSe/ODWFJb8gNY81OSM1OZuBAQCfaQnQAAAA\") format(\"woff\");\n}\n.gui {\n  --width: auto;\n  --bg-color: #1a1a1a;\n  --fg-color: #eee;\n  --widget-fg-color: #eee;\n  --widget-bg-color: #3c3c3c;\n  --widget-fg-color-focus: #fff;\n  --widget-bg-color-focus: #4d4d4d;\n  --number-color: #00adff;\n  --string-color: #1ed36f;\n  --title-bg-color: #111;\n  --header-rule-color: rgba(255, 255, 255, 0.1);\n  --folder-rule-color: #444;\n  --font-family: system-ui, sans-serif;\n  --font-size: 11px;\n  --line-height: 1;\n  --name-width: 35%;\n  --row-height: 24px;\n  --widget-height: 20px;\n  --padding: 0.55em;\n  --widget-padding: 0 0 0 0.25em;\n  --widget-border-radius: 2px;\n  --scrollbar-width: 0.375em;\n  width: var(--width);\n  text-align: left;\n  font-size: var(--font-size);\n  line-height: var(--line-height);\n  font-family: var(--font-family);\n  font-weight: normal;\n  font-style: normal;\n  background-color: var(--bg-color);\n  color: var(--fg-color);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  user-select: none;\n  -webkit-user-select: none;\n}\n.gui, .gui * {\n  box-sizing: border-box;\n  margin: 0;\n}\n.gui.autoPlace {\n  position: fixed;\n  top: 0;\n  right: 15px;\n  z-index: 1001;\n}\n.gui.autoPlace > .children {\n  max-height: calc(var(--window-height) - var(--row-height));\n  overflow-y: auto;\n  -webkit-overflow-scrolling: touch;\n}\n.gui.autoPlace > .children::-webkit-scrollbar {\n  width: var(--scrollbar-width);\n  background: var(--bg-color);\n}\n.gui.autoPlace > .children::-webkit-scrollbar-corner {\n  height: 0;\n  display: none;\n}\n.gui.autoPlace > .children::-webkit-scrollbar-thumb {\n  border-radius: var(--scrollbar-width);\n  background: var(--widget-bg-color);\n}\n@media (max-width: 600px) {\n  .gui {\n    --row-height: 38px;\n    --widget-height: 32px;\n    --font-size: 16px;\n  }\n  .gui.autoPlace {\n    right: auto;\n    top: auto;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n  }\n  .gui.autoPlace > .children {\n    max-height: 200px;\n  }\n}\n.gui input {\n  border: 0;\n  outline: none;\n  font-family: var(--font-family);\n  font-size: var(--font-size);\n  border-radius: var(--widget-border-radius);\n  height: var(--widget-height);\n  background: var(--widget-bg-color);\n  color: var(--widget-fg-color);\n  width: 100%;\n}\n.gui input[type=text] {\n  padding: var(--widget-padding);\n}\n.gui input[type=checkbox] {\n  appearance: none;\n  -webkit-appearance: none;\n  --size: calc(.75*var(--widget-height));\n  height: var(--size);\n  width: var(--size);\n  border-radius: var(--widget-border-radius);\n  text-align: center;\n}\n.gui input[type=checkbox]:checked:before {\n  font-family: \"gui-icons\";\n  content: \"✓\";\n  font-size: var(--size);\n  line-height: var(--size);\n}\n.gui button {\n  outline: none;\n  cursor: pointer;\n  border: 0;\n  font-size: var(--font-size);\n  color: var(--widget-fg-color);\n  background: var(--widget-bg-color);\n  border-radius: var(--widget-border-radius);\n  height: var(--widget-height);\n  padding: 0 var(--padding);\n}\n.gui input:focus, .gui input:active,\n.gui button:focus,\n.gui button:active {\n  background: var(--widget-bg-color-focus);\n  color: var(--widget-fg-color-focus);\n}\n.gui .display {\n  background: var(--widget-bg-color);\n}\n.gui .display.focus, .gui .display.active {\n  background: var(--widget-bg-color-focus);\n  color: var(--widget-fg-color-focus);\n}\n.gui .title {\n  height: var(--row-height);\n  padding: 0 var(--padding);\n  line-height: var(--row-height);\n  font-weight: bold;\n  cursor: pointer;\n}\n.gui .title:before {\n  font-family: \"gui-icons\";\n  content: \"▾\";\n  width: 1em;\n  vertical-align: middle;\n}\n.gui.closed .children {\n  display: none;\n}\n.gui.closed .title:before {\n  content: \"▸\";\n}\n.gui.root > .title {\n  background: var(--title-bg-color);\n}\n.gui.root > .children {\n  padding: calc(.5*var(--padding)) 0;\n}\n.gui:not(.root) > .children {\n  margin-left: 0.75em;\n  border-left: 2px solid var(--folder-rule-color);\n}\n.gui .header {\n  height: var(--row-height);\n  padding: 0 var(--padding);\n  font-weight: bold;\n  border-bottom: 1px solid var(--header-rule-color);\n  margin-bottom: calc(.5*var(--padding));\n  display: flex;\n  align-items: center;\n}\n.gui .controller {\n  display: flex;\n  align-items: center;\n  padding: 0 var(--padding);\n  height: var(--row-height);\n}\n.gui .controller.disabled {\n  opacity: 0.5;\n  pointer-events: none;\n}\n.gui .controller .name {\n  display: flex;\n  align-items: center;\n  width: var(--name-width);\n  height: 100%;\n  flex-shrink: 0;\n  overflow: hidden;\n}\n.gui .controller .widget {\n  display: flex;\n  align-items: center;\n  width: 100%;\n  height: 100%;\n}\n.gui .controller.number input:not(:focus) {\n  color: var(--number-color);\n}\n.gui .controller.number.hasSlider input {\n  width: 33%;\n  min-width: 0;\n}\n.gui .controller.number .slider {\n  position: relative;\n  width: 100%;\n  height: var(--widget-height);\n  margin-right: calc(var(--padding) - 2px);\n  background-color: var(--widget-bg-color);\n  border-radius: var(--widget-border-radius);\n  overflow: hidden;\n}\n.gui .controller.number .fill {\n  height: 100%;\n  background-color: var(--number-color);\n}\n.gui .controller.string input:not(:focus) {\n  color: var(--string-color);\n}\n.gui .controller.color .widget {\n  position: relative;\n}\n.gui .controller.color input {\n  opacity: 0;\n  height: var(--widget-height);\n  width: 100%;\n  position: absolute;\n}\n.gui .controller.color .display {\n  height: var(--widget-height);\n  width: 100%;\n  border-radius: var(--widget-border-radius);\n  pointer-events: none;\n}\n.gui .controller.option .widget {\n  position: relative;\n}\n.gui .controller.option select {\n  opacity: 0;\n  position: absolute;\n  width: 100%;\n}\n.gui .controller.option .display {\n  pointer-events: none;\n  border-radius: var(--widget-border-radius);\n  height: var(--widget-height);\n  line-height: var(--widget-height);\n  padding: 0 var(--padding);\n}\n.gui .controller.option .display:after {\n  font-family: \"gui-icons\";\n  content: \"↕\";\n  vertical-align: middle;\n  margin-left: var(--padding);\n}\n\n/* \n.gui .controller.number.hasSlider { \n\tposition: relative;\n}\n\n.gui .controller.number.hasSlider .name { \n\tposition: absolute;\n\tpointer-events: none;\n\twidth: auto;\n} \n.gui .controller.number.hasSlider input {\n\twidth: 18%;\n} */\n.gui.solarized, .gui.solarized .gui {\n  --bg-color: #fdf6e3;\n  --fg-color: #657b83;\n  --widget-fg-color: #657b83;\n  --widget-bg-color: #eee8d5;\n  --widget-fg-color-focus: #eee8d5;\n  --widget-bg-color-focus: #657b83;\n  --number-color: #268bd2;\n  --string-color: #859900;\n  --title-bg-color: #eee8d5;\n  --header-rule-color: #eee8d5;\n  --folder-rule-color: #eee8d5;\n}\n";

injectStyles( styles, 'https://github.com/abc/xyz/blob/master/build/xyz.css' );

class GUI {

    constructor( {
        parent,
        name = 'Controls',
        autoPlace = true,
        width = 250
    } = {} ) {

        this.parent = parent;
        this.children = [];

        this.domElement = document.createElement( 'div' );
        this.domElement.classList.add( 'gui' );

        this.$children = document.createElement( 'div' );
        this.$children.classList.add( 'children' );

        this.$title = document.createElement( 'div' );
        this.$title.classList.add( 'title' );
        this.$title.setAttribute( 'tabindex', 0 );
        this.$title.addEventListener( 'click', () => {
            this.__closed ? this.open() : this.close();
        } );

        if ( this.parent ) {

            this.root = this.parent.root;

            this.parent.children.push( this );
            this.parent.$children.appendChild( this.domElement );

        } else {

            this.root = this;

            this.width( width );
            this.domElement.classList.add( 'root' );

            if ( autoPlace ) {

                this.domElement.classList.add( 'autoPlace' );
                document.body.appendChild( this.domElement );

                this._onResize = () => {
                    this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
                };

                window.addEventListener( 'resize', this._onResize );
                this._onResize();

            }

        }

        this.domElement.appendChild( this.$title );
        this.domElement.appendChild( this.$children );

        this.name( name );

    }

    destroy() {

        this.children.forEach( c => c.destroy() );
        this.domElement.parentElement.removeChild( this.domElement );

        if ( this.parent ) {
            this.parent.children.splice( this.parent.children.indexOf( this ) );
        }

        if ( this._onResize ) {
            window.removeEventListener( 'resize', this._onResize );
        }

    }

    add( object, property, $1, $2, $3 ) {

        const initialValue = object[ property ];

        if ( initialValue === undefined ) {
            throw new Error( `Property "${property}" of ${object} is undefined.` );
        }

        let controller;

        if ( Array.isArray( $1 ) || isObject( $1 ) ) {

            controller = new OptionController( this, object, property, $1 );

        } else if ( isBoolean( initialValue ) ) {

            controller = new BooleanController( this, object, property );

        } else if ( isString( initialValue ) ) {

            controller = new StringController( this, object, property );

        } else if ( isFunction( initialValue ) ) {

            controller = new FunctionController( this, object, property );

        } else if ( isNumber( initialValue ) ) {

            controller = new NumberController( this, object, property, $1, $2, $3 );

        } else {

            throw new Error( `No suitable controller type for ${initialValue}` );

        }

        return controller;

    }

    addFolder( name ) {
        return new GUI( { name, parent: this } );
    }

    addColor( object, property ) {
        return new ColorController( this, object, property );
    }

    addHeader( name ) {
        return new Header( this, name );
    }

    name( name ) {
        this.__name = name;
        this.$title.innerHTML = name;
        return this;
    }

    width( v ) {
        this.__width = v;
        if ( v === undefined ) {
            this.domElement.style.setProperty( '--width', 'auto' );
        } else {
            this.domElement.style.setProperty( '--width', v + 'px' );
        }
    }

    open( open = true ) {
        this.__closed = !open;
        this.domElement.classList.toggle( 'closed', this.__closed );
        return this;
    }

    close() {
        this.__closed = true;
        this.domElement.classList.add( 'closed' );
        return this;
    }

}

export { GUI };
