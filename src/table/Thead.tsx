'use client';

import { Objector, Style } from '@esmalley/ts-utils';

export const Thead = (
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
  const theadStyle = Objector.extender(
    {
      display: 'table-header-group',
    },
    style,
  );

  return (
    <thead className = {Style.getStyleClassName(theadStyle)} {...props}>
      {children}
    </thead>
  );
};

