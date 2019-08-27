// shim just enough browser stuff to run in node

global.window = {
	addEventListener() {},
	removeEventListener() {}
};

global.document = {
	body: createElement(),
	createElement: createElement,
	querySelector: createElement
};

function createElement() {
	return {
		addEventListener() {},
		appendChild() {},
		removeChild() {},
		insertBefore() {},
		setAttribute() {},
		classList: { add() {} },
		style: { setProperty() {} },
		parentElement: { removeChild() {} }
	};
}