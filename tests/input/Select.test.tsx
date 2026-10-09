import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Select } from '../../src/input/Select.tsx';

describe('Select', () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  it('renders select with placeholder or label', () => {
    render(<Select options={options} label="Fruit" placeholder="Choose a fruit" />);
    expect(screen.getByText('Fruit')).toBeInTheDocument();
  });

  it('does not mutate caller options array passed via props', () => {
    const rawOptions = [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ];
    Object.freeze(rawOptions[0]); // Throws if mutated

    render(<Select options={rawOptions} value="1" />);
    expect('selectable' in rawOptions[0]).toBe(false);
  });

  it('displays selected option label when value matches', () => {
    render(<Select options={options} value="banana" />);
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('opens menu and calls onChange when option is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Select options={options} value="apple" onChange={handleChange} />);

    // Click on select trigger
    const trigger = screen.getByText('Apple');
    await user.click(trigger);

    // Option should appear in portal
    const cherryOption = await screen.findByText('Cherry');
    await user.click(cherryOption);

    expect(handleChange).toHaveBeenCalledWith('cherry');
  });

  it('renders error message when error and errorMessage are provided', () => {
    render(
      <Select
        options={options}
        error={true}
        errorMessage="Please select a valid fruit"
        showError={true}
      />
    );
    expect(screen.getByText('Please select a valid fruit')).toBeInTheDocument();
  });
});
