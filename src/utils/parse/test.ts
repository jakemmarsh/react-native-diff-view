import { basic } from '../../fixtures';
import { parseDiff } from '..';

describe('utils/parse', () => {
  describe('parseDiff', () => {
    it('basic', () => {
      expect(parseDiff(basic)).toMatchSnapshot();
    });

    it('trim', () => {
      expect(parseDiff(`\n${basic}`)).toMatchSnapshot();
    });
  });
});
