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

exports.write = text => {
	if (typeof text !== 'string') {
		return Promise.reject(new TypeError(`Expected a string, got ${typeof text}`));
	}

	return platformLib.copy({input: text}).then(() => {});
};

exports.read = () => platformLib.paste({stripEof: false});

exports.writeSync = text => {
	if (typeof text !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof text}`);
	}

	platformLib.copySync({input: text});
};

exports.readSync = () => platformLib.pasteSync({stripEof: false}).stdout;
