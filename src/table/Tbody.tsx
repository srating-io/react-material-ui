'use client';

import { Objector, Style } from '@esmalley/ts-utils';


export const Tbody = (
  {
    style = {},
    children,
    ...props
  }:
  {
    style?: object;
    children: React.ReactNode;
  },
) => {
  const tbodyStyle = Objector.extender(
    {
      display: 'table-row-group',
    },
    style,
  );

  return (
    <tbody className = {Style.getStyleClassName(tbodyStyle)} {...props}>
      {children}
    </tbody>
  );
};

