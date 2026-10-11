'use client';

import { useTheme } from '../contexts/themeContext.tsx';
import KeyboardArrowDownIcon from '@esmalley/react-material-icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@esmalley/react-material-icons/KeyboardArrowUp';
import CheckBoxIcon from '@esmalley/react-material-icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@esmalley/react-material-icons/CheckBoxOutlineBlank';
import { Typography } from '../text/Typography.tsx';
import { MultiSelectInputProps, SelectOption, useMultiSelectInputLogic } from './hooks/useInputLogic.ts';
import { Cancel as CancelIcon } from '@esmalley/react-material-icons/Cancel';
import { IconButton } from '../buttons/IconButton.tsx';

import { Objector, Style, Color } from '@esmalley/ts-utils';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Menu, MenuOption } from '../menu/Menu.tsx';


export const MultiSelect: React.FC<MultiSelectInputProps> = (props) => {
  const {
    inputHandler,
    options,
    ref = null,
    style = {},
    placeholderStyle = {},
    clearIconStyle = {},
    placeholder,
    label,
    variant = 'outlined',
    disabled = false,
    error: externalError = false,
    errorMessage: externalErrorMessage,
    showError = true,
    required = false,
    onFocus,
    onBlur,
    onChange,
    value: valueProp,
    triggerValidation = false,
    icon = null,
    clear = false,
    transformPlaceholder = true,
    allOption = false,
    allLabel = 'All',
    displayMode = 'labels',
    renderValue,
    closeOnSelect = false,
    showMenuCloseButton = false,
    ...domProps
  } = props;

  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const internalRef = useRef<HTMLDivElement | null>(null);
  const pointerFocusRef = useRef(false);

  // This helper ensures both the prop ref and our internal ref get the DOM node
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    internalRef.current = node;
    if (ref) {
      ref.current = node;
    }
  }, [ref]);

  // Use the shared logic
  const {
    value,
    isFocused,
    hasError,
    displayedErrorMessage,
    handlers,
    anchor,
    isOpen,
  } = useMultiSelectInputLogic(props);

  // Uncontrolled with no defaultValue hands back undefined, and everything below indexes into it
  const selected = useMemo(() => (Array.isArray(value) ? value : []), [value]);

  // Resolved in value order, so the trigger reads in the order the user picked
  const selectedOptions: SelectOption[] = useMemo(
    () => selected
      .map((v) => options.find((o) => o.value === v))
      .filter((o): o is SelectOption => Boolean(o)),
    [options, selected],
  );

  const commit = (next: (string | number)[]) => {
    if (valueProp === undefined) {
      handlers.handleInternalValue(next);
    }
    if (onChange) {
      onChange(next);
    }

    // Clear validation error when something is selected. Checked on `next`, not on the clicked
    // option, so unticking the last box leaves the error in place.
    if (required && next.length) {
      handlers.handleValidationError(false);
    }
  };

  const handleSelect = (option: MenuOption) => {
    // value is (string | number)[], so null can only ever be the All row
    if (option.value === null) {
      commit([]);
    } else {
      const optionValue = option.value;
      commit(
        selected.includes(optionValue)
          ? selected.filter((v) => v !== optionValue)
          : [...selected, optionValue],
      );
    }

    if (closeOnSelect) {
      handlers.handleIsOpen(false);
    }
  };

  // What the closed trigger reads. `none` keeps it empty so the placeholder carries the meaning.
  let triggerText = '';
  if (displayMode === 'labels') {
    if (selectedOptions.length) {
      triggerText = selectedOptions.map((o) => o.label).join(', ');
    } else if (allOption) {
      triggerText = allLabel;
    }
  } else if (displayMode === 'count') {
    if (selectedOptions.length) {
      triggerText = `${selectedOptions.length} selected`;
    } else if (allOption) {
      triggerText = allLabel;
    }
  }

  const triggerContent = renderValue ? renderValue(selectedOptions) : triggerText;
  const hasTriggerText = renderValue
    ? (triggerContent !== null && triggerContent !== undefined && triggerContent !== '')
    : triggerText !== '';

  // Derived from the rendered text rather than from the value, because an empty array is truthy -
  // testing the value the way the single select does would strand the placeholder in every mode.
  const hidePlaceholder = !transformPlaceholder && (hasTriggerText || isFocused);

  const errorColor = theme.error.main;
  let textColor = theme.text.primary;

  let borderColor = theme.mode === 'dark' ? theme.grey[400] : theme.grey[600];

  if (hasError) {
    borderColor = errorColor;
  } else if (isFocused || isHovered) {
    borderColor = theme.mode === 'dark' ? theme.info.light : theme.info.dark;
  }

  if (disabled) {
    textColor = theme.text.disabled;
  }

  let paddingLeft = (icon ? 40 : 16);
  const iconLeft = icon ? 8 : 0;
  // standard variant has padding top to help make it look more aligned... first because the 2px border bottom + without the box to see container it looks too close to label
  const paddingTop = variant === 'standard' ? 8 : 0;

  if (variant === 'standard' && !icon) {
    paddingLeft = 0;
  }

  // The arrow is absolutely positioned over the right edge, so the text has to stop short of it.
  // Derived from the same numbers the arrow is positioned with so the two cannot drift apart.
  const arrowRight = variant === 'standard' ? 0 : 12;
  const arrowSpace = arrowRight + 20 + 4; // 20px icon at fontSize 20, plus a small gap

  const height = 46;

  const inputStyle: React.CSSProperties & {
    '&:hover'?: React.CSSProperties
  } = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height,
    boxSizing: 'border-box',
    color: hasError ? errorColor : textColor,
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'transparent',
    borderRadius: variant === 'outlined' ? 4 : 0,
    fontSize: '1rem',
    paddingTop,
    paddingLeft,
    paddingRight: Math.max(paddingLeft, arrowSpace) + (clear ? 24 : 0),
    cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
  };

  if (variant === 'filled') {
    inputStyle.backgroundColor = theme.mode === 'dark' ? theme.grey[900] : theme.grey[300];
    inputStyle.border = 'none';
    inputStyle.borderBottom = 'none';
    if (!disabled) {
      inputStyle['&:hover'] = {
        backgroundColor: Color.alphaColor((theme.mode === 'dark' ? '#fff' : theme.grey[600]), 0.25),
      };
    }
  } else if (variant === 'standard') {
    inputStyle.border = 'none';
    inputStyle.borderBottom = `2px solid ${borderColor}`;
  } else if (variant === 'outlined') {
    inputStyle.border = `1px solid ${borderColor}`;
  }

  Objector.extender(inputStyle, style);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    lineHeight: 'initial',
    opacity: disabled ? 0.5 : 1,
  };

  const isLabelActive = isFocused || hasTriggerText;

  let labelColor = theme.text.secondary;
  if (isFocused || isHovered) {
    labelColor = borderColor;
  } else if (hasError) {
    labelColor = errorColor;
  }

  const pStyle: Record<string, unknown> = {
    position: 'absolute',
    color: labelColor,
    transition: 'all 0.3s ease-out',
    transformOrigin: 'top left',
    transform: isLabelActive
      ? 'translate(0, -100%) scale(0.75)' // Lift and shrink
      : 'translate(0, 0) scale(1)', // Stay put
    margin: `0px 16px 0px ${paddingLeft}px`,
  };

  if (isLabelActive && variant === 'outlined') {
    pStyle.backgroundColor = (
      (style && style.backgroundColor) as string ||
      (style && style['background-color']) as string ||
      theme.background.main
    );
  }

  Objector.extender(pStyle, placeholderStyle);

  const selectedTextStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    // A flex item's automatic minimum size is its max-content width, so without these it refuses
    // to shrink and the ellipsis above never takes effect - the list runs under the arrow instead.
    minWidth: 0,
    flex: '1 1 auto',
    color: labelColor,
  };

  const errorHeight = 20;

  const errorTextStyle: React.CSSProperties = {
    color: errorColor,
    marginTop: '4px',
    marginLeft: variant === 'standard' ? '0px' : '4px',
    fontSize: '12px',
    minHeight: errorHeight, // Prevents layout jumping if you want consistent spacing
  };

  let placeholderElement: React.JSX.Element | null = <Typography type = 'caption' className = {Style.getStyleClassName(pStyle)}>{placeholder}</Typography>;

  if (hidePlaceholder) {
    placeholderElement = null;
  }

  const clearStyle = {
    color: (theme.mode === 'dark' ? theme.error.main : theme.grey[600]),
    fontSize: 20,
  };

  const showClear = clear && selected.length > 0;
  const clearWidth = showClear ? 32 : 0;

  Objector.extender(clearStyle, clearIconStyle);

  const arrowIconStyle: Record<string, unknown> = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: labelColor,
    pointerEvents: 'none', // Allow clicking through the icon
    right: arrowRight,
  };

  const iconStyle = {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    left: iconLeft,
    color: labelColor,
    pointerEvents: 'none',
  };

  const clearContainerStyle = {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: clearWidth,
    paddingBottom: (showError ? errorHeight : 0),
  };

  // aria-label is what makes the ticked state assertable, for a screen reader and for a test
  const checkbox = (checked: boolean) => (checked
    ? <CheckBoxIcon aria-label = 'selected' style = {{ color: theme.primary.main, fontSize: 20 }} />
    : <CheckBoxOutlineBlankIcon aria-label = 'not selected' style = {{ color: theme.text.secondary, fontSize: 20 }} />);

  // The All row is checked only on an empty selection. `[]` and "every value listed" are different
  // values even when they filter the same, so checking it there would misreport what a click does.
  const allRow: MenuOption[] = allOption ? [{
    value: null,
    label: allLabel,
    selectable: true,
    onSelect: handleSelect,
    icon: checkbox(selected.length === 0),
  }] : [];

  // spread rather than mutate - the caller owns these objects
  const menuOptions: MenuOption[] = [
    ...allRow,
    ...options.map((option) => ({
      ...option,
      onSelect: handleSelect,
      selectable: true,
      icon: checkbox(selected.includes(option.value)),
    })),
  ];

  const triggerMenu = useCallback((e: React.FocusEvent | React.MouseEvent) => {
    if (disabled) return;

    // Use the internalRef which is guaranteed to be set after mount
    if (internalRef.current) {
      const proxyEvent = {
        ...e,
        currentTarget: internalRef.current,
        target: internalRef.current,
      } as unknown as React.MouseEvent<HTMLDivElement>;

      handlers.handleClick(proxyEvent);
    }
  }, [disabled, handlers]);


  return (
    <div
      style={{ display: 'flex' }}
    >
      <div
        className={Style.getStyleClassName(containerStyle)}
        tabIndex={disabled ? -1 : 0}
        onMouseDown={() => {
          pointerFocusRef.current = true;
        }}
        onMouseUp={() => {
          setTimeout(() => {
            pointerFocusRef.current = false;
          }, 0);
        }}
        onKeyDown={(e) => {
          if (disabled) return;

          handlers.handleKeyDown(e);
        }}
        onFocus={(e) => {
          if (disabled) return;
          if (pointerFocusRef.current) {
            pointerFocusRef.current = false;
            return;
          }
          if (!isOpen) {
            triggerMenu(e);
          }
        }}
      >
        {label ? <Typography type='caption' style={{ color: labelColor, marginBottom: 5 }}>{label}</Typography> : ''}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          {icon ? <div className = {Style.getStyleClassName(iconStyle)}>{icon}</div> : ''}
          {placeholderElement}
          <div
            ref = {setRefs}
            className={Style.getStyleClassName(inputStyle)}
            role = 'combobox'
            aria-haspopup = 'listbox'
            aria-expanded = {isOpen}
            aria-disabled = {disabled}
            // only our own text, since renderValue can return an element
            title = {renderValue ? undefined : (triggerText || undefined)}
            onClick={triggerMenu}
            onMouseEnter={() => {
              if (disabled) return;
              setIsHovered(true);
            }}
            onMouseLeave={() => {
              if (disabled) return;
              setIsHovered(false);
            }}
          >
            <Typography type='body1' style={selectedTextStyle}>
              {triggerContent}
            </Typography>

            <div style={arrowIconStyle}>
              {isOpen ? <KeyboardArrowUpIcon style = {{ fontSize: 20 }} /> : <KeyboardArrowDownIcon style = {{ fontSize: 20 }} />}
            </div>
          </div>
          <Menu
            open = {isOpen}
            options = {menuOptions}
            anchor={anchor}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            useAnchorWidth
            showCloseButton = {showMenuCloseButton}
            onClose = {handlers.handleClose}
          />
        </div>
        {showError && <div style={{ height: errorHeight, marginTop: 4 }}>
          {displayedErrorMessage && (
            <Typography type='caption' style={errorTextStyle}>
              {displayedErrorMessage}
            </Typography>
          )}
        </div>}
      </div>
      {
        showClear ?
          <div
            className = {Style.getStyleClassName(clearContainerStyle)}
          >
            <IconButton
              tabIndex = {0}
              icon = {<CancelIcon aria-label = 'clear selection' style = {clearStyle} />}
              value = 'clear'
              onClick={() => {
                // Deliberately not handlers.handleChange - it reads e.target.value, which would
                // set this input's array value to the string ''
                commit([]);
              }}
            />
          </div> : ''
      }
    </div>
  );
};

export default MultiSelect;
