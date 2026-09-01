import {
  MoonIcon,
  Square2StackIcon,
  ScissorsIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  PhotoIcon,
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
    description: 'Convert PDFs to smart contrast-preserving dark & sepia modes',
  },
  {
    id: 2,
    name: 'Merge PDFs',
    path: '/merge',
    icon: <Square2StackIcon className="w-8 h-8" />,
    description: 'Combine multiple PDFs into a single document with zero size caps',
  },
  {
    id: 3,
    name: 'Split PDF',
    path: '/split',
    icon: <ScissorsIcon className="w-8 h-8" />,
    description: 'Split PDF ranges into a new document instantly',
  },
  {
    id: 4,
    name: 'Rotate PDF',
    path: '/rotate',
    icon: <ArrowPathIcon className="w-8 h-8" />,
    description: 'Rotate PDF pages permanently in local memory',
  },
  {
    id: 5,
    name: 'Optimize PDF',
    path: '/optimize',
    icon: <ArchiveBoxIcon className="w-8 h-8" />,
    description: 'Fast structural object stream compression without data loss',
  },
  {
    id: 6,
    name: 'Extract Pages',
    path: '/extract',
    icon: <DocumentDuplicateIcon className="w-8 h-8" />,
    description: 'Extract specific pages, chapters, or bibliographies',
  },
  {
    id: 7,
    name: 'Cleanse Metadata',
    path: '/cleanse-metadata',
    icon: <ShieldCheckIcon className="w-8 h-8" />,
    description: 'Wipe authors, timestamps, company paths & hidden layer metadata',
  },
  {
    id: 8,
    name: 'Images to PDF',
    path: '/images-to-pdf',
    icon: <PhotoIcon className="w-8 h-8" />,
    description: 'Compile high-res PNG/JPG images into clean, lossless PDF files',
  },
];

export function getToolByPath(path: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.path === path);
}

export function getToolById(id: number): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.id === id);
}
