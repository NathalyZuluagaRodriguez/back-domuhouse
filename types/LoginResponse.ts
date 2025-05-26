export type LoginResponseSuccess = {
  logged: true;
  status: string;
  id: number;
  first_name: string;
  correo: string;
  foto_perfil: string | null;
};

export type LoginResponseFail = {
  logged: false;
  status: string;
};

export type LoginResponse = LoginResponseSuccess | LoginResponseFail;
