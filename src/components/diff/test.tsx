import React from 'react';
import renderer from 'react-test-renderer';
import { IHunk, DiffChildren, Widgets } from '../../types';
import { basicHunk } from '../../fixtures';
import { Decoration, getChangeKey } from '../..';
import Diff from '.';

const DiffSplit = ({ children }: { children: DiffChildren }): JSX.Element => (
  <Diff diffType={'modify'} hunks={[basicHunk]} viewType={'split'}>
    {children}
  </Diff>
);

const DiffUnified = ({ children }: { children: DiffChildren }): JSX.Element => (
  <Diff diffType={'modify'} hunks={[basicHunk]} viewType={'unified'}>
    {children}
  </Diff>
);

describe('components/diff', () => {
  const renderRawHunks = (hunks: IHunk[]): JSX.Element => <div>{JSON.stringify(hunks)}</div>;

  describe('base', () => {
    test('renders correctly', () => {
      expect(renderer.create(<DiffSplit>{renderRawHunks}</DiffSplit>).toJSON()).toMatchSnapshot();
    });

    test('unified Diff', () => {
      expect(renderer.create(<DiffUnified>{renderRawHunks}</DiffUnified>).toJSON()).toMatchSnapshot();
    });
  });

  describe('w/ Decoration', () => {
    const renderDecoration = (): JSX.Element => (
      <Decoration hideGutter={false} monotonous={false}>
        <div>xxx</div>
      </Decoration>
    );

    test('renders correctly', () => {
      expect(renderer.create(<DiffSplit>{renderDecoration}</DiffSplit>).toJSON()).toMatchSnapshot();
    });

    test('unified Diff with Decoration', () => {
      expect(renderer.create(<DiffUnified>{renderDecoration}</DiffUnified>).toJSON()).toMatchSnapshot();
    });
  });

  describe('w/ Widget', () => {
    const getWidgets = (hunks: IHunk[]): Widgets => {
      const changes = hunks.reduce((result, { changes }) => [...result, ...changes], []);
      const longLines = changes.filter(({ content }) => content.length > 20);

      return longLines.reduce((widgets, change) => {
        const changeKey = getChangeKey(change);

        return {
          ...widgets,
          [changeKey]: <span className="error">Line too long</span>,
        };
      }, {});
    };

    test('split widget', () => {
      const hunks = [basicHunk];

      expect(
        renderer
          .create(
            <Diff hunks={hunks} widgets={getWidgets(hunks)} diffType="modify" viewType="split">
              {renderRawHunks}
            </Diff>,
          )
          .toJSON(),
      ).toMatchSnapshot();
    });

    test('unified widget', () => {
      const hunks = [basicHunk];

      expect(
        renderer
          .create(
            <Diff hunks={hunks} widgets={getWidgets(hunks)} diffType="modify" viewType="unified">
              {renderRawHunks}
            </Diff>,
          )
          .toJSON(),
      ).toMatchSnapshot();
    });
  });
});
