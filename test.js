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

test('works with empty string', async t => {
	const fixture = '';
	t.is(await writeRead(fixture), fixture);
});

test('works with empty string (sync)', t => {
	const fixture = '';
	t.is(writeReadSync(fixture), fixture);
});

test('works with long strings', async t => {
	const fixture = 'x'.repeat(10_000);
	t.is(await writeRead(fixture), fixture);
});

test('works with tabs and special whitespace', async t => {
	const fixture = 'foo\tbar\nbaz\r\nqux';
	t.is(await writeRead(fixture), fixture);
});

test('works with tabs and special whitespace (sync)', t => {
	const fixture = 'foo\tbar\nbaz\r\nqux';
	t.is(writeReadSync(fixture), fixture);
});

test('works with unicode (sync)', t => {
	const fixture = 'ĀāĂăĄąĆćĈĉĊċČčĎ ፰፱፲፳፴፵፶፷፸፹፺፻፼ æøå ±';
	t.is(writeReadSync(fixture), fixture);
});

test('works with emojis (sync)', t => {
	const fixture = '🦄❤️🤘🐑💩';
	t.is(writeReadSync(fixture), fixture);
});

test('preserves leading and trailing spaces', async t => {
	const fixture = '  foo bar  ';
	t.is(await writeRead(fixture), fixture);
});

test('preserves leading and trailing spaces (sync)', t => {
	const fixture = '  foo bar  ';
	t.is(writeReadSync(fixture), fixture);
});
