export default function map( v, a, b, c, d ) {
	return ( v - a ) / ( b - a ) * ( d - c ) + c;
}