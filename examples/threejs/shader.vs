varying vec3 vWorldPosition;
varying vec3 vNormal;

void main() { 

	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

	vNormal = ( modelMatrix * vec4( normal, 1.0 ) ).xyz;
	vWorldPosition = worldPosition.xyz;

	gl_Position = projectionMatrix * viewMatrix * worldPosition;

}
		