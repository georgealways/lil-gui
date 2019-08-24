import GUIItem from './GUIItem.js';

export default class Header extends GUIItem {

	constructor( parent, name ) {

		super( parent );

		this.domElement.classList.add( 'header' );

		this.name( name );

	}

	name( name ) {
		this.__name = name;
		this.domElement.innerHTML = name;
	}

}