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
function solveCubic( a, b, c, d ) {

	// actually that's quadratic
	if ( a === 0 ) {

		// actually that's linear
		if ( b === 0 ) {
			return -d / c;
		}

		const D = c * c - 4 * b * d;

		if ( D === 0 ) {

			// one root
			return -c / ( 2 * b );

		} else if ( D > 0 ) {

			// two roots
			const z = Math.sqrt( D ) / ( 2 * b );
			const r = -c + z;

			if ( r >= 0 && r <= 1 ){
				return r;
			}

			return -b - z;

		} else {

			// no roots
			return;

		}

	}

	const p = ( 3 * a * c - b * b ) / ( 3 * a * a );
	const q = ( 2 * b * b * b - 9 * a * b * c + 27 * a * a * d ) / ( 27 * a * a * a );
	const X = b / ( 3 * a );

	if ( p === 0 ) {

		// one root
		return cubeRoot( -q ) - X;

	} else if ( q === 0 ) {

		if ( p > 0 ) {

			// two roots
			const r = Math.sqrt( -p ) - X;

			if ( r >= 0 && r <= 1 ) {
				return r;
			}

			return Math.sqrt( p ) - X;

		} else {

			// no roots
			return;

		}

	}

	const D = q * q / 4 + p * p * p / 27;

	if ( D === 0 ) {

		// two roots
		const r = -1.5 * q / p - X;

		if ( r >= 0 && r <= 1 ) {
			return r;
		}

		return 3 * q / p - X;

	} else if ( D > 0 ) {

		// one root
		const u = cubeRoot( -q / 2 - Math.sqrt( D ) );
		return u - p / ( 3 * u ) - X;

	} else {

		// three roots
		const u = 2 * Math.sqrt( -p / 3 );
		const t = Math.acos( 3 * q / p / u ) / 3;

		for ( let n = 0; n <= 2; n++ ) {
			const r = u * Math.cos( t - n * K ) - X;
			if ( r >= 0 && r <= 1 ) {
				return r;
			}
		}

	}

}

function cubeRoot( x ) {
	return Math.sign( x ) * Math.pow( Math.abs( x ), THIRD );
}

const K = Math.PI * 2 / 3;
const THIRD = 1 / 3;
