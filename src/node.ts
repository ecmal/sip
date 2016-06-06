export default class Node {
    static require(path):Function {
        return system.node.require(path);
    }
    static get Buffer():any{
        return this.require('buffer');
    }
    static get Http():any{
        return this.require('http');
    }
    static get Https():any{
        return this.require('https');
    }
    static get Net():any{
        return this.require('net');
    }
    static get Fs():any{
        return this.require('fs');
    }
    static get Path():any{
        return this.require('path');
    }
    static get Url():any{
        return this.require('url');
    }
    static get Qs():any{
        return this.require('querystring');
    }
    static get Zlib():any{
        return this.require('zlib');
    }
    static get Crypto():any{
        return this.require('crypto');
    }
    static get Udp():any{
        return this.require('dgram');
    }
    static get Peg():any{
        return this.require('pegjs');
    }
}