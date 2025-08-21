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
