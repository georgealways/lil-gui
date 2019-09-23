/**
 * @typedef GUIOptions
 *
 * @property {boolean} [autoPlace=true]
 * Adds the GUI to `document.body` and applies fixed positioning.
 *
 * @property {boolean} [injectStyles=true]
 * Injects the default stylesheet as the first child of `document.head`.
 * Pass false when using your own stylesheet.
 *
 * @property {string} [title='Controls']
 * Name to display in the title bar.
 *
 * @property {number} [width] todoc
 * @property {number} [mobileMaxHeight=200] todoc
 * @property {number} [mobileBreakpoint=600] todoc
 * @property {boolean} [collapses=true] todoc
 *
 * @property {string} [queryKey]
 * If defined, the GUI will be hidden unless the specified string is found in `location.search`.
 * You can use this to hide the GUI until you visit `url.com/?debug` for example.
 *
 * @property {GUI} [parent] todoc
 */

export interface GUIOptions {

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

export interface OnChangeHandler {
	(currentValue: any): void;
}

export class GUI {

	constructor(options?: GUIOptions);

	readonly parent: GUI;

	readonly root: GUI;

	readonly children: Array<GUI | Controller>;

	readonly _closed: boolean;

	readonly domElement: HTMLElement;

	readonly $title: HTMLElement;

	readonly $children: HTMLElement;

	add(object: object, property: string, onChange?: OnChangeHandler): Controller;

	add(object: object, property: string, options: object | Array, onChange?: OnChangeHandler): Controller;
	
	add(object: object, property: string, min: number, onChange?: OnChangeHandler): Controller;
	add(object: object, property: string, min: number, max: number, onChange?: OnChangeHandler): Controller;
	add(object: object, property: string, min: number, max: number, step: number, onChange?: OnChangeHandler): Controller;

	addColor(object: object, property: string, onChange?: OnChangeHandler): Controller;
	addColor(object: object, property: string, rgbScale?: number = 1, onChange?: OnChangeHandler): Controller;

	addFolder(title: string, collapses?: boolean = true): GUI;

	open(open?: boolean = true): void;

	close(): this;

	destroy(): void;

	forEachController(callback: function(Controller): void, recursive?: boolean = false): void;

}

export class Controller {

	readonly parent: GUI;

	readonly object: object;

	readonly property: string;

	readonly initialValue: any;

	readonly domElement: HTMLElement;

	readonly $name: HTMLElement;

	readonly $widget: HTMLElement;

	readonly _disabled: boolean;
	readonly _onChange: OnChangeHandler;
	readonly _listening: boolean;

	/**
	 * Sets the name of the controller and its label in the GUI.
	 */
	name(name: string): this;

	/**
	 * Pass a function to be called whenever the value is modified by this controller.
	 * The function takes the current value as its only parameter and `this` will
	 * be bound to the controller.
	 * @example
	 * gui.add( object, 'property' ).onChange( v => {
	 * 	console.log( 'The value is now ' + v );
	 * } );
	 *
	 * controller = gui.add( object, 'property' ).onChange(function() {
	 * 	console.assert(this === controller);
	 * } );
	 */
	onChange(callback: OnChangeHandler): this;

	onFinishChange(callback: OnChangeHandler): this;

	/**
	 * Destroys this controller and adds a new option controller. The `gui.add( object, property, options )` syntax is preferred.
	 * @returns {Controller}
	 */
	options(options: object | Array): Controller;

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
	enable(enabled: boolean = true): this;

	/**
	 * Disables this controller.
	 * @example
	 * controller.disable();
	 * controller.disable( false ); // enable
	 * controller.disable( !controller._disabled ); // toggle
	 */
	disable(disabled: boolean = true): this;

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
	 * @returns {any}
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
	listen(listen: boolean = true): this;

	_listenCallback(): void;

}