export interface GUIOptions {

	/**
	* Adds the GUI to `document.body` and applies fixed positioning.
	*/
	autoPlace?: boolean;

	/**
	* Injects the default stylesheet as the first child of `document.head`.
	* Pass false when using your own stylesheet.
	*/
	injectStyles?: boolean;

	/**
	* Name to display in the title bar.
	*/
	title?: string;

	width?: number;

	mobileMaxHeight?: number;

	mobileBreakpoint?: number;

	collapses?: boolean;

	/**
	* If defined, the GUI will be hidden unless the specified string is found in `location.search`.
	* You can use this to hide the GUI until you visit `url.com/?debug` for example.
	*/
	queryKey?: string;

	parent?: GUI;

}


export class GUI {

	constructor(options?: GUIOptions);

	readonly parent: GUI;
	readonly root: GUI;
	readonly children: Array<GUI | Controller>;

	readonly _closed: boolean;
	readonly _title: string;

	readonly domElement: HTMLElement;
	readonly $title: HTMLElement;
	readonly $children: HTMLElement;

	add(object: any, property: string, onChange?: Function): Controller;
	add(object: any, property: string, options: object | any[], onChange?: Function): Controller;
	add(object: any, property: string, min: number, onChange?: Function): Controller;
	add(object: any, property: string, min: number, max: number, onChange?: Function): Controller;
	add(object: any, property: string, min: number, max: number, step: number, onChange?: Function): Controller;

	addColor(object: any, property: string, onChange?: Function): Controller;
	addColor(object: any, property: string, rgbScale?: number, onChange?: Function): Controller;

	addFolder(title: string, collapses?: boolean): GUI;

	open(open?: boolean): void;

	close(): this;

	destroy(): void;

	getControllers(recursive?: boolean): Controller[];
	getFolders(recursive?: boolean): GUI[];

	title(title: string): this;

}

export class Controller {

	readonly parent: GUI;

	readonly object: any;

	readonly property: string;

	readonly initialValue: any;

	readonly domElement: HTMLElement;

	readonly $name: HTMLElement;
	readonly $widget: HTMLElement;

	/**
	* Used to access the controller's name.
	*/
	readonly _name: string;

	readonly _disabled: boolean;
	readonly _listening: boolean;
	readonly _onChange: Function;

	/**
	* Sets the name of the controller and its label in the GUI.
	*/
	name(name: string): this;

	/**
	* Pass a function to be called whenever the value is modified by this controller.
	* The function takes the current value as its only parameter and `this` will
	* be bound to the controller.
	*
	* @example
	* gui.add( object, 'property' ).onChange( v => {
	* console.log( 'The value is now ' + v );
	* } );
	*
	* controller = gui.add( object, 'property' ).onChange(function() {
	* console.assert(this === controller);
	* } );
	*/
	onChange(callback: Function): this;

	onFinishChange(callback: Function): this;

	/**
	* Destroys this controller and adds a new option controller. The `gui.add( object, property, options )` syntax is preferred.
	*/
	options(options: object | any[]): Controller;

	/**
	* Sets `object[ property ]` to `value`, calls `_onChange()` and then `updateDisplay()`.
	*/
	setValue(value: any): this;

	_callOnChange(): void;

	/**
	* Shorthand for `setValue( initialValue )`.
	*/
	reset(): this;

	/**
	* Enables this controller.
	* @example
	* controller.enable();
	* controller.enable( false ); // disable
	* controller.enable( controller._disabled ); // toggle
	*/
	enable(enabled: boolean): this;

	/**
	* Disables this controller.
	* @example
	* controller.disable();
	* controller.disable( false ); // enable
	* controller.disable( !controller._disabled ); // toggle
	*/
	disable(disabled: boolean): this;

	/**
	* Destroys this controller and removes it from the parent GUI.
	* @example
	* const controller = gui.add( object, 'property' );
	* controller.destroy();
	*
	* @example
	* // Won't destroy all the controllers because c.destroy() modifies gui.children
	* gui.forEachController( c => c.destroy() );
	*
	* // Make a copy of the array first if you actually want to do that
	* Array.from( gui.children ).forEach( c => c.destroy() );
	*/
	destroy(): void;

	/**
	* Returns `object[ property ]`.
	*/
	getValue(): any;

	/**
	* Sets the minimum value. Only works on number controllers.
	*/
	min(min: number): this;

	/**
	* Sets the maximum value. Only works on number controllers.
	*/
	max(max: number): this;

	/**
	* Sets the step. Only works on number controllers.
	*/
	step(step: number): this;

	/**
	* Updates the display to keep it in sync with `getValue()`. Useful for updating
	* your controllers when their values have been modified outside of the GUI.
	*/
	updateDisplay(): this;

	/**
	* Calls `updateDisplay()` every animation frame. Pass `false` to stop listening, and use `controller._listening` to access the listening state.
	*/
	listen(listen: boolean): this;

	_listenCallback(): void;

}

export default GUI;
