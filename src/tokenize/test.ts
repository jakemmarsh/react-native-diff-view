import refractor from 'refractor';
import { IHunk } from '../types';
import { basicHunk, multipleHunk } from '../fixtures';
import toTokenTrees from './to_token_trees';
import { markEdits, markWord, tokenize, ITokenizeOptions } from '.';

describe('tokenize', () => {
  describe('markEdits', () => {
    it('returns a function', () => {
      expect(typeof markEdits([], {})).toBe('function');
    });

    it('empty', () => {
      expect(markEdits([], {})([[{} as any], [{}]])).toEqual([[{}], [{}]]);
      expect(markEdits([], { type: 'line' })([[{} as any], [{}]])).toEqual([[{}], [{}]]);
    });

    it('withHunk', () => {
      expect(markEdits([basicHunk], {})([[], []])).toMatchSnapshot();
      expect(markEdits([multipleHunk], {})([[], []])).toMatchSnapshot();
      expect(markEdits([basicHunk], { type: 'line' })([[], []])).toMatchSnapshot();
      expect(markEdits([multipleHunk], { type: 'line' })([[], []])).toMatchSnapshot();
    });
  });

  describe('markWord', () => {
    it('returns a function', () => {
      expect(typeof markWord()).toBe('function');
    });

    it('empty', () => {
      expect(markWord()([[{} as any], []])).toEqual([[[]], []]);
    });

    it('hit value', () => {
      expect(
        markWord('A')([
          [[[{ value: 'A' }]]], // oldLinesOfPaths
          [[[{ value: 'A' }]]], // newLinesOfPaths
        ]),
      ).toEqual([
        [[[{ markType: undefined, type: 'mark', value: 'A' }]]],
        [[[{ markType: undefined, type: 'mark', value: 'A' }]]],
      ]);
    });

    it('mark single word', () => {
      expect(
        markWord('A', 'first', 'a')([
          [[[{ value: 'AAaabb' }]]], // oldLinesOfPaths
          [[[{ value: '' }]]], // newLinesOfPaths
        ]),
      ).toEqual([
        [
          [
            [
              {
                markType: 'first',
                type: 'mark',
                value: 'a',
              },
            ],
            [
              {
                markType: 'first',
                type: 'mark',
                value: 'a',
              },
            ],
            [
              {
                value: 'aabb',
              },
            ],
          ],
        ],
        [[[{ value: '' }]]],
      ]);
    });

    it('mark complex word', () => {
      expect(
        markWord('\t', 'tab', '    ')([
          [[[{ value: '\t\t    bb' }]]], // oldLinesOfPaths
          [[[{ value: '' }]]], // newLinesOfPaths
        ]),
      ).toEqual([
        [
          [
            [
              {
                markType: 'tab',
                type: 'mark',
                value: '    ',
              },
            ],
            [
              {
                markType: 'tab',
                type: 'mark',
                value: '    ',
              },
            ],
            [
              {
                value: '    bb',
              },
            ],
          ],
        ],
        [[[{ value: '' }]]],
      ]);
    });
  });

  describe('toTokenTrees', () => {
    const content =
      '<img style="width:<?php echo (80 / count($images)) ?>%" src=\'<?php echo Component_Union_FinanceInfoModel::UNION_LICEPIC_URL_PREFIX . $image?>\'/>';

    it('php will render __PHP__', () => {
      const options: ITokenizeOptions = {
        highlight: true,
        refractor,
        language: 'php',
        oldSource: null,
        enhancers: [],
      };

      const hunks = [
        {
          changes: [
            {
              content,
              isInsert: true,
              lineNumber: 1,
              type: 'insert',
            },
          ],
          content: '@@ -1,10 +1,17 @@',
          isPlain: false,
          newLines: 17,
          newStart: 1,
          oldLines: 10,
          oldStart: 1,
        },
      ] as IHunk[];

      const tokens = toTokenTrees(hunks, options);

      expect(tokens).toMatchSnapshot();
    });

    it('refractor highlight', () => {
      expect(refractor.highlight(content, 'php')).toMatchSnapshot();
    });
  });

  describe('tokenize', () => {
    it('basic', () => {
      expect(tokenize([], {})).toEqual({
        new: [[{ type: 'text', value: '' }]],
        old: [[{ type: 'text', value: '' }]],
      });
    });

    it('different config', () => {
      expect(
        tokenize([], {
          highlight: true,
          refractor: { highlight: (text: string) => [{ type: 'text', value: text }] },
        }),
      ).toEqual({
        new: [[{ type: 'text', value: '' }]],
        old: [[{ type: 'text', value: '' }]],
      });

      expect(tokenize([], { oldSource: 'A' })).toEqual({
        new: [[{ type: 'text', value: 'A' }]],
        old: [[{ type: 'text', value: 'A' }]],
      });
    });

    it('withHunk', () => {
      expect(tokenize([basicHunk, multipleHunk], {})).toMatchSnapshot();
    });
  });
});
