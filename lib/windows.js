import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa, execaSync} from 'execa';
import {is64bitSync} from 'is64bit';
import {powerShellPath, executePowerShell} from 'powershell-utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const binarySuffix = process.arch === 'arm64' ? 'aarch64' : (is64bitSync() ? 'x86_64' : 'i686');

// Binaries from: https://github.com/sindresorhus/win-clipboard
const windowBinaryPath = path.join(__dirname, `../fallbacks/windows/clipboard_${binarySuffix}.exe`);

// Check if the bundled fallback binary exists on disk. It may not exist when running in a bundled environment (e.g. Node.js SEA, webpack, esbuild).
const hasWindowsBinaryFallback = fs.existsSync(windowBinaryPath);

// Robust PowerShell commands with error handling
// Read raw stdin from the standard input stream to preserve newline characters and trailing newlines.
// Avoid $Input because it enumerates pipeline input line-by-line.
const psCopyScript = `
try {
	[Console]::InputEncoding = [System.Text.Encoding]::UTF8
	$inputStream = [Console]::OpenStandardInput()
	$memoryStream = New-Object System.IO.MemoryStream
	$inputStream.CopyTo($memoryStream)
	$text = [Console]::InputEncoding.GetString($memoryStream.ToArray())
	Set-Clipboard -Value $text
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
		if (!hasWindowsBinaryFallback) {
			throw new Error('PowerShell clipboard operation failed and the bundled fallback binary was not found. This can happen when running in a bundled environment (e.g. Node.js SEA).');
		}

		return fallbackCommand();
	}
};

const executeWithFallbackSync = (primaryCommand, fallbackCommand) => {
	try {
		return primaryCommand();
	} catch {
		if (!hasWindowsBinaryFallback) {
			throw new Error('PowerShell clipboard operation failed and the bundled fallback binary was not found. This can happen when running in a bundled environment (e.g. Node.js SEA).');
		}

		return fallbackCommand();
	}
};

const runPowerShell = (script, options) => execa(
	powerShellPath(),
	executePowerShell.createArguments(script),
	{
		windowsHide: true,
		...options,
	},
);

const runPowerShellSync = (script, options) => execaSync(
	powerShellPath(),
	executePowerShell.createArguments(script),
	{
		windowsHide: true,
		...options,
	},
);

const runBinary = (arguments_, options) => execa(
	windowBinaryPath,
	arguments_,
	{
		windowsHide: true,
		...options,
	},
);

const runBinarySync = (arguments_, options) => execaSync(
	windowBinaryPath,
	arguments_,
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
