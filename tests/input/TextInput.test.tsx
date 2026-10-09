import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { TextInput } from '../../src/input/TextInput.tsx';

describe('TextInput', () => {
  it('renders input with label and placeholder', () => {
    render(<TextInput label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('updates value and calls onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<TextInput onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'hello');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('hello');
  });

  it('reflects controlled value prop', () => {
    render(<TextInput value="controlled text" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveValue('controlled text');
  });

  it('displays error message when external error is passed', () => {
    render(
      <TextInput
        error={true}
        errorMessage="Invalid email address"
        showError={true}
      />
    );
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('applies disabled state to input element', () => {
    render(<TextInput disabled placeholder="Disabled field" />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
