declare const clipboard: {
	/**
	Write (copy) to the clipboard asynchronously.

	@param text - The text to write to the clipboard.

	@example
	```
	import clipboard from 'clipboardy';

	await clipboard.write('🦄');

	await clipboard.read();
	//=> '🦄'
	```
	*/
	write(text: string): Promise<void>;

	/**
	Read (paste) from the clipboard asynchronously.

	@example
	```
	import clipboard from 'clipboardy';

	await clipboard.write('🦄');

	await clipboard.read();
	//=> '🦄'
	```
	*/
	read(): Promise<string>;

	/**
	Write (copy) to the clipboard synchronously.

	__Doesn't work in browsers.__

	@param text - The text to write to the clipboard.

	@example
	```
	import clipboard from 'clipboardy';

	clipboard.writeSync('🦄');

	clipboard.readSync();
	//=> '🦄'
	```
	*/
	writeSync(text: string): void;

	/**
	Read (paste) from the clipboard synchronously.

	__Doesn't work in browsers.__

	@example
	```
	import clipboard from 'clipboardy';

	clipboard.writeSync('🦄');

	clipboard.readSync();
	//=> '🦄'
	```
	*/
	readSync(): string;

	/**
	Configure the root directory for fallback binaries.
	This is useful for bundlers or packagers (e.g. Node.js SEA) who need
	to control where `clipboardy` looks for fallback binaries like `xsel` or
	Windows executables.

	@example
	```
	import clipboard from 'clipboardy';

	// Tell clipboardy to load fallbacks from a custom directory
	clipboard.configure({fallbacksRoot: '/path/to/fallbacks'});
	```

	@param options.fallbacksRoot The directory path where fallback binaries are located.
	*/
	configure(options: {fallbacksRoot: string}): void;
};

export default clipboard;
