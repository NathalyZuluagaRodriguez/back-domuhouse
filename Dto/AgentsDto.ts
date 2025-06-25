class Agent {
  constructor(

    public _name_person: string,
    public _last_name: string,
    public _phone: string,
    public _email: string,
    public _password: string,
    public _realEstateId: number,
    public _roleId: number = 2
  ) {}


  get name_person() { return this._name_person; }
  get last_name() { return this._last_name; }
  get email() { return this._email; }
  get phone() { return this._phone; }
  get password() { return this._password; }
  get realEstateId() { return this._realEstateId; }
  get roleId() { return this._roleId; }

  set password(p: string) { this._password = p; }
}

export default Agent;
