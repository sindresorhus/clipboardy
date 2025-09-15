declare const clipboard: {
	/**
	Write (copy) to the clipboard asynchronously.

	@param text - The text to write to the clipboard.

	@example
	```
	import clipboard from 'clipboardy';

	await clipboard.write('🦄');
	```
	*/
	write(text: string): Promise<void>;

	/**
	Read (paste) from the clipboard asynchronously.

	@example
	```
	import clipboard from 'clipboardy';

	const content = await clipboard.read();
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
	```
	*/
	writeSync(text: string): void;

	/**
	Read (paste) from the clipboard synchronously.

	__Doesn't work in browsers.__

	@example
	```
	import clipboard from 'clipboardy';

	const content = clipboard.readSync();
	//=> '🦄'
	```
	*/
	readSync(): string;
};

export default clipboard;
