Message       = Request / Response

Request
= m:Method __ u:RequestUri __ v:SipVersion h:Headers
{return M('Request',{
    method    : m,
    uri       : u,
    version   : v,
    headers   : h
})}

Response
= v:SipVersion __ c:Status_Code __ r:Reason_Phrase h:Headers
{return M('Response',{
  status  : c,
  message : r,
  version : v,
  headers : h
})}

RequestUri    = Uri / AbsoluteUri
// Headers
Headers = CRLF h:Header* { return pairsToObject(h); }

Header
= k:"Accept"                HCOLON v:Accept                 CRLF {return [k,v]}
/ k:"Expires"               HCOLON v:Expires                CRLF {return [k,v]}
/ k:"From"                  HCOLON v:Address                CRLF {return [k,v]}
/ k:"To"                    HCOLON v:Address                CRLF {return [k,v]}
/ k:"Via"                   HCOLON v:Vias                   CRLF {return [k,v]}
/ k:"CSeq"                  HCOLON v:CSeq                   CRLF {return [k,v]}
/ k:"Call-ID"               HCOLON v:CallId                 CRLF {return [k,v]}
/ k:"Contact"               HCOLON v:Contacts               CRLF {return [k,v]}
/ k:"Max-Forwards"          HCOLON v:integer                CRLF {return [k,v]}
/ k:"Supported"             HCOLON v:Supported              CRLF {return [k,v]}
/ k:"Accept"                HCOLON v:Accept                 CRLF {return [k,v]}
/ k:"Allow"                 HCOLON v:Allow                  CRLF {return [k,v]}
/ k:"Allow-Events"          HCOLON v:Allow_Events           CRLF {return [k,v]}
/ k:"Content-Type"          HCOLON v:Content_Type           CRLF {return [k,v]}
/ k:"Content-Length"        HCOLON v:Content_Length         CRLF {return [k,v]}
/ k:"Content-Disposition"   HCOLON v:Content_Disposition    CRLF {return [k,v]}
/ k:"Content-Encoding"      HCOLON v:Content_Encoding       CRLF {return [k,v]}

/ k:"User-Agent"            HCOLON v:UserAgent              CRLF {return [k,v]}
/ k:"Event"                 HCOLON v:Event                  CRLF {return [k,v]}
/ k:"Route"                 HCOLON v:Route                  CRLF {return [k,v]}
/// k:"x-inin-crn"            HCOLON v:XIninCrn               CRLF {return [k,v]}
/ k:"Record-Route"          HCOLON v:Route                  CRLF {return [k,v]}
/ k:"WWW-Authenticate"      HCOLON v:WWW_Authenticate       CRLF {return [k,v]}
/ k:x_token                 HCOLON v:HeaderValue            CRLF {return [k,v]}
/ k:token                   HCOLON v:HeaderValue            CRLF {return [k,v]}
;

HeaderValue = (TEXT_UTF8char/UTF8_CONT/LWS)* {return text()}
// Uri

Uri         
= s:UriScheme ":" u:UriUserInfo? d:UriServerInfo p:UriParams? h:UriHeaders?
{ return M('Uri',{
  scheme   : s,
  host     : d.host,
  port     : d.port,
  username : u ? u.username : void 0,
  password : u ? u.password : void 0,
  params   : p ? p : void 0,
  headers  : h ? h : void 0
}).set(u) }

UriNoParams 
= s:UriScheme ":" u:UriUserInfo? d:UriServerInfo
{ return M('Uri',{
  scheme   : s,
  host     : d.host,
  port     : d.port,
  username : u ? u.username : void 0,
  password : u ? u.password : void 0
}).set(u) }

// ABNF BASIC

CRLF    = "\r"?"\n"
DIGIT   = [0-9]
ALPHA   = [a-zA-Z]
HEXDIG  = [0-9a-fA-F]
WSP     = __ / HTAB
OCTET   = [\u0000-\u00FF]
DQUOTE  = '"'
__      = " "
HTAB    = "\t"


// BASIC RULES
alphanum    = [a-zA-Z0-9]
reserved    = ";" / "/" / "?" / ":" / "@" / "&" / "=" / "+" / "$" / ","
unreserved  = alphanum / mark
mark        = "-" / "_" / "." / "!" / "~" / "*" / "'" / "(" / ")"
escaped     = $ ("%" HEXDIG HEXDIG)

/* 
 * RFC3261 25: A recipient MAY replace any linear white space with a single __
 * before interpreting the field value or forwarding the message downstream
 */
LWS = ( WSP* CRLF )? WSP+ {return " "; }

SWS = LWS?

HCOLON  = ( __ / HTAB )* ":" SWS { return ':'; }

TEXT_UTF8_TRIM  = $( TEXT_UTF8char+ ( LWS* TEXT_UTF8char)* )

TEXT_UTF8char   = [\x21-\x7E] / UTF8_NONASCII

UTF8_NONASCII   = [\u0080-\uFFFF]

UTF8_CONT       = [\x80-\xBF]

LHEX            = DIGIT / [\x61-\x66]

token           = $ (alphanum / "-" / "." / "!" / "%" / "*" / "_" / "+" / "`" / "'" / "~" )+

token_nodot     = $ ( alphanum / "-"  / "!" / "%" / "*"
                  / "_" / "+" / "`" / "'" / "~" )+

separators      = "(" / ")" / "<" / ">" / "@" / "," / ";" / ":" / "\\"
                  / DQUOTE / "/" / "[" / "]" / "?" / "=" / "{" / "}"
                  / __ / HTAB

word            = $ (alphanum / "-" / "." / "!" / "%" / "*" /
                  "_" / "+" / "`" / "'" / "~" /
                  "(" / ")" / "<" / ">" /
                  ":" / "\\" / DQUOTE /
                  "/" / "[" / "]" / "?" /
                  "{" / "}" )+

STAR        = SWS "*" SWS   {return "*"; }
SLASH       = SWS "/" SWS   {return "/"; }
EQUAL       = SWS "=" SWS   {return "="; }
LPAREN      = SWS "(" SWS   {return "("; }
RPAREN      = SWS ")" SWS   {return ")"; }
RAQUOT      = ">" SWS       {return ">"; }
LAQUOT      = SWS "<"       {return "<"; }
COMMA       = SWS "," SWS   {return ","; }
SEMI        = SWS ";" SWS   {return ";"; }
COLON       = SWS ":" SWS   {return ":"; }
LDQUOT      = SWS DQUOTE    {return "\""; }
RDQUOT      = DQUOTE SWS    {return "\""; }

comment     = LPAREN t:(ctext / quoted_pair / comment)* RPAREN {return t.join('')}
ctext       = [\x21-\x27] / [\x2A-\x5B] / [\x5D-\x7E] / UTF8_NONASCII / LWS
quoted_string = $( SWS DQUOTE ( qdtext / quoted_pair )* DQUOTE )
quoted_string_clean = SWS DQUOTE contents: $( qdtext / quoted_pair )* DQUOTE
{ return contents; }
qdtext  = LWS / "\x21" / [\x23-\x5B] / [\x5D-\x7E] / UTF8_NONASCII
quoted_pair = "\\" ( [\x00-\x09] / [\x0B-\x0C] / [\x0E-\x7F] )
user_unreserved = "&" / "=" / "+" / "$" / "," / ";" / "?" / "/"
integer = DIGIT+ {return parseInt(text())}

//=======================
// SIP URI
//=======================





UriScheme      
= s:("sips"i/"sip"i)
{ return s.toLowerCase(); }

UriUserInfo        
= u:user ":" p:password "@" { return {username:decodeURIComponent(u),password:decodeURIComponent(p)}; }
/ u:user "@" { return {username:decodeURIComponent(u)}; }

user            = ( unreserved / escaped / user_unreserved )+ {return text()}
password        = ( unreserved / escaped / "&" / "=" / "+" / "$" / "," )* { return text(); }

UriServerInfo   
= h:host ":" p:port { return {host:h,port:p} }
/ h:host { return {host:h} }

host            = ( hostname / IPv4address / IPv6reference ) { return text(); }
hostname        = ( domainlabel "." )* toplabel  "." ? { return text(); }

domainlabel     = domainlabel: ( [a-zA-Z0-9_-]+ )
toplabel        = toplabel: ( [a-zA-Z][a-zA-Z0-9-]* )

IPv6reference   = "[" IPv6address "]"
{ return text(); }

IPv6address     = ( h16 ":" h16 ":" h16 ":" h16 ":" h16 ":" h16 ":" ls32
                  / "::" h16 ":" h16 ":" h16 ":" h16 ":" h16 ":" ls32
                  / "::" h16 ":" h16 ":" h16 ":" h16 ":" ls32
                  / "::" h16 ":" h16 ":" h16 ":" ls32
                  / "::" h16 ":" h16 ":" ls32
                  / "::" h16 ":" ls32
                  / "::" ls32
                  / "::" h16
                  / h16 "::" h16 ":" h16 ":" h16 ":" h16 ":" ls32
                  / h16 (":" h16)? "::" h16 ":" h16 ":" h16 ":" ls32
                  / h16 (":" h16)? (":" h16)? "::" h16 ":" h16 ":" ls32
                  / h16 (":" h16)? (":" h16)? (":" h16)? "::" h16 ":" ls32
                  / h16 (":" h16)? (":" h16)? (":" h16)? (":" h16)? "::" ls32
                  / h16 (":" h16)? (":" h16)? (":" h16)? (":" h16)? (":" h16)? "::" h16
                  / h16 (":" h16)? (":" h16)? (":" h16)? (":" h16)? (":" h16)? (":" h16)? "::"
                  )
{ return text(); }


h16             = HEXDIG HEXDIG? HEXDIG? HEXDIG?
ls32            = ( h16 ":" h16 ) / IPv4address


IPv4address     = dec_octet "." dec_octet "." dec_octet "." dec_octet
{ return text(); }

dec_octet       = "25" [\x30-\x35]          // 250-255
                / "2" [\x30-\x34] DIGIT     // 200-249
                / "1" DIGIT DIGIT           // 100-199
                / [\x31-\x39] DIGIT         // 10-99
                / DIGIT                     // 0-9

port            = port: (DIGIT ? DIGIT ? DIGIT ? DIGIT ? DIGIT ?) {return parseInt(port.join('')); }

// URI PARAMETERS

UriParams    = p:uri_parameter* 
{return pairsToObject(p)}

uri_parameter     = ";" p:(transport_param / user_param / method_param / ttl_param / maddr_param / lr_param / other_param)
{return p}

transport_param   = "transport="i t: ( "udp"i / "tcp"i / "sctp"i / "tls"i / other_transport)
{ return ['transport',t.toLowerCase()] }

other_transport   = token

user_param        = "user="i u:( "phone"i / "ip"i / other_user) 
{ return ['user',u ] }

other_user        = token

method_param      = "method="i m: Method 
{ return ['method',m] }

ttl_param         = "ttl="i t: ttl 
{ return ['ttl',t] }

maddr_param       = "maddr="i a: host 
{ return ['maddr',t] }

lr_param          = "lr"i p:("=" token)? 
{ return ['lr',p?p[1]:null] }

other_param       = p: pname v: ( "=" pvalue )? 
{ return [p,v?v[1]:null] }

pname             = $ paramchar +

pvalue            = $ paramchar +

paramchar         = param_unreserved / unreserved / escaped

param_unreserved  = "[" / "]" / "/" / ":" / "&" / "+" / "$"


// HEADERS

UriHeaders        = "?" f:header h:("&" v:header {return v})*
{return pairsToObject([f].concat(h))}
header            = k: hname "=" v: hvalue
{ return [k,v||true] }

hname             = ( hnv_unreserved / unreserved / escaped )+ {return text()}
hvalue            = ( hnv_unreserved / unreserved / escaped )* {return text()}

hnv_unreserved    = "[" / "]" / "/" / "?" / ":" / "+" / "$"


// FIRST LINE



// REQUEST LINE





AbsoluteUri       = scheme ":" ( hier_part / opaque_part )
{return text();}

hier_part         = ( net_path / abs_path ) ( "?" query )?
net_path          = "//" authority  abs_path ?
abs_path          = "/" path_segments

opaque_part       = uric_no_slash uric *

uric              = reserved / unreserved / escaped
uric_no_slash     = unreserved / escaped / ";" / "?" / ":" / "@" / "&" / "=" / "+" / "$" / ","
path_segments     = segment ( "/" segment )*
segment           = pchar * ( ";" param )*
param             = pchar *
pchar             = unreserved / escaped / ":" / "@" / "&" / "=" / "+" / "$" / ","
scheme            = ( ALPHA ( ALPHA / DIGIT / "+" / "-" / "." )* )
{return text(); }
authority         = srvr / reg_name
srvr              = ( ( UriUserInfo "@" )? UriServerInfo )?
reg_name          = ( unreserved / escaped / "$" / "," / ";" / ":" / "@" / "&" / "=" / "+" )+
query             = uric *
SipVersion        = "SIP"i "/" maj:(DIGIT+) "." min:(DIGIT+)
{return M('Version',{
    minor   : parseInt(min.join('')),
    major   : parseInt(maj.join('')),
})}

// SIP METHODS

INVITEm           = "\x49\x4E\x56\x49\x54\x45"             // INVITE in caps
ACKm              = "\x41\x43\x4B"                         // ACK in caps
PRACKm            = "\x56\x58\x41\x43\x48"                 // PRACK in caps
OPTIONSm          = "\x4F\x50\x54\x49\x4F\x4E\x53"         // OPTIONS in caps
BYEm              = "\x42\x59\x45"                         // BYE in caps
CANCELm           = "\x43\x41\x4E\x43\x45\x4C"             // CANCEL in caps
REGISTERm         = "\x52\x45\x47\x49\x53\x54\x45\x52"     // REGISTER in caps
SUBSCRIBEm        = "\x53\x55\x42\x53\x43\x52\x49\x42\x45" // SUBSCRIBE in caps
NOTIFYm           = "\x4E\x4F\x54\x49\x46\x59"             // NOTIFY in caps
REFERm            = "\x52\x45\x46\x45\x52"                 // REFER in caps

Method            
= INVITEm 
/ ACKm 
/ OPTIONSm 
/ BYEm 
/ CANCELm 
/ REGISTERm
/ SUBSCRIBEm 
/ NOTIFYm 
/ REFERm 
/ token 
{return text()}


// STATUS LINE

Status_Code     = extension_code {return parseInt(text())}
extension_code  = DIGIT DIGIT DIGIT
Reason_Phrase   = (reserved / unreserved / escaped  / UTF8_NONASCII / UTF8_CONT / __ / HTAB)* 
{ return text(); }


//=======================
// HEADERS
//=======================

//ININ 

XIninCrn = v:CrnValue  p:XIninCrnParams 
{return {value:v,params:p}}

XIninCrnParams = p:XIninCrnParam* 
{return pairsToObject(p)}

XIninCrnParam = SEMI k:token EQUAL v:CrnParam 
{return [k,v]}

CrnValue = DIGIT+ 
{return text()} 

CrnParam 
= token {return text()}
/ quoted_string {return text()}
/ escaped {return decodeURIComponent(text())}

// Allow-Events
Allow = f:Method r:(COMMA m:Method {return m})*
{return [f].concat(r)}

Allow_Events = f:event_type r:(COMMA m:event_type {return m})*
{return [f].concat(r)}

// CALL-ID

CallId  =  word ( "@" word )? {return text(); }

// CONTACT

Contacts
= STAR {return []} 
/ a:Contact r:(COMMA v:Contact {return v})*
{ return [a].concat(r) }


Contact
= a:(name_addr/addr_spec) p:ContactParams
{ return M('Contact',a).set({ params:p })}

ContactParams = p:contact_params* {return pairsToObject(p)}


name_addr = n:displayName? LAQUOT u:Uri RAQUOT
{return n?{name:n,uri:u}:{uri:u}}
addr_spec = u:UriNoParams
{return {uri:u}}


displayName         = displayName: (token ( LWS token )* / quoted_string) {
                        displayName = text().trim();
                        if (displayName[0] === '\"') {
                          displayName = displayName.substring(1, displayName.length-1);
                        }
                        return displayName; }
                        // The previous rule is corrected from RFC3261

contact_params      = SEMI p:(c_p_q / c_p_expires /c_p_reg/ c_p_instance/ contact_extension)
{return p}

c_p_q               = "q"i EQUAL q: qvalue { return ['q',q]; }
c_p_expires         = "expires"i EQUAL e: integer { return ['expires',e]; }
c_p_reg             = "reg-id"i EQUAL v: DIGIT+ { return ['reg-id',parseInt(v)]; }
c_p_instance        = "+sip.instance"i EQUAL LDQUOT "<" v:instance_val ">" RDQUOT { return ['+sip.instance',v]; }
instance_val        = uric* {return text()}
contact_extension   = generic_param



qvalue              = "0" ( "." DIGIT? DIGIT? DIGIT? )? {
                        return parseFloat(text()); }

generic_param       = param: token  value: ( EQUAL v:gen_value {return v})? 
{ return [param.toLowerCase(), value?value:null] }

gen_value           = token / host / quoted_string {return text()}


// CONTENT-DISPOSITION

Content_Disposition     = t:disp_type p:disp_params
{return {type:t,params:p}}

disp_type               = ("render"i / "session"i / "icon"i / "alert"i / disp_extension_token)
{ return text().toLowerCase(); }

disp_params             = p:disp_param* 
{return pairsToObject(p)}

disp_param              = SEMI p:(handling_param / generic_param) 
{return p}

handling_param          = "handling"i EQUAL v:( "optional"i / "required"i / other_handling )
{return ["handling",v]}

other_handling          = token
disp_extension_token    = token


// CONTENT-ENCODING

Content_Encoding    = f:content_coding r:(COMMA content_coding)*
{return [f].concat(r.map(function(i){return i[1]}))}

content_coding      = token


// CONTENT-LENGTH

Content_Length      = DIGIT+ {return parseInt(text()); }
// UserAgent

UserAgent  = server_val (LWS server_val)* {return text()}
server_val = product / comment
product 
= token SLASH token
/ token

// CONTENT-TYPE
Accept              
= m:Mime r:(COMMA v:Mime {return v})* 
{ return [m].concat(r)} 

Content_Type        = Mime 


Mime          = t:m_type SLASH s:m_subtype p:m_parameters
{return M('Mime',{type:t,subtype:s,params:p})}

m_parameters        = p:m_parameter*
{return pairsToObject(p)}

m_type              = discrete_type / composite_type

discrete_type       = "text"i / "image"i / "audio"i / "video"i / "application"i / extension_token

composite_type      = "message"i / "multipart"i / extension_token

extension_token     = ietf_token / x_token

ietf_token          = token

x_token             = "x-"i token {return text()}

m_subtype           = extension_token / iana_token

iana_token          = token

m_parameter         = SEMI k:m_attribute EQUAL v:m_value 
{return [k,v]}

m_attribute         = token

m_value             = token / quoted_string


// CSEQ
CSeq          = v:integer LWS m:Method
{return M('Sequence',{method:m,value:v})}



// EXPIRES

Expires     = expires: integer {return expires}


Event             = t: event_type ps:( SEMI p:event_param {return p} )* 
{ return M('Event',{type:t,params:pairsToObject(ps)}) }

event_type        = $( event_package ( "." event_template )* ) {return text()}
event_package     = token_nodot
event_template    = token_nodot
event_param       = generic_param

// FROM
Address
= a:(name_addr/addr_spec) p:AddressParams
{ return M('Contact',a).set({ params:p })}

AddressParams  = p:AddressParam*
{return pairsToObject(p);}

AddressParam   = SEMI p:(tag_param/generic_param) {return p}

tag_param   = "tag"i EQUAL tag: token {return ['tag',tag];}


//MAX-FORWARDS

Max_Forwards  = DIGIT+ {return parseInt(text()); }


// MIN-EXPIRES

Min_Expires  = min_expires: integer
{return min_expires; }

// PROXY-AUTHENTICATE

Proxy_Authenticate  =  Challenge

Challenge           = digest_challenge / other_challenge

digest_challenge    = "Digest"i LWS p:digest_clns
{return M('Challenge',{type:'Digest',params:p})}

other_challenge     = s:auth_scheme LWS p:auth_params
{return M('Challenge',{type:s,params:p})}

auth_scheme         = token {return text()}
auth_params         = f:auth_param r:(COMMA v:auth_param {return v})*
{return pairsToObject([f].concat(r))}
auth_param          = k:auth_param_name EQUAL v:auth_param_value {return [k,v]}
auth_param_name     = token {return text()}
auth_param_value    = token {return text()} / quoted_string {return JSON.parse(text())}

digest_clns         = f:digest_cln r:(COMMA v:digest_cln {return v})*
{return pairsToObject([f].concat(r))}

digest_cln          = realm / domain / nonce / opaque / stale / algorithm / qop_options / auth_param
realm               = "realm"i EQUAL v:realm_value { return ['realm',v]; }
realm_value         = quoted_string_clean { return JSON.parse(text()); }
domain              = "domain"i EQUAL d:domain_value  { return ['domain',d]; }
domain_value        = LDQUOT f:URI r:( __+ v:URI {return v})* RDQUOT {return [f].concat(r)}
URI                 = AbsoluteUri / abs_path
nonce               = "nonce"i EQUAL d:nonce_value  { return ['nonce',d]; }
nonce_value         = quoted_string_clean { return JSON.parse(text()); }
opaque              = "opaque"i EQUAL v: (quoted_string_clean {return text()}){ return ['opaque',JSON.parse(v)]; }
stale               = "stale"i EQUAL v:( "true"i { return true; } / "false"i { return false; } ) { return ['stale',v]; }
algorithm           = "algorithm"i EQUAL a: ( "MD5"i / "MD5-sess"i / token ) { return ['algorithm',a.toUpperCase()]; }
qop_options         = "qop"i EQUAL LDQUOT f:qop_value r:("," v:qop_value {return v})* RDQUOT { return ['qop',[f].concat(r)]; }
qop_value           = ( "auth-int"i / "auth"i / token ) { return text().toLowerCase() }


// PROXY-REQUIRE

Proxy_Require  = option_tag (COMMA option_tag)*
option_tag     = token

// RAck

RAck          = RAck_value LWS RAck_value LWS RAck_method

RAck_value    = rack_value: DIGIT + {
                 return parseInt(rack_value.join('')); }

RAck_method   = Method

// ROUTE


Route  = f:rec_route r:(COMMA v:rec_route {return v})* 
{ return [f].concat(r)}

rec_route     = a:name_addr p:( SEMI v:rr_param {return v})*
{return M('Contact',a).set({params:pairsToObject(p)})}

rr_param      = generic_param

// REFER-TO

Refer_To = ( addr_spec / name_addr / LAQUOT? AbsoluteUri RAQUOT? ) ( SEMI r_param )*
{return text() }

r_param = generic_param

// REPLACES

Replaces          = replaces_CallId ( SEMI replaces_params )*
{ return text() }

replaces_CallId  = CallId


replaces_params   = "from-tag"i EQUAL from_tag: token {
                      return from_tag;
                    }
                  / "to-tag"i EQUAL to_tag: token {
                      return to_tag;
                    }
                  / "early-only"i {
                      return true;
                    }
                  / generic_param

// REQUIRE

Require = f:option_tag r:(COMMA r:option_tag {return r;})*
{ return [f].concat(r) }





// RSEQ
RSeq = DIGIT + 
{return parseInt(text());}


// SUBSCRIPTION-STATE

Subscription_State   = substate_value ( SEMI subexp_params )*

substate_value       = ( "active"i / "pending"i / "terminated"i
                       / extension_substate ) {
                        return text(); }

extension_substate   = token

subexp_params        = ("reason"i EQUAL reason: event_reason_value) { return reason; }
                       / ("expires"i EQUAL expires: integer) {return expires; }
                       / ("retry_after"i EQUAL retry_after: integer) {return retry_after; }
                       / generic_param

event_reason_value   = "deactivated"i
                       / "probation"i
                       / "rejected"i
                       / "timeout"i
                       / "giveup"i
                       / "noresource"i
                       / "invariant"i
                       / event_reason_extension

event_reason_extension = token


// SUBJECT

Subject  = ( TEXT_UTF8_TRIM )?


// SUPPORTED

Supported  =  f:option_tag r:(COMMA r:option_tag {return r;})*
{ return [f].concat(r)}



// TO





// VIA

Vias = f:Via r:(COMMA v:Via {return v})*
{ return [f].concat(r)}
Via = p:ViaProtocol SLASH v:ViaVersion SLASH t:transport LWS s:ViaSentBy a:ViaParams
{ return M('Via',{
  protocol  :p,
  version   :v,
  transport :t,
  host      :s.host,
  port      :s.port,
  params    :a
})}
ViaProtocol = ("SIP"i / token )
{ return text(); }
ViaVersion = token
{return text(); }
ViaSentBy
= h:ViaHost p:(COLON p:ViaPort {return p})?
{ return {host:h,port:p||void 0}}
ViaHost  = ( hostname / IPv4address / IPv6reference )
{ return text(); }
ViaPort = DIGIT ? DIGIT ? DIGIT ? DIGIT ? DIGIT ?
{ return parseInt(text()); }

ViaParams = p:(SEMI v:ViaParam {return v})*
{return pairsToObject(p)}
ViaParam
= "ttl"i EQUAL t: ttl { return ['ttl',t]}
/ "maddr"i EQUAL h: host  { return ['maddr',h]}
/ "received"i EQUAL r: (IPv4address / IPv6address)
{ return ['received',r]}
/ "branch"i EQUAL b: token
{ return ['branch',b]}
/ "rport"i (EQUAL p: (DIGIT*) )?
{ return ['rport',(typeof p !== 'undefined')? parseInt(p.join('')):null] }
/ generic_param




transport         = ("UDP"i / "TCP"i / "TLS"i / "SCTP"i / other_transport)
{ return text();}

ttl               = DIGIT DIGIT ? DIGIT ?
{ return parseInt(text()); }


// WWW-AUTHENTICATE
WWW_Authenticate  = Challenge


// RFC 4028

Session_Expires   = deltaSeconds:integer (SEMI se_params)*
{ return text() }

se_params         = refresher_param / generic_param

refresher_param   = "refresher" EQUAL endpoint:("uas" / "uac")
{ return text() }

Min_SE            = deltaSeconds:integer (SEMI generic_param)*
{return deltaSeconds}

// EXTENSION-HEADER

extension_header  = extension_header: header_name HCOLON header_value: header_value

header_name       = token

header_value      = (TEXT_UTF8char / UTF8_CONT / LWS)*

message_body      = OCTET*


// STUN URI (draft-nandakumar-rtcweb-stun-uri)

stun_URI          = stun_scheme ":" stun_host_port

stun_scheme       = scheme: ("stuns"i / "stun"i) {
                      return scheme; }

stun_host_port    = stun_host ( ":" port )?

stun_host         = host: (IPv4address / IPv6reference / reg_name)
{ return host }

reg_name          = $ ( stun_unreserved / escaped / sub_delims )*

stun_unreserved   = ALPHA / DIGIT / "-" / "." / "_" / "~"

sub_delims        = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="


// TURN URI (draft-petithuguenin-behave-turn-uris)

turn_URI          = turn_scheme ":" stun_host_port ( "?transport=" transport )?

turn_scheme       = scheme: ("turns"i / "turn"i) {
                      return scheme; }

turn_transport    = transport ("udp"i / "tcp"i / unreserved*)
{return transport;}

// UUID URI
uuid          = hex8 "-" hex4 "-" hex4 "-" hex4 "-" hex12
{ return text(); }
hex4          = HEXDIG HEXDIG HEXDIG HEXDIG
hex8          = hex4 hex4
hex12         = hex4 hex4 hex4