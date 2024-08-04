// shim just enough browser stuff to run in node

class Element {

	constructor( tagName, parentElement ) {
		this.classList = { add() {}, remove() {}, toggle() {} };
		this.style = { setProperty() {} };
		this.parentElement = parentElement;
		this.tagName = tagName;
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

	$callEventListener( name, event = {}, simulatePropagation = true ) {

		const listeners = this.__eventListeners[ name ];

		let propagate = true;

		event.target = event.target || this;

		if ( !event.stopPropagation ) {
			event.stopPropagation = () => { propagate = false; };
		}

		if ( !event.preventDefault ) {
			event.preventDefault = () => {};
		}

		listeners?.forEach( l => l( event ) );

		if ( !simulatePropagation ) return;

		let parent = this.parentElement;
		while ( propagate && parent ) {
			parent.$callEventListener( name, event, false );
			parent = parent.parentElement;
		}

	}

	appendChild( element ) {
		element.parentElement = this;
	}
	removeChild( element ) {
		element.parentElement = undefined;
	}
	replaceChildren() {}
	insertBefore() {}
	setAttribute( attr, val ) {
		this[ attr ] = val;
	}
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
	constructor( tagName, parentElement ) {
		super( tagName, parentElement );
		if ( tagName === 'INPUT' ) {
			this.setAttribute( 'type', 'text' );
		}
	}
	blur() { this.$callEventListener( 'blur' ); }
	focus() { this.$callEventListener( 'focus' ); }
	select() {}
}

function createElement( tag ) {
	const tagName = tag.toUpperCase();
	if ( [ 'input', 'select', 'button' ].includes( tag ) ) {
		return new InputElement( tagName );
	}
	return new Element( tagName );
}

export function initShim() {
	global.window = new Element();
	global.window.matchMedia = () => { return { matches: true }; };
	global.requestAnimationFrame = fnc => setTimeout( fnc, 100 / 6 );
	global.cancelAnimationFrame = id => clearTimeout( id );

	const document = new Element( 'DOCUMENT', window );
	document.head = new Element( 'HEAD', document );
	document.body = new Element( 'BODY', document );
	document.createElement = createElement;

	global.document = document;
}
