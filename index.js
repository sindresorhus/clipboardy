'use strict';
const execa = require('execa');

const writeCmd = () => {
	switch (process.platform) {
		case 'darwin':
			return ['pbcopy'];
		case 'win32':
			return ['clip'];
		default:
			return ['xsel', '--clipboard', '--input'];
	}
};

const readCmd = () => {
	switch (process.platform) {
		case 'darwin':
			return ['pbpaste'];
		case 'win32':
			return ['cscript', '/Nologo', '.\\fallbacks\\win-read.vbs'];
		default:
			return ['xsel', '--clipboard', '--output'];
	}
};

const handler = err => {
	if (err.code === 'ENOENT' && process.platform !== 'darwin' && process.platform !== 'win32') {
		throw new Error('Couldn\'t find the required `xsel` binary. On Debian/Ubuntu you can install it with: sudo apt install xsel');
	}

	throw err;
};

exports.write = input => {
	if (typeof input !== 'string') {
		return Promise.reject(new TypeError(`Expected a string, got ${typeof input}`));
	}

	const args = writeCmd();
	return execa(args.shift(), args, {input}).then(() => {}).catch(handler);
};

exports.read = () => {
	const args = readCmd();
	return execa.stdout(args.shift(), args).catch(handler);
};

exports.writeSync = input => {
	if (typeof input !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof input}`);
	}

	const args = writeCmd();

	try {
		execa.sync(args.shift(), args, {input});
	} catch (err) {
		handler(err);
	}
};

exports.readSync = () => {
	const args = readCmd();
	let ret;

	try {
		ret = execa.sync(args.shift(), args).stdout;
	} catch (err) {
		handler(err);
	}

	return ret;
};
