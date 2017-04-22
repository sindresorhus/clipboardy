'use strict';
const clipboardy = require('.');

clipboardy.write('你好🦄');
clipboardy.read().then(console.log);
