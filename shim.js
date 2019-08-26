const createElement = () => ( {
	insertBefore() {},
	classList: {
		add() {}
	},
	addEventListener() {},
	setAttribute() {},
	style: {
		setProperty() {}
	},
	appendChild() {},
	parentElement: {
		removeChild() {}
	}
} );

global.window = {
	addEventListener() {},
	removeEventListener() {}
};

global.document = {
	body: createElement(),
	createElement: createElement,
	querySelector: createElement
};
