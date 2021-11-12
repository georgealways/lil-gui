import assert from 'assert';
import GUI from '..';

export default () => {

	assert.doesNotThrow( () => new GUI().openAnimated() );

};
