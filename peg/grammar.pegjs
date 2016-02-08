
//
ALPHA     = [a-zA-Z]
ALPHANUM  = [a-zA-Z]
DIGIT     = [0-9]
HEX       = DIGIT / [a-fA-F]
ESCAPED   = "%" HEX HEX
MARK 	  = "-"  /  "_"  /  "."  /  "!"  /  "~"  /  "*"  /  "'"  /  "("  /  ")"
UNRESEVED = ALPHA / MARK
RESERVED  = ";"  /  "/"  /  "?"  /  ":"  /  "@"  /  "&"  /  "="  /  "+"  /  "$"  /  ","
USERFREE  = "&"  /  "="  /  "+"  /  "$"  /  ","  /  ";"  /  "?"  /  "/"
PASSFREE  = "&"  /  "="  /  "+"  /  "$"  /  ","


//
SipUri
= sh:UriScheme ui:UriUserInfo hp:UriHostPort pm:UriParams hd:UriHeaders?
{ return Rules.SipUri(sh,ui,hp,pm,hd) }

UriScheme
= s:("sips"/"sip"/"tel") ":"
{ return s }


UriUserInfo
 = u:UriUserName ':' p:UriUserPass '@'
 {return {user:u,pass:p}}
 / u:UriUserName '@'
 {return {user:u}}
 / u:UriUserTel ':' p:UriUserPass '@'
 {return {user:u,pass:p}}
 / u:UriUserTel '@'
 {return {user:u}}

UriUserName
= r:(UNRESEVED / ESCAPED / USERFREE)*
{return r.join("")}

UriUserTel
= g:"+"? p:(DIGIT / "-"   /   "."   /   "("   /   ")")+
{ return (g?g:'')+p.join("").replace(/[^\d]+/g,'')}

UriUserPass = r:(UNRESEVED / ESCAPED / PASSFREE)*
{return r.join("")}

UriHostPort
= d:UriHostName ':' p:DIGIT+
{return {host:d,port:parseInt(p.join(""))}}
/ d:UriHostName
{return {host:d}}

UriHostName
= UriHostDomain / UriHostIp4 / UriHostIp6

UriHostDomain
= s:UriHostSubdomain+ z:ALPHANUM+
{return s.join('')+z.join("")}

UriHostSubdomain
= d:(ALPHANUM+ ".")
{return d[0].join("")+d[1]}

UriHostIp4
= r:(UriHostIpB "." UriHostIpB "." UriHostIpB "." UriHostIpB)
{return r.join("")}

UriHostIp6
= "[" r:(HEX/":"/".")*  "]"
{return '['+r.join("")+']'}

UriHostIpB
= r:(DIGIT DIGIT? DIGIT?) {return r.join("")}

UriParams
= p:(";" p:UriParam {return p})*
{return p;}

UriParam
 = p:TransportParam  		{return {key:"transport",value:p}}
 / p:UserParam         		{return {key:"user",value:p}}
 / p:MethodParam        	{return {key:"method",value:p}}
 / p:TtlParam           	{return {key:"ttl",value:p}}
 / p:MaddrParam          	{return {key:"maddr",value:p}}
 / p:LrParam               	{return {key:"lr",value:p}}
 / p:CompressionParam      	{return {key:"compression",value:p}}
 / p:AnncParameters         {return {key:"anncs",value:p}}
 / p:DialogParameters       {return {key:"dialogs",value:p}}
 / p:TargetParam            {return {key:"target",value:p}}
 / p:CauseParam             {return {key:"cause",value:p}}
 / p:UriSipSigcompIdParam   {return {key:"sig",value:p}}
 / p:DialogParam            {return {key:"dialog",value:p}}
 / p:MaxageParam            {return {key:"maxage",value:p}}
 / p:MaxstaleParam          {return {key:"maxstale",value:p}}
 / p:OtherParam             {return {key:"compression",value:p}}

TransportParam           = "TransportParam"
UserParam                = "UserParam"
MethodParam              = "MethodParam"
TtlParam                 = "TtlParam"
MaddrParam               = "MaddrParam"
LrParam                  = "LrParam"
CompressionParam         = "CompressionParam"
AnncParameters           = "AnncParameters"
DialogParameters         = "DialogParameters"
TargetParam              = "TargetParam"
CauseParam               = "CauseParam"
UriSipSigcompIdParam     = "UriSipSigCompIdParam"
DialogParam              = "DialogParam"
MaxageParam              = "MaxageParam"
MaxstaleParam            = "MaxstaleParam"
MethodParam              = "MethodParam"
PostbodyParam            = "PostbodyParam"
CcxmlParam               = "CcxmlParam"
AaiParam                 = "AaiParam"
ObParam                  = "ObParam"
GrParam                  = "GrParam"
BncParam                 = "BncParam"
SgParam                  = "SgParam"
MParam                   = "MParam"
Orig                     = "Orig"
SosParam                 = "SosParam"
OtherParam               = "OtherParam"

UriHeaders
  = "?" h:UriHeader "&" H:UriHeader* {return (H.push(h),H);}
  / "?" h:UriHeader {return [h]}
UriHeader   = "${UriHeader}"
