import './shim';
import { GUI } from './build/lil-gui.module';

const gui = new GUI();
gui.add( { x: 0 }, 'x', 0, 1 );
gui.destroy();

console.log( GUI );