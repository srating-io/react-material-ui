'use client';

import { useTheme } from '../contexts/themeContext.tsx';
import { Color, Style } from '@esmalley/ts-utils';
import { Typography } from '../text/Typography.tsx';
import CancelIcon from '@esmalley/react-material-icons/Cancel';
import { useState } from 'react';

export const Chip = (
  {
    title,
    value,
    filled = false,
    onClick,
    onDelete,
    style = {},
  }:
  {
    title: string;
    value: string|number;
    filled?: boolean;
    onClick?: (e: React.SyntheticEvent, value: string | number) => void
    onDelete?: (e: React.SyntheticEvent, value: string | number) => void
    style?: React.CSSProperties;
  },
) => {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  const height = 32;

  const color = theme.mode === 'dark' ? theme.info.light : theme.info.dark;
  const filledHoverColor = theme.mode === 'dark' ? theme.success.light : theme.success.dark;


  const cStyle: React.CSSProperties = {
    color,
    padding: onDelete ? '0px 6px 0px 12px' : '0px 12px',
    margin: 0,
    height,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: height / 2,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    ...style,
  };

  const textStyle: React.CSSProperties = {
    color: cStyle.color,
    fontWeight: 500,
    lineHeight: 'initial',
  };

  if (onClick) {
    cStyle.cursor = 'pointer';
  }

  if (hover) {
    const percent = theme.mode === 'dark' ? 15 : -20;
    if (cStyle.color) {
      cStyle.color = Color.shadeColor(cStyle.color, percent);
    }

    if (textStyle.color) {
      textStyle.color = Color.shadeColor(textStyle.color, percent);
    }
  }

  if (filled) {
    cStyle.backgroundColor = hover ? filledHoverColor : theme.success.main;
    cStyle.color = Color.getTextColor(theme.text.primary, cStyle.backgroundColor);
    textStyle.color = Color.getTextColor(theme.text.primary, cStyle.backgroundColor);
  } else {
    cStyle.border = `1px solid ${cStyle.color}`;
  }


  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e, value);
    }
  };

  const handleDelete = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(e, value);
    }
  };

  const handleMouseEnter = () => {
    if (onClick) {
      setHover(true);
    }
  };

  const handleMouseLeave = () => {
    setHover(false);
  };

  return (
    <div
      className={Style.getStyleClassName(cStyle)}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e, value);
        }
      } : undefined}
    >
      <Typography style = {textStyle} type = 'caption'>{title}</Typography>
      {onDelete ? (
        <div
          role="button"
          tabIndex={0}
          style={{ display: 'flex', marginLeft: '5px', cursor: 'pointer' }}
          onClick={handleDelete}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleDelete(e);
            }
          }}
        >
          <CancelIcon style={{ fontSize: '20px' }} />
        </div>
      ) : ''}
    </div>
  );
};

