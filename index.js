'use strict';
const termux = require('./lib/termux.js');
const linux = require('./lib/linux.js');
const macos = require('./lib/macos.js');
const windows = require('./lib/windows.js');

const platformLib = getPlatformLib();

function getPlatformLib() {
	switch (process.platform) {
		case 'darwin':
			return macos;
		case 'win32':
			return windows;
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

	return platformLib.copy({input}).then(() => {});
};

exports.read = () => platformLib.paste({stripEof: false});

exports.writeSync = input => {
	if (typeof input !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof input}`);
	}

	platformLib.copySync({input});
};

exports.readSync = () => platformLib.pasteSync({stripEof: false}).stdout;
