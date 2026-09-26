const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const backendRoot = path.resolve(__dirname, '../..');

// System variables take priority, followed by local credentials and legacy settings.
dotenv.config({ path: path.join(backendRoot, '.env.local') });
const legacyPath = path.join(backendRoot, 'data.env');
dotenv.config({ path: fs.existsSync(legacyPath) ? legacyPath : path.join(backendRoot, '.env') });
