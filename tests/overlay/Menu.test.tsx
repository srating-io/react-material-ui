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

describe('Menu elevateAnchor', () => {
  const options: MenuOption[] = [
    { value: 'lakers', label: 'Los Angeles Lakers', selectable: true },
  ];

  // Deliberately fractional, so the integer rounding of the hole edges is actually exercised.
  const anchorBox = { top: 100.4, left: 50.2, right: 250.8, bottom: 135.6 };

  const makeAnchor = (box = anchorBox) => {
    const el = document.createElement('input');
    document.body.appendChild(el);
    el.getBoundingClientRect = () => ({
      top: box.top,
      left: box.left,
      right: box.right,
      bottom: box.bottom,
      width: box.right - box.left,
      height: box.bottom - box.top,
      x: box.left,
      y: box.top,
      toJSON: () => ({}),
    }) as DOMRect;
    return el;
  };

  // Styles are injected as class rules in <style> tags, so read the rule rather than the element.
  const rulesFor = (el: Element): Record<string, string> => {
    const className = (el.getAttribute('class') || '').trim();
    const out: Record<string, string> = {};

    Array.from(document.head.querySelectorAll('style')).forEach((style) => {
      const match = new RegExp(`\\.${className}\\s*\\{([^}]*)\\}`).exec(style.textContent || '');
      if (!match) {
        return;
      }
      match[1].split(';').forEach((declaration) => {
        const split = declaration.indexOf(':');
        if (split === -1) {
          return;
        }
        out[declaration.slice(0, split).trim()] = declaration.slice(split + 1).trim();
      });
    });

    return out;
  };

  const panels = () => Array.from(document.querySelectorAll('[data-menu-backdrop]'));

  const pixels = (value: string) => Number(value.replace('px', ''));

  it('paints one full-bleed dim layer by default', () => {
    render(
      <Menu open={true} options={options} anchor={makeAnchor()} onClose={() => {}} />,
    );

    expect(panels().length).toBe(1);

    const rule = rulesFor(panels()[0]);
    expect(rule.top).toBe('0px');
    expect(rule.left).toBe('0px');
    expect(rule.right).toBe('0px');
    expect(rule.bottom).toBe('0px');
    expect(rule['background-color']).toBe('rgba(0, 0, 0, 0.4)');
  });

  it('keeps the container opaque to clicks by default', () => {
    render(
      <Menu open={true} options={options} anchor={makeAnchor()} onClose={() => {}} />,
    );

    const container = panels()[0].parentElement as HTMLElement;
    expect(rulesFor(container)['pointer-events']).toBeUndefined();
  });

  it('leaves the anchor box uncovered, with panels tiling exactly around it', () => {
    render(
      <Menu open={true} options={options} anchor={makeAnchor()} onClose={() => {}} elevateAnchor />,
    );

    const found = panels();
    expect(found.length).toBe(4);

    const [above, below, left, right] = found.map(rulesFor);

    // Hole rounds outward: top/left floored to 100/50, right/bottom ceiled to 251/136.
    expect(above).toMatchObject({ top: '0px', left: '0px', right: '0px', height: '100px' });
    expect(below).toMatchObject({ top: '136px', left: '0px', right: '0px', bottom: '0px' });
    expect(left).toMatchObject({ top: '100px', left: '0px', width: '50px', height: '36px' });
    expect(right).toMatchObject({ top: '100px', left: '251px', right: '0px', height: '36px' });

    // The side panels start where the top panel ends and end where the bottom panel starts,
    // so the four tile with no gap and no double-darkened overlap.
    expect(pixels(left.top)).toBe(pixels(above.height));
    expect(pixels(left.top) + pixels(left.height)).toBe(pixels(below.top));
  });

  it('dims every panel the same and keeps them catching the outside click', () => {
    render(
      <Menu open={true} options={options} anchor={makeAnchor()} onClose={() => {}} elevateAnchor />,
    );

    panels().forEach((panel) => {
      const rule = rulesFor(panel);
      expect(rule['background-color']).toBe('rgba(0, 0, 0, 0.4)');
      expect(rule['pointer-events']).toBe('auto');
    });
  });

  it('makes the container click-through so the anchor stays usable', () => {
    render(
      <Menu open={true} options={options} anchor={makeAnchor()} onClose={() => {}} elevateAnchor />,
    );

    const container = panels()[0].parentElement as HTMLElement;
    expect(rulesFor(container)['pointer-events']).toBe('none');
  });

  it('clamps the hole to the viewport when the anchor is scrolled off the top', () => {
    render(
      <Menu
        open={true}
        options={options}
        anchor={makeAnchor({ top: -20, left: -10, right: 200, bottom: 15 })}
        onClose={() => {}}
        elevateAnchor
      />,
    );

    const [above, , left] = panels().map(rulesFor);
    expect(above.height).toBe('0px');
    expect(left.width).toBe('0px');
  });
});
