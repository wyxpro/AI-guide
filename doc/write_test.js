const fs = require('fs');
const path = require('path');
const outPath = path.resolve('e:\\Code\\AI\\Start\\Web\\AI-guide\\doc\\商业计划书.md');
const content = `# test`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, 'utf8');
console.log('ok');
