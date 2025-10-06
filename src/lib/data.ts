import type { Concern } from "./types";

export const initialConcerns: Omit<Concern, 'id'>[] = [
  {
    title: "Leaky Faucet in Apartment 2A",
    description: "The kitchen faucet in apartment 2A has been dripping for the past three days. It's wasting water and the sound is constant.",
    authorName: "Jane Smith",
    apartmentNumber: "2A",
    upvotes: 12,
    upvotedBy: ["3B", "5C", "1A", "4D", "2B", "6A", "1C", "5A", "3D", "4A", "6B", "2C"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isDeleted: false,
  },
  {
    title: "Noise complaints on the 5th floor",
    description: "There have been loud parties on the 5th floor almost every night this week, going on past midnight. It's difficult to sleep.",
    authorName: "Robert Johnson",
    apartmentNumber: "6B",
    upvotes: 25,
    upvotedBy: ["1A", "2A", "3A", "4A", "5A", "6A", "1B", "2B", "3B", "4B", "5B", "1C", "2C", "3C", "4C", "5C", "1D", "2D", "3D", "4D", "5D", "6D", "6C", "3A", "4B"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    isDeleted: false,
  },
  {
    title: "Package theft from the lobby",
    description: "I had a package stolen from the lobby yesterday. The area is not secure enough. We should consider getting security cameras or a better system.",
    authorName: "Emily White",
    apartmentNumber: "3D",
    upvotes: 8,
    upvotedBy: ["1B", "4A", "5C", "2D", "6A", "3A", "1D", "4B"],
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isDeleted: false,
  },
  {
    title: "Request for more recycling bins",
    description: "The recycling bins are always overflowing by the middle of the week. Can we please get additional bins to handle the volume?",
    authorName: "Michael Brown",
    apartmentNumber: "1A",
    upvotes: 18,
    upvotedBy: ["2B", "3C", "4D", "5A", "6B", "1C", "2D", "3A", "4B", "5C", "6D", "1B", "2C", "3D", "4A", "5B", "6C", "2A"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    isDeleted: false,
  },
];
