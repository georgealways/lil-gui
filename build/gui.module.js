class Controller {

    constructor( { object, property, parent }, className, tagName = 'div' ) {

        this.parent = parent;

        this.object = object;
        this.property = property;

        this.domElement = document.createElement( tagName );
        this.domElement.classList.add( className );
        this.domElement.classList.add( 'controller' );

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
        if ( this.__onChange !== undefined ) this.__onChange.call( this, value );
        if ( finished ) this._changeFinished();
        this.updateDisplay();
    }

    _changeFinished() {
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

    updateDisplay() {
        return this;
    }

}

class BooleanController extends Controller {

    constructor( params ) {

        super( params, 'boolean', 'label' );

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

class ColorController extends Controller {

    constructor( params ) {

        super( params, 'color', 'label' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'color' );

        this.$widget.appendChild( this.$input );

        this.$input.addEventListener( 'change', () => {
            this.setValue( this.$input.value );
        } );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.value = this.getValue();
    }

}

class FunctionController extends Controller {

    constructor( params ) {

        super( params, 'function' );

        this.domElement.addEventListener( 'click', () => {
            this.getValue()();
        } );

    }

}

const map = ( v, a, b, c, d ) => ( v - a ) / ( b - a ) * ( d - c ) + c;

class NumberController extends Controller {

    constructor( params, min, max, step ) {

        super( params, 'number' );

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
            this._changeFinished();
        } );

        this.$input.addEventListener( 'keydown', e => {
            if ( e.keyCode === 13 ) {
                this._changeFinished();
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

        this.$slider.addEventListener( 'mousedown', e => {
            setValue( e.clientX );
            window.addEventListener( 'mousemove', mouseMove );
            window.addEventListener( 'mouseup', mouseUp );
        } );

        const mouseMove = e => {
            setValue( e.clientX );
        };

        const mouseUp = () => {
            this._changeFinished();
            window.removeEventListener( 'mousemove', mouseMove );
            window.removeEventListener( 'mouseup', mouseUp );
        };

        this.$slider.addEventListener( 'touchstart', e => {
            if ( e.touches.length > 1 ) return;
            setValue( e.touches[ 0 ].clientX );
            window.addEventListener( 'touchmove', touchMove );
            window.addEventListener( 'touchend', touchEnd );
        } );

        const touchMove = e => {
            setValue( e.touches[ 0 ].clientX );
        };

        const touchEnd = () => {
            this._changeFinished();
            window.removeEventListener( 'touchmove', touchMove );
            window.removeEventListener( 'touchend', touchEnd );
        };

        this.$widget.insertBefore( this.$slider, this.$input );

        this.domElement.classList.add( 'hasSlider' );

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

class OptionController extends Controller {

    constructor( params, options ) {

        super( params, 'option', 'label' );

        this.$select = document.createElement( 'select' );

        this.__values = Array.isArray( options ) ? options : Object.values( options );

        const names = Array.isArray( options ) ? options : Object.keys( options );

        names.forEach( ( name, index ) => {
            const $option = document.createElement( 'option' );
            $option.setAttribute( 'value', index );
            $option.innerHTML = name;
            this.$select.appendChild( $option );
        } );

        this.$select.addEventListener( 'change', () => {
            const index = parseInt( this.$select.value );
            this.setValue( this.__values[ index ] );
        } );

        this.$widget.appendChild( this.$select );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$select.value = this.__values.indexOf( this.getValue() );
    }

}

class StringController extends Controller {

    constructor( params ) {

        super( params, 'string', 'label' );

        this.$input = document.createElement( 'input' );
        this.$input.setAttribute( 'type', 'text' );

        this.$input.addEventListener( 'input', () => {
            this.setValue( this.$input.value, false );
        } );

        this.$input.addEventListener( 'blur', () => {
            this._changeFinished();
        } );

        this.$input.addEventListener( 'keydown', e => {
            if ( e.keyCode === 13 ) {
                this._changeFinished();
            }
        } );

        this.$widget.appendChild( this.$input );

        this.updateDisplay();

    }

    updateDisplay() {
        this.$input.value = this.getValue();
    }

}

const isFunction = val => typeof val === 'function';
const isString = val => typeof val === 'string';
const isBoolean = val => typeof val === 'boolean';
const isNumber = val => typeof val === 'number';
const isObject = val => Object( val ) === val;

function injectStyles( cssContent, fallbackURL ) {
    const injected = document.createElement( 'style' );
    injected.type = 'text/css';
    injected.innerHTML = cssContent;
    const head = document.getElementsByTagName( 'head' )[ 0 ];
    try {
        head.appendChild( injected );
    } catch ( e ) {

    }
}

var stylesGUI = "/* css vars */\n\n.gui {\n    --width: auto;\n    --background-color: #1a1a1a;\n    --color: #eee;\n    --font-family: system-ui;\n    --font-size: 11px;\n    --line-height: 11px;\n    --name-width: 90px;\n    --row-height: 24px;\n    --widget-height: 20px;\n    --padding: 6px;\n    --widget-color: #3c3c3c;\n    --number-color: #00adff;\n    --string-color: #1ed36f;\n    --widget-border-radius: 3px;\n}\n\n/* base styles */\n\n.gui, .gui * {\n    box-sizing: border-box;\n    margin: 0;\n}\n\n.gui {\n    width: var(--width);\n    font-size: var(--font-size);\n    line-height: var(--line-height);\n    font-family: var(--font-family);\n    font-weight: normal;\n    font-style: normal;\n    background-color: var(--background-color);\n    color: var(--color);\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n    text-align: left;\n}\n\n.gui.autoPlace {\n    position: fixed;\n    top: 0;\n    right: 20px;\n    z-index: 1001;\n    max-height: var(--window-height);\n}\n\n.gui.root {\n    overflow-y: scroll;\n}\n\n/* folders, children, titles */\n\n.gui .title {\n    height: var(--row-height);\n    padding: 0 var(--padding);\n    line-height: var(--row-height);\n    font-weight: bold;\n    border-bottom: 1px solid rgb(63, 63, 63);\n}\n\n.gui .children {\n    padding: var(--padding) 0;\n}\n\n.gui:not(.root) {\n    margin-left: var(--padding);\n}\n\n.gui.closed .children {\n    display: none;\n}\n\n/* global form control styles */\n\n.gui input {\n    border: 0;\n    outline: none;\n    font-size: var(--font-size);\n    border-radius: var(--widget-border-radius);\n}\n\n.gui select {\n    outline: none;\n}\n\n.gui input[type=text], \n.gui input[type=number] {\n    height: var(--widget-height);\n    font-family: var(--font-family);\n    line-height: var(--widget-height);\n    background: var(--widget-color);\n    color: var(--color);\n    padding: 0 2px;\n    width: 100%;\n}\n\n/* mobile styles */\n\n@media (max-width: 700px) {\n    .gui {\n        --name-width: 80px;\n        --row-height: 34px;\n        --widget-height: 28px;\n        --padding: 8px;\n    }\n    .gui.autoPlace {\n        right: auto;\n        left: 0;\n        width: 100%;\n        max-height: calc(var(--window-height) * .4);\n    }\n    .gui input, \n    .gui select {\n        /* prevents zoom on mobile safari */\n        font-size: 16px !important;\n    }\n}";

var stylesController = ".gui .controller {\n    padding: 0 var(--padding);\n    height: var(--row-height);\n    display: flex;\n    align-items: center;\n}\n\n.gui .controller.disabled {\n    opacity: 0.5;\n    pointer-events: none;\n}\n\n.gui .controller .name {\n    width: var(--name-width);\n    padding-right: var(--padding);\n    flex-shrink: 0;\n}\n\n.gui .controller .widget {\n    height: 100%;\n    width: 100%;\n    display: flex;\n    align-items: center;\n}";

var stylesBoolean = ".gui .controller.boolean {\n    cursor: pointer;\n}\n\n@media (hover: hover) {\n    .gui .controller.boolean:hover { \n        background: #000;\n    }\n}";

var stylesColor = ".gui .controller.color input {\n    background: var(--widget-color);\n    height: var(--widget-height);\n    width: 100%;\n    padding: 0;\n}";

var stylesNumber = ".gui .controller.number input {\n    color: var(--number-color);\n}\n\n.gui .controller.number input::-webkit-inner-spin-button, \n.gui .controller.number input::-webkit-outer-spin-button {\n    -webkit-appearance: none;\n}\n\n.gui .controller.number .slider {\n    width: 100%;\n    height: var(--widget-height);\n    margin-right: calc( var(--padding) - 2px);\n    background-color: var(--widget-color);\n    border-radius: var(--widget-border-radius);\n    /* border: 1px solid #333; */\n    overflow: hidden;\n}\n\n.gui .controller.number .fill {\n    height: 100%;\n    background-color: var(--number-color);\n    /* background-color: #666; */\n}\n\n.gui .controller.number.hasSlider input[type=number] {\n    width: 30%;\n}\n\n/* \n.gui .controller.number.hasSlider .name { \n  position: absolute;\n  pointer-events: none;\n  width: 80%;\n  padding-left: var(--padding);\n} \n\n.gui .controller.number.hasSlider input[type=number] {\n  width: 18%;\n}*/\n";

var stylesFunction = ".gui .controller.function {\n    cursor: pointer;\n}\n\n@media (hover: hover) {\n    .gui .controller.function:hover { \n        background: #000;\n    }\n}";

var stylesOption = "";

var stylesString = ".gui .controller.string input {\n    color: var(--string-color);\n}";

injectStyles( [
    stylesGUI,
    stylesController,
    stylesBoolean,
    stylesColor,
    stylesNumber,
    stylesFunction,
    stylesOption,
    stylesString
].join( '\n' ));

class GUI {

    constructor( {
        parent,
        name = 'Controls',
        autoPlace = true,
        width = 245
    } = {} ) {

        this.parent = parent;
        this.children = [];

        this.domElement = document.createElement( 'div' );
        this.domElement.classList.add( 'gui' );

        this.$children = document.createElement( 'div' );
        this.$children.classList.add( 'children' );

        this.$title = document.createElement( 'div' );
        this.$title.classList.add( 'title' );
        this.$title.addEventListener( 'click', () => {
            this.__closed ? this.open() : this.close();
        } );

        if ( this.parent ) {

            this.parent.children.push( this );
            this.parent.$children.appendChild( this.domElement );

        } else {

            this.width( width );
            this.domElement.classList.add( 'root' );

            if ( autoPlace ) {

                this.domElement.classList.add( 'autoPlace' );
                document.body.appendChild( this.domElement );

            }

        }

        this.domElement.appendChild( this.$title );
        this.domElement.appendChild( this.$children );

        this.onResize = this.onResize.bind( this );
        this.onResize();

        window.addEventListener( 'resize', this.onResize );

        this.name( name );

    }

    destroy() {

        this.children.forEach( c => c.destroy() );

        if ( this.parent ) {
            this.parent.children.splice( this.parent.children.indexOf( this ) );
            this.parent.$children.removeChild( this.domElement );
        }

        window.removeEventListener( 'resize', this.onResize );

    }

    add( object, property, $1, $2, $3 ) {

        if ( !object.hasOwnProperty( property ) ) {
            throw new Error( `${object} has no property called "${property}"` );
        }

        const initialValue = object[ property ];

        if ( initialValue === undefined ) {
            throw new Error( `Property "${property}" of ${object} is undefined.` );
        }

        const params = { object, property, parent: this };

        let controller;

        if ( Array.isArray( $1 ) || isObject( $1 ) ) {

            controller = new OptionController( params, $1 );

        } else if ( isBoolean( initialValue ) ) {

            controller = new BooleanController( params );

        } else if ( isString( initialValue ) ) {

            controller = new StringController( params );

        } else if ( isFunction( initialValue ) ) {

            controller = new FunctionController( params );

        } else if ( isNumber( initialValue ) ) {

            controller = new NumberController( params, $1, $2, $3 );

        } else {

            throw new Error( `No suitable controller type for ${initialValue}` );

        }

        return controller;

    }

    addFolder( name ) {
        return new GUI( { name, parent: this } );
    }

    addColor( object, property ) {
        return new ColorController( { object, property, parent: this } );
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

    onResize() {
        this.domElement.style.setProperty( '--window-height', window.innerHeight + 'px' );
    }

}

export { GUI };
