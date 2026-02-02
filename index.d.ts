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

	/**
	Write (copy) images to the clipboard asynchronously.

	Only supported on macOS. On other platforms, this is a no-op.

	@param filePaths - The file paths of the images to write to the clipboard. Supports any image type that macOS supports, including PNG, JPEG, HEIC, WebP, and GIF.

	@example
	```
	import clipboard from 'clipboardy';

	await clipboard.writeImages(['/path/to/image.png']);
	```
	*/
	writeImages(filePaths: string[]): Promise<void>;

	/**
	Read images from the clipboard asynchronously.

	Only supported on macOS. On other platforms, this returns an empty array.

	Returns file paths to temporary PNG files. You are responsible for cleaning up the files.

	@example
	```
	import clipboard from 'clipboardy';

	const filePaths = await clipboard.readImages();
	```
	*/
	readImages(): Promise<string[]>;

	/**
	Check if the clipboard contains images.

	Only supported on macOS. On other platforms, this returns `false`.

	@example
	```
	import clipboard from 'clipboardy';

	const hasImages = await clipboard.hasImages();
	```
	*/
	hasImages(): Promise<boolean>;
};

export default clipboard;
