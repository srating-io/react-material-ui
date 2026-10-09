import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Paper } from '../../src/container/Paper.tsx';

describe('Paper', () => {
  it('renders children inside paper surface', () => {
    render(<Paper>Paper Surface Content</Paper>);
    expect(screen.getByText('Paper Surface Content')).toBeInTheDocument();
  });

  it('renders with transparency without throwing', () => {
    render(<Paper transparency={0.5}>Transparent Paper</Paper>);
    expect(screen.getByText('Transparent Paper')).toBeInTheDocument();
  });

  it('renders with hover and transparency without color conversion crash', () => {
    render(<Paper transparency={0.7} hover>Hoverable Paper</Paper>);
    expect(screen.getByText('Hoverable Paper')).toBeInTheDocument();
  });

  it('handles click events when onClick is provided', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Paper onClick={handleClick}>Clickable Paper</Paper>);
    await user.click(screen.getByText('Clickable Paper'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
