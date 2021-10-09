import GUI from '../../dist/lil-gui.esm.js';

import XYController from './XYController.js';

const params = {
	xy: { x: 0.5, y: 0.5 }
};

const display = document.createElement( 'div' );
document.body.appendChild( display );

const gui = new GUI();

new XYController( gui, params, 'xy' ).onChange( update );
update();

function update() {
	display.innerHTML = JSON.stringify( params.xy );
}