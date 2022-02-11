/* global Stats */
import GUI from '../../dist/lil-gui.esm.js';

const params = {
	count: parseInt( location.search.substring( 1 ) ) || 10,
	animateAll: false,
	update() {

		let diff = params.count - folder.controllers.length;

		for ( ; diff < 0; diff++ ) {
			folder.controllers.at( -1 ).destroy();
		}

		for ( ; diff > 0; diff-- ) {
			const i = folder.controllers.length % dummyControllers.length;
			const controller = dummyControllers[ i ]();
			controller.listen();
		}

		folder.title( params.count + ' Listening Controllers' );

		history.replaceState( {}, '', '?' + params.count );

	}
};

const dummyControllers = [
	() => folder.add( dummyParams, 'options', { Small: 1, Medium: 10, Large: 100 } ),
	() => folder.add( dummyParams, 'boolean' ),
	() => folder.add( dummyParams, 'string' ),
	() => folder.add( dummyParams, 'number', 0, 1 ),
	() => folder.addColor( dummyParams, 'color' )
];

const dummyParams = {
	options: 10,
	boolean: true,
	string: 'lil-gui',
	number: 0,
	color: { r: 1, g: 0, b: 1 }
};

let frame = 0;
function animate() {

	stats.end();
	stats.begin();

	if ( params.animateAll ) {

		const time = Date.now() / 1000;

		dummyParams.options = [ 1, 10, 100 ][ frame % 3 ];
		dummyParams.boolean = frame % 2;
		dummyParams.string = time.toString();
		dummyParams.number = time % 1;

		dummyParams.color.r = Math.sin( time / 2 ) / 2 + 0.5;
		dummyParams.color.g = Math.sin( time / 3 ) / 2 + 0.5;
		dummyParams.color.b = Math.sin( time / 5 ) / 2 + 0.5;

		frame++;

	}

	requestAnimationFrame( animate );

}

const gui = new GUI();

gui.add( params, 'animateAll' );
gui.add( params, 'count' ).min( 0 );
gui.add( params, 'update' );

const folder = gui.addFolder();

const stats = new Stats();
document.body.appendChild( stats.dom );

params.update();
animate();
