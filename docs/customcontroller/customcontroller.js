import GUI from '../lil-gui.module.js';

import CubicBezier from './CubicBezier.js';
import CubicBezierController from './CubicBezierController.js';

const params = {
	curve1: new CubicBezier( 0.11624221844934918, 0.27560837577815506, 0.4204867006225241, 0.9927560837577816 ),
	duration: 1
};

const gui = new GUI();

new CubicBezierController( gui, params, 'curve1' );
gui.add( params, 'duration', 0, 5 );

const div = document.createElement( 'div' );
Object.assign( div.style, {
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
	background: 'gold'
} );
document.body.appendChild( div );

function animate() {
	requestAnimationFrame( animate );
	const time = ( +new Date() ) / ( params.duration * 1000 ) % 1;
	const val = params.curve1.interpolate( time );
	div.style.height = val * 100 + '%';
}

animate();
