import {expectType} from 'tsd';
import * as clipboardy from '.';

clipboardy.writeSync('🦄');
expectType<Promise<void>>(clipboardy.write('🦄'));
expectType<string>(clipboardy.readSync());
expectType<Promise<string>>(clipboardy.read());
