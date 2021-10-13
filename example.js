import clipboard from './index.js';

(async () => {
	clipboard.write('你好🦄');
	console.log(await clipboard.read());
})();
