import {execa, execaSync} from 'execa';
import linux from './linux.js';

// Common arguments for text clipboard operations
const textArgs = ['--type', 'text/plain'];

const makeError = (command, error) => {
	if (error.code === 'ENOENT') {
		return new Error(`Couldn't find the \`${command}\` binary. On Debian/Ubuntu you can install wl-clipboard with: sudo apt install wl-clipboard`);
	}

	return new Error(`Command \`${command}\` failed: ${error.message}`);
};

const tryWaylandWithFallback = async (command, arguments_, options, fallbackMethod) => {
	try {
		const result = await execa(command, arguments_, options);
		return result.stdout;
	} catch (error) {
		// Handle empty clipboard on wl-paste
		if (command === 'wl-paste' && /nothing is copied|no selection|selection owner/i.test(error.stderr || '')) {
			return '';
		}

		// Fall back to X11 if wl-clipboard not found OR Wayland not available
		if (error.code === 'ENOENT'
			|| /wayland|wayland_display|failed to connect|display/i.test(error.stderr || '')) {
			return fallbackMethod(options);
		}

		throw makeError(command, error);
	}
};

const tryWaylandWithFallbackSync = (command, arguments_, options, fallbackMethod) => {
	try {
		const result = execaSync(command, arguments_, options);
		return result.stdout;
	} catch (error) {
		// Handle empty clipboard on wl-paste
		if (command === 'wl-paste' && /nothing is copied|no selection|selection owner/i.test(error.stderr || '')) {
			return '';
		}

		// Fall back to X11 if wl-clipboard not found OR Wayland not available
		if (error.code === 'ENOENT'
			|| /wayland|wayland_display|failed to connect|display/i.test(error.stderr || '')) {
			return fallbackMethod(options);
		}

		throw makeError(command, error);
	}
};

const clipboard = {
	async copy(options) {
		await tryWaylandWithFallback('wl-copy', textArgs, options, linux.copy);
	},
	copySync(options) {
		tryWaylandWithFallbackSync('wl-copy', textArgs, options, linux.copySync);
	},
	async paste(options) {
		return tryWaylandWithFallback('wl-paste', [...textArgs, '--no-newline'], options, linux.paste);
	},
	pasteSync(options) {
		return tryWaylandWithFallbackSync('wl-paste', [...textArgs, '--no-newline'], options, linux.pasteSync);
	},
};

export default clipboard;
