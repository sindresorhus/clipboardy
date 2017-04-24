'use strict';
const termux = require('./lib/termux.js');
const linux = require('./lib/linux.js');
const darwin = require('./lib/darwin.js');
const win32 = require('./lib/win32.js');

function platform() {
	switch (process.platform) {
		case 'darwin':
			return darwin;
		case 'win32':
			return win32;
		case 'android':
			if (process.env.PREFIX !== '/data/data/com.termux/files/usr') {
				throw new Error('You need to install Termux for this module to work on Android: https://termux.com');
			}
			return termux;
		default:
			return linux;
	}
}

exports.write = input => {
	if (typeof input !== 'string') {
		return Promise.reject(new TypeError(`Expected a string, got ${typeof input}`));
	}

	return platform().copy({input}).then(() => {});
};

exports.read = () => platform().paste();

exports.writeSync = input => {
	if (typeof input !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof input}`);
	}

	platform().copySync({input});
};

exports.readSync = () => platform().pasteSync().stdout;
