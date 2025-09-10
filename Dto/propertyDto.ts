export default class Property {
    // Campos privados
    private _propertyId: number;
    private _title: string;
    private _description: string;
    private _price: number;
    private _location: string;
    private _type: string;
    private _userId: number;
    private _createdAt: Date;

    constructor(
        propertyId: number,
        title: string,
        description: string,
        price: number,
        location: string,
        type: string,
        userId: number,
        createdAt: Date
    ) {
        this._propertyId = propertyId;
        this._title       = title;
        this._description = description;
        this._price       = price;
        this._location    = location;
        this._type        = type;
        this._userId      = userId;
        this._createdAt   = createdAt;
    }

    // ---------- GETTERS ----------
    get propertyId(): number      { return this._propertyId; }
    get title(): string           { return this._title; }
    get description(): string     { return this._description; }
    get price(): number           { return this._price; }
    get location(): string        { return this._location; }
    get type(): string            { return this._type; }
    get userId(): number          { return this._userId; }
    get createdAt(): Date         { return this._createdAt; }

    // ---------- SETTERS ----------
    set propertyId(value: number) { this._propertyId = value; }
    set title(value: string)      { this._title = value; }
    set description(value: string){ this._description = value; }
    set price(value: number)      { this._price = value; }
    set location(value: string)   { this._location = value; }
    set type(value: string)       { this._type = value; }
    set userId(value: number)     { this._userId = value; }
    set createdAt(value: Date)    { this._createdAt = value; }
}
