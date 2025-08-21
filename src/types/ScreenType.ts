export type ScreenType = {
  id: number;
  name: string;
  capacity: number;
  rows: number;
  cols: number;
  type: string;
  active: boolean;
  disabledSeats: string[];
  aisles: number[];
  theatreId: string;
  multiplier: number | null;
  seatTypes: SelectedTypeList[];
};

export type SelectedTypeList = {
  typeId: string;
  seatList: string[];
};
