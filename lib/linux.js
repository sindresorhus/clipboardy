import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa, execaSync} from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const xsel = 'xsel';
const xselFallback = path.join(__dirname, '../fallbacks/linux/xsel');

const copyArguments = ['--clipboard', '--input'];
const pasteArguments = ['--clipboard', '--output'];

const isDisplayError = error => /Can't open display|Inappropriate ioctl/i.test(error.stderr ?? '');

const makeError = (xselError, fallbackError) => {
	let message;

	if (xselError.code === 'ENOENT') {
		message = 'Couldn\'t find the `xsel` binary and fallback didn\'t work. On Debian/Ubuntu you can install xsel with: sudo apt install xsel';
	} else if (isDisplayError(xselError)) {
		message = 'Clipboard access requires a display server (X11 or Wayland). This doesn\'t work in headless environments like CI servers, Docker containers, or SSH sessions without X11 forwarding.';
	} else {
		message = 'Both xsel and fallback failed';
	}

	const error = new Error(message);

	if (xselError.code !== 'ENOENT') {
		error.xselError = xselError;
	}

	error.fallbackError = fallbackError;
	return error;
};

const xselWithFallback = async (argumentList, options) => {
	try {
		const {stdout} = await execa(xsel, argumentList, options);
		return stdout;
	} catch (xselError) {
		try {
			const {stdout} = await execa(xselFallback, argumentList, options);
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
		try {
			return execaSync(xselFallback, argumentList, options).stdout;
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
