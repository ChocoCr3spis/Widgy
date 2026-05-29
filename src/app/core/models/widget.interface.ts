export interface Widget {
    widgetId?: string;
    ownerId: string;
    visibility: 'private' | 'shared' | 'public';
    type: 'text' | 'image' | 'vote' | 'img';
    name: string;
    description: string;
    createdAt: any;
    data: any;
  }