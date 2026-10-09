import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Chip } from '../../src/container/Chip.tsx';

describe('Chip', () => {
  it('renders chip with title text', () => {
    render(<Chip title="React 19" value="react" />);
    expect(screen.getByText('React 19')).toBeInTheDocument();
  });

  it('clicking delete icon only triggers onDelete and does not trigger onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const handleDelete = vi.fn();

    render(
      <Chip title="Removable" value="tag-1" onClick={handleClick} onDelete={handleDelete} />
    );

    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith(expect.anything(), 'tag-1');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('clicking chip body only triggers onClick and not onDelete', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const handleDelete = vi.fn();

    render(
      <Chip title="Clickable Tag" value="tag-2" onClick={handleClick} onDelete={handleDelete} />
    );

    await user.click(screen.getByText('Clickable Tag'));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(expect.anything(), 'tag-2');
    expect(handleDelete).not.toHaveBeenCalled();
  });

  it('renders filled variant without errors', () => {
    render(<Chip title="Filled Chip" value="filled" filled />);
    expect(screen.getByText('Filled Chip')).toBeInTheDocument();
  });
});
