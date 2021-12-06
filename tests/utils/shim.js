// shim just enough browser stuff to run in node

// collects event listeners by name and exposes them for unit tests
class EventTarget {

	constructor() {
		this.__eventListeners = {};
	}

	addEventListener( name, callback ) {
		if ( !this.__eventListeners[ name ] ) {
			this.__eventListeners[ name ] = [];
		}
		this.__eventListeners[ name ].push( callback );
	}

	removeEventListener( name, callback ) {
		const listeners = this.__eventListeners[ name ];
		if ( !listeners ) return;
		const index = listeners.indexOf( callback );
		if ( index === -1 ) return;
		listeners.splice( index, 1 );
	}

	$callEventListener( name, event = {} ) {
		const listeners = this.__eventListeners[ name ];
		if ( !listeners ) return;
		event.preventDefault = function() {};
		event.stopPropagation = function() {};
		listeners.forEach( l => l( event ) );
	}

}

class Element extends EventTarget {
	constructor() {
		super();
		this.classList = { add() {}, remove() {}, toggle() {} };
		this.style = { setProperty() {} };
		this.parentElement = { removeChild() {} };
	}
	appendChild() {}
	removeChild() {}
	insertBefore() {}
	setAttribute() {}
	removeAttribute() {}
	toggleAttribute() {}
	getBoundingClientRect() {

		const rect = {
			left: 10.1,
			top: 9.9,
			width: 200,
			height: 100
		};

		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;

		return rect;

	}
	querySelector() {
		return new Element();
	}
}

class InputElement extends Element {
	blur() { this.$callEventListener( 'blur' ); }
	focus() { this.$callEventListener( 'focus' ); }
	select() {}
}

function createElement( tag ) {
	if ( [ 'input', 'select', 'button' ].includes( tag ) ) {
		return new InputElement();
	}
	return new Element();
}

global.window = new EventTarget();
global.requestAnimationFrame = fnc => setTimeout( fnc, 100 / 6 );
global.cancelAnimationFrame = id => clearTimeout( id );

const document = new Element();
document.head = new Element();
document.body = new Element();
document.createElement = createElement;

global.document = document;
