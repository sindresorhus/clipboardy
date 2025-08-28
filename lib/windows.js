import path from 'node:path';
import {execa, execaSync} from 'execa';
import {is64bitSync} from 'is64bit';
import {getFallbacksRoot} from './fallbacks.js';

const binarySuffix = is64bitSync() ? 'x86_64' : 'i686';

// Binaries from: https://github.com/sindresorhus/win-clipboard
const windowBinaryPath = path.join(getFallbacksRoot(), `windows/clipboard_${binarySuffix}.exe`);

const clipboard = {
	copy: async options => execa(windowBinaryPath, ['--copy'], options),
	async paste(options) {
		const {stdout} = await execa(windowBinaryPath, ['--paste'], options);
		return stdout;
	},
	copySync: options => execaSync(windowBinaryPath, ['--copy'], options),
	pasteSync: options => execaSync(windowBinaryPath, ['--paste'], options).stdout,
};

export default clipboard;
