import { GUI } from '../build/gui.module.js';

const debounce = function( fnc ) {
	return fnc; // todo
};

class GUISwitcher {
	constructor() {
		this.elements = {};
		this.onScroll = this.onScroll.bind( this );
		this.onResize = this.onResize.bind( this );
		this.activeElement = undefined;
		this.gui = undefined;
	}
	init() {
		window.addEventListener( 'scroll', this.onScroll, { passive: true } );
		window.addEventListener( 'resize', debounce( this.onResize ) );
		this.onResize();
		this.onScroll();
	}
	register( id, callback ) {
		const domElement = document.getElementById( id );
		this.elements[ id ] = {
			domElement,
			callback,
			top: undefined
		};
	}
	onScroll() {
		let candidate;
		for ( let id in this.elements ) {
			const el = this.elements[ id ];
			const top = el.top - window.scrollY;
			if ( top < window.innerHeight * 0.5 ) {
				candidate = el;
			}
		}
		if ( candidate && candidate !== this.activeElement ) {
			this.setActiveElement( candidate );
		}
	}
	setActiveElement( el ) {
		if ( this.gui !== undefined ) {
			this.gui.destroy();
		}
		this.activeElement = el;
		this.gui = this.activeElement.callback( this.gui );
	}
	onResize() {
		for ( let id in this.elements ) {
			const el = this.elements[ id ];
			el.top = el.domElement.offsetTop;
		}
	}
}

const switcher = new GUISwitcher();

switcher.register( 'div1', () => {
	const gui = new GUI( { name: 'example1' } );
	gui.add( { div: 1 }, 'div' );
	return gui;
} );

switcher.register( 'div2', () => {
	const gui = new GUI( { name: 'example2' } );
	gui.add( { div: 2 }, 'div' );
	gui.add( { div: 2 }, 'div' );
	return gui;
} );

switcher.register( 'div3', () => {
	const gui = new GUI( { name: 'example3' } );
	gui.add( { div: 3 }, 'div' );
	gui.add( { div: 3 }, 'div' );
	gui.add( { div: 3 }, 'div' );
	return gui;
} );

switcher.init();