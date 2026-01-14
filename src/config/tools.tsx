import {
  MoonIcon,
  Square2StackIcon,
  ScissorsIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

import type { Tool } from '@/types';

export type ToolDefinition = Tool & {
  path: string;
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 1,
    name: 'Dark Mode',
    path: '/dark-mode',
    icon: <MoonIcon className="w-8 h-8" />,
    description: 'Convert PDFs to dark mode',
  },
  {
    id: 2,
    name: 'Merge PDFs',
    path: '/merge',
    icon: <Square2StackIcon className="w-8 h-8" />,
    description: 'Combine multiple PDFs',
  },
  {
    id: 3,
    name: 'Split PDF',
    path: '/split',
    icon: <ScissorsIcon className="w-8 h-8" />,
    description: 'Split PDF into a new file',
  },
  {
    id: 4,
    name: 'Rotate PDF',
    path: '/rotate',
    icon: <ArrowPathIcon className="w-8 h-8" />,
    description: 'Rotate PDF pages',
  },
  {
    id: 5,
    name: 'Optimize PDF',
    path: '/optimize',
    icon: <ArchiveBoxIcon className="w-8 h-8" />,
    description: 'Fast structural optimization (no image downsampling)',
  },
  {
    id: 6,
    name: 'Extract Pages',
    path: '/extract',
    icon: <DocumentDuplicateIcon className="w-8 h-8" />,
    description: 'Extract specific pages',
  },
];

export function getToolByPath(path: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.path === path);
}

export function getToolById(id: number): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.id === id);
}
