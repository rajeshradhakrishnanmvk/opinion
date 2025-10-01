export type Concern = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  apartmentNumber: string;
  upvotes: number;
  upvotedBy: string[]; // Array of apartmentNumbers that have upvoted
  createdAt: string; // ISO 8601 date string
};

export type User = {
  name: string;
  apartmentNumber: string;
};
