export type UserProfile = {
  email: string;
  companyId: string;
  role: string;
  createdAt?: unknown;
};

export type Vehicle = {
  id: string;
  companyId: string;
  vehicleName: string;
  nickname?: string;
  plateNumber?: string;
  isReservable?: boolean;
  createdAt?: unknown;
};

export type LogItem = {
  id: string;
  companyId: string;
  userId: string;
  vehicleId: string;
  date: string;
  destination: string;
  distance: number;
  fueled: boolean;
  comment?: string;
  createdAt?: unknown;
};

export type Reservation = {
  id: string;
  companyId: string;
  userId: string;
  vehicleId: string;
  date: string;
  createdAt?: unknown;
};