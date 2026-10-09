import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { IconButton } from '../../src/buttons/IconButton.tsx';

describe('IconButton', () => {
  const DummyIcon = <span data-testid="dummy-icon">Icon</span>;

  it('renders button with icon and default type="button"', () => {
    render(<IconButton icon={DummyIcon} value="icon-btn" onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(document.body.contains(button)).toBe(true);
    expect(button.getAttribute('type')).toBe('button');
    expect(document.body.contains(screen.getByTestId('dummy-icon'))).toBe(true);
  });

  it('calls onClick with synthetic event and value when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<IconButton icon={DummyIcon} value="close-action" onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(expect.anything(), 'close-action');
  });

  it('supports explicit htmlType="submit"', () => {
    render(<IconButton icon={DummyIcon} value="submit-icon" htmlType="submit" onClick={() => {}} />);
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit');
  });

  it('renders badge count when badge > 0', () => {
    render(<IconButton icon={DummyIcon} value="badge-btn" badge={5} onClick={() => {}} />);
    expect(document.body.contains(screen.getByText('5'))).toBe(true);
  });

  it('renders 99+ when badge exceeds 99', () => {
    render(<IconButton icon={DummyIcon} value="badge-btn" badge={120} onClick={() => {}} />);
    expect(document.body.contains(screen.getByText('99+'))).toBe(true);
  });
});
