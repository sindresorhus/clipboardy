'use strict';
const execa = require('execa');

module.exports = handler => {
	return {
		copy: opts => execa('termux-clipboard-set', opts).catch(handler),
		paste: opts => execa.stdout('termux-clipboard-get', opts).catch(handler),
		copySync: opts => {
			try {
				return execa.sync('termux-clipboard-set', opts);
			} catch (err) {
				handler(err);
			}
		},
		pasteSync: opts => {
			try {
				return execa.sync('termux-clipboard-get', opts);
			} catch (err) {
				handler(err);
			}
		}
	};
};
