import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.108/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.108/examples/jsm/controls/OrbitControls.js';

import GUI from '../../build/lil-gui.module.js';

let fragmentShader,
	vertexShader,
	font,
	envMap,
	assetsLoaded = 0;

const params = {
	message: 'lil-gui',
	rotationSpeed: 0.01
};

const geoParams = {
	height: 50,
	curveSegments: 8,
	bevelEnabled: true,
	bevelThickness: 3,
	bevelSize: 3,
	bevelOffset: 0,
	bevelSegments: 2
};

const uniforms = {
	thinFilmThickness: { value: 1313 },
	thinFilmOuterIndex: { value: 1 },
	thinFilmIndex: { value: 1.75 },
	thinFilmInnerIndex: { value: 1 },
	thinFilmPolarization: { value: 1.5 }
};

const assetsToLoad = 4;

function onLoad() {
	assetsLoaded++;
	if ( assetsLoaded === assetsToLoad ) {
		main();
	}
}

fetch( './shader.fs' ).then( r => r.text() ).then( asset => {
	fragmentShader = asset;
	onLoad();
} );

fetch( './shader.vs' ).then( r => r.text() ).then( asset => {
	vertexShader = asset;
	onLoad();
} );

new THREE.FontLoader().load( './font.json', asset => {
	font = asset;
	onLoad();
} );

new THREE.TextureLoader().load( './envmap.png', asset => {
	envMap = asset;
	envMap.minFilter = THREE.NearestFilter; // seems to fix a texture seam with atan
	onLoad();
} );

function main() {

	let text;

	const dpr = window.devicePixelRatio;
	const renderer = new THREE.WebGLRenderer( { antialias: dpr === 1 } );

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	const container = new THREE.Object3D();

	const material = new THREE.ShaderMaterial( {
		uniforms: Object.assign( uniforms, {
			envMap: { value: envMap }
		} ),
		vertexShader,
		fragmentShader
	} );

	renderer.setPixelRatio( dpr );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	scene.add( container );

	camera.position.z = 400;

	// pass a target to orbit controls to make it leave the gui alone
	const controls = new OrbitControls( camera, renderer.domElement );

	function buildGeometry() {

		if ( text ) {
			text.parent.remove( text );
			text.geometry.dispose();
		}

		const geometry = new THREE.TextBufferGeometry( params.message, Object.assign( geoParams, {
			font: font,
			size: 100
		} ) );

		geometry.center();

		text = new THREE.Mesh( geometry, material );
		container.add( text );

	}

	function buildGUI() {

		const gui = new GUI();
		gui.add( params, 'message' );

		const geo = gui.addFolder( 'Geometry', false );
		geo.add( geoParams, 'height', 0, 200 ).name( 'depth' );
		geo.add( geoParams, 'curveSegments', 1, 12, 1 );

		const bevel = geo.addFolder( 'Bevel', false );
		bevel.add( geoParams, 'bevelEnabled' ).name( 'enabled' );
		bevel.add( geoParams, 'bevelThickness', -10, 10 ).name( 'depth' );
		bevel.add( geoParams, 'bevelSize', 0, 10 ).name( 'size' );
		bevel.add( geoParams, 'bevelOffset', -5, 5 ).name( 'offset' );
		bevel.add( geoParams, 'bevelSegments', 1, 5, 1 ).name( 'segments' );

		gui.forEachController( c => c.onChange( buildGeometry ), true );

		const thinFilm = gui.addFolder( 'Thin Film', false );
		thinFilm.add( uniforms.thinFilmThickness, 'value', 100, 2000 ).name( 'thickness' );
		thinFilm.add( uniforms.thinFilmIndex, 'value', 1, 2 ).name( 'index' );
		thinFilm.add( uniforms.thinFilmPolarization, 'value', 0, 2 ).name( 'polarization' );

		gui.add( params, 'rotationSpeed', 0, 0.05 );
	}

	function animate() {

		requestAnimationFrame( animate );
		controls.update();
		container.rotation.y += params.rotationSpeed;
		renderer.render( scene, camera );

	}

	buildGeometry();
	buildGUI();
	animate();

}
