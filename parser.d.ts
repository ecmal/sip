export declare class Parser {
    static normalize(text: string): string;
    static parse<T>(content: string, model?: {
        new (): T;
    }): T;
}
