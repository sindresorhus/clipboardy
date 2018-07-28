'use strict';
const path = require('path');
const execa = require('execa');
const arch = require('arch');

// Binaries from: https://github.com/sindresorhus/win-clipboard
const winBinPath = arch() === 'x64' ?
	path.join(__dirname, '../fallbacks/windows/clipboard_x86_64.exe') :
	path.join(__dirname, '../fallbacks/windows/clipboard_i686.exe');

module.exports = {
	copy: options => execa(winBinPath, ['--copy'], options),
	paste: options => execa.stdout(winBinPath, ['--paste'], options),
	copySync: options => execa.sync(winBinPath, ['--copy'], options),
	pasteSync: options => execa.sync(winBinPath, ['--paste'], options)
};
