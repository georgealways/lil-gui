// because you still need a law degree to import a json file in node 18
import fs from 'fs';
export default JSON.parse( fs.readFileSync( './package.json' ) );
