'use client';

import { useTheme } from '../contexts/themeContext.tsx';
import { Style } from '@esmalley/ts-utils';

/**
 * Maps the 'type' prop values to the actual HTML element tag names.
 * This is used to infer the correct HTML attributes for the component.
 */
const TYPES_TO_TAGS = {
  a: 'a',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  inherit: 'p',
} as const; // Use 'as const' to ensure string literal types are preserved

// Extract the valid 'type' keys
type TypographyType = keyof typeof TYPES_TO_TAGS;

type TypographyElementType<T extends TypographyType> = HTMLElementTagNameMap[typeof TYPES_TO_TAGS[T]];

// Define base props for all Typography variants
interface TypographyBaseProps<T extends TypographyType> {
  children: React.ReactNode;
  type: T;
  style?: React.CSSProperties | Record<string, unknown>;
  ref?: React.RefObject<TypographyElementType<T>>;
}

/**
 * Defines the props for the Typography component, allowing for
 * all valid HTML attributes for the underlying element (e.g., 'a', 'p').
 * This uses a discriminated union to get correct tag-specific props.
 */
type TypographyProps =
  | (TypographyBaseProps<'a'> & React.ComponentPropsWithoutRef<'a'>)
  | (TypographyBaseProps<'h1'> & React.ComponentPropsWithoutRef<'h1'>)
  | (TypographyBaseProps<'h2'> & React.ComponentPropsWithoutRef<'h2'>)
  | (TypographyBaseProps<'h3'> & React.ComponentPropsWithoutRef<'h3'>)
  | (TypographyBaseProps<'h4'> & React.ComponentPropsWithoutRef<'h4'>)
  | (TypographyBaseProps<'h5'> & React.ComponentPropsWithoutRef<'h5'>)
  | (TypographyBaseProps<'h6'> & React.ComponentPropsWithoutRef<'h6'>)
  // For tags that map to 'h6' but use a different 'type'
  | (TypographyBaseProps<'subtitle1' | 'subtitle2'> & React.ComponentPropsWithoutRef<'h6'>)
  // For tags that map to 'p'
  | (TypographyBaseProps<'body1' | 'body2' | 'inherit'> & React.ComponentPropsWithoutRef<'p'>)
  // For tags that map to 'span'
  | (TypographyBaseProps<'caption' | 'overline'> & React.ComponentPropsWithoutRef<'span'>);

export const Typography = (
  {
    children,
    type,
    style = {},
    ref,
    ...props
  }: TypographyProps,
) => {
  const theme = useTheme();

  const getBaseStyle = (): React.CSSProperties => {
    if (type === 'a') {
      return {
        color: theme.link.primary,
      };
    }
    if (type === 'h1') {
      return {
        fontWeight: 300,
        fontSize: '6rem',
        lineHeight: 1.167,
        letterSpacing: '-0.01562em',
      };
    }
    if (type === 'h2') {
      return {
        fontWeight: 300,
        fontSize: '3.75rem',
        lineHeight: 1.2,
        letterSpacing: '-0.00833em',
      };
    }
    if (type === 'h3') {
      return {
        fontSize: '3rem',
        lineHeight: 1.167,
        letterSpacing: '0em',
      };
    }
    if (type === 'h4') {
      return {
        fontSize: '2.125rem',
        lineHeight: 1.235,
        letterSpacing: '0.00735em',
      };
    }
    if (type === 'h5') {
      return {
        fontSize: '1.5rem',
        lineHeight: 1.334,
        letterSpacing: '0em',
      };
    }
    if (type === 'h6') {
      return {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.6,
        letterSpacing: '0.0075em',
      };
    }
    if (type === 'subtitle1') {
      return {
        fontSize: '1rem',
        lineHeight: 1.75,
        letterSpacing: '0.00938em',
      };
    }
    if (type === 'subtitle2') {
      return {
        fontWeight: 500,
        fontSize: '0.875rem',
        lineHeight: 1.57,
        letterSpacing: '0.00714em',
      };
    }
    if (type === 'body1') {
      return {
        fontSize: '1rem',
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
      };
    }
    if (type === 'body2') {
      return {
        fontSize: '0.875rem',
        lineHeight: 1.43,
        letterSpacing: '0.01071em',
      };
    }
    if (type === 'caption') {
      return {
        fontSize: '0.75rem',
        lineHeight: 1.66,
        letterSpacing: '0.03333em',
        display: 'block',
      };
    }
    if (type === 'overline') {
      return {
        fontSize: '0.75rem',
        lineHeight: 2.66,
        letterSpacing: '0.08333em',
        textTransform: 'uppercase',
        display: 'block',
      };
    }
    return {};
  };

  const cStyle: React.CSSProperties = {
    color: theme.text.primary,
    padding: 0,
    margin: 0,
    fontWeight: 400,
    ...getBaseStyle(),
    ...style,
  };

  const types = TYPES_TO_TAGS;

  const Tag = (types[type] || 'p') as React.ElementType; // Ensure a default fallback

  return (
    <Tag className ={Style.getStyleClassName(cStyle)} ref = {ref} {...props}>
      {children}
    </Tag>
  );
};

