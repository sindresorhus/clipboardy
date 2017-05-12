'use strct';
const execa = require('execa');

const ENV = Object.assign({}, process.env, {LC_CTYPE: 'UTF-8'});

module.exports = {
	copy: opts => execa('pbcopy', Object.assign({}, opts, {env: ENV})),
	paste: opts => execa.stdout('pbpaste', Object.assign({}, opts, {env: ENV})),
	copySync: opts => execa.sync('pbcopy', Object.assign({}, opts, {env: ENV})),
	pasteSync: opts => execa.sync('pbpaste', Object.assign({}, opts, {env: ENV}))
};
