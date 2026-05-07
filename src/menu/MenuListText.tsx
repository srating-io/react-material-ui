'use client';

import React from 'react';
import { Typography } from '../text/Typography.tsx';
import { useTheme } from '../contexts/themeContext.tsx';
import { Style } from '@esmalley/ts-utils';

export const MenuListText = (
  {
    primary,
    secondary,
    style = {},
    // children,
  }:
  {
    primary: string;
    secondary?: string;
    style?: React.CSSProperties;
    // children: React.ReactNode;
  },
) => {
  const theme = useTheme();
  const cStyle: React.CSSProperties = {
    flex: '1 1 auto',
    margin: '6px 0px',
    ...style,
  };

  return (
    <div className={Style.getStyleClassName(cStyle)}>
      <Typography type='body1'>{primary}</Typography>
      {secondary ? <Typography type = 'caption' style = {{ color: theme.text.secondary }}>{secondary}</Typography> : ''}
    </div>
  );
};

