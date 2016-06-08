export declare class Model {
    protected static parser: any;
    static new(text: any): Model;
    constructor(data?: any);
    set(data: any): this;
    inspect(): string;
    toString(options?: any): string;
    clone(select?: string): any;
}
