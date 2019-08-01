class Controller {

    constructor( parent, object, property, className ) {

        this.parent = parent;

        this.object = object;
        this.property = property;

        this.domElement = document.createElement( 'div' );
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
        if ( this.__onChange !== undefined ) this.__onChange.call( this, value );
        if ( finished ) this._callOnFinishedChange();
        this.updateDisplay();
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

    updateDisplay() {
        return this;
    }

}

class BooleanController extends Controller {

    constructor( parent, object, property ) {

        super( parent, object, property, 'boolean' );

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

    constructor( parent, object, property ) {

        super( parent, object, property, 'color' );

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

    constructor( parent, object, property ) {

        super( parent, object, property, 'function' );

        this.domElement.addEventListener( 'click', () => {
            this.getValue()();
        } );

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
            setValue( e.clientX);
            window.addEventListener( 'mousemove', mouseMove );
            window.addEventListener( 'mouseup', mouseUp );
        } );

        const mouseMove = e => {
            setValue( e.clientX);
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
                setValue( e.touches[ 0 ].clientX);
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

class OptionController extends Controller {

    constructor( parent, object, property, options ) {

        super( parent, object, property, 'option' );

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
        console.warn( `Failed to inject styles. Manually include the stylesheet at ${fallbackURL}` );
    }
}

var styles = ".gui {\n\t--width: auto;\n\t--background-color: #1a1a1a;\n\t--color: #eee;\n\t--font-family: Arial, sans-serif;\n\t--font-size: 11px;\n\t--line-height: 11px;\n\t--name-width: 35%;\n\t--row-height: 24px;\n\t--widget-height: 20px;\n\t--widget-padding: 0 2px;\n\t--widget-border-radius: 3px;\n\t--widget-color: #3c3c3c;\n\t--number-color: #00adff;\n\t--string-color: #1ed36f;\n\t--padding: 6px;\n\t--scrollbar-width: 5px;\n\t--title-color: #111;\n}\n\n.gui {\n\twidth: var(--width);\n\tfont-size: var(--font-size);\n\tline-height: var(--line-height);\n\tfont-family: var(--font-family);\n\tfont-weight: normal;\n\tfont-style: normal;\n\tbackground-color: var(--background-color);\n\tcolor: var(--color);\n\t-webkit-font-smoothing: antialiased;\n\t-moz-osx-font-smoothing: grayscale;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\ttext-align: left;\n}\n\n.gui, .gui * {\n\tbox-sizing: border-box;\n\tmargin: 0;\n}\n\n.gui.autoPlace {\n\tposition: fixed;\n\ttop: 0;\n\tright: 15px;\n\tz-index: 1001;\n}\n\n.gui.autoPlace > .children {\n\toverflow-y: auto;\n\tmax-height: calc( var(--window-height) - var(--row-height) );\n}\n\n.gui.autoPlace > .children::-webkit-scrollbar { \n\twidth: var(--scrollbar-width);\n\tbackground: var(--background-color);\n}\n\n.gui.autoPlace > .children::-webkit-scrollbar-corner {\n\theight: 0;\n\tdisplay: none;\n}\n\n.gui.autoPlace > .children::-webkit-scrollbar-thumb {\n\tborder-radius: var(--scrollbar-width);\n\tbackground: var(--widget-color);\n}\n\n@media (max-width: 600px) {\n\t.gui {\n\t\t--row-height: 38px;\n\t\t--widget-height: 32px;\n\t\t--padding: 8px;\n\t\t--font-size: 16px;\n\t}\n\t.gui.autoPlace {\n\t\tright: auto;\n\t\ttop: auto;\n\t\tbottom: 0;\n\t\tleft: 0;\n\t\twidth: 100%;\n\t}\n\t.gui.autoPlace > .children { \n\t\tmax-height: 200px;\n\t}\n}\n\n/* \"widgets\" */\n\n.gui input {\n\tborder: 0;\n\toutline: none;\n\tfont-family: var(--font-family);\n\tfont-size: var(--font-size);\n}\n\n.gui select {\n\toutline: none;\n\tfont-family: var(--font-family);\n\tfont-size: var(--font-size);\n}\n\n.gui input[type=text], \n.gui input[type=number] {\n\tborder-radius: var(--widget-border-radius);\n\theight: var(--widget-height);\n\tline-height: var(--widget-height);\n\tbackground: var(--widget-color);\n\tpadding: var(--widget-padding);\n\tcolor: var(--color);\n\twidth: 100%;\n}\n\n@media (hover: hover) { \n\t.gui input[type=text]:hover,\n\t.gui input[type=number]:hover {\n\t\tbackground-color: red;\n\t}\n}\n\n.gui input[type=text]:focus,\n.gui input[type=number]:focus { \n\tbackground-color: blue;\n\tcolor: var(--color);\n}\n\n.gui input[type=color] {\n\tborder-radius: var(--widget-border-radius);\n\tbackground: var(--widget-color);\n\theight: var(--widget-height);\n\twidth: 100%;\n\tpadding: 0;\n}\n\n.gui input[type=text] {\n\tcolor: var(--string-color);\n}\n\n.gui input[type=number] {\n\tcolor: var(--number-color);\n}\n\n.gui input[type=number]::-webkit-inner-spin-button, \n.gui input[type=number]::-webkit-outer-spin-button {\n\t-webkit-appearance: none;\n}\n\n/* titles and folders */\n\n.gui .title {\n\theight: var(--row-height);\n\tpadding: 0 var(--padding);\n\tline-height: var(--row-height);\n\tfont-weight: bold;\n\tdisplay: flex;\n\talign-items: center;\n\tcursor: pointer;\n}\n\n.gui.root > .title { \n\tbackground: var(--title-color);\n}\n\n.gui .title:before { \n\tcontent: '▾';\n\twidth: 1em;\n}\n\n.gui.closed .children {\n\tdisplay: none;\n}\n\n.gui.closed .title:before {\n\tcontent: '▸';\n}\n\n.gui .children {\n\tpadding: var(--padding) 0;\n}\n\n.gui:not(.root) { \n\tmargin: var(--padding) 0;\n}\n\n.gui:not(.root):first-child {\n\tmargin-top: 0;\n}\n\n.gui:not(.root) .children { \n\tmargin-left: var(--padding);\n\tborder-left: 2px solid #444;\n}\n\n/* controllers */\n\n.gui .controller {\n\tpadding: 0 var(--padding);\n\theight: var(--row-height);\n\tdisplay: flex;\n\talign-items: center;\n}\n\n.gui .controller.disabled {\n\topacity: 0.5;\n\tpointer-events: none;\n}\n\n.gui .controller .name {\n\twidth: var(--name-width);\n\tpadding-right: var(--padding);\n\tflex-shrink: 0;\n}\n\n.gui .controller .widget {\n\theight: 100%;\n\twidth: 100%;\n\tdisplay: flex;\n\talign-items: center;\n}\n\n/* number */\n\n.gui .controller.number .slider {\n\twidth: 100%;\n\theight: var(--widget-height);\n\tmargin-right: calc( var(--padding) - 2px);\n\tbackground-color: var(--widget-color);\n\tborder-radius: var(--widget-border-radius);\n\toverflow: hidden;\n}\n\n.gui .controller.number .fill {\n\theight: 100%;\n\tbackground-color: var(--number-color);\n}\n\n.gui .controller.number.hasSlider input[type=number] {\n\twidth: 30%;\n}\n\n/* big slider experiment */\n\n.gui .controller.number.hasSlider { \n\tposition: relative;\n}\n\n.gui .controller.number.hasSlider .name { \n\tposition: absolute;\n\tpointer-events: none;\n\twidth: auto;\n\tpadding-left: var(--padding);\n} \n.gui .controller.number.hasSlider input[type=number] {\n\twidth: 18%;\n}";

injectStyles( styles, 'https://github.com/abc/xyz/blob/master/build/xyz.css' );

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

        if ( this.parent ) {
            this.parent.children.splice( this.parent.children.indexOf( this ) );
            this.parent.$children.removeChild( this.domElement );
        }

        if ( this._onResize ) {
            window.removeEventListener( 'resize', this._onResize );
        }

    }

    add( object, property, $1, $2, $3 ) {

        if ( !object.hasOwnProperty( property ) ) {
            throw new Error( `${object} has no property called "${property}"` );
        }

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
