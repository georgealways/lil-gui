# Example Test

Backtick fences work normally:

```js
console.log( "This doesn't run" );

this.$customToken();
```

Squiggle fences will also run the code:

~~~js
import GUI from 'lil-gui';

const gui = new GUI();
gui.add( document, 'title' );
~~~

This comment automatically embeds an external file:

<!-- show ../../scripts/examples.js -->
