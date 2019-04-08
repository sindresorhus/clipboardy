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
	const f = 'foo';
	t.is(await writeRead(f), f);
});

test('sync', t => {
	const f = 'foo';
	t.is(writeReadSync(f), f);
});

test('works with ascii', async t => {
	const f = '123456789abcdefghijklmnopqrstuvwxyz+-=&_[]<^=>=/{:})-{(`)}';
	t.is(await writeRead(f), f);
});

test('works with unicode', async t => {
	const f = 'ĀāĂăĄąĆćĈĉĊċČčĎ ፰፱፲፳፴፵፶፷፸፹፺፻፼ æøå ±';
	t.is(await writeRead(f), f);
});

test('works with unicode #2', async t => {
	const f = '你好';
	t.is(await writeRead(f), f);
});

test('works with emojis', async t => {
	const f = '🦄❤️🤘🐑💩';
	t.is(await writeRead(f), f);
});

test('EOL handling', async t => {
	const f = `line ${EOL} line`;
	t.is(await writeRead(f), f);
});

test('does not strips eof', async t => {
	const f = `somestring${EOL}`;
	t.is(await writeRead(f), f);
});
