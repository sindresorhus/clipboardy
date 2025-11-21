import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execa, execaSync} from 'execa';
import {is64bitSync} from 'is64bit';
import {powerShellPath, executePowerShell} from 'powershell-utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const binarySuffix = is64bitSync() ? 'x86_64' : 'i686';

// Binaries from: https://github.com/sindresorhus/win-clipboard
const windowBinaryPath = path.join(__dirname, `../fallbacks/windows/clipboard_${binarySuffix}.exe`);

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
