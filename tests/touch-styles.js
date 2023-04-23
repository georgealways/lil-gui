import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	let gui = new GUI();
	assert( gui.domElement.classList.contains( 'allow-touch-styles' ), 'touch styles enabled by default' );

	gui = gui.addFolder();
	assert( gui.domElement.classList.contains( 'allow-touch-styles' ), 'folders inherit touch styles' );

	gui = new GUI( { touchStyles: false } );
	assert( !gui.domElement.classList.contains( 'allow-touch-styles' ), 'touch styles can be disabled' );

	gui = gui.addFolder();
	assert( !gui.domElement.classList.contains( 'allow-touch-styles' ), 'folders inherit disabled touch styles' );

};
