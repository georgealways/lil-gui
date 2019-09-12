import GUI from '../../build/lil-gui.module.js';

/**
 * A PageGUI has a controller that lets you change between "pages" of controllers
 * and updates the URL when the page changes.
 */
export default class PageGUI extends GUI {

	constructor( pages, {
		updateURL = true,
		hideDefault = true,
		queryMode = false,
		queryKey = 'page',
		queryOpen = false,
		pedanticURL = false
	} = {} ) {

		super();

		this._pages = pages;
		this._pageNames = Object.keys( this._pages );
		this._defaultPage = this._pageNames[ 0 ];

		this.updateURL = updateURL;
		this.hideDefault = hideDefault;
		this.queryMode = queryMode;
		this.queryKey = queryKey;
		this.queryOpen = queryOpen;

		this.queryRegExp = new RegExp( this.queryKey + '(=([^&]+))?', 'g' );

		if ( this.queryMode && this.queryOpen ) {
			this.close();
		}

		this._page = this._getStartPage();

		this._pageController = this.add( this, 'page', this._pageNames );

		this._pages[ this._page ].call( this, this );

		if ( this.updateURL && this.queryMode && this.queryOpen ) {
			let closed = this._closed;
			Object.defineProperty( this, '_closed', {
				get() { return closed; },
				set( v ) {
					closed = v;
					history.replaceState( null, null, this._pageToURL() );
				}
			} );
		}

		if ( pedanticURL ) {
			const expectedURL = this._pageToURL();
			if ( location.href !== expectedURL ) {
				// eslint-disable-next-line no-console
				console.warn( `Replacing actual location ${location.href} with expected URL ${expectedURL}` );
				history.replaceState( null, null, expectedURL );
			}
		}

	}

	set page( v ) {

		this._page = v;

		this.children
			.filter( c => c !== this._pageController )
			.forEach( c => c.destroy() );

		this._pages[ this._page ].call( this, this );

		if ( this.updateURL ) {
			history.replaceState( null, null, this._pageToURL() );
		}

	}

	get page() {

		return this._page;

	}

	_getStartPage() {

		let startPage = this._defaultPage;

		if ( this.queryMode ) {

			location.search.replace( this.queryRegExp, ( _0, _1, $2 ) => {
				const arg = decodeURIComponent( $2 );
				if ( arg in this._pages ) {
					startPage = arg;
				}
				if ( this.queryOpen ) {
					this.open();
				}
			} );

		} else {

			const hash = decodeURIComponent( location.hash.substring( 1 ) );
			if ( hash in this._pages ) {
				startPage = hash;
			}

		}

		return startPage;

	}

	_pageToURL() {

		const url = location.origin + location.pathname;

		if ( this.queryMode ) {

			let query = this.queryKey + '=' + encodeURIComponent( this.page );

			if ( this.queryOpen && this._closed ) {
				query = '';
			} else if ( this.hideDefault && this.page === this._defaultPage ) {
				query = this.queryKey;
			}

			let search = '';

			if ( location.search ) {
				if ( location.search.match( this.queryRegExp ) ) {
					search = location.search.replace( this.queryRegExp, query );
					if ( search === '?' ) search = '';
				} else {
					search = location.search + query;
				}
			} else if ( query ) {
				search = '?' + query;
			}

			return url + search + location.hash;

		} else {

			let hash = '#' + encodeURIComponent( this.page );

			if ( this.hideDefault && this.page === this._defaultPage ) {

				return url + location.search;

			}

			return url + location.search + hash;

		}

	}

}
