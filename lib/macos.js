'use strct';
const execa = require('execa');

module.exports = {
	copy: opts => execa('pbcopy', opts),
	paste: opts => execa.stdout('pbpaste', opts),
	copySync: opts => execa.sync('pbcopy', opts),
	pasteSync: opts => execa.sync('pbpaste', opts)
};
