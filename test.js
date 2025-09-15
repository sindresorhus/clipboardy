import {EOL} from 'node:os';
import test from 'ava';
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

