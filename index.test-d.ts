import {expectType} from 'tsd';
import clipboard from './index.js';

clipboard.writeSync('🦄');
expectType<Promise<void>>(clipboard.write('🦄'));
expectType<string>(clipboard.readSync());
expectType<Promise<string>>(clipboard.read());
