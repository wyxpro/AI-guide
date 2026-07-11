const fs = require('fs');
const path = 'e:\\Code\\AI\\Start\\Web\\AI-guide\\doc\\商业计划书.md';
fs.appendFileSync(path, 'APPEND_TEST', 'utf8');
