import {Buffer} from 'node:buffer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa, execaSync} from 'execa';
import {is64bitSync} from 'is64bit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const binarySuffix = is64bitSync() ? 'x86_64' : 'i686';

// Binaries from: https://github.com/sindresorhus/win-clipboard
const windowBinaryPath = path.join(__dirname, `../fallbacks/windows/clipboard_${binarySuffix}.exe`);

const powershellPath = 'powershell.exe';

const psCommonArgs = [
	'-NoProfile',
	'-NonInteractive',
	'-ExecutionPolicy',
	'Bypass',
];

// Use -EncodedCommand for better safety and Unicode handling
const createEncodedCommand = script => {
	const encodedCommand = Buffer.from(script, 'utf16le').toString('base64');
	return [...psCommonArgs, '-EncodedCommand', encodedCommand];
};

// Robust PowerShell commands with error handling
const psCopyScript = `
try {
	[Console]::InputEncoding = [System.Text.Encoding]::UTF8
	$input = [Console]::In.ReadToEnd()
	if ($input -eq $null) { $input = '' }
	Set-Clipboard -Value $input
} catch {
	Write-Error "Failed to set clipboard: $($_.Exception.Message)"
	exit 1
}
`.trim();

const psPasteScript = `
try {
	$content = Get-Clipboard -Raw -ErrorAction Stop
	if ($content -eq $null) { $content = '' }
	[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
	[Console]::Out.Write($content)
} catch {
	Write-Error "Failed to get clipboard: $($_.Exception.Message)"
	exit 1
}
`.trim();

const executeWithFallback = async (primaryCommand, fallbackCommand) => {
	try {
		return await primaryCommand();
	} catch {
		return fallbackCommand();
	}
};

const executeWithFallbackSync = (primaryCommand, fallbackCommand) => {
	try {
		return primaryCommand();
	} catch {
		return fallbackCommand();
	}
};

const clipboard = {
	copy: async options => executeWithFallback(
		async () => execa(powershellPath, createEncodedCommand(psCopyScript), options),
		async () => execa(windowBinaryPath, ['--copy'], options),
	),

	async paste(options) {
		const {stdout} = await executeWithFallback(
			async () => execa(powershellPath, createEncodedCommand(psPasteScript), options),
			async () => execa(windowBinaryPath, ['--paste'], options),
		);
		return stdout;
	},

	copySync: options => executeWithFallbackSync(
		() => execaSync(powershellPath, createEncodedCommand(psCopyScript), options),
		() => execaSync(windowBinaryPath, ['--copy'], options),
	),

	pasteSync: options => executeWithFallbackSync(
		() => execaSync(powershellPath, createEncodedCommand(psPasteScript), options),
		() => execaSync(windowBinaryPath, ['--paste'], options),
	).stdout,
};

export default clipboard;
