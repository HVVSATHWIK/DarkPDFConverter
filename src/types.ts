import { ReactNode } from 'react';

export interface Tool {
  id: number;
  name: string;
  icon: ReactNode;
  description?: string;
}