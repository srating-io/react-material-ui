import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { MultiPicker } from '../../src/input/MultiPicker.tsx';
import { Inputs } from '../../src/input/Inputs.ts';

describe('MultiPicker', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];

  it('renders all options and label', () => {
    render(
      <MultiPicker
        inputHandler={new Inputs()}
        label="Select Options"
        options={options}
        selected={['a']}
      />
    );
    expect(screen.getByText('Select Options')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('toggles selection on click in multi mode and calls onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={options}
        selected={['a']}
        onChange={handleChange}
      />
    );

    // Clicking unselected Option B adds it
    await user.click(screen.getByText('Option B'));
    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('selects single item in radio mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={options}
        selected={['a']}
        isRadio={true}
        onChange={handleChange}
      />
    );

    await user.click(screen.getByText('Option C'));
    expect(handleChange).toHaveBeenCalledWith('c');
  });

  it('does not allow selecting disabled options', () => {
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={options}
        selected={['a']}
        disabled={true}
        onChange={handleChange}
      />
    );

    const option = screen.getByText('Option B').closest('div');
    expect(option).toHaveStyle({ pointerEvents: 'none' });
  });
});
