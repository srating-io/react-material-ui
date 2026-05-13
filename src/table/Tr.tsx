'use client';

import { Objector, Style } from '@esmalley/ts-utils';


export const Tr = (
  {
    onClick,
    style = {},
    children,
    ...props
  }:
  {
    onClick?: (e: React.MouseEvent<HTMLTableRowElement>) => void,
    style?: object;
    children: React.ReactNode;
  },
) => {
  const trStyle = Objector.extender(
    {
      color: 'inherit',
      display: 'table-row',
      verticalAlign: 'middle',
      outline: '0',
      cursor: onClick ? 'pointer' : 'initial',
    },
    style,
  );

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <tr className = {Style.getStyleClassName(trStyle)} onClick={handleClick} {...props}>
      {children}
    </tr>
  );
};

