# clipboardy

> Access the system clipboard (copy/paste)

Cross-platform. Supports: macOS, Windows, Linux (including Wayland), OpenBSD, FreeBSD, Android with [Termux](https://termux.com/), and [modern browsers](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#Browser_compatibility).

## Install

```sh
npm install clipboardy
```

## Usage

```js
import clipboard from 'clipboardy';

await clipboard.write('🦄');

await clipboard.read();
//=> '🦄'

// Or use the synchronous API
clipboard.writeSync('🦄');

clipboard.readSync();
//=> '🦄'
```

## API

**Browser usage:** Requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) (HTTPS). Synchronous methods are not available in browsers.

### clipboard

#### .write(text)

Write (copy) to the clipboard asynchronously.

Returns a `Promise<void>`.

##### text

Type: `string`

The text to write to the clipboard.

```js
await clipboard.write('🦄');
```

#### .read()

Read (paste) from the clipboard asynchronously.

Returns a `Promise<string>`.

```js
const content = await clipboard.read();
//=> '🦄'
```

#### .writeSync(text)

Write (copy) to the clipboard synchronously.

**Doesn't work in browsers.**

##### text

Type: `string`

The text to write to the clipboard.

```js
clipboard.writeSync('🦄');
```

#### .readSync()

Read (paste) from the clipboard synchronously.

Returns a `string`.

**Doesn't work in browsers.**

```js
const content = clipboard.readSync();
//=> '🦄'
```

## FAQ

#### Where can I find the source of the bundled binaries?

The [Linux binary](fallbacks/linux/xsel) is just a bundled version of [`xsel`](https://linux.die.net/man/1/xsel). The source for the [Windows binary](fallbacks/windows/clipboard_x86_64.exe) can be found [here](https://github.com/sindresorhus/win-clipboard).

On Windows, clipboardy first tries the native PowerShell cmdlets (`Set-Clipboard`/`Get-Clipboard`) and falls back to the bundled binary if PowerShell is unavailable or restricted.

#### Does this work on Wayland?

Yes. On Linux, clipboardy automatically detects Wayland sessions and uses [`wl-clipboard`](https://github.com/bugaevc/wl-clipboard) when available. If not, it gracefully falls back to X11 tools. Also works with WSLg (Windows Subsystem for Linux GUI). Install `wl-clipboard` using your distribution's package manager.

## Related

- [clipboard-cli](https://github.com/sindresorhus/clipboard-cli) - CLI for this module
- [clipboard-image](https://github.com/sindresorhus/clipboard-image) - Get and set images on the clipboard
- [copy-text-to-clipboard](https://github.com/sindresorhus/copy-text-to-clipboard) - Copy text to the clipboard in the browser
