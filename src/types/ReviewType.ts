export type ReviewType = {
  id: number;
  username: string;
  rating: number;
  description: string;
  reviewedDate: string;
};

export type ReviewInputType = {
  movieId: number;
  rating: number;
  description: string;
};
