/**
 * Used to simulate mouse or touch drags in conjunction with shim.js
 * @param {'mouse'|'touch'} type
 * @param {*} target
 * @param {object} [options]
 * @param {number} [options.x=0.5] start x of drag, defined as a percentage of width from rect.left
 * @param {number} [options.y=0.5] start y of drag, defined as a percentage of height from rect.top
 * @param {number} [options.dx=0] distance in px to move
 * @param {number} [options.dy=0] distance in px to move
 * @param {boolean} [options.altKey]
 * @param {boolean} [options.shiftKey]
 */
export default function( type, target, {
	x = 0.5,
	y = 0.5,
	dx = 0,
	dy = 0,
	altKey = false,
	shiftKey = false
} = {} ) {

	const rect = target.getBoundingClientRect();
	x = rect.left + rect.width * x;
	y = rect.top + rect.height * y;

	const events = {
		touch: { start: 'touchstart', move: 'touchmove', end: 'touchend' },
		mouse: { start: 'mousedown', move: 'mousemove', end: 'mouseup' }
	};

	target.$callEventListener( events[ type ].start, pointEvent( type, x, y ) );

	if ( dx !== 0 || dy !== 0 ) {
		window.$callEventListener( events[ type ].move, pointEvent( type, x + dx, y + dy ) );
	}

	window.$callEventListener( events[ type ].end, pointEvent( type, x + dx, y + dy ) );

	function pointEvent( type, clientX, clientY ) {
		let event = { clientX, clientY, altKey, shiftKey };
		return type === 'touch' ? { touches: [ event ] } : event;
	}

}
