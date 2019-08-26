import './test-shim.js';
import assert from 'assert';

import GUI from '../build/lil-gui.module';

assert( true, 'I can import GUI as the default module' );

const gui = new GUI();
gui.add( { x: 0 }, 'x', 0, 1 );
gui.destroy();
