import fs from 'node:fs';
import path from 'node:path';
import os, {EOL} from 'node:os';
import test from 'ava';
import {getFallbacksRoot} from './lib/fallbacks.js';
import clipboard from './index.js';

const writeRead = async input => {
	await clipboard.write(input);
	return clipboard.read();
};

const writeReadSync = input => {
	clipboard.writeSync(input);
	return clipboard.readSync();
};

test('async', async t => {
	const fixture = 'foo';
	t.is(await writeRead(fixture), fixture);
});

test('sync', t => {
	const fixture = 'foo';
	t.is(writeReadSync(fixture), fixture);
});

test('works with ascii', async t => {
	const fixture = '123456789abcdefghijklmnopqrstuvwxyz+-=&_[]<^=>=/{:})-{(`)}';
	t.is(await writeRead(fixture), fixture);
});

test('works with unicode', async t => {
	const fixture = 'ĀāĂăĄąĆćĈĉĊċČčĎ ፰፱፲፳፴፵፶፷፸፹፺፻፼ æøå ±';
	t.is(await writeRead(fixture), fixture);
});

test('works with unicode #2', async t => {
	const fixture = '你好';
	t.is(await writeRead(fixture), fixture);
});

test('works with emojis', async t => {
	const fixture = '🦄❤️🤘🐑💩';
	t.is(await writeRead(fixture), fixture);
});

test('EOL handling', async t => {
	const fixture = `line ${EOL} line`;
	t.is(await writeRead(fixture), fixture);
});

test('does not strips eof', async t => {
	const fixture = `somestring${EOL}`;
	t.is(await writeRead(fixture), fixture);
});

test('configure rejects non-absolute fallbacks root path', t => {
	t.throws(
		() => clipboard.configure({fallbacksRoot: 'relative/path'}),
		{instanceOf: Error, message: /absolute/},
	);
});

test('configure accepts and sets fallbacks root path', t => {
	const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'clipboardy-'));
	t.notThrows(() => clipboard.configure({fallbacksRoot: temporaryDir}));
	t.is(getFallbacksRoot(), temporaryDir);

	try {
		fs.rmSync(temporaryDir, {recursive: true});
	} catch (error) {
		console.error(`Failed to clean up test directory: ${temporaryDir}`, error);
	}
});

test('default fallbacks root path is absolute', t => {
	const root = getFallbacksRoot();
	t.true(path.isAbsolute(root));
});
