import {EOL, tmpdir} from 'node:os';
import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'ava';
import browserClipboard from './browser.js';
import wayland from './lib/wayland.js';
import clipboard from './index.js';

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

if (process.platform === 'win32') {
	test('preserves newlines from stdin on Windows', async t => {
		const input = 'line one\nline two\n';
		t.is(await writeRead(input), input);
	});
}

const countTemporaryFiles = () => fs.readdirSync(tmpdir()).filter(name => name.startsWith('clipboardy-')).length;

if (process.platform !== 'win32') {
	const createFakeWlCopyEnvironment = () => {
		const temporaryDirectory = fs.mkdtempSync(path.join(import.meta.dirname, '.ai-temporary-'));
		const fakeWlCopyPath = path.join(temporaryDirectory, 'wl-copy');
		const backgroundProcessIdPath = path.join(temporaryDirectory, 'background-process-id');
		fs.writeFileSync(fakeWlCopyPath, '#!/bin/sh\nsleep 5 &\necho $! > "$FAKE_WL_COPY_PID_FILE"\nexit 0\n', {mode: 0o755});

		return {
			temporaryDirectory,
			cleanup() {
				try {
					const backgroundProcessId = Number(fs.readFileSync(backgroundProcessIdPath, 'utf8'));
					if (backgroundProcessId > 0) {
						process.kill(backgroundProcessId);
					}
				} catch {}

				fs.rmSync(temporaryDirectory, {recursive: true});
			},
			environment: {
				...process.env,
				PATH: `${temporaryDirectory}${path.delimiter}${process.env.PATH}`,
				FAKE_WL_COPY_PID_FILE: backgroundProcessIdPath,
			},
		};
	};

	test('Wayland write() does not wait for the clipboard to be taken over', async t => {
		const {cleanup, environment} = createFakeWlCopyEnvironment();

		try {
			const before = countTemporaryFiles();
			const start = performance.now();
			await wayland.copy({input: 'no hang', env: environment});
			t.true(performance.now() - start < 2000);
			t.is(countTemporaryFiles(), before);
		} finally {
			cleanup();
		}
	});

	test('Wayland writeSync() does not wait for the clipboard to be taken over', t => {
		const {cleanup, environment} = createFakeWlCopyEnvironment();

		try {
			const before = countTemporaryFiles();
			const start = performance.now();
			wayland.copySync({input: 'no hang', env: environment});
			t.true(performance.now() - start < 2000);
			t.is(countTemporaryFiles(), before);
		} finally {
			cleanup();
		}
	});
}

if (process.platform === 'linux') {
	// On Wayland, `wl-copy` keeps serving the clipboard in a background process, which must not keep us waiting nor leave its stderr file behind (https://github.com/sindresorhus/clipboardy/issues/111)
	test('write() does not wait for the clipboard to be taken over', async t => {
		const start = performance.now();
		await clipboard.write('no hang');
		t.true(performance.now() - start < 2000);
	});

	test('writeSync() does not wait for the clipboard to be taken over', t => {
		const start = performance.now();
		clipboard.writeSync('no hang');
		t.true(performance.now() - start < 2000);
	});

	test('write() does not leave temporary files behind', async t => {
		const before = countTemporaryFiles();
		await clipboard.write('no leftovers');
		t.is(countTemporaryFiles(), before);
	});

	test('writeSync() does not leave temporary files behind', t => {
		const before = countTemporaryFiles();
		clipboard.writeSync('no leftovers');
		t.is(countTemporaryFiles(), before);
	});
}

// Large input test (reproduces https://github.com/sindresorhus/clipboard-cli/issues/9)
test('handles large multiline input', async t => {
	const line = 'I am a pink elephant. Do not think about me';
	const lineCount = 5000;
	const input = Array.from({length: lineCount}, () => line).join('\n');

	const output = await writeRead(input);
	t.is(output, input);
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
