/* eslint-globals navigator */

'use strict';

exports.write = async text => {
	await navigator.clipboard.writeText(text);
};

exports.read = async () => {
	return navigator.clipboard.readText();
};

exports.readSync = () => {
	throw new Error('.readSync() not supported in browsers!');
};

exports.writeSync = () => {
	throw new Error('.writeSync() not supported in browsers!');
};
