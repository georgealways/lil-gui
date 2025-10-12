import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	// root GUI should have expected classes by default
	const root = new GUI();
	const cl = root.domElement.classList;

	assert( cl.contains( 'lil-gui' ), 'root has lil-gui class' );
	assert( cl.contains( 'lil-root' ), 'root has lil-root class' );
	assert( cl.contains( 'lil-allow-touch-styles' ), 'root allows touch styles by default' );
	assert( cl.contains( 'lil-auto-place' ), 'root is auto-placed by default' );
	assert( cl.contains( 'autoPlace' ), 'root retains deprecated autoPlace class for compatibility' );

	// title and children elements should have expected classes
	assert( root.$title.classList.contains( 'lil-title' ), 'title has lil-title class' );
	assert( root.$children.classList.contains( 'lil-children' ), 'children has lil-children class' );

	// closed state toggles lil-closed class
	root.close();
	assert( cl.contains( 'lil-closed' ), 'root has lil-closed after close()' );
	root.open();
	assert( !cl.contains( 'lil-closed' ), 'root does not have lil-closed after open()' );

	// child folders should not get root-only/auto-place classes
	const folder = root.addFolder( 'Folder' );
	const fcl = folder.domElement.classList;
	assert( fcl.contains( 'lil-gui' ), 'folder has lil-gui class' );
	assert( !fcl.contains( 'lil-root' ), 'folder does not have lil-root class' );
	assert( !fcl.contains( 'lil-auto-place' ) && !fcl.contains( 'autoPlace' ), 'folder is not auto-placed' );

};

