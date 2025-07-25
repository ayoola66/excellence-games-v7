declare module 'clsx' {
  type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];
  
  export default function clsx(...inputs: ClassValue[]): string;
} 