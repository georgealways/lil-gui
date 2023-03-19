import assert from 'assert';
import GUI from '../dist/lil-gui.esm.js';

export default () => {

	const tracker = new assert.CallTracker();

	let _args, _this;

	const rootHandler = tracker.calls( function( ...args ) {
		_args = args;
		_this = this;
	}, 2 );

	const root = new GUI();

	const folder1 = root.addFolder();
	const folder2 = root.addFolder();

	root.onOpenClose( rootHandler );

	folder1.close();
	assert.strictEqual( _args[ 0 ], folder1 );
	assert.strictEqual( _this, root );

	folder2.close();
	assert.strictEqual( _args[ 0 ], folder2 );
	assert.strictEqual( _this, root );

	// ignore redundant calls
	folder2.close();

	tracker.verify();

};

