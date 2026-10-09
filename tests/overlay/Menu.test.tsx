import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils.tsx';
import userEvent from '@testing-library/user-event';
import { Menu, MenuOption } from '../../src/menu/Menu.tsx';

describe('Menu', () => {
  const options: MenuOption[] = [
    { value: 'profile', label: 'Profile', selectable: true },
    { value: 'settings', label: 'Settings', selectable: true },
    { value: 'logout', label: 'Logout', selectable: true },
  ];

  it('does not render options when open is false', () => {
    render(
      <Menu
        open={false}
        options={options}
        anchor={null}
        onClose={() => {}}
      />
    );
    expect(screen.queryByText('Profile')).toBeNull();
  });

  it('renders menu options inside portal when open is true', () => {
    render(
      <Menu
        open={true}
        options={options}
        anchor={null}
        onClose={() => {}}
      />
    );
    expect(document.body.contains(screen.getByText('Profile'))).toBe(true);
    expect(document.body.contains(screen.getByText('Settings'))).toBe(true);
    expect(document.body.contains(screen.getByText('Logout'))).toBe(true);
  });

  it('calls onSelect when an option is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    const selectableOptions: MenuOption[] = [
      { value: 'edit', label: 'Edit Item', selectable: true, onSelect: handleSelect },
    ];

    render(
      <Menu
        open={true}
        options={selectableOptions}
        anchor={null}
        onClose={() => {}}
      />
    );

    await user.click(screen.getByText('Edit Item'));
    expect(handleSelect).toHaveBeenCalledWith(selectableOptions[0]);
  });
});
