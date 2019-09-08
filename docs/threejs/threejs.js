import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/108/three.module.js';

import GUI from '../../../build/lil-gui.module.js';

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

let fragmentShader, vertexShader, font, envMap;

const assetsToLoad = 4;

let assetsLoaded = 0;
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
	onLoad();
} );

function main() {

	let cube;

	const container = new THREE.Object3D();

	const scene = new THREE.Scene();

	scene.add( container );

	const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 400;

	const material = new THREE.ShaderMaterial( {
		uniforms: Object.assign( uniforms, {
			envMap: { value: envMap }
		} ),
		vertexShader,
		fragmentShader
	} );

	const dpr = window.devicePixelRatio;
	const renderer = new THREE.WebGLRenderer( { antialias: dpr === 1 } );
	renderer.setPixelRatio( dpr );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	function animate() {
		requestAnimationFrame( animate );
		container.rotation.y += params.rotationSpeed;
		renderer.render( scene, camera );
	}

	animate();

	function buildGeometry() {

		if ( cube ) {
			cube.parent.remove( cube );
			cube.geometry.dispose();
		}

		const geometry = new THREE.TextBufferGeometry( params.message, Object.assign( geoParams, {
			font: font,
			size: 100
		} ) );

		geometry.center();

		cube = new THREE.Mesh( geometry, material );
		container.add( cube );

	}

	buildGeometry();

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
