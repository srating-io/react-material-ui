import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Modal } from '../../src/modal/Modal.tsx';

describe('Modal', () => {
  it('does not render content when open is false', () => {
    render(<Modal open={false} onClose={() => {}}>Modal Hidden</Modal>);
    expect(screen.queryByText('Modal Hidden')).not.toBeInTheDocument();
  });

  it('renders content inside portal when open is true', () => {
    render(<Modal open={true} onClose={() => {}}>Modal Visible</Modal>);
    expect(screen.getByText('Modal Visible')).toBeInTheDocument();
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
    expect(closeIcon).toBeInTheDocument();

    if (closeIcon) {
      await user.click(closeIcon);
      expect(handleClose).toHaveBeenCalled();
    }
  });
});
