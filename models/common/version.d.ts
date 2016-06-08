import { Model } from "../model";
export declare class Version extends Model {
    static SIP_2_0: Version;
    minor: number;
    major: number;
    toString(): string;
}
