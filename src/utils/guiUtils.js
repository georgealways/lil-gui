
/**
 * Helper for disabling a GUI or a Controller
 * @template {{ _disabled: boolean, domElement: HTMLElement }} GUI
 * @param { GUI } gui
 * @param { boolean } disabled
 * @returns { GUI }
 */
export function disableGui( gui, disabled ) {
	if ( disabled === gui._disabled ) return gui;

	gui._disabled = disabled;

	gui.domElement.classList.toggle( 'disabled', disabled );
	gui.domElement.toggleAttribute( 'disabled', disabled );

	return gui;
}

/**
 * Helper for showing a GUI or a Controller
 * @template {{ _hidden: boolean, domElement: HTMLElement }} GUI
 * @param { GUI } gui
 * @param { boolean } show
 * @returns { GUI }
 */
export function showGui( gui, show ) {
	gui._hidden = !show;

	gui.domElement.style.display = gui._hidden ? 'none' : '';

	return gui;
}
