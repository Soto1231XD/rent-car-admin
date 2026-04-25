export type Client = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  address: string;
  driverLicenseNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  rentedCar?: string;
  notes?: string;
};