import assert from 'assert';
import GUI from '..';

export default () => {

	const gui = new GUI();

	gui.add( { x: 0 }, 'x' );
	gui.add( { x: 0 }, 'x' );
	gui.add( { x: 0 }, 'x' );

	const folder1 = gui.addFolder( 'title' );
	folder1.add( { x: 0 }, 'x' );
	folder1.add( { x: 0 }, 'x' );
	folder1.add( { x: 0 }, 'x' );

	const folder2 = folder1.addFolder( 'title' );
	folder2.add( { x: 0 }, 'x' );
	folder2.add( { x: 0 }, 'x' );
	folder2.add( { x: 0 }, 'x' );

	const folder3 = gui.addFolder( 'title' );
	folder3.add( { x: 0 }, 'x' );
	folder3.add( { x: 0 }, 'x' );

	const controllersVisited = [];
	const visit = c => {
		assert.strictEqual( controllersVisited.indexOf( c ), -1, 'visits each controller exactly once' );
		controllersVisited.push( c );
	};

	controllersVisited.length = 0;
	gui.controllersRecursive().forEach( visit );
	assert.strictEqual( controllersVisited.length, 11, 'recursive defaults to true' );

	controllersVisited.length = 0;
	gui.controllers.forEach( visit );
	assert.strictEqual( controllersVisited.length, 3, 'recursive' );

	controllersVisited.length = 0;
	folder1.controllers.forEach( visit );
	assert.strictEqual( controllersVisited.length, 3 );

	controllersVisited.length = 0;
	folder1.controllersRecursive().forEach( visit );
	assert.strictEqual( controllersVisited.length, 6 );

	controllersVisited.length = 0;
	folder2.controllers.forEach( visit );
	assert.strictEqual( controllersVisited.length, 3 );

	controllersVisited.length = 0;
	folder2.controllersRecursive().forEach( visit );
	assert.strictEqual( controllersVisited.length, 3 );

	controllersVisited.length = 0;
	folder3.controllers.forEach( visit );
	assert.strictEqual( controllersVisited.length, 2 );

	controllersVisited.length = 0;
	folder3.controllersRecursive().forEach( visit );
	assert.strictEqual( controllersVisited.length, 2 );

	controllersVisited.length = 0;
	gui.foldersRecursive().forEach( visit );
	assert.strictEqual( controllersVisited.length, 3 );

	controllersVisited.length = 0;
	gui.folders.forEach( visit );
	assert.strictEqual( controllersVisited.length, 2 );

};
