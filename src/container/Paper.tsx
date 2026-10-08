'use client';

import { useTheme } from '../contexts/themeContext.tsx';
import { Color, Style } from '@esmalley/ts-utils';
import React, { AnimationEventHandler, RefObject } from 'react';


/**
 * Paper component, use to decorate things on a surface.
 * Alter the surface elevation and shadows with `elevation`
 * Can add click events, hover animation etc.
 */
export const Paper = (
  {
    elevation = 3,
    style = {},
    children,
    ref,
    transparency = 0,
    hover = false,
    onClick,
    onKeyDown,
    tabIndex,
    buttons = [],
    onAnimationEnd,
  }:
  {
    elevation?: number;
    style?: React.CSSProperties & {
      '&:hover'?: React.CSSProperties
    } | Record<string, unknown>;
    children: React.ReactNode;
    transparency?: number;
    ref?: RefObject<HTMLDivElement | null>;
    hover?: boolean;
    onClick?: (e: React.SyntheticEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void; // Type definition
    tabIndex?: number;
    buttons?: React.JSX.Element[];
    onAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
  },
) => {
  const theme = useTheme();

  let backgroundColor = '#fff';
  if (theme.mode === 'dark') {
    backgroundColor = Color.lerpColor(theme.background.main, theme.grey[400], elevation / 24);
  }

  if (transparency) {
    const rgb = Color.hexToRgb(backgroundColor);
    backgroundColor = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${transparency})`;
  }

  const cStyle: React.CSSProperties & {
    '&:hover'?: React.CSSProperties
  } = {
    position: 'relative',
    borderRadius: '4px',
    boxShadow: Style.getShadow(elevation),
    backgroundColor,
    color: theme.text.primary,
    ...style,
  };

  if (hover && cStyle.backgroundColor) {
    const bg = cStyle.backgroundColor as string;
    if (typeof bg === 'string' && (bg.startsWith('rgba') || bg.startsWith('rgb'))) {
      cStyle['&:hover'] = {
        backgroundColor: theme.mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
      };
    } else {
      cStyle['&:hover'] = {
        backgroundColor: theme.mode === 'light' ? Color.alphaColor(bg, 0.5) : Color.lighten(bg, 0.04),
      };
    }
  }

  const handleClick = (e: React.SyntheticEvent) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // the top offset assumes all the buttons will be 40px in height

  return (
    <div
      className={Style.getStyleClassName(cStyle)}
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      onAnimationEnd={onAnimationEnd}
    >
      <div style = {{ position: 'absolute', right: 0, top: -20, marginRight: 20 }}>
        {buttons.map((button, index) => {
          return (
            <div key = {index} style = {{ margin: '0px 5px', display: 'inline-flex' }}>
              {button}
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
};

