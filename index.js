'use strict';
const platformLib = (() => {
	switch (process.platform) {
		case 'darwin':
			return require('./lib/macos');
		case 'win32':
			return require('./lib/windows');
		case 'android':
			if (process.env.PREFIX !== '/data/data/com.termux/files/usr') {
				throw new Error('You need to install Termux for this module to work on Android: https://termux.com');
			}

			return require('./lib/termux');
		default:
			return require('./lib/linux');
	}
})();

exports.write = async text => {
	if (typeof text !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof text}`);
	}

	await platformLib.copy({input: text});
};

exports.read = async () => platformLib.paste({stripEof: false});

exports.writeSync = text => {
	if (typeof text !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof text}`);
	}

	platformLib.copySync({input: text});
};

exports.readSync = () => platformLib.pasteSync({stripEof: false}).stdout;
