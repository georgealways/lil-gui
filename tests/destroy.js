import assert from 'assert';
import GUI from '..';

import spy from './utils/spy';

export default () => {

	const gui = new GUI();
	gui.add( { x: 0 }, 'x' );
	gui.add( { x: 0 }, 'x' );
	gui.add( { x: 0 }, 'x' );

	const folder1 = gui.addFolder( 'folder' );
	folder1.add( { x: 0 }, 'x' );
	folder1.add( { x: 0 }, 'x' );

	const folder2 = folder1.addFolder( 'folder' );
	folder2.add( { x: 0 }, 'x' );
	folder2.add( { x: 0 }, 'x' );

	let childCount = 0;
	let destroyCount = 0;

	gui.children.forEach( spyDestroyRecursive );

	gui.destroy();

	assert.strictEqual( destroyCount, childCount, 'destroy was called exactly once on each child' );
	assert.strictEqual( gui.children.length, 0, 'children is empty' );
	assert.strictEqual( folder1.children.length, 0, 'children is empty' );
	assert.strictEqual( folder2.children.length, 0, 'children is empty' );

	function spyDestroyRecursive( child ) {
		childCount++;
		spy( child, 'destroy', () => destroyCount++ );
		if ( child.children ) {
			child.children.forEach( spyDestroyRecursive );
		}
	}

};
