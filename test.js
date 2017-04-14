import {serial as test} from 'ava';
import m from './';

const writeRead = async input => {
	await m.write(input);
	return m.read();
};

test('async', async t => {
	const f = 'foo';
	t.is(await writeRead(f), f);
});

test('sync', t => {
	const f = 'foo';
	m.writeSync(f);
	t.is(m.readSync(), f);
});

test('works with ascii', async t => {
	const f = '123456789abcdefghijklmnopqrstuvwxyz+-=&_[]<^=>=/{:})-{(`)}';
	t.is(await writeRead(f), f);
});

test.only('works with unicode', async t => {
	const f = 'ĀāĂăĄąĆćĈĉĊċČčĎ ፰፱፲፳፴፵፶፷፸፹፺፻፼ æøå ±';
	t.is(await writeRead(f), f);
});

test('works with emojis', async t => {
	const f = '🦄❤️🤘🐑💩';
	t.is(await writeRead(f), f);
});
