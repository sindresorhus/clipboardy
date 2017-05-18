'use strct';
const path = require('path');
const execa = require('execa');

// Binaries from: https://github.com/sindresorhus/win-clipboard
const winReadBinPath = path.join(__dirname, '../fallbacks/windows/paste.exe');
const winWriteBinPath = path.join(__dirname, '../fallbacks/windows/copy.exe');

module.exports = {
	copy: opts => {
		if (opts && opts.input) {
			opts.input += '\n';
		}
		return execa(winWriteBinPath, opts);
	},
	paste: opts => execa.stdout(winReadBinPath, opts),
	copySync: opts => {
		if (opts && opts.input) {
			opts.input += '\n';
		}
		return execa.sync(winWriteBinPath, opts);
	},
	pasteSync: opts => execa.sync(winReadBinPath, opts)
};
