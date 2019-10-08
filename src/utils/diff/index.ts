import { computeLineNumberFactory, findChangeByLineNumberFactory, getCorrespondingLineNumberFactory } from './factory';

export * from './insert_hunk';
export * from './expand_collapsed_block_by';
export * from './get_change_key';

export const computeOldLineNumber = computeLineNumberFactory('old');

export const computeNewLineNumber = computeLineNumberFactory('new');

export const findChangeByOldLineNumber = findChangeByLineNumberFactory('old');

export const findChangeByNewLineNumber = findChangeByLineNumberFactory('new');

export const getCorrespondingOldLineNumber = getCorrespondingLineNumberFactory('new');

export const getCorrespondingNewLineNumber = getCorrespondingLineNumberFactory('old');
