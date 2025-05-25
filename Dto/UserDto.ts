class User {

  private _first_name: string;
  private _last_name: string;
  private _email: string;
  private _phone: string;
  private _Password: string;

  constructor(
      first_name: string,
      last_name: string,
      email: string,
      phone: string,
      password: string
  ) {
      this._first_name = first_name;
      this._last_name = last_name;
      this._email = email;
      this._phone = phone;
      this._Password = password;
  }

  //Getters
  get first_name(): string {
      return this._first_name;
  }
  get last_name():string {
        return this._last_name;
  }
  get email(): string {
      return this._email;
  }

  get phone(): string {
      return this._phone;
  }


  get password(): string {
      return this._Password;
  }
  //Setters
  set first_name(first_name: string) {
      this._first_name = first_name;
  }   
  set last_name(last_name: string){
    this._last_name = last_name
  }
  set email(email: string) {
      this._email = email;
  }

  set phone(phone: string) {
      this._phone = phone;
  }

  set password(password: string) {
      this._Password = password;
  }   

}

export default User;    