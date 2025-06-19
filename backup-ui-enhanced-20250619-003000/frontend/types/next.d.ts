// This file provides type declarations for Next.js modules that might be missing

// Declare module for next/navigation if it's missing
declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (url: string) => void;
  };
  
  export function useSearchParams(): {
    get: (key: string) => string | null;
    getAll: (key: string) => string[];
    has: (key: string) => boolean;
    forEach: (callback: (value: string, key: string) => void) => void;
    entries: () => IterableIterator<[string, string]>;
    keys: () => IterableIterator<string>;
    values: () => IterableIterator<string>;
    toString: () => string;
  };
  
  export function usePathname(): string;
  
  export function useParams<T = Record<string, string | string[]>>(): T;
}

// Declare module for next/link if it's missing
declare module 'next/link' {
  import { ComponentProps, ReactElement } from 'react';
  
  export interface LinkProps extends ComponentProps<'a'> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
  }
  
  export default function Link(props: LinkProps): ReactElement;
}

// Declare module for next/image if it's missing
declare module 'next/image' {
  import { ComponentProps, ReactElement } from 'react';
  
  export interface ImageProps extends Omit<ComponentProps<'img'>, 'src' | 'alt'> {
    src: string | { src: string; height: number; width: number; blurDataURL?: string };
    alt: string;
    width?: number;
    height?: number;
    layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
    loader?: (resolverProps: { src: string; width: number; quality?: number }) => string;
    quality?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    unoptimized?: boolean;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    fill?: boolean;
  }
  
  export default function Image(props: ImageProps): ReactElement;
} 