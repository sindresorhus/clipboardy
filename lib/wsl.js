import {execa, execaSync} from 'execa';
import windows from './windows.js';

// Use `clip.exe` for copy instead of PowerShell to avoid the slow WSL-to-Windows interop overhead when starting PowerShell.
const clipboard = {
	async copy(options) {
		await execa('clip.exe', [], options);
	},
	copySync(options) {
		execaSync('clip.exe', [], options);
	},
	paste: options => windows.paste(options),
	pasteSync: options => windows.pasteSync(options),
};

export default clipboard;
