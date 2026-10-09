import React, { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../../src/overlay/Tooltip.tsx';

describe('Tooltip', () => {
  it('renders child element', () => {
    render(
      <Tooltip text="Helpful hint">
        <button>Target Element</button>
      </Tooltip>
    );
    expect(document.body.contains(screen.getByRole('button', { name: /target element/i }))).toBe(true);
  });

  it('preserves child ref on the wrapped element', () => {
    const buttonRef = createRef<HTMLButtonElement>();

    render(
      <Tooltip text="Tooltip Text">
        <button ref={buttonRef}>Button with Ref</button>
      </Tooltip>
    );

    expect(buttonRef.current).not.toBeNull();
    expect(buttonRef.current?.tagName).toBe('BUTTON');
    expect(buttonRef.current?.textContent).toBe('Button with Ref');
  });

  it('preserves callback refs on child element', () => {
    let capturedNode: HTMLButtonElement | null = null;
    const refCallback = (node: HTMLButtonElement | null) => {
      capturedNode = node;
    };

    render(
      <Tooltip text="Tooltip Text">
        <button ref={refCallback}>Callback Ref Button</button>
      </Tooltip>
    );

    expect(capturedNode).not.toBeNull();
    expect(capturedNode?.tagName).toBe('BUTTON');
  });

  it('calls child onClick handler alongside tooltip click handler', async () => {
    const user = userEvent.setup();
    const handleChildClick = vi.fn();

    render(
      <Tooltip text="Hint text">
        <button onClick={handleChildClick}>Click Me</button>
      </Tooltip>
    );

    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleChildClick).toHaveBeenCalledTimes(1);
  });
});
