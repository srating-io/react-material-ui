import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Tab } from '../../src/buttons/Tab.tsx';

describe('Tab', () => {
  it('renders tab button with title text and type="button"', () => {
    render(<Tab title="Overview" value="tab-1" selected={false} onClick={() => {}} />);
    const button = screen.getByRole('button', { name: /overview/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
  });

  it('calls onClick with synthetic event and value when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Tab title="Settings" value="settings-tab" selected={false} onClick={handleClick} />);
    await user.click(screen.getByRole('button', { name: /settings/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(expect.anything(), 'settings-tab');
  });

  it('renders correctly when selected is true', () => {
    render(<Tab title="Active Tab" value="active" selected={true} onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /active tab/i })).toBeInTheDocument();
  });
});
