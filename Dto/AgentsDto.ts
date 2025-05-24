class Agent {
  constructor(
    private _nombre: string,
    private _apellido: string,
    private _email: string,
    private _telefono: string,
    private _password: string,
    private _id_inmobiliaria: number,
    public _id_rol: number
  ) {}

  get nombre() { return this._nombre; }
  get apellido() { return this._apellido; }
  get email() { return this._email; }
  get telefono() { return this._telefono; }
  get password() { return this._password; }
  get id_inmobiliaria() { return this._id_inmobiliaria; }
  get id_rol() { return this._id_rol; }

  set password(p: string) { this._password = p; }
}

export default Agent;