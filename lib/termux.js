'use strict';
const execa = require('execa');

const handler = error => {
	if (error.code === 'ENOENT') {
		throw new Error('Couldn\'t find the termux-api scripts. You can install them with: apt install termux-api');
	}

	throw error;
};

module.exports = {
	copy: options => execa('termux-clipboard-set', options).catch(handler),
	paste: options => execa.stdout('termux-clipboard-get', options).catch(handler),
	copySync: options => {
		try {
			return execa.sync('termux-clipboard-set', options);
		} catch (error) {
			handler(error);
		}
	},
	pasteSync: options => {
		try {
			return execa.sync('termux-clipboard-get', options);
		} catch (error) {
			handler(error);
		}
	}
};
