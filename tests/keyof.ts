import { GUI } from '..';

const params = { blur: 0 };

const gui = new GUI();

// @ts-expect-error
gui.add( params, 'not-a-key' );

// @ts-expect-error
gui.addColor( params, 'also-not-a-key' );
