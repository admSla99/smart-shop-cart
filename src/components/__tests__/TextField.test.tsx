import React from 'react';
import renderer from 'react-test-renderer';

import { TextField } from '../TextField';

describe('TextField', () => {
  it('renders without crashing', () => {
    const tree = renderer.create(<TextField label="Name" />);
    expect(tree.toJSON()).toBeTruthy();
  });
});
