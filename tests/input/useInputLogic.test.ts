import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextInputLogic, useSelectInputLogic, useMultiSelectInputLogic } from '../../src/input/hooks/useInputLogic.ts';
import { Inputs } from '../../src/input/Inputs.ts';

describe('useInputLogic', () => {
  it('initializes with defaultValue when valueProp is undefined', () => {
    const { result } = renderHook(() =>
      useTextInputLogic({ defaultValue: 'initial' })
    );
    expect(result.current.value).toBe('initial');
  });

  it('formats number input on blur by removing non-digits', () => {
    const { result } = renderHook(() =>
      useTextInputLogic({ defaultValue: 'abc123xyz.45', formatter: 'number' })
    );

    act(() => {
      result.current.handlers.handleBlur({} as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe('123.45');
  });

  it('formats money input on blur with two decimal places', () => {
    const { result } = renderHook(() =>
      useTextInputLogic({ defaultValue: '45.1', formatter: 'money' })
    );

    act(() => {
      result.current.handlers.handleBlur({} as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.value).toBe('45.10');
  });

  it('handles null and undefined gracefully without throwing in transformOnBlur', () => {
    const { result } = renderHook(() =>
      useTextInputLogic({ formatter: 'money' })
    );

    expect(() => {
      act(() => {
        result.current.handlers.handleBlur({} as React.FocusEvent<HTMLInputElement>);
      });
    }).not.toThrow();
  });

  it('validates required fields when touched and empty', () => {
    const { result } = renderHook(() =>
      useTextInputLogic({ required: true, defaultValue: '' })
    );

    act(() => {
      result.current.handlers.handleFocus({} as React.FocusEvent<HTMLInputElement>);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.displayedErrorMessage).toBe('This field is required');
  });

  it('validates a required multi select once touched and empty', () => {
    const { result } = renderHook(() => useMultiSelectInputLogic({ required: true, options: [{ label: 'A', value: 'a' }], value: [] }));

    act(() => {
      result.current.handlers.handleIsTouched(true);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.displayedErrorMessage).toBe('Please select an option');
  });

  it('rejects a multi select value with no matching option', () => {
    const { result } = renderHook(() => useMultiSelectInputLogic({ options: [{ label: 'A', value: 'a' }], value: ['a', 'nope'] }));

    expect(result.current.hasError).toBe(true);
    expect(result.current.displayedErrorMessage).toBe('Invalid option selected');
  });

  it('reports an empty array to the form handler for a required multi select', () => {
    // An empty array is truthy, so the registry needs its own emptiness test - this is the one
    // case the validator cannot cover, since it stays valid until the input is touched.
    const controller = new Inputs();

    renderHook(() => useMultiSelectInputLogic({ required: true, inputHandler: controller, options: [{ label: 'A', value: 'a' }], value: [] }));

    expect(controller.getErrors()).toHaveLength(1);
  });

  it('still treats an empty string select value as empty for the form handler', () => {
    // Guards the non-array branch of that same emptiness test against regression.
    const controller = new Inputs();

    renderHook(() => useSelectInputLogic({ required: true, inputHandler: controller, options: [{ label: 'A', value: 'a' }], value: '' }));

    expect(controller.getErrors()).toHaveLength(1);
  });
});

describe('Inputs OOP controller', () => {
  it('registers and unregisters inputs correctly', () => {
    const controller = new Inputs();
    const callback = vi.fn(() => ({ validationError: false, validationErrorMessage: undefined }));

    controller.register('input-1', callback);
    expect(controller.getErrors()).toHaveLength(0);

    controller.unregister('input-1');
  });

  it('detects errors and returns error list across registered inputs', () => {
    const controller = new Inputs();
    const invalidCallback = vi.fn(() => ({
      validationError: true,
      validationErrorMessage: 'Required field',
    }));

    controller.register('input-err', invalidCallback);
    const errors = controller.getErrors();

    expect(errors).toHaveLength(1);
    expect(errors[0].validationErrorMessage).toBe('Required field');
    expect(invalidCallback).toHaveBeenCalled();
  });
});
