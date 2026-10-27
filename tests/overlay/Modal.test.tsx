import React from 'react';
import { createPortal } from 'react-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../src/modal/Modal.tsx';

describe('Modal', () => {
  it('does not render content when open is false', () => {
    render(<Modal open={false} onClose={() => {}}>Modal Hidden</Modal>);
    expect(screen.queryByText('Modal Hidden')).toBeNull();
  });

  it('renders content inside portal when open is true', () => {
    render(<Modal open={true} onClose={() => {}}>Modal Visible</Modal>);
    expect(document.body.contains(screen.getByText('Modal Visible'))).toBe(true);
  });

  it('renders close button when showCloseButton is true and calls onClose on click', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Modal open={true} onClose={handleClose} showCloseButton={true}>
        Modal with Close
      </Modal>
    );

    const closeIcon = document.querySelector('svg');
    expect(closeIcon).not.toBeNull();

    if (closeIcon) {
      await user.click(closeIcon);
      expect(handleClose).toHaveBeenCalled();
    }
  });

  it('closes when the area beside the content is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<Modal open={true} onClose={handleClose}>Modal content</Modal>);

    const centering = screen.getByText('Modal content').parentElement?.parentElement;
    expect(centering).toBeTruthy();

    await user.click(centering as Element);
    expect(handleClose).toHaveBeenCalled();
  });

  it('stays open when a child in another portal is pressed', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    // what a Plane does: its dom node is a sibling of the modal, so it is outside the content
    // while its events still bubble to the backdrop through the react tree
    const Portaled = () => createPortal(<button type = 'button'>Pick a date</button>, document.body);

    render(
      <Modal open={true} onClose={handleClose}>
        Modal content
        <Portaled />
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: 'Pick a date' }));
    expect(handleClose).not.toHaveBeenCalled();
  });
});
