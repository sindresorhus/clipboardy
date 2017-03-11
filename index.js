'use strict';
const execa = require('execa');

const darwin = {
	copy: opts => execa('pbcopy', [], opts),
	paste: opts => execa.stdout('pbpaste', [], opts),
	copySync: opts => execa.sync('pbcopy', [], opts),
	pasteSync: opts => execa.sync('pbpaste', [], opts)
};

const win32 = {
	copy: opts => execa('clip', [], opts),
	paste: opts => execa.stdout('cscript', ['/Nologo', '.\\fallbacks\\win-read.vbs'], opts),
	copySync: opts => execa.sync('clip', [], opts),
	pasteSync: opts => execa.sync('cscript', ['/Nologo', '.\\fallbacks\\win-read.vbs'], opts)
};

const linux = {
	copy: opts => execa('./vendor/xsel', ['--clipboard', '--input'], opts),
	paste: opts => execa.stdout('./vendor/xsel', ['--clipboard', '--output'], opts),
	copySync: opts => execa.sync('./vendor/xsel', ['--clipboard', '--input'], opts),
	pasteSync: opts => execa.sync('./vendor/xsel', ['--clipboard', '--output'], opts)
};

function platform() {
	switch (process.platform) {
		case 'darwin':
			return darwin;
		case 'win32':
			return win32;
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
