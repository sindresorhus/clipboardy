import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execa, execaSync} from 'execa';
import linux from './linux.js';

// Common arguments for text clipboard operations
const textArgs = ['--type', 'text/plain'];

/*
After taking ownership of the clipboard, `wl-copy` forks and keeps serving the clipboard contents in the background until another app takes over. The background process inherits our stdio, so if we give it pipes, we end up waiting for a process that only exits when something else is copied.

We point its stderr at a real file instead. A file descriptor can be held open by the background process indefinitely without blocking us, and unlike `'ignore'`, we can still read back what it wrote. Its stdout is ignored, as wl-clipboard before 2.1 does not redirect it before forking.

It has to be a raw file descriptor. Execa's own `{file}` redirection is implemented as a pipe, so it brings the hang right back.
https://github.com/sindresorhus/clipboardy/issues/111
*/
const createStderrFile = () => {
	const file = path.join(os.tmpdir(), `clipboardy-${crypto.randomUUID()}`);
	const fileDescriptor = fs.openSync(file, 'w+');

	return {
		fileDescriptor,
		// Best-effort. The contents only feed the error message and the X11 fallback heuristic, so an unreadable file should not replace the failure we are already handling.
		read() {
			try {
				return fs.readFileSync(file, 'utf8');
			} catch {
				return '';
			}
		},
		// Safe to do while the background process is still alive. It holds its own descriptor, and the file only disappears once it exits too.
		remove() {
			fs.closeSync(fileDescriptor);
			fs.rmSync(file, {force: true});
		},
	};
};

const makeError = (command, error) => {
	if (error.code === 'ENOENT') {
		return new Error(`Couldn't find the \`${command}\` binary. On Debian/Ubuntu you can install wl-clipboard with: sudo apt install wl-clipboard`);
	}

	// Execa only embeds stderr in `error.message` when it captured it through a pipe, which is not the case for `wl-copy`, so prefer the stderr we read back ourselves.
	return new Error(`Command \`${command}\` failed: ${error.stderr?.trim() || error.message}`);
};

const handleError = (command, error, options, fallbackMethod) => {
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
};

const clipboard = {
	async copy(options) {
		const stderrFile = createStderrFile();

		try {
			await execa('wl-copy', textArgs, {...options, stdout: 'ignore', stderr: stderrFile.fileDescriptor});
		} catch (error) {
			// Execa cannot buffer stderr into the error when it goes to a file descriptor, so fill it in for the checks below.
			error.stderr = stderrFile.read();
			await handleError('wl-copy', error, options, linux.copy);
		} finally {
			stderrFile.remove();
		}
	},
	copySync(options) {
		const stderrFile = createStderrFile();

		try {
			execaSync('wl-copy', textArgs, {...options, stdout: 'ignore', stderr: stderrFile.fileDescriptor});
		} catch (error) {
			// Execa cannot buffer stderr into the error when it goes to a file descriptor, so fill it in for the checks below.
			error.stderr = stderrFile.read();
			handleError('wl-copy', error, options, linux.copySync);
		} finally {
			stderrFile.remove();
		}
	},
	/*
	Unlike `wl-copy`, `wl-paste` does not fork, so it can use ordinary pipes.

	`--no-newline` stops it from appending a trailing newline that was never on the clipboard.
	*/
	async paste(options) {
		try {
			const {stdout} = await execa('wl-paste', [...textArgs, '--no-newline'], options);
			return stdout;
		} catch (error) {
			return handleError('wl-paste', error, options, linux.paste);
		}
	},
	pasteSync(options) {
		try {
			return execaSync('wl-paste', [...textArgs, '--no-newline'], options).stdout;
		} catch (error) {
			return handleError('wl-paste', error, options, linux.pasteSync);
		}
	},
};

export default clipboard;
