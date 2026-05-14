export interface Group {
  groupId?: string;
  ownerId: string;
  name: string;
  description: string;
  createdAt: any;
  sharedWith: {
    userId: string;
    role: 'viewer' | 'editor';
  }[];
}