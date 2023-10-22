import clipboard from './index.js';

await clipboard.write('你好🦄');
console.log(await clipboard.read());
