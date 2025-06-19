class User {

  private _name_person: string;
  private _last_name: string;
  private _email: string;
  private _phone: string;
  private _Password: string;
  private _role_id: number;

  constructor(
      name_person: string,
      last_name: string,
      email: string,
      phone: string,
      password: string,
      role_id:number
  ) {
      this._name_person = name_person;
      this._last_name = last_name;
      this._email = email;
      this._phone = phone;
      this._Password = password;
      this._role_id= role_id;
  }

  //Getters
  get name_person(): string {
      return this._name_person;
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

  get role_id(): number{
    return this._role_id;
  }


  //Setters
  set name_person(name_person: string) {
      this._name_person = name_person;
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

  set role_id(role_id:number){
    this._role_id= role_id;
  }

}

export default User;    