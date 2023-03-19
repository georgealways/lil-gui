// workaround to import json without warnings from node@18 and eslint
import fs from 'fs';
export default JSON.parse( fs.readFileSync( './package.json' ) );
