'use strict';
const path = require('path');
const execa = require('execa');
const termux = require('./lib/termux.js');

const handler = err => {
	if (err.code === 'ENOENT') {
		let message = 'Couldn\'t find the required `xsel` binary. On Debian/Ubuntu you can install it with: sudo apt install xsel';
		if (err.path === 'termux-clipboard-get' || err.path === 'termux-clipboard-set') {
			message = 'Couldn\'t find the termux-api scripts. You can install them with: apt install termux-api';
		}
		throw new Error(message);
	}

	throw err;
};

const darwin = {
	copy: opts => execa('pbcopy', opts),
	paste: opts => execa.stdout('pbpaste', opts),
	copySync: opts => execa.sync('pbcopy', opts),
	pasteSync: opts => execa.sync('pbpaste', opts)
};

const winBinPath = path.join(__dirname, 'fallbacks/win-read.vbs');

const win32 = {
	copy: opts => execa('clip', [], opts),
	paste: opts => execa.stdout('cscript', ['/Nologo', winBinPath], opts),
	copySync: opts => execa.sync('clip', opts),
	pasteSync: opts => execa.sync('cscript', ['/Nologo', winBinPath], opts)
};

const xsel = path.join(__dirname, 'vendor/xsel');

const linux = {
	copy: opts => {
		return execa(xsel, ['--clipboard', '--input'], opts)
			.catch(() => execa('xsel', ['--clipboard', '--input'], opts))
			.catch(handler);
	},
	paste: opts => {
		return execa.stdout(xsel, ['--clipboard', '--output'], opts)
			.catch(() => execa.stdout('xsel', ['--clipboard', '--output'], opts))
			.catch(handler);
	},
	copySync: opts => {
		try {
			return execa.sync(xsel, ['--clipboard', '--input'], opts);
		} catch (err) {
			try {
				return execa.sync('xsel', ['--clipboard', '--input'], opts);
			} catch (err) {
				handler(err);
			}
		}
	},
	pasteSync: opts => {
		try {
			return execa.sync(xsel, ['--clipboard', '--output'], opts);
		} catch (err) {
			try {
				return execa.sync('xsel', ['--clipboard', '--output'], opts);
			} catch (err) {
				handler(err);
			}
		}
	}
};

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
			return termux(handler);
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
