'use client';

import { Objector, Style } from '@esmalley/ts-utils';


export const Tfoot = (
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
  const tfootStyle = Objector.extender(
    {
      display: 'table-footer-group',
    },
    style,
  );

  return (
    <tfoot className = {Style.getStyleClassName(tfootStyle)} {...props}>
      {children}
    </tfoot>
  );
};

