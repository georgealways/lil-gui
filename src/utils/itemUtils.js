export function disableItem( item, disabled ) {
	if ( disabled === item._disabled ) return item;

	item._disabled = disabled;

	item.domElement.classList.toggle( 'disabled', disabled );
	item.domElement.toggleAttribute( 'disabled', disabled );

	return item;
}

export function showItem( item, show ) {
	item._hidden = !show;

	item.domElement.style.display = item._hidden ? 'none' : '';

	return item;
}
