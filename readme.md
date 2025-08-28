# clipboardy

> Access the system clipboard (copy/paste)

Cross-platform. Supports: macOS, Windows, Linux, OpenBSD, FreeBSD, Android with [Termux](https://termux.com/), and [modern browsers](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#Browser_compatibility).

## Install

```sh
npm install clipboardy
```

## Usage

```js
import clipboard from 'clipboardy';

clipboard.writeSync('🦄');

clipboard.readSync();
//=> '🦄'
```

## API

In the browser, it requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts).

### clipboard

#### .write(text)

Write (copy) to the clipboard asynchronously.

Returns a `Promise`.

##### text

Type: `string`

The text to write to the clipboard.

#### .read()

Read (paste) from the clipboard asynchronously.

Returns a `Promise`.

#### .writeSync(text)

Write (copy) to the clipboard synchronously.

**Doesn't work in browsers.**

##### text

Type: `string`

The text to write to the clipboard.

#### .readSync()

Read (paste) from the clipboard synchronously.

**Doesn't work in browsers.**

#### .configure(options)

Configure the root directory for fallback binaries.

This is useful for bundlers or packagers (e.g. Node.js SEA) who need to control where `clipboardy` looks for fallback binaries like `xsel` or Windows executables.

##### options

- `fallbacksRoot` (string) The directory path where fallback binaries are located.

## FAQ

#### Where can I find the source of the bundled binaries?

The [Linux binary](fallbacks/linux/xsel) is just a bundled version of [`xsel`](https://linux.die.net/man/1/xsel). The source for the [Windows binary](fallbacks/windows/clipboard_x86_64.exe) can be found [here](https://github.com/sindresorhus/win-clipboard).

## Related

- [clipboard-cli](https://github.com/sindresorhus/clipboard-cli) - CLI for this module
- [clipboard-image](https://github.com/sindresorhus/clipboard-image) - Get and set images on the clipboard
- [copy-text-to-clipboard](https://github.com/sindresorhus/copy-text-to-clipboard) - Copy text to the clipboard in the browser
