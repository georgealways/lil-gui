import assert from 'assert';
import GUI from '..';

export default () => {

	// make some objects, remember their original state

	const obj1 = {
		boolean: false,
		color1: '#aa00ff',
		color2: [ 1 / 3, 2 / 3, 1 ],
		color3: { r: 2 / 3, g: 1, b: 1 / 3 },
		color4: [ 0, 170, 255 ],
		color5: { r: 10, g: 21, b: 34 },
		func: function() { },
		number: 0,
		options: 'a',
		string: 'foo'
	};

	const obj2 = {
		string: 'collision test',
		number: 2
	};

	const obj1Tester = new Tester( obj1 );
	const obj2Tester = new Tester( obj2 );

	const gui = new GUI();

	// add every controller type to the gui
	const booleanCtrl = gui.add( obj1, 'boolean' );
	const color1Ctrl = gui.addColor( obj1, 'color1' );
	const color2Ctrl = gui.addColor( obj1, 'color2' );
	const color3Ctrl = gui.addColor( obj1, 'color3' );
	const color4Ctrl = gui.addColor( obj1, 'color4', 255 );
	const color5Ctrl = gui.addColor( obj1, 'color5', 255 );
	const numberCtrl = gui.add( obj1, 'number' );
	const optionsCtrl = gui.add( obj1, 'options', [ 'a', 'b', 'c' ] );
	const stringCtrl = gui.add( obj1, 'string' );

	// and add some more to folders to test recursive
	const folder = gui.addFolder( 'Folder' );
	const folderString = folder.add( obj2, 'string' );
	const folderNumber = folder.add( obj2, 'number' );

	// change it via gui
	booleanCtrl.setValue( true );
	color1Ctrl._setValueFromHexString( '#0fac8f' );
	color2Ctrl._setValueFromHexString( '#3fccea' );
	color3Ctrl._setValueFromHexString( '#219c3a' );
	color4Ctrl._setValueFromHexString( '#0033aa' );
	color5Ctrl._setValueFromHexString( '#88fac3' );
	numberCtrl.setValue( 1 );
	optionsCtrl.setValue( 'c' );
	stringCtrl.setValue( 'bar' );

	// also change some nested ones to test recursive
	folderString.setValue( 'somethin' );
	folderNumber.setValue( 200 );

	// remember new state
	obj1Tester.modified = deepClone( obj1 );
	obj2Tester.modified = deepClone( obj2 );

	// save
	const saved = gui.save();

	// reset gui to original state
	gui.reset();

	// current values should be same as original
	obj1Tester.compare( obj1Tester.originalDeep );
	obj2Tester.compare( obj2Tester.originalDeep );

	// import
	gui.load( saved );

	// current values should be same as modified
	obj1Tester.compare( obj1Tester.modified );
	obj2Tester.compare( obj2Tester.modified );

	function Tester( obj ) {

		this.originalDeep = deepClone( obj );
		const originalShallow = Object.assign( {}, obj );

		// assert matches original state
		// assert object types retain reference
		this.compare = state => {
			for ( let key in obj ) {
				const val = obj[ key ];
				const deep = state[ key ];
				const shallow = originalShallow[ key ];
				if ( Object( val ) === val ) {
					assert.deepStrictEqual( val, deep, 'deep ' + key );
					assert.strictEqual( val, shallow, 'shallow ' + key );
				} else {
					assert.strictEqual( val, deep );
				}
			}
		};

	}

	function deepClone( obj ) {
		const clone = {};
		for ( let key in obj ) {
			const val = obj[ key ];
			if ( Array.isArray( val ) ) {
				clone[ key ] = Array.from( val );
			} else if ( typeof val !== 'function' && Object( val ) === val ) {
				clone[ key ] = deepClone( val );
			} else {
				clone[ key ] = val;
			}
		}
		return clone;
	}

};
