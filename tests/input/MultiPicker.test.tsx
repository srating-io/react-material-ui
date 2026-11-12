import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { MultiPicker } from '../../src/input/MultiPicker.tsx';
import { Inputs } from '../../src/input/Inputs.ts';

describe('MultiPicker', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];

  it('renders all options and label', () => {
    render(
      <MultiPicker
        inputHandler={new Inputs()}
        label="Select Options"
        options={options}
        selected={['a']}
      />
    );
    expect(document.body.contains(screen.getByText('Select Options'))).toBe(true);
    expect(document.body.contains(screen.getByText('Option A'))).toBe(true);
    expect(document.body.contains(screen.getByText('Option B'))).toBe(true);
    expect(document.body.contains(screen.getByText('Option C'))).toBe(true);
  });

  it('toggles selection on click in multi mode and calls onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={options}
        selected={['a']}
        onChange={handleChange}
      />
    );

    // Clicking unselected Option B adds it
    await user.click(screen.getByText('Option B'));
    expect(handleChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('selects single item in radio mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={options}
        selected={['a']}
        isRadio={true}
        onChange={handleChange}
      />
    );

    await user.click(screen.getByText('Option C'));
    expect(handleChange).toHaveBeenCalledWith('c');
  });

  it('disables tab focus for disabled options', () => {
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={options}
        selected={['a']}
        disabled={true}
        onChange={handleChange}
      />
    );

    const option = screen.getByText('Option B').closest('[tabindex]') as HTMLElement;
    expect(option.getAttribute('tabindex')).toBe('-1');
  });

  const partlyDisabled = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b', disabled: true },
  ];

  it('keeps only the disabled option out of the tab order', () => {
    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={partlyDisabled}
        selected={[]}
      />
    );

    const enabled = screen.getByText('Option A').closest('[tabindex]') as HTMLElement;
    const disabled = screen.getByText('Option B').closest('[tabindex]') as HTMLElement;
    expect(enabled.getAttribute('tabindex')).toBe('0');
    expect(disabled.getAttribute('tabindex')).toBe('-1');
  });

  it('ignores clicks and keyboard on a disabled option', () => {
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={partlyDisabled}
        selected={[]}
        onChange={handleChange}
      />
    );

    const option = screen.getByText('Option B').closest('[tabindex]') as HTMLElement;
    fireEvent.click(option);
    fireEvent.keyDown(option, { key: 'Enter' });
    fireEvent.keyDown(option, { key: ' ' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('ignores a disabled option in radio mode', () => {
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={partlyDisabled}
        selected={['a']}
        isRadio={true}
        onChange={handleChange}
      />
    );

    const option = screen.getByText('Option B').closest('[tabindex]') as HTMLElement;
    fireEvent.click(option);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('keeps an already selected disabled option in the selection', () => {
    const handleChange = vi.fn();

    render(
      <MultiPicker
        inputHandler={new Inputs()}
        options={partlyDisabled}
        selected={['b']}
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByText('Option A').closest('[tabindex]') as HTMLElement);
    expect(handleChange).toHaveBeenCalledWith(['b', 'a']);
  });

  it('does not report a required error when every option is disabled', () => {
    const inputHandler = new Inputs();

    render(
      <MultiPicker
        inputHandler={inputHandler}
        options={options.map((option) => ({ ...option, disabled: true }))}
        selected={[]}
        required={true}
        triggerValidation={true}
      />
    );

    expect(inputHandler.getErrors()).toHaveLength(0);
  });

  it('still reports a required error while an option is selectable', () => {
    const inputHandler = new Inputs();

    render(
      <MultiPicker
        inputHandler={inputHandler}
        options={partlyDisabled}
        selected={[]}
        required={true}
        triggerValidation={true}
      />
    );

    expect(inputHandler.getErrors()).toHaveLength(1);
  });
});
