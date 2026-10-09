import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/buttons/Button.tsx';

describe('Button', () => {
  it('renders button with title text', () => {
    render(<Button title="Click Me" value="test-btn" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(document.body.contains(button)).toBe(true);
  });

  it('defaults htmlType to "button" to prevent accidental form submission', () => {
    render(<Button title="Submit" value="submit-btn" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button.getAttribute('type')).toBe('button');
  });

  it('allows setting htmlType to "submit" explicitly', () => {
    render(<Button title="Submit Form" value="submit-btn" htmlType="submit" onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /submit form/i });
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('calls onClick with synthetic event and value when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button title="Save" value="save-action" onClick={handleClick} />);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(expect.anything(), 'save-action');
  });

  it('sets disabled attribute when disabled is true', () => {
    render(<Button title="Disabled" value="disabled-btn" disabled onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /disabled/i }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
