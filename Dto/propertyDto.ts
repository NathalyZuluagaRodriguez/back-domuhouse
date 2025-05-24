class Property {

    private _id : number;
    private _titulo : string;
    private _descripcion : string;
    private _precio : number;
    private _ubicacion : string;
    private _tipo : string;
    private _usuario_id : number;
    private _fecha_creacion : Date;

    constructor (
        id : number,
        titulo : string,
        descripcion : string,
        precio : number,
        ubicacion : string,
        tipo : string,
        usuario_id : number,
        fecha_creacion : Date
    ) {
        this._id = id;
        this._titulo = titulo;
        this._descripcion = descripcion;
        this._precio = precio;
        this._ubicacion = ubicacion;
        this._tipo = tipo;
        this._usuario_id = usuario_id;
        this._fecha_creacion = fecha_creacion;
    }

    get id(): number{
        return this.id;
    }

    get titulo(): string{
        return this.titulo;
    }

    get descripcion(): string{
        return this.descripcion;
    }

    get precio(): number{
        return this.precio;
    }

    get ubicacion(): string{
        return this.ubicacion;
    }

    get tipo(): string{
        return this.tipo;
    }

    get usuario_id(): number{
        return this.usuario_id;
    }

    get fecha_creacion(): Date{
        return this.fecha_creacion;
    }


    set id(id: number){
        this._id = id;
    }

    set titulo(titulo: string){
        this._titulo = titulo;
    }

    set descripcion(descripcion: string){
        this._descripcion = descripcion;
    }

    set precio(precio: number){
        this._precio = precio;
    }

    set ubicacion(ubicacion: string){
        this._ubicacion = ubicacion;
    }

    set tipo(tipo: string){
        this._tipo = tipo;
    }

    set usuario_id(usuario_id: number){
        this._usuario_id = usuario_id;
    }

    set fecha_creacion(fecha_creacion: Date){
        this._fecha_creacion = fecha_creacion;
    }

}