import { ScheduleType } from "./ScheduleType";

export type MovieType = {
  title: string;
  description: string;
  duration: string;
  language: string[];
  subtitle: string[];
  releaseDate: Date;
  status: string;
  poster: File;
  trailerId: string;
  photos: File[];
  experience: string[];
  genres: number[];
  casts: number[];
};

export enum MovieStatus {
  comingSoon = "Coming Soon",
  ticketAvailable = "Ticket Available",
  nowShowing = "Now Showing",
  ended = "Ended",
  trending = "Trending",
}
