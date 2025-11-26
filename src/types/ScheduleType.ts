import { MovieType } from "./MovieType";
import { ScreenType } from "./ScreenType";
import { TheatreType } from "./TheatreType";

export type ScheduleType = {
  id: number;
  movie: MovieType;
  theatre: TheatreType;
  screen: ScreenType;
  showDate: string;
  showTime: string;
  multiplier: string;
  availableSeats: 180;
  isActive: true;
};

export type ScheduleBodyType = {
  movieId: number;
  theatreId: number;
  screenId: number;
  showDate: string;
  showTime: string;
  multiplier: string;
  availableSeats: number;
  isActive: true;
  language: string;
  subtitle: string;
};

export enum ScheduleStatus {
  active = "Active",
  inActive = "Inactive",
  ongoing = "Ongoing",
  completed = "Completed",
}
