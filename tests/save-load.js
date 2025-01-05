import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	// make some objects, remember their original state

	const obj1 = {
		boolean: false,
		number: 0,
		options: 'a',
		string: 'foo',
		func: function() { },

		colorHex: '#aa00ff',
		colorArr: [ 1 / 3, 2 / 3, 1 ],
		colorView: new Float32Array( [ 1 / 3, 2 / 3, 1 ] ),
		colorObj: { r: 2 / 3, g: 1, b: 1 / 3 },

		color255Arr: [ 0, 170, 255 ],
		color255View: new Float32Array( [ 0, 170, 255 ] ),
		color255Obj: { r: 10, g: 21, b: 34 }
	};

	const obj2 = {
		string: 'collision test',
		number: 2
	};

	const obj1Tester = new Tester( obj1 );
	const obj2Tester = new Tester( obj2 );

	const gui = new GUI();

	// add every controller type to the gui
	const ctrlBoolean = gui.add( obj1, 'boolean' );
	const ctrlNumber = gui.add( obj1, 'number' );
	const ctrlOptions = gui.add( obj1, 'options', [ 'a', 'b', 'c' ] );
	const ctrlString = gui.add( obj1, 'string' );

	const ctrlColorHex = gui.addColor( obj1, 'colorHex' );
	const ctrlColorArr = gui.addColor( obj1, 'colorArr' );
	const ctrlColorView = gui.addColor( obj1, 'colorView' );
	const ctrlColorObj = gui.addColor( obj1, 'colorObj' );

	const ctrlColor255Arr = gui.addColor( obj1, 'color255Arr', 255 );
	const ctrlColor255View = gui.addColor( obj1, 'color255View', 255 );
	const ctrlColor255Obj = gui.addColor( obj1, 'color255Obj', 255 );

	// add a function to test that it doesn't get saved
	gui.add( obj1, 'func' );

	// and add some more to folders to test recursive
	const folder = gui.addFolder( 'Folder' );
	const folderString = folder.add( obj2, 'string' );
	const folderNumber = folder.add( obj2, 'number' );

	// change it via gui
	ctrlBoolean.setValue( true );
	ctrlColorHex._setValueFromHexString( '#0fac8f' );
	ctrlColorArr._setValueFromHexString( '#3fccea' );
	ctrlColorView._setValueFromHexString( '#219c3a' );
	ctrlColorObj._setValueFromHexString( '#0033aa' );
	ctrlColor255Arr._setValueFromHexString( '#88fac3' );
	ctrlColor255View._setValueFromHexString( '#12bb20' );
	ctrlColor255Obj._setValueFromHexString( '#1f1f1f' );
	ctrlNumber.setValue( 1 );
	ctrlOptions.setValue( 'c' );
	ctrlString.setValue( 'bar' );

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
			} else if ( ArrayBuffer.isView( val ) ) {
				clone[ key ] = new val.constructor( val );
			} else if ( typeof val !== 'function' && Object( val ) === val ) {
				clone[ key ] = deepClone( val );
			} else {
				clone[ key ] = val;
			}
		}
		return clone;
	}

};
