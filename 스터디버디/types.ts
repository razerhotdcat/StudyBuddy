export interface ReceiptItem {
  id: string;
  task: string;
  category: string;
  status: 'completed' | 'in-progress';
}

export interface NavItem {
  label: string;
  href: string;
}