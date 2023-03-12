import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	{
		const gui = new GUI();

		const folder1 = gui.addFolder();
		const folder2 = gui.addFolder();
		const folder3 = folder2.addFolder();

		assert.strictEqual( gui._closed, false, 'closeFolders does not affect root' );
		assert.strictEqual( folder1._closed, false, 'folders are open by default' );
		assert.strictEqual( folder2._closed, false, 'folders are open by default' );
		assert.strictEqual( folder3._closed, false, 'folders are open by default' );
	}

	{
		const gui = new GUI( { closeFolders: true } );

		const folder1 = gui.addFolder();
		const folder2 = gui.addFolder();
		const folder3 = folder2.addFolder();

		assert.strictEqual( gui._closed, false, 'closeFolders does not affect root' );
		assert.strictEqual( folder1._closed, true, 'closeFolders closes folders by default' );
		assert.strictEqual( folder2._closed, true, 'closeFolders closes folders by default' );
		assert.strictEqual( folder3._closed, true, 'closeFolders closes folders by default' );
	}

};
