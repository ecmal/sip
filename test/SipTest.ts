import {SipUri} from "sip/models";
import {Parser} from "sip/parser";


var uri = Parser.parse('si:hello@world.com',SipUri)
var uri = Parser.parse('sip:armen:pass@world.com',SipUri)

console.info(uri.toString());