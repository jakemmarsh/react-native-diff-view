import React from 'react';
import renderer from 'react-test-renderer';
import { IHunk, DiffChildren, Widgets } from '../../types';
import { basicHunk } from '../../fixtures';
import { Decoration, getChangeKey } from '../..';
import Diff from '.';

const TestDiff = ({ children }: { children: DiffChildren }): JSX.Element => (
  <Diff diffType={'modify'} hunks={[basicHunk]}>
    {children}
  </Diff>
);

describe('components/diff', () => {
  const renderRawHunks = (hunks: IHunk[]): JSX.Element => <div>{JSON.stringify(hunks)}</div>;

  describe('base', () => {
    it('renders correctly', () => {
      expect(renderer.create(<TestDiff>{renderRawHunks}</TestDiff>).toJSON()).toMatchSnapshot();
    });
  });

  describe('w/ Decoration', () => {
    const renderDecoration = (): JSX.Element => (
      <Decoration hideGutter={false} monotonous={false}>
        <div>xxx</div>
      </Decoration>
    );

    it('renders correctly', () => {
      expect(renderer.create(<TestDiff>{renderDecoration}</TestDiff>).toJSON()).toMatchSnapshot();
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

    it('renders correctly', () => {
      const hunks = [basicHunk];

      expect(
        renderer
          .create(
            <Diff hunks={hunks} widgets={getWidgets(hunks)} diffType="modify">
              {renderRawHunks}
            </Diff>,
          )
          .toJSON(),
      ).toMatchSnapshot();
    });
  });
});
