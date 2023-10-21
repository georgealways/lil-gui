// replaces the deprecated assert.CallTracker
// node suggests the "mock helper function" instead, but it feels overkill
export default class CallTracker {

	constructor( handler ) {

		this.numCalls = 0;
		this.lastThis = undefined;
		this.lastArgs = undefined;

		const _this = this;

		this.handler = function( ...args ) {
			_this.numCalls++;
			_this.lastThis = this;
			_this.lastArgs = args;
			handler && handler.call( this, ...args );
		};

	}

}
