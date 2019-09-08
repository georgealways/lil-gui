export default class CubicBezier {
	constructor( x1, y1, x2, y2 ) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
	interpolate( t ) {
		return CubicBezier.interpolate( t, this.x1, this.y1, this.x2, this.y2 );
	}
	static interpolate( t, x1, y1, x2, y2 ) {
		return bezier( inverseBezier( t, x1, x2 ), y1, y2 );
	}
}

function bezier( t, a, b ) {
	return t * ( t * ( t * ( 1 - 3 * b + 3 * a ) + ( 3 * b - 6 * a ) ) + 3 * a );
}

function inverseBezier( v, a, b ) {
	return solveCubic( 1 - 3 * b + 3 * a, 3 * b - 6 * a, 3 * a, -v );
}

// https://stackoverflow.com/a/27176424
// modified to return only the roots we're after
function solveCubic( a, b, c, d ) {

	const p = ( 3 * a * c - b * b ) / ( 3 * a * a );
	const q = ( 2 * b * b * b - 9 * a * b * c + 27 * a * a * d ) / ( 27 * a * a * a );
	const X = b / ( 3 * a );

	if ( p === 0 ) {

		return cubeRoot( -q ) - X;

	}

	const D = q * q / 4 + p * p * p / 27;

	if ( D > 0 ) {

		const u = cubeRoot( -q / 2 - Math.sqrt( D ) );
		return u - p / ( 3 * u ) - X;

	} else {

		const u = 2 * Math.sqrt( -p / 3 );
		const t = Math.acos( 3 * q / p / u ) / 3;

		for ( let n = 0; n <= 2; n++ ) {
			const k = u * Math.cos( t - K * n ) - X;
			if ( k >= 0 && k <= 1 ) {
				return k;
			}
		}

	}

}

function cubeRoot( x ) {
	return Math.sign( x ) * Math.pow( Math.abs( x ), 1 / 3 );
}

const K = Math.PI * 2 / 3;
