import { GUI } from '..';

const params = { blur: 0 };

const gui = new GUI();
gui.add( params, 'blur' );

// @ts-expect-error
gui.add( params, 'not-a-key' );

// @ts-expect-error
gui.addColor( params, 'also-not-a-key' );
