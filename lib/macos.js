'use strict';
const execa = require('execa');

const env = Object.assign({}, process.env, {LC_CTYPE: 'UTF-8'});

module.exports = {
	copy: options => execa('pbcopy', Object.assign({}, options, {env})),
	paste: options => execa.stdout('pbpaste', Object.assign({}, options, {env})),
	copySync: options => execa.sync('pbcopy', Object.assign({}, options, {env})),
	pasteSync: options => execa.sync('pbpaste', Object.assign({}, options, {env}))
};
