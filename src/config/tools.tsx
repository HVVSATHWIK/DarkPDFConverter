import {
  MoonIcon,
  Square3Stack3DIcon,
  ScissorsIcon,
  ArrowPathRoundedSquareIcon,
  ArrowsPointingInIcon,
  DocumentArrowUpIcon,
  FingerPrintIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

import type { Tool } from '@/types';

export type ToolDefinition = Tool & {
  path: string;
  category: 'organize' | 'edit' | 'convert' | 'security';
  categoryLabel: string;
};

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: 2,
    name: 'Merge PDFs',
    path: '/merge-pdf',
    icon: <Square3Stack3DIcon className="w-5 h-5" />,
    description: 'Combine multiple PDF files into a single document.',
    category: 'organize',
    categoryLabel: 'Organize',
  },
  {
    id: 3,
    name: 'Split PDF',
    path: '/split-pdf',
    icon: <ScissorsIcon className="w-5 h-5" />,
    description: 'Split a PDF into separate files or selected page ranges.',
    category: 'organize',
    categoryLabel: 'Organize',
  },
  {
    id: 4,
    name: 'Rotate PDF',
    path: '/rotate-pdf',
    icon: <ArrowPathRoundedSquareIcon className="w-5 h-5" />,
    description: 'Rotate PDF pages to the orientation you need.',
    category: 'organize',
    categoryLabel: 'Organize',
  },
  {
    id: 6,
    name: 'Extract Pages',
    path: '/extract-pdf',
    icon: <DocumentArrowUpIcon className="w-5 h-5" />,
    description: 'Extract selected pages from a PDF into a new document.',
    category: 'organize',
    categoryLabel: 'Organize',
  },
  {
    id: 5,
    name: 'Optimize PDF',
    path: '/compress-pdf',
    icon: <ArrowsPointingInIcon className="w-5 h-5" />,
    description: 'Reduce PDF file size by optimizing its internal structure.',
    category: 'edit',
    categoryLabel: 'Edit',
  },
  {
    id: 1,
    name: 'Dark Mode PDF',
    path: '/dark-mode-pdf',
    icon: <MoonIcon className="w-5 h-5" />,
    description: 'Convert bright PDF pages to a darker, more comfortable reading theme.',
    category: 'edit',
    categoryLabel: 'Edit',
  },
  {
    id: 8,
    name: 'Images to PDF',
    path: '/images-to-pdf',
    icon: <PhotoIcon className="w-5 h-5" />,
    description: 'Convert JPG, PNG, and WebP images into a PDF.',
    category: 'convert',
    categoryLabel: 'Convert',
  },
  {
    id: 7,
    name: 'Cleanse Metadata',
    path: '/cleanse-metadata',
    icon: <FingerPrintIcon className="w-5 h-5" />,
    description: 'Remove document metadata such as author, software, and creation details.',
    category: 'security',
    categoryLabel: 'Security & Privacy',
  },
];

export function getToolByPath(path: string): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.path === path);
}

export function getToolById(id: number): ToolDefinition | undefined {
  return TOOL_DEFINITIONS.find((t) => t.id === id);
}
