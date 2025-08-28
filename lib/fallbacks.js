import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let currentFallbacksRoot = path.join(__dirname, '../fallbacks');

export function getFallbacksRoot() {
	return currentFallbacksRoot;
}

export function setFallbacksRoot(newRoot) {
	if (typeof newRoot !== 'string') {
		throw new TypeError('Fallbacks root must be a string');
	}

	if (!path.isAbsolute(newRoot)) {
		throw new Error('Fallbacks root must be an absolute path');
	}

	currentFallbacksRoot = newRoot;
}
