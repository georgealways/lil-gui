// workaround to import json without warnings from node@18 and eslint
// https://github.com/eslint/eslint/discussions/15305

import fs from 'fs';

export default JSON.parse( fs.readFileSync( './package.json' ) );
