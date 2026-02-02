import {EOL} from 'node:os';
import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'ava';
import clipboard from './index.js';
import browserClipboard from './browser.js';

const writeRead = async input => {
	await clipboard.write(input);
	return clipboard.read();
};

const writeReadSync = input => {
	clipboard.writeSync(input);
	return clipboard.readSync();
};

// Basic functionality tests
test('basic async operation', async t => {
	t.is(await writeRead('test'), 'test');
});

test('basic sync operation', t => {
	t.is(writeReadSync('test'), 'test');
});

// Content type tests
test('handles various content types', async t => {
	const testCases = [
		'', // Empty string
		'simple text',
		'123456789abcdefghijklmnopqrstuvwxyz+-=&_[]<^=>=/{:})-{(`)}', // ASCII special chars
		'ĀāĂăĄąĆćĈĉĊċČčĎ ፰፱፲፳፴፵፶፷፸፹፺፻፼ æøå ± 你好', // Unicode mix
		'🦄❤️🤘🐑💩', // Emojis
		'  leading and trailing spaces  ',
		`line${EOL}break`,
		`ending newline${EOL}`,
		'foo\tbar\nbaz\r\nqux', // Various whitespace
		'x'.repeat(1000), // Longer string
	];

	// Test each case sequentially to avoid clipboard conflicts
	for (const fixture of testCases) {
		t.is(await writeRead(fixture), fixture); // eslint-disable-line no-await-in-loop
	}
});

test('handles various content types (sync)', t => {
	const testCases = [
		'',
		'sync test',
		'🎉 sync unicode 测试',
		'  sync spaces  ',
		`sync${EOL}newline`,
	];

	for (const fixture of testCases) {
		t.is(writeReadSync(fixture), fixture);
	}
});

// Error handling tests
test('write() rejects non-string input', async t => {
	const invalidInputs = [123, null, undefined, {}, [], true];

	for (const input of invalidInputs) {
		await t.throwsAsync( // eslint-disable-line no-await-in-loop
			async () => clipboard.write(input),
			{instanceOf: TypeError, message: /Expected a string/},
		);
	}
});

test('writeSync() throws on non-string input', t => {
	const invalidInputs = [123, null, undefined, {}, [], true];

	for (const input of invalidInputs) {
		t.throws(
			() => clipboard.writeSync(input),
			{instanceOf: TypeError, message: /Expected a string/},
		);
	}
});

test('browser export provides image stubs', async t => {
	t.is(typeof browserClipboard.writeImages, 'function');
	t.is(typeof browserClipboard.readImages, 'function');
	t.is(typeof browserClipboard.hasImages, 'function');

	await browserClipboard.writeImages([]);
	t.deepEqual(await browserClipboard.readImages(), []);
	t.false(await browserClipboard.hasImages());
});

// Image clipboard tests
test('writeImages() rejects non-array input', async t => {
	await t.throwsAsync(
		async () => clipboard.writeImages('not-an-array'),
		{instanceOf: TypeError, message: /Expected an array/},
	);
});

if (process.platform === 'darwin') {
	test('image round-trip', async t => {
		// Create a minimal valid PNG
		const temporaryDirectory = fs.mkdtempSync(path.join(import.meta.dirname, 'tmp-'));
		const imagePath = path.join(temporaryDirectory, 'test.png');

		// 8x8 RGB PNG
		const pngBuffer = Buffer.from(
			'89504e470d0a1a0a0000000d49484452000000080000000808020000004b6d29dc0000001849444154789c6260a0040098e7f84f0000f3ff03f40810061c0089f9057f2a4c29970000000049454e44ae426082',
			'hex',
		);
		fs.writeFileSync(imagePath, pngBuffer);

		try {
			await clipboard.writeImages([imagePath]);

			t.true(await clipboard.hasImages());

			const readPaths = await clipboard.readImages();
			t.true(readPaths.length > 0);

			for (const filePath of readPaths) {
				t.true(fs.existsSync(filePath));
				fs.unlinkSync(filePath);
			}
		} finally {
			fs.rmSync(temporaryDirectory, {recursive: true});
		}
	});

	test('hasImages() returns false after writing text', async t => {
		await clipboard.write('text content');
		t.false(await clipboard.hasImages());
	});
}
