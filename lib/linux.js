import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa, execaSync} from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Note: We use xsel instead of xclip because xclip does not properly close stdout/stderr when receiving input via stdin, causing hangs in subprocess/pipe scenarios.
const xsel = 'xsel';
const xselFallbackPath = path.join(__dirname, '../fallbacks/linux/xsel');

// Check if the bundled fallback binary exists on disk. It may not exist when running in a bundled environment (e.g. Node.js SEA, webpack, esbuild).
const hasXselFallback = fs.existsSync(xselFallbackPath);

const copyArguments = ['--clipboard', '--input'];
const pasteArguments = ['--clipboard', '--output'];

const isDisplayError = error => /Can't open display|Inappropriate ioctl/i.test(error.stderr ?? '');

const makeError = (xselError, fallbackError) => {
	let message;

	if (xselError.code === 'ENOENT') {
		message = 'Couldn\'t find the `xsel` binary and fallback didn\'t work. On Debian/Ubuntu you can install xsel with: sudo apt install xsel';

		if (!hasXselFallback) {
			message += '\nThe bundled `xsel` fallback was not found. This can happen when running in a bundled environment (e.g. Node.js SEA).';
		}
	} else if (isDisplayError(xselError)) {
		message = 'Clipboard access requires a display server (X11 or Wayland). This doesn\'t work in headless environments like CI servers, Docker containers, or SSH sessions without X11 forwarding.';
	} else {
		message = 'Both xsel and fallback failed';
	}

	const error = new Error(message);

	if (xselError.code !== 'ENOENT') {
		error.xselError = xselError;
	}

	if (fallbackError) {
		error.fallbackError = fallbackError;
	}

	return error;
};

const xselWithFallback = async (argumentList, options) => {
	try {
		const {stdout} = await execa(xsel, argumentList, options);
		return stdout;
	} catch (xselError) {
		if (!hasXselFallback) {
			throw makeError(xselError);
		}

		try {
			const {stdout} = await execa(xselFallbackPath, argumentList, options);
			return stdout;
		} catch (fallbackError) {
			throw makeError(xselError, fallbackError);
		}
	}
};

const xselWithFallbackSync = (argumentList, options) => {
	try {
		return execaSync(xsel, argumentList, options).stdout;
	} catch (xselError) {
		if (!hasXselFallback) {
			throw makeError(xselError);
		}

		try {
			return execaSync(xselFallbackPath, argumentList, options).stdout;
		} catch (fallbackError) {
			throw makeError(xselError, fallbackError);
		}
	}
};

const clipboard = {
	async copy(options) {
		await xselWithFallback(copyArguments, options);
	},
	copySync(options) {
		xselWithFallbackSync(copyArguments, options);
	},
	paste: options => xselWithFallback(pasteArguments, options),
	pasteSync: options => xselWithFallbackSync(pasteArguments, options),
};

export default clipboard;
