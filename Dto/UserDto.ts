class User {

  private _nombre: string;
  private _apellido: string;
  private _correo: string;
  private _telefono: string;
  private _Password: string;

  constructor(
      nombre: string,
      apellido: string,
      correo: string,
      telefono: string,
      password: string
  ) {
      this._nombre = nombre;
      this._apellido = apellido;
      this._correo = correo;
      this._telefono = telefono;
      this._Password = password;
  }

  //Getters
  get nombre(): string {
      return this._nombre;
  }
  get apellido():string {
        return this._apellido;
  }
  get correo(): string {
      return this._correo;
  }

  get telefono(): string {
      return this._telefono;
  }


  get password(): string {
      return this._Password;
  }
  //Setters
  set nombre(nombre: string) {
      this._nombre = nombre;
  }   
  set apellido(apellido: string){
    this._apellido = apellido
  }
  set correo(correo: string) {
      this._correo = correo;
  }

  set telefono(telefono: string) {
      this._telefono = telefono;
  }

  set password(password: string) {
      this._Password = password;
  }   

}

export default User;    