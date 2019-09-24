export class GUI {
	constructor(options?: GUIOptions);
	parent?: GUI;
	root: GUI;
	children: Array<GUI | Controller>;
	_closed: boolean;
	_title: string;
	domElement: HTMLElement;
	$title: HTMLElement;
	$children: HTMLElement;
	add(object: any, property: string, onChange?: ChangeHandler): Controller;
	add(object: any, property: string, options: object | any[], onChange?: ChangeHandler): Controller;
	add(object: any, property: string, min: number, onChange?: ChangeHandler): Controller;
	add(object: any, property: string, min: number, max: number, onChange?: ChangeHandler): Controller;
	add(object: any, property: string, min: number, max: number, step: number, onChange?: ChangeHandler): Controller;
	addColor(object: any, property: string, onChange?: ChangeHandler): Controller;
	addColor(object: any, property: string, rgbScale?: number, onChange?: ChangeHandler): Controller;
	addFolder(title: string, collapses?: boolean): GUI;
	open(open?: boolean): void;
	close(): this;
	destroy(): void;
	forEachController(callback: (c: Controller) => void, recursive?: boolean): void;
	title(title: string): this;
}

interface GUIOptions {
	autoPlace?: boolean;
	injectStyles?: boolean;
	title?: string;
	width?: number;
	mobileMaxHeight?: number;
	mobileBreakpoint?: number;
	collapses?: boolean;
	queryKey?: string;
	parent?: GUI;
}

interface ChangeHandler {
	(this: Controller, currentValue: any): void;
}

export class Controller {
	parent: GUI;
	object: any;
	property: string;
	initialValue: any;
	domElement: HTMLElement;
	$name: HTMLElement;
	$widget: HTMLElement;
	_name: string;
	_onChange?: ChangeHandler;
	_disabled: boolean;
	_listening: boolean;
	_listenCallbackID?: number;
	_min?: number;
	_max?: number;
	_step?: number;
	name(name: string): this;
	onChange(callback: ChangeHandler): this;
	onFinishChange(callback: ChangeHandler): this;
	options(options: object | any[]): Controller;
	setValue(value: any): this;
	reset(): this;
	enable(enabled: boolean): this;
	disable(disabled: boolean): this;
	destroy(): void;
	getValue(): any;
	min(min: number): this;
	max(max: number): this;
	step(step: number): this;
	updateDisplay(): this;
	listen(listen: boolean): this;
	_callOnChange(): void;
	_listenCallback(): void;
}

export default GUI;
