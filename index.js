import process from 'node:process';
import isWSL from 'is-wsl';
import isWayland from 'is-wayland';
import termux from './lib/termux.js';
import linux from './lib/linux.js';
import wayland from './lib/wayland.js';
import macos from './lib/macos.js';
import windows from './lib/windows.js';

const platformLib = (() => {
	switch (process.platform) {
		case 'darwin': {
			return macos;
		}

		case 'win32': {
			return windows;
		}

		case 'android': {
			if (process.env.PREFIX !== '/data/data/com.termux/files/usr') {
				throw new Error('You need to install Termux for this module to work on Android: https://termux.com');
			}

			return termux;
		}

		default: {
			// `process.platform === 'linux'` for WSL.
			if (isWSL) {
				return windows;
			}

			// Check for Wayland session on Linux
			if (isWayland()) {
				return wayland;
			}

			return linux;
		}
	}
})();

const clipboard = {
	async write(text) {
		if (typeof text !== 'string') {
			throw new TypeError(`Expected a string, got ${typeof text}`);
		}

		await platformLib.copy({input: text});
	},

	async read() {
		return platformLib.paste({stripFinalNewline: false});
	},

	writeSync(text) {
		if (typeof text !== 'string') {
			throw new TypeError(`Expected a string, got ${typeof text}`);
		}

		platformLib.copySync({input: text});
	},

	readSync() {
		return platformLib.pasteSync({stripFinalNewline: false});
	},
};

export default clipboard;
