import {EOL} from 'os';
import {serial as test} from 'ava';
import clipboardy from '.';

const writeRead = async input => {
	await clipboardy.write(input);
	return clipboardy.read();
};

const writeReadSync = input => {
	clipboardy.writeSync(input);
	return clipboardy.readSync();
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
