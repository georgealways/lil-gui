export default class CallTracker {

	constructor( handler ) {

		this.calls = 0;

		const _this = this;

		this.handler = function() {
			_this.calls++;
			handler && handler.call( this, ...arguments );
		};

	}

}
