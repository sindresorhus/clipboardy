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
	copy: options => {
		return execa(xsel, ['--clipboard', '--input'], options)
			.catch(() => execa('xsel', ['--clipboard', '--input'], options))
			.catch(handler);
	},
	paste: options => {
		return execa.stdout(xsel, ['--clipboard', '--output'], options)
			.catch(() => execa.stdout('xsel', ['--clipboard', '--output'], options))
			.catch(handler);
	},
	copySync: options => {
		try {
			return execa.sync(xsel, ['--clipboard', '--input'], options);
		} catch (err) {
			try {
				return execa.sync('xsel', ['--clipboard', '--input'], options);
			} catch (err) {
				handler(err);
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
