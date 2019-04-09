'use strict';
const path = require('path');
const execa = require('execa');

const handler = error => {
	if (error.code === 'ENOENT') {
		throw new Error('Couldn\'t find the required `xsel` binary. On Debian/Ubuntu you can install it with: sudo apt install xsel');
	}

	throw error;
};

const xsel = path.join(__dirname, '../fallbacks/linux/xsel');

module.exports = {
	copy: async options => {
		try {
			await execa(xsel, ['--clipboard', '--input'], options);
		} catch (_) {
			try {
				await execa('xsel', ['--clipboard', '--input'], options);
			} catch (error) {
				handler(error);
			}
		}
	},
	paste: async options => {
		try {
			return await execa.stdout(xsel, ['--clipboard', '--output'], options);
		} catch (_) {
			try {
				return await execa.stdout('xsel', ['--clipboard', '--output'], options);
			} catch (error) {
				handler(error);
			}
		}
	},
	copySync: options => {
		try {
			execa.sync(xsel, ['--clipboard', '--input'], options);
		} catch (_) {
			try {
				execa.sync('xsel', ['--clipboard', '--input'], options);
			} catch (error) {
				handler(error);
			}
		}
	},
	pasteSync: options => {
		try {
			return execa.sync(xsel, ['--clipboard', '--output'], options);
		} catch (_) {
			try {
				return execa.sync('xsel', ['--clipboard', '--output'], options);
			} catch (error) {
				handler(error);
			}
		}
	}
};
