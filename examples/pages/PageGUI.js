import { GUI } from '../../build/lil-gui.module.js';

export default class PageGUI extends GUI {

	constructor( { pages, updateURL = true, queryMode = false, queryKey = 'page' } ) {

		super();

		this._pages = pages;
		this._pageNames = Object.keys( this._pages );
		this._defaultPage = this._pageNames[ 0 ];

		this.updateURL = updateURL;
		this.queryMode = queryMode;
		this.queryKey = queryKey;
		this.queryRegExp = new RegExp( queryKey + '(=([^&]+))?', 'g' );

		this._page = this._getStartPage();

		this._pageController = this.add( this, 'page', this._pageNames );

		this._pages[ this._page ].call( this, this );

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

			const newQuery = this.queryKey + '=' + encodeURIComponent( this.page );
			let query = url;

			if ( location.search ) {
				if ( location.search.match( this.queryRegExp ) ) {
					query += location.search.replace( this.queryRegExp, newQuery );
				} else {
					query += location.search + newQuery;
				}
			} else {
				query += '?' + newQuery;
			}

			return query + location.hash;

		} else {

			return url + location.search + '#' + encodeURIComponent( this.page );

		}

	}

}
