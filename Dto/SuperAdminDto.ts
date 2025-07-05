export interface SuperAdminDTO {
  personId: number;
  namePerson: string;
  lastName: string;
  phone: string;
  email: string;
  verified: boolean;
  active: boolean;

  realEstate: {
    realEstateId: number;
    name: string;
    phone: string;
    email: string;
  };
}
