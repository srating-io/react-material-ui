import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { TextInput } from '../../src/input/TextInput.tsx';

describe('TextInput', () => {
  it('renders input with label and placeholder', () => {
    render(<TextInput label="Username" placeholder="Enter username" />);
    expect(document.body.contains(screen.getByText('Username'))).toBe(true);
    expect(document.body.contains(screen.getByRole('textbox'))).toBe(true);
  });

  it('updates value and calls onChange when typing', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<TextInput onChange={handleChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, 'hello');
    expect(handleChange).toHaveBeenCalled();
    expect(input.value).toBe('hello');
  });

  it('reflects controlled value prop', () => {
    render(<TextInput value="controlled text" onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('controlled text');
  });

  it('displays error message when external error is passed', () => {
    render(
      <TextInput
        error={true}
        errorMessage="Invalid email address"
        showError={true}
      />
    );
    expect(document.body.contains(screen.getByText('Invalid email address'))).toBe(true);
  });

  it('applies disabled state to input element', () => {
    render(<TextInput disabled placeholder="Disabled field" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
