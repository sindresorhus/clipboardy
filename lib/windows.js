'use strct';
const path = require('path');
const execa = require('execa');

// Binaries from: https://github.com/sindresorhus/win-clipboard
const winReadBinPath = path.join(__dirname, '../fallbacks/windows/paste.exe');
const winWriteBinPath = path.join(__dirname, '../fallbacks/windows/copy.exe');

module.exports = {
	copy: opts => {
		const input = opts.input;
		delete opts.input;
		return execa(winWriteBinPath, [input], opts);
	},
	paste: opts => execa.stdout(winReadBinPath, opts),
	copySync: opts => {
		const input = opts.input;
		delete opts.input;
		return execa.sync(winWriteBinPath, [input], opts);
	},
	pasteSync: opts => execa.sync(winReadBinPath, opts)
};
