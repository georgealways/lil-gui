import assert from 'assert';
import GUI from '..';

export default () => {

	// sanity check to make sure this isn't throwing errors
	assert.doesNotThrow( () => new GUI().openAnimated() );

};
