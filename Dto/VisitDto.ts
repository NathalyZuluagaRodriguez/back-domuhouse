class Visit {
    private _id_visita: number;
    private _fecha_visita: Date;
  
    constructor(id_visita: number, fecha_visita: Date) {
      this._id_visita = id_visita;
      this._fecha_visita = fecha_visita;
    }
  
    get id_visita(): number {
      return this._id_visita;
    }
  
    get fecha_visita(): Date {
      return this._fecha_visita;
    }
  
    set id_visita(id_visita: number) {
      this._id_visita = id_visita;
    }
  
    set fecha_visita(fecha_visita: Date) {
      this._fecha_visita = fecha_visita;
    }
  }
  
  export default Visit;
  