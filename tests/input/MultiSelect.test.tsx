import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from '../../src/input/MultiSelect.tsx';
import { MultiSelectInputProps } from '../../src/input/hooks/useInputLogic.ts';
import { Inputs } from '../../src/input/Inputs.ts';

describe('MultiSelect', () => {
  const options = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
  ];

  /** Opens the menu. The trigger carries role=combobox, so it is findable in every display mode. */
  const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('combobox'));
  };

  /**
   * The menu row with this label. Scoped to the li because the closed trigger can carry the same
   * text - with allOption and displayMode 'labels' it reads 'All' too.
   */
  const rowByLabel = (rowLabel: string) => screen.getAllByText(rowLabel)
    .map((el) => el.closest('li'))
    .find((li): li is HTMLLIElement => Boolean(li));

  /** The ticked state of a row, read off the aria-label the checkbox icon carries. */
  const iconLabelOf = (rowLabel: string) => rowByLabel(rowLabel)?.querySelector('svg')?.getAttribute('aria-label');

  // A real controlled input, for the cases that need the value to actually move
  const Controlled = (props: Partial<MultiSelectInputProps>) => {
    const [value, setValue] = useState<(string | number)[]>(props.value ?? []);

    return (
      <MultiSelect
        options={options}
        {...props}
        value={value}
        onChange={(next) => {
          setValue(next);
          if (props.onChange) {
            props.onChange(next);
          }
        }}
      />
    );
  };

  it('renders label and placeholder', () => {
    render(<MultiSelect options={options} label="Fruit" placeholder="Choose fruit" />);
    expect(document.body.contains(screen.getByText('Fruit'))).toBe(true);
    expect(document.body.contains(screen.getByText('Choose fruit'))).toBe(true);
  });

  it('does not mutate caller options array passed via props', () => {
    const rawOptions = [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ];
    Object.freeze(rawOptions[0]); // Throws if mutated

    render(<MultiSelect options={rawOptions} value={['1']} />);
    expect('selectable' in rawOptions[0]).toBe(false);
    expect('icon' in rawOptions[0]).toBe(false);
  });

  it('lists the selected labels in the trigger', () => {
    render(<MultiSelect options={options} value={['apple', 'cherry']} />);
    expect(document.body.contains(screen.getByText('Apple, Cherry'))).toBe(true);
  });

  it('shows a count when displayMode is count', () => {
    render(<MultiSelect options={options} value={['apple', 'cherry']} displayMode="count" />);
    expect(document.body.contains(screen.getByText('2 selected'))).toBe(true);
  });

  it('shows no selection text when displayMode is none', () => {
    render(<MultiSelect options={options} value={['apple']} displayMode="none" placeholder="Fruit" />);
    // the placeholder still renders, but the picked label never reaches the closed trigger
    expect(screen.queryByText('Apple')).toBe(null);
    expect(document.body.contains(screen.getByText('Fruit'))).toBe(true);
  });

  it('lets renderValue override displayMode', () => {
    render(
      <MultiSelect
        options={options}
        value={['apple', 'cherry']}
        displayMode="count"
        renderValue={(sel) => `${sel.length} fruit`}
      />,
    );
    expect(document.body.contains(screen.getByText('2 fruit'))).toBe(true);
    expect(screen.queryByText('2 selected')).toBe(null);
  });

  it('adds a value when an unselected option is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<MultiSelect options={options} value={['apple']} onChange={handleChange} />);
    await openMenu(user);
    await user.click(screen.getByText('Cherry'));

    expect(handleChange).toHaveBeenCalledWith(['apple', 'cherry']);
  });

  it('removes a value when a selected option is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<MultiSelect options={options} value={['apple', 'cherry']} onChange={handleChange} />);
    await openMenu(user);
    await user.click(screen.getByText('Cherry'));

    expect(handleChange).toHaveBeenCalledWith(['apple']);
  });

  it('keeps the menu open after a row is toggled', async () => {
    const user = userEvent.setup();

    render(<Controlled />);
    await openMenu(user);
    await user.click(screen.getByText('Cherry'));

    // the other rows are still mounted, so the list did not close
    expect(document.body.contains(screen.getByText('Banana'))).toBe(true);
  });

  it('closes the menu after a row is toggled when closeOnSelect is set', async () => {
    const user = userEvent.setup();

    render(<Controlled closeOnSelect />);
    await openMenu(user);
    await user.click(screen.getByText('Cherry'));

    expect(screen.queryByText('Banana')).toBe(null);
  });

  it('renders an All row that clears the selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<MultiSelect options={options} value={['apple']} allOption onChange={handleChange} />);
    await openMenu(user);
    await user.click(rowByLabel('All') as HTMLLIElement);

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('ticks the All row only while nothing is selected', async () => {
    const user = userEvent.setup();

    const { unmount } = render(<MultiSelect options={options} value={[]} allOption />);
    await openMenu(user);
    expect(iconLabelOf('All')).toBe('selected');
    expect(iconLabelOf('Apple')).toBe('not selected');
    unmount();

    render(<MultiSelect options={options} value={['apple']} allOption />);
    await openMenu(user);
    expect(iconLabelOf('All')).toBe('not selected');
    expect(iconLabelOf('Apple')).toBe('selected');
  });

  it('leaves the All row unticked when every option is selected individually', async () => {
    const user = userEvent.setup();

    render(<MultiSelect options={options} value={['apple', 'banana', 'cherry']} allOption />);
    await openMenu(user);

    // [] and "every value listed" are different values, so All must not claim to be active
    expect(iconLabelOf('All')).toBe('not selected');
    expect(iconLabelOf('Apple')).toBe('selected');
    expect(iconLabelOf('Cherry')).toBe('selected');
  });

  it('works uncontrolled, with no value prop at all', async () => {
    const user = userEvent.setup();

    // regression test for the undefined -> [] normalization; without it this throws on first render
    render(<MultiSelect options={options} />);
    await openMenu(user);
    await user.click(screen.getByText('Apple'));
    await user.click(screen.getByText('Cherry'));

    expect(document.body.contains(screen.getByText('Apple, Cherry'))).toBe(true);
  });

  it('clears the selection from the clear button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<MultiSelect options={options} value={['apple']} clear onChange={handleChange} />);
    await user.click(screen.getByLabelText('clear selection'));

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('reports a required empty value to the form handler before being touched', () => {
    const inputHandler = new Inputs();

    // value={[]} on purpose: an empty array is truthy, so this is the case a plain `!value` check
    // in the registry would wave through
    render(<MultiSelect options={options} required inputHandler={inputHandler} value={[]} />);

    expect(inputHandler.getErrors().length).toBe(1);
  });

  it('reports no error to the form handler once something is selected', () => {
    const inputHandler = new Inputs();

    render(<MultiSelect options={options} required inputHandler={inputHandler} value={['apple']} />);

    expect(inputHandler.getErrors().length).toBe(0);
  });

  it('renders error message when error and errorMessage are provided', () => {
    render(
      <MultiSelect
        options={options}
        error={true}
        errorMessage="Pick at least one fruit"
        showError={true}
      />,
    );
    expect(document.body.contains(screen.getByText('Pick at least one fruit'))).toBe(true);
  });

  it('does not open the menu when disabled', async () => {
    // The disabled trigger sets pointer-events: none, which userEvent refuses to click through by
    // default. Bypass that so this exercises the component's own disabled guard rather than the
    // CSS a real browser would already honour.
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<MultiSelect options={options} disabled />);
    await openMenu(user);

    expect(screen.queryByText('Banana')).toBe(null);
  });
});
