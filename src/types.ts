export interface Tool {
  id: number;
  name: string;
  icon: string;
  description?: string;
  // subTools?: Tool[]; // Optional: For nested sub-tools feature. Each sub-tool would also be of type Tool.
}