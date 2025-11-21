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
	'-NoLogo',
	'-NonInteractive',
	'-WindowStyle',
	'Hidden',
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

const runPowerShell = (script, options) => execa(
	powershellPath,
	createEncodedCommand(script),
	{
		windowsHide: true,
		...options,
	},
);

const runPowerShellSync = (script, options) => execaSync(
	powershellPath,
	createEncodedCommand(script),
	{
		windowsHide: true,
		...options,
	},
);

const runBinary = (args, options) => execa(
	windowBinaryPath,
	args,
	{
		windowsHide: true,
		...options,
	},
);

const runBinarySync = (args, options) => execaSync(
	windowBinaryPath,
	args,
	{
		windowsHide: true,
		...options,
	},
);

const clipboard = {
	copy: async options => executeWithFallback(
		async () => runPowerShell(psCopyScript, options),
		async () => runBinary(['--copy'], options),
	),

	async paste(options) {
		const {stdout} = await executeWithFallback(
			async () => runPowerShell(psPasteScript, options),
			async () => runBinary(['--paste'], options),
		);
		return stdout;
	},

	copySync: options => executeWithFallbackSync(
		() => runPowerShellSync(psCopyScript, options),
		() => runBinarySync(['--copy'], options),
	),

	pasteSync: options => executeWithFallbackSync(
		() => runPowerShellSync(psPasteScript, options),
		() => runBinarySync(['--paste'], options),
	).stdout,
};

export default clipboard;
