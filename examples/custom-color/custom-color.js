import * as THREE from 'https://cdn.jsdelivr.net/npm/three/build/three.module.js';
import GUI from '../../dist/lil-gui.esm.js';

const debugDiv = document.getElementById( 'debug-div' );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial( { color: 0x00aaff } );
const cube = new THREE.Mesh( geometry, material );

scene.add( cube );
const gui = new GUI();
const ctrl = gui.addColor( material, 'color' );

function animate() {

	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	debugDiv.style.backgroundColor = '#' + ctrl.$text.value;

	renderer.render( scene, camera );

}

animate();
