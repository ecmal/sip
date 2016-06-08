export declare enum Color {
    RED = 31,
    RED_FG = 41,
    GREEN = 32,
    GREEN_FG = 42,
    YELLOW = 33,
    YELLOW_FG = 43,
    BLUE = 34,
    BLUE_FG = 44,
    MAGENTA = 35,
    MAGENTA_FG = 45,
    CYAN = 36,
    CYAN_FG = 46,
    LGRAY = 37,
    LGRAY_FG = 47,
    GRAY = 90,
    GRAY_FG = 100,
}
export declare class Paint {
    static bold(text: any): string;
    static dim(text: any): string;
    static underline(text: any): string;
    static color(text: string, color: Color): string;
    static red(text: string, bg?: boolean): string;
    static green(text: string, bg?: boolean): string;
    static yellow(text: string, bg?: boolean): string;
    static blue(text: string, bg?: boolean): string;
    static magenta(text: string, bg?: boolean): string;
    static cyan(text: string, bg?: boolean): string;
    static gray(text: string, bg?: boolean): string;
}
export declare class Util {
    static getLocalIpAddress(): Promise<string>;
    static toUnsigned(n: number): number;
    static addZeros(num: number, size: number): string;
    static random(): number;
    static guid(): any;
    static md5(text: string): any;
    static hash(count?: number, text?: any): any;
    static toParamString(params: any): string;
}
