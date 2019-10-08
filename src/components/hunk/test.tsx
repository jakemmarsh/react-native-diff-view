import React from 'react';
import renderer from 'react-test-renderer';
import CodeCell from './code_cell';

describe('components/hunk', () => {
  describe('CodeCell', () => {
    it('renders correctly', () => {
      expect(renderer.create(<CodeCell text="A" />).toJSON()).toMatchSnapshot();
    });
  });
});
