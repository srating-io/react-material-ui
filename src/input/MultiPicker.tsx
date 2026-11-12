
'use client';

import { useTheme } from '../contexts/themeContext.tsx';
import { Columns } from '../layout/Columns.tsx';
import { Typography } from '../text/Typography.tsx';
import { Paper } from '../container/Paper.tsx';
import { FocusEvent, useCallback, useEffect, useId, useState } from 'react';
import { Inputs } from '../input/Inputs.ts';

export type MultiPickerOption = {
  label: string;
  value: string | number;
  // locks this one option, the rest of the picker stays usable
  disabled?: boolean;
};

// todo compbine with other inputs typ props in useInputLgic?

export interface MultiPickerProps {
  inputHandler: Inputs;
  options: MultiPickerOption[];
  selected: (string | number)[];
  label?: string;
  onChange?: (value: (string | number)[] | string | number | null) => void;
  style?: React.CSSProperties;
  isRadio?: boolean;
  required?: boolean;
  disabled?: boolean;
  error?: boolean; // External error control
  errorMessage?: string; // External error message
  showError?: boolean;
  triggerValidation?: boolean;
  numberOfColumns?: number;
}


export const MultiPicker = ({
  inputHandler,
  label,
  options,
  selected,
  onChange,
  isRadio = false,
  required = false,
  disabled = false,
  error: externalError = false,
  errorMessage = 'Selection is required',
  showError = true,
  style,
  triggerValidation = false,
  numberOfColumns = 2,
}: MultiPickerProps) => {
  const theme = useTheme();
  const instanceId = useId();

  // Initialize state, but keep it synced with props
  const [internalSelected, setInternalSelected] = useState<(string | number)[]>(selected || []);
  const [isTouched, setIsTouched] = useState(false);

  // nothing left to pick means required can never be satisfied, so it must not block a save
  const allOptionsDisabled = options.length > 0 && options.every((option) => option.disabled);
  const isMissingSelection = required && !allOptionsDisabled && internalSelected.length === 0;

  const hasError = externalError || (isMissingSelection && (isTouched || triggerValidation));

  const errorCallback = useCallback(() => {
    return {
      validationError: hasError || isMissingSelection,
      validationErrorMessage: errorMessage || (isMissingSelection ? 'Selection is required' : undefined),
    };
  }, [hasError, isMissingSelection, errorMessage]);

  useEffect(() => {
    if (inputHandler) {
      inputHandler.register(instanceId, errorCallback);
    }

    return () => {
      if (inputHandler) {
        inputHandler.unregister(instanceId);
      }
    };
  }, [inputHandler, instanceId, errorCallback]);

  // Effect to sync internal state if parent props change
  useEffect(() => {
    if (Array.isArray(selected)) {
      setInternalSelected((prev) => {
        if (
          prev.length === selected.length &&
          prev.every((val, index) => val === selected[index])
        ) {
          return prev;
        }
        return selected;
      });
    }
  }, [selected]);


  const handleSelection = (value: string | number) => {
    let newSelection: (string | number)[] = [];

    if (isRadio) {
      if (internalSelected.includes(value)) {
        newSelection = [];
      } else {
        newSelection = [value];
      }
    } else {
      // Logic: Multi-select toggle
      // eslint-disable-next-line no-lonely-if
      if (internalSelected.includes(value)) {
        // Remove item (Immutable way)
        newSelection = internalSelected.filter((item) => item !== value);
      } else {
        // Add item (Immutable way)
        newSelection = [...internalSelected, value];
      }
    }

    // Update Internal State
    setInternalSelected(newSelection);

    // Trigger external onChange
    if (onChange) {
      // If radio, usually parents expect a single value, if multi, an array.
      // We pass the structure based on the mode.
      onChange(isRadio ? newSelection[0] || null : newSelection);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsTouched(true);
    }
  };

  const handleOptionClick = (e: React.SyntheticEvent, option: MultiPickerOption) => {
    e.preventDefault();

    if (disabled || option.disabled) return;

    handleSelection(option.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, option: MultiPickerOption) => {
    if (disabled || option.disabled) return;
    // 'Enter' or ' ' (Spacebar) are standard for activating buttons
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent scrolling when pressing Space
      handleSelection(option.value);
    }
  };

  const getOptionContainer = (option: MultiPickerOption) => {
    const isSelected = internalSelected.includes(option.value);
    const isDisabled = disabled || !!option.disabled;

    // Dynamic Styles
    const paperStyle: React.CSSProperties = {
      textAlign: 'center',
      padding: '8px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      ...style,
    };

    // Styling logic for Selection
    if (isSelected) {
      paperStyle.backgroundColor = theme.blue[500];
    }

    // Styling logic for Error (Overrides default border, but maybe not selection fill)
    if (hasError && !isSelected) {
      paperStyle.color = theme.error.main;
    }

    if (disabled) {
      paperStyle.color = theme.text.disabled;
      paperStyle.pointerEvents = 'none';
    } else if (option.disabled) {
      // matches the disabled Button fill, but a selected one keeps its blue and only dims, so a
      // selection the caller still owns is not hidden
      paperStyle.opacity = 0.6;
      paperStyle.pointerEvents = 'none';

      if (!isSelected) {
        paperStyle.backgroundColor = theme.grey[300];
        paperStyle.color = theme.grey[500];
      }
    }

    return (
      <Paper
        key={option.value} // Always need a key for map
        hover = {!isDisabled}
        style={paperStyle}
        tabIndex={isDisabled ? -1 : 0} // Allows the element to be focused via Tab when not disabled
        onClick={(e) => handleOptionClick(e, option)}
        onKeyDown={(e) => handleKeyDown(e, option)}
      >
        <Typography type="body1" style={{ color: 'inherit' }}>
           {option.label}
        </Typography>
      </Paper>
    );
  };

  return (
    <div
      onBlur={handleBlur}
    >
      {/* Label with Required Asterisk */}
      {label && (
        <Typography type="caption" style={{ color: hasError ? theme.error.main : theme.text.secondary }}>
          {label} {/* required && <span style={{ color: showError ? theme.error.main : theme.text.secondary }}>*</span> */}
        </Typography>
      )}

      {/* Option Containers */}
      <Columns numberOfColumns={numberOfColumns} style = {{ gap: 10 }}>
        {options.map((option) => getOptionContainer(option))}
      </Columns>

      {/* Error Message -- keep space so screen does not bounce */}
      {showError && <div style={{ height: 20, marginTop: 4 }}>
        {hasError && errorMessage && (
          <Typography type="caption" style={{ color: theme.error.main }}>
            {errorMessage}
          </Typography>
        )}
      </div>}
    </div>
  );
};


