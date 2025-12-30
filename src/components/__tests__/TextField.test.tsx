import React from 'react';
import { render } from '@testing-library/react-native';

import { TextField } from '../TextField';

describe('TextField', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<TextField label='Name' />);
    expect(getByText('Name')).toBeTruthy();
  });
});
