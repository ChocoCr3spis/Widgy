export interface Widget {
    widgetId?: string;
    ownerId: string;
    visibility: 'private' | 'shared' | 'public';
    type: 'text' | 'image' | 'vote';
    name: string;
    description: string;
    createdAt: any;
    sharedWith: {
      userId: string;
      role: 'viewer' | 'editor';
    }[];
    data: any;
  }