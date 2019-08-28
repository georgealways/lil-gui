export default class Header {

	constructor( parent, name ) {

		this.parent = parent;

		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'header' );

		this.parent.children.push( this );
		this.parent.$children.appendChild( this.domElement );

		this.name( name );

	}

	name( name ) {
		this._name = name;
		this.domElement.innerHTML = name;
	}

	destroy() {
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

}