var wi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Ti={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Xh=0,ec=1,qh=2;var Uu=1,pl=2,Nn=3,ni=0,qt=1,yn=2;var Qn=0,es=1,tc=2,nc=3,ic=4,Yh=5,gi=100,jh=101,Zh=102,sc=103,rc=104,Jh=200,Kh=201,$h=202,Qh=203,To=204,Ao=205,ed=206,td=207,nd=208,id=209,sd=210,rd=211,ad=212,od=213,ld=214,cd=0,ud=1,hd=2,zr=3,dd=4,fd=5,pd=6,md=7,Nu=0,gd=1,_d=2,ei=0,xd=1,yd=2,vd=3,ml=4,bd=5,Md=6;var Ou=300,is=301,ss=302,Ro=303,Co=304,ya=306,Po=1e3,vn=1001,Lo=1002,Ut=1003,ac=1004;var Xa=1005;var an=1006,Sd=1007;var Ds=1008;var ti=1009,Ed=1010,wd=1011,gl=1012,Fu=1013,Kn=1014,$n=1015,Us=1016,Bu=1017,zu=1018,xi=1020,Td=1021,bn=1023,Ad=1024,Rd=1025,yi=1026,rs=1027,Cd=1028,ku=1029,Pd=1030,Hu=1031,Vu=1033,qa=33776,Ya=33777,ja=33778,Za=33779,oc=35840,lc=35841,cc=35842,uc=35843,Gu=36196,hc=37492,dc=37496,fc=37808,pc=37809,mc=37810,gc=37811,_c=37812,xc=37813,yc=37814,vc=37815,bc=37816,Mc=37817,Sc=37818,Ec=37819,wc=37820,Tc=37821,Ja=36492,Ac=36494,Rc=36495,Ld=36283,Cc=36284,Pc=36285,Lc=36286;var kr=2300,Hr=2301,Ka=2302,Ic=2400,Dc=2401,Uc=2402;var Wu=3e3,vi=3001,Id=3200,Dd=3201,Xu=0,Ud=1,on="",yt="srgb",Fn="srgb-linear",_l="display-p3",va="display-p3-linear",Vr="linear",ht="srgb",Gr="rec709",Wr="p3";var Di=7680;var Nc=519,Nd=512,Od=513,Fd=514,qu=515,Bd=516,zd=517,kd=518,Hd=519,Oc=35044;var Fc="300 es",Io=1035,On=2e3,Xr=2001,An=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Bc=1234567,Ts=Math.PI/180,Ns=180/Math.PI;function Ai(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(zt[i&255]+zt[i>>8&255]+zt[i>>16&255]+zt[i>>24&255]+"-"+zt[e&255]+zt[e>>8&255]+"-"+zt[e>>16&15|64]+zt[e>>24&255]+"-"+zt[t&63|128]+zt[t>>8&255]+"-"+zt[t>>16&255]+zt[t>>24&255]+zt[n&255]+zt[n>>8&255]+zt[n>>16&255]+zt[n>>24&255]).toLowerCase()}function Rt(i,e,t){return Math.max(e,Math.min(t,i))}function xl(i,e){return(i%e+e)%e}function Vd(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Gd(i,e,t){return i!==e?(t-i)/(e-i):0}function As(i,e,t){return(1-t)*i+t*e}function Wd(i,e,t,n){return As(i,e,1-Math.exp(-t*n))}function Xd(i,e=1){return e-Math.abs(xl(i,e*2)-e)}function qd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Yd(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function jd(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Zd(i,e){return i+Math.random()*(e-i)}function Jd(i){return i*(.5-Math.random())}function Kd(i){i!==void 0&&(Bc=i);let e=Bc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function $d(i){return i*Ts}function Qd(i){return i*Ns}function Do(i){return(i&i-1)===0&&i!==0}function ef(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function qr(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function tf(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),u=o((e+n)/2),h=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*u,l*h,l*d,a*c);break;case"YZY":i.set(l*d,a*u,l*h,a*c);break;case"ZXZ":i.set(l*h,l*d,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Zi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Gt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Qs={DEG2RAD:Ts,RAD2DEG:Ns,generateUUID:Ai,clamp:Rt,euclideanModulo:xl,mapLinear:Vd,inverseLerp:Gd,lerp:As,damp:Wd,pingpong:Xd,smoothstep:qd,smootherstep:Yd,randInt:jd,randFloat:Zd,randFloatSpread:Jd,seededRandom:Kd,degToRad:$d,radToDeg:Qd,isPowerOfTwo:Do,ceilPowerOfTwo:ef,floorPowerOfTwo:qr,setQuaternionFromProperEuler:tf,normalize:Gt,denormalize:Zi},oe=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},tt=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=s[0],m=s[3],p=s[6],E=s[1],x=s[4],w=s[7],D=s[2],R=s[5],A=s[8];return r[0]=o*_+a*E+l*D,r[3]=o*m+a*x+l*R,r[6]=o*p+a*w+l*A,r[1]=c*_+u*E+h*D,r[4]=c*m+u*x+h*R,r[7]=c*p+u*w+h*A,r[2]=d*_+f*E+g*D,r[5]=d*m+f*x+g*R,r[8]=d*p+f*w+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*r,f=c*r-o*l,g=t*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=h*_,e[1]=(s*c-u*n)*_,e[2]=(a*n-s*o)*_,e[3]=d*_,e[4]=(u*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply($a.makeScale(e,t)),this}rotate(e){return this.premultiply($a.makeRotation(-e)),this}translate(e,t){return this.premultiply($a.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},$a=new tt;function Yu(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Yr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function nf(){let i=Yr("canvas");return i.style.display="block",i}var zc={};function Rs(i){i in zc||(zc[i]=!0,console.warn(i))}var kc=new tt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Hc=new tt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),dr={[Fn]:{transfer:Vr,primaries:Gr,toReference:i=>i,fromReference:i=>i},[yt]:{transfer:ht,primaries:Gr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[va]:{transfer:Vr,primaries:Wr,toReference:i=>i.applyMatrix3(Hc),fromReference:i=>i.applyMatrix3(kc)},[_l]:{transfer:ht,primaries:Wr,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Hc),fromReference:i=>i.applyMatrix3(kc).convertLinearToSRGB()}},sf=new Set([Fn,va]),ot={enabled:!0,_workingColorSpace:Fn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!sf.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;let n=dr[e].toReference,s=dr[t].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return dr[i].primaries},getTransfer:function(i){return i===on?Vr:dr[i].transfer}};function ts(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Qa(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ui,jr=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Ui===void 0&&(Ui=Yr("canvas")),Ui.width=e.width,Ui.height=e.height;let n=Ui.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Ui}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Yr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ts(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ts(t[n]/255)*255):t[n]=ts(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},rf=0,Zr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:rf++}),this.uuid=Ai(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(eo(s[o].image)):r.push(eo(s[o]))}else r=eo(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function eo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?jr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var af=0,ln=class i extends An{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=vn,s=vn,r=an,o=Ds,a=bn,l=ti,c=i.DEFAULT_ANISOTROPY,u=on){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:af++}),this.uuid=Ai(),this.name="",this.source=new Zr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new oe(0,0),this.repeat=new oe(1,1),this.center=new oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof u=="string"?this.colorSpace=u:(Rs("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=u===vi?yt:on),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Ou)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Po:e.x=e.x-Math.floor(e.x);break;case vn:e.x=e.x<0?0:1;break;case Lo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Po:e.y=e.y-Math.floor(e.y);break;case vn:e.y=e.y<0?0:1;break;case Lo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Rs("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===yt?vi:Wu}set encoding(e){Rs("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===vi?yt:on}};ln.DEFAULT_IMAGE=null;ln.DEFAULT_MAPPING=Ou;ln.DEFAULT_ANISOTROPY=1;var Ct=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let x=(c+1)/2,w=(f+1)/2,D=(p+1)/2,R=(u+d)/4,A=(h+_)/4,H=(g+m)/4;return x>w&&x>D?x<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(x),s=R/n,r=A/n):w>D?w<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(w),n=R/s,r=H/s):D<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(D),n=A/r,s=H/r),this.set(n,s,r,t),this}let E=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(E)<.001&&(E=1),this.x=(m-g)/E,this.y=(h-_)/E,this.z=(d-u)/E,this.w=Math.acos((c+f+p-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Uo=class extends An{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Ct(0,0,e,t),this.scissorTest=!1,this.viewport=new Ct(0,0,e,t);let s={width:e,height:t,depth:1};n.encoding!==void 0&&(Rs("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===vi?yt:on),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:an,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new ln(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new Zr(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Bn=class extends Uo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Jr=class extends ln{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var No=class extends ln{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ft=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3],d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-a,p=l*d+c*f+u*g+h*_,E=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let D=Math.sqrt(x),R=Math.atan2(D,p*E);m=Math.sin(m*R)/D,a=Math.sin(a*R)/D}let w=a*E;if(l=l*m+d*w,c=c*m+f*w,u=u*m+g*w,h=h*m+_*w,m===1-a){let D=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=D,c*=D,u*=D,h*=D}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+u*h+l*f-c*d,e[t+1]=l*g+u*d+c*h-a*f,e[t+2]=c*g+u*f+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>h){let f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>h){let f=2*Math.sqrt(1+a-n-h);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+h-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Rt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(s),n*Math.sin(r),n*Math.cos(r),t*Math.sin(s))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vc.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),u=2*(a*t-r*s),h=2*(r*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return to.copy(this).projectOnVector(e),this.sub(to)}reflect(e){return this.sub(to.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},to=new L,Vc=new ft,cn=class{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(mn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(mn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=mn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,mn):mn.fromBufferAttribute(r,o),mn.applyMatrix4(e.matrixWorld),this.expandByPoint(mn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),fr.copy(n.boundingBox)),fr.applyMatrix4(e.matrixWorld),this.union(fr)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,mn),mn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ms),pr.subVectors(this.max,Ms),Ni.subVectors(e.a,Ms),Oi.subVectors(e.b,Ms),Fi.subVectors(e.c,Ms),qn.subVectors(Oi,Ni),Yn.subVectors(Fi,Oi),hi.subVectors(Ni,Fi);let t=[0,-qn.z,qn.y,0,-Yn.z,Yn.y,0,-hi.z,hi.y,qn.z,0,-qn.x,Yn.z,0,-Yn.x,hi.z,0,-hi.x,-qn.y,qn.x,0,-Yn.y,Yn.x,0,-hi.y,hi.x,0];return!no(t,Ni,Oi,Fi,pr)||(t=[1,0,0,0,1,0,0,0,1],!no(t,Ni,Oi,Fi,pr))?!1:(mr.crossVectors(qn,Yn),t=[mr.x,mr.y,mr.z],no(t,Ni,Oi,Fi,pr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,mn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(mn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Pn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},Pn=[new L,new L,new L,new L,new L,new L,new L,new L],mn=new L,fr=new cn,Ni=new L,Oi=new L,Fi=new L,qn=new L,Yn=new L,hi=new L,Ms=new L,pr=new L,mr=new L,di=new L;function no(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){di.fromArray(i,r);let a=s.x*Math.abs(di.x)+s.y*Math.abs(di.y)+s.z*Math.abs(di.z),l=e.dot(di),c=t.dot(di),u=n.dot(di);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var of=new cn,Ss=new L,io=new L,ii=class{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):of.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ss.subVectors(e,this.center);let t=Ss.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ss,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(io.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ss.copy(e.center).add(io)),this.expandByPoint(Ss.copy(e.center).sub(io))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},Ln=new L,so=new L,gr=new L,jn=new L,ro=new L,_r=new L,ao=new L,as=class{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ln)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ln.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ln.copy(this.origin).addScaledVector(this.direction,t),Ln.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){so.copy(e).add(t).multiplyScalar(.5),gr.copy(t).sub(e).normalize(),jn.copy(this.origin).sub(so);let r=e.distanceTo(t)*.5,o=-this.direction.dot(gr),a=jn.dot(this.direction),l=-jn.dot(gr),c=jn.lengthSq(),u=Math.abs(1-o*o),h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){let _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(so).addScaledVector(gr,d),f}intersectSphere(e,t){Ln.subVectors(e.center,this.origin);let n=Ln.dot(this.direction),s=Ln.dot(Ln)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),u>=0?(r=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(r=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ln)!==null}intersectTriangle(e,t,n,s,r){ro.subVectors(t,e),_r.subVectors(n,e),ao.crossVectors(ro,_r);let o=this.direction.dot(ao),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;jn.subVectors(this.origin,e);let l=a*this.direction.dot(_r.crossVectors(jn,_r));if(l<0)return null;let c=a*this.direction.dot(ro.cross(jn));if(c<0||l+c>o)return null;let u=-a*jn.dot(ao);return u<0?null:this.at(u/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ze=class i{constructor(e,t,n,s,r,o,a,l,c,u,h,d,f,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,u,h,d,f,g,_,m)}set(e,t,n,s,r,o,a,l,c,u,h,d,f,g,_,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Bi.setFromMatrixColumn(e,0).length(),r=1/Bi.setFromMatrixColumn(e,1).length(),o=1/Bi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){let d=l*u,f=l*h,g=c*u,_=c*h;t[0]=d-_*a,t[4]=-o*h,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let d=o*u,f=o*h,g=a*u,_=a*h;t[0]=l*u,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*h,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-d*h,t[8]=g*h+f,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*h+g,t[10]=d-_*h}else if(e.order==="XZY"){let d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+_,t[5]=o*u,t[9]=f*h-g,t[2]=g*h-f,t[6]=a*u,t[10]=_*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(lf,e,cf)}lookAt(e,t,n){let s=this.elements;return Qt.subVectors(e,t),Qt.lengthSq()===0&&(Qt.z=1),Qt.normalize(),Zn.crossVectors(n,Qt),Zn.lengthSq()===0&&(Math.abs(n.z)===1?Qt.x+=1e-4:Qt.z+=1e-4,Qt.normalize(),Zn.crossVectors(n,Qt)),Zn.normalize(),xr.crossVectors(Qt,Zn),s[0]=Zn.x,s[4]=xr.x,s[8]=Qt.x,s[1]=Zn.y,s[5]=xr.y,s[9]=Qt.y,s[2]=Zn.z,s[6]=xr.z,s[10]=Qt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],E=n[3],x=n[7],w=n[11],D=n[15],R=s[0],A=s[4],H=s[8],M=s[12],T=s[1],B=s[5],q=s[9],re=s[13],U=s[2],F=s[6],G=s[10],J=s[14],Z=s[3],X=s[7],te=s[11],ie=s[15];return r[0]=o*R+a*T+l*U+c*Z,r[4]=o*A+a*B+l*F+c*X,r[8]=o*H+a*q+l*G+c*te,r[12]=o*M+a*re+l*J+c*ie,r[1]=u*R+h*T+d*U+f*Z,r[5]=u*A+h*B+d*F+f*X,r[9]=u*H+h*q+d*G+f*te,r[13]=u*M+h*re+d*J+f*ie,r[2]=g*R+_*T+m*U+p*Z,r[6]=g*A+_*B+m*F+p*X,r[10]=g*H+_*q+m*G+p*te,r[14]=g*M+_*re+m*J+p*ie,r[3]=E*R+x*T+w*U+D*Z,r[7]=E*A+x*B+w*F+D*X,r[11]=E*H+x*q+w*G+D*te,r[15]=E*M+x*re+w*J+D*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*f-n*l*f)+_*(+t*l*f-t*c*d+r*o*d-s*o*f+s*c*u-r*l*u)+m*(+t*c*h-t*a*f-r*o*h+n*o*f+r*a*u-n*c*u)+p*(-s*a*u-t*l*h+t*a*d+s*o*h-n*o*d+n*l*u)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],E=h*m*c-_*d*c+_*l*f-a*m*f-h*l*p+a*d*p,x=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,w=u*_*c-g*h*c+g*a*f-o*_*f-u*a*p+o*h*p,D=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,R=t*E+n*x+s*w+r*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/R;return e[0]=E*A,e[1]=(_*d*r-h*m*r-_*s*f+n*m*f+h*s*p-n*d*p)*A,e[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*p+n*l*p)*A,e[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*f-n*l*f)*A,e[4]=x*A,e[5]=(u*m*r-g*d*r+g*s*f-t*m*f-u*s*p+t*d*p)*A,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*p-t*l*p)*A,e[7]=(o*d*r-u*l*r+u*s*c-t*d*c-o*s*f+t*l*f)*A,e[8]=w*A,e[9]=(g*h*r-u*_*r-g*n*f+t*_*f+u*n*p-t*h*p)*A,e[10]=(o*_*r-g*a*r+g*n*c-t*_*c-o*n*p+t*a*p)*A,e[11]=(u*a*r-o*h*r-u*n*c+t*h*c+o*n*f-t*a*f)*A,e[12]=D*A,e[13]=(u*_*s-g*h*s+g*n*d-t*_*d-u*n*m+t*h*m)*A,e[14]=(g*a*s-o*_*s-g*n*l+t*_*l+o*n*m-t*a*m)*A,e[15]=(o*h*s-u*a*s+u*n*l-t*h*l-o*n*d+t*a*d)*A,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,u=o+o,h=a+a,d=r*c,f=r*u,g=r*h,_=o*u,m=o*h,p=a*h,E=l*c,x=l*u,w=l*h,D=n.x,R=n.y,A=n.z;return s[0]=(1-(_+p))*D,s[1]=(f+w)*D,s[2]=(g-x)*D,s[3]=0,s[4]=(f-w)*R,s[5]=(1-(d+p))*R,s[6]=(m+E)*R,s[7]=0,s[8]=(g+x)*A,s[9]=(m-E)*A,s[10]=(1-(d+_))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Bi.set(s[0],s[1],s[2]).length(),o=Bi.set(s[4],s[5],s[6]).length(),a=Bi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],gn.copy(this);let c=1/r,u=1/o,h=1/a;return gn.elements[0]*=c,gn.elements[1]*=c,gn.elements[2]*=c,gn.elements[4]*=u,gn.elements[5]*=u,gn.elements[6]*=u,gn.elements[8]*=h,gn.elements[9]*=h,gn.elements[10]*=h,t.setFromRotationMatrix(gn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=On){let l=this.elements,c=2*r/(t-e),u=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s),f,g;if(a===On)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===Xr)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=On){let l=this.elements,c=1/(t-e),u=1/(n-s),h=1/(o-r),d=(t+e)*c,f=(n+s)*u,g,_;if(a===On)g=(o+r)*h,_=-2*h;else if(a===Xr)g=r*h,_=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Bi=new L,gn=new Ze,lf=new L(0,0,0),cf=new L(1,1,1),Zn=new L,xr=new L,Qt=new L,Gc=new Ze,Wc=new ft,un=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Rt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Rt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(Rt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Rt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Rt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Rt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Gc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Gc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Wc.setFromEuler(this),this.setFromQuaternion(Wc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};un.DEFAULT_ORDER="XYZ";var Kr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},uf=0,Xc=new L,zi=new ft,In=new Ze,yr=new L,Es=new L,hf=new L,df=new ft,qc=new L(1,0,0),Yc=new L(0,1,0),jc=new L(0,0,1),ff={type:"added"},pf={type:"removed"},Pt=class i extends An{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:uf++}),this.uuid=Ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new L,t=new un,n=new ft,s=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ze},normalMatrix:{value:new tt}}),this.matrix=new Ze,this.matrixWorld=new Ze,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Kr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return zi.setFromAxisAngle(e,t),this.quaternion.multiply(zi),this}rotateOnWorldAxis(e,t){return zi.setFromAxisAngle(e,t),this.quaternion.premultiply(zi),this}rotateX(e){return this.rotateOnAxis(qc,e)}rotateY(e){return this.rotateOnAxis(Yc,e)}rotateZ(e){return this.rotateOnAxis(jc,e)}translateOnAxis(e,t){return Xc.copy(e).applyQuaternion(this.quaternion),this.position.add(Xc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(qc,e)}translateY(e){return this.translateOnAxis(Yc,e)}translateZ(e){return this.translateOnAxis(jc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(In.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?yr.copy(e):yr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Es.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?In.lookAt(Es,yr,this.up):In.lookAt(yr,Es,this.up),this.quaternion.setFromRotationMatrix(In),s&&(In.extractRotation(s.matrixWorld),zi.setFromRotationMatrix(In),this.quaternion.premultiply(zi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(ff)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(pf)),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),In.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),In.multiply(e.parent.matrixWorld)),e.applyMatrix4(In),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Es,e,hf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Es,df,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++){let r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++){let a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let h=l[c];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Pt.DEFAULT_UP=new L(0,1,0);Pt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _n=new L,Dn=new L,oo=new L,Un=new L,ki=new L,Hi=new L,Zc=new L,lo=new L,co=new L,uo=new L,vr=!1,Ji=class i{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),_n.subVectors(e,t),s.cross(_n);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){_n.subVectors(s,t),Dn.subVectors(n,t),oo.subVectors(e,t);let o=_n.dot(_n),a=_n.dot(Dn),l=_n.dot(oo),c=Dn.dot(Dn),u=Dn.dot(oo),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;let d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Un)===null?!1:Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getUV(e,t,n,s,r,o,a,l){return vr===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),vr=!0),this.getInterpolation(e,t,n,s,r,o,a,l)}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Un)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Un.x),l.addScaledVector(o,Un.y),l.addScaledVector(a,Un.z),l)}static isFrontFacing(e,t,n,s){return _n.subVectors(n,t),Dn.subVectors(e,t),_n.cross(Dn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _n.subVectors(this.c,this.b),Dn.subVectors(this.a,this.b),_n.cross(Dn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,s,r){return vr===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),vr=!0),i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;ki.subVectors(s,n),Hi.subVectors(r,n),lo.subVectors(e,n);let l=ki.dot(lo),c=Hi.dot(lo);if(l<=0&&c<=0)return t.copy(n);co.subVectors(e,s);let u=ki.dot(co),h=Hi.dot(co);if(u>=0&&h<=u)return t.copy(s);let d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(ki,o);uo.subVectors(e,r);let f=ki.dot(uo),g=Hi.dot(uo);if(g>=0&&f<=g)return t.copy(r);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Hi,a);let m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return Zc.subVectors(r,s),a=(h-u)/(h-u+(f-g)),t.copy(s).addScaledVector(Zc,a);let p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector(ki,o).addScaledVector(Hi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ju={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Jn={h:0,s:0,l:0},br={h:0,s:0,l:0};function ho(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var We=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=ot.workingColorSpace){if(e=xl(e,1),t=Rt(t,0,1),n=Rt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=ho(o,r,e+1/3),this.g=ho(o,r,e),this.b=ho(o,r,e-1/3)}return ot.toWorkingColorSpace(this,s),this}setStyle(e,t=yt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=yt){let n=ju[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ts(e.r),this.g=ts(e.g),this.b=ts(e.b),this}copyLinearToSRGB(e){return this.r=Qa(e.r),this.g=Qa(e.g),this.b=Qa(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yt){return ot.fromWorkingColorSpace(kt.copy(this),e),Math.round(Rt(kt.r*255,0,255))*65536+Math.round(Rt(kt.g*255,0,255))*256+Math.round(Rt(kt.b*255,0,255))}getHexString(e=yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.fromWorkingColorSpace(kt.copy(this),t);let n=kt.r,s=kt.g,r=kt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=ot.workingColorSpace){return ot.fromWorkingColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=yt){ot.fromWorkingColorSpace(kt.copy(this),e);let t=kt.r,n=kt.g,s=kt.b;return e!==yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Jn),this.setHSL(Jn.h+e,Jn.s+t,Jn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Jn),e.getHSL(br);let n=As(Jn.h,br.h,t),s=As(Jn.s,br.s,t),r=As(Jn.l,br.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},kt=new We;We.NAMES=ju;var mf=0,si=class extends An{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mf++}),this.uuid=Ai(),this.name="",this.type="Material",this.blending=es,this.side=ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=To,this.blendDst=Ao,this.blendEquation=gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new We(0,0,0),this.blendAlpha=0,this.depthFunc=zr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Nc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Di,this.stencilZFail=Di,this.stencilZPass=Di,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==es&&(n.blending=this.blending),this.side!==ni&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==To&&(n.blendSrc=this.blendSrc),this.blendDst!==Ao&&(n.blendDst=this.blendDst),this.blendEquation!==gi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==zr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Nc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Di&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Di&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Di&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},zn=class extends si{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new We(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Nu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var vt=new L,Mr=new oe,Yt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Oc,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=$n,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Mr.fromBufferAttribute(this,t),Mr.applyMatrix3(e),this.setXY(t,Mr.x,Mr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix3(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyMatrix4(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.applyNormalMatrix(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)vt.fromBufferAttribute(this,t),vt.transformDirection(e),this.setXYZ(t,vt.x,vt.y,vt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Zi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Gt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Zi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Zi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Zi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Zi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Gt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Gt(t,this.array),n=Gt(n,this.array),s=Gt(s,this.array),r=Gt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Oc&&(e.usage=this.usage),e}};var $r=class extends Yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Qr=class extends Yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var lt=class extends Yt{constructor(e,t,n){super(new Float32Array(e),t,n)}};var gf=0,rn=new Ze,fo=new Pt,Vi=new L,en=new cn,ws=new cn,At=new L,Ot=class i extends An{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gf++}),this.uuid=Ai(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Yu(e)?Qr:$r)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new tt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return rn.makeRotationFromQuaternion(e),this.applyMatrix4(rn),this}rotateX(e){return rn.makeRotationX(e),this.applyMatrix4(rn),this}rotateY(e){return rn.makeRotationY(e),this.applyMatrix4(rn),this}rotateZ(e){return rn.makeRotationZ(e),this.applyMatrix4(rn),this}translate(e,t,n){return rn.makeTranslation(e,t,n),this.applyMatrix4(rn),this}scale(e,t,n){return rn.makeScale(e,t,n),this.applyMatrix4(rn),this}lookAt(e){return fo.lookAt(e),fo.updateMatrix(),this.applyMatrix4(fo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Vi).negate(),this.translate(Vi.x,Vi.y,Vi.z),this}setFromPoints(e){let t=[];for(let n=0,s=e.length;n<s;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new lt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new cn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ii);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new L,1/0);return}if(e){let n=this.boundingSphere.center;if(en.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];ws.setFromBufferAttribute(a),this.morphTargetsRelative?(At.addVectors(en.min,ws.min),en.expandByPoint(At),At.addVectors(en.max,ws.max),en.expandByPoint(At)):(en.expandByPoint(ws.min),en.expandByPoint(ws.max))}en.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)At.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(At));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)At.fromBufferAttribute(a,c),l&&(Vi.fromBufferAttribute(e,c),At.add(Vi)),s=Math.max(s,n.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.array,s=t.position.array,r=t.normal.array,o=t.uv.array,a=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Yt(new Float32Array(4*a),4));let l=this.getAttribute("tangent").array,c=[],u=[];for(let T=0;T<a;T++)c[T]=new L,u[T]=new L;let h=new L,d=new L,f=new L,g=new oe,_=new oe,m=new oe,p=new L,E=new L;function x(T,B,q){h.fromArray(s,T*3),d.fromArray(s,B*3),f.fromArray(s,q*3),g.fromArray(o,T*2),_.fromArray(o,B*2),m.fromArray(o,q*2),d.sub(h),f.sub(h),_.sub(g),m.sub(g);let re=1/(_.x*m.y-m.x*_.y);isFinite(re)&&(p.copy(d).multiplyScalar(m.y).addScaledVector(f,-_.y).multiplyScalar(re),E.copy(f).multiplyScalar(_.x).addScaledVector(d,-m.x).multiplyScalar(re),c[T].add(p),c[B].add(p),c[q].add(p),u[T].add(E),u[B].add(E),u[q].add(E))}let w=this.groups;w.length===0&&(w=[{start:0,count:n.length}]);for(let T=0,B=w.length;T<B;++T){let q=w[T],re=q.start,U=q.count;for(let F=re,G=re+U;F<G;F+=3)x(n[F+0],n[F+1],n[F+2])}let D=new L,R=new L,A=new L,H=new L;function M(T){A.fromArray(r,T*3),H.copy(A);let B=c[T];D.copy(B),D.sub(A.multiplyScalar(A.dot(B))).normalize(),R.crossVectors(H,B);let re=R.dot(u[T])<0?-1:1;l[T*4]=D.x,l[T*4+1]=D.y,l[T*4+2]=D.z,l[T*4+3]=re}for(let T=0,B=w.length;T<B;++T){let q=w[T],re=q.start,U=q.count;for(let F=re,G=re+U;F<G;F+=3)M(n[F+0]),M(n[F+1]),M(n[F+2])}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Yt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new L,r=new L,o=new L,a=new L,l=new L,c=new L,u=new L,h=new L;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(a,l){let c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u),f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new Yt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){let d=c[u],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){let f=c[h];u.push(f.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,u=o.length;c<u;c++){let h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Jc=new Ze,fi=new as,Sr=new ii,Kc=new L,Gi=new L,Wi=new L,Xi=new L,po=new L,Er=new L,wr=new oe,Tr=new oe,Ar=new oe,$c=new L,Qc=new L,eu=new L,Rr=new L,Cr=new L,Nt=class extends Pt{constructor(e=new Ot,t=new zn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Er.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=a[l],h=r[l];u!==0&&(po.fromBufferAttribute(h,e),o?Er.addScaledVector(po,u):Er.addScaledVector(po.sub(t),u))}t.add(Er)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Sr.copy(n.boundingSphere),Sr.applyMatrix4(r),fi.copy(e.ray).recast(e.near),!(Sr.containsPoint(fi.origin)===!1&&(fi.intersectSphere(Sr,Kc)===null||fi.origin.distanceToSquared(Kc)>(e.far-e.near)**2))&&(Jc.copy(r).invert(),fi.copy(e.ray).applyMatrix4(Jc),!(n.boundingBox!==null&&fi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,fi)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),x=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let w=E,D=x;w<D;w+=3){let R=a.getX(w),A=a.getX(w+1),H=a.getX(w+2);s=Pr(this,p,e,n,c,u,h,R,A,H),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let E=a.getX(m),x=a.getX(m+1),w=a.getX(m+2);s=Pr(this,o,e,n,c,u,h,E,x,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],E=Math.max(m.start,f.start),x=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let w=E,D=x;w<D;w+=3){let R=w,A=w+1,H=w+2;s=Pr(this,p,e,n,c,u,h,R,A,H),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let E=m,x=m+1,w=m+2;s=Pr(this,o,e,n,c,u,h,E,x,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function _f(i,e,t,n,s,r,o,a){let l;if(e.side===qt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===ni,a),l===null)return null;Cr.copy(a),Cr.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Cr);return c<t.near||c>t.far?null:{distance:c,point:Cr.clone(),object:i}}function Pr(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Gi),i.getVertexPosition(l,Wi),i.getVertexPosition(c,Xi);let u=_f(i,e,t,n,Gi,Wi,Xi,Rr);if(u){s&&(wr.fromBufferAttribute(s,a),Tr.fromBufferAttribute(s,l),Ar.fromBufferAttribute(s,c),u.uv=Ji.getInterpolation(Rr,Gi,Wi,Xi,wr,Tr,Ar,new oe)),r&&(wr.fromBufferAttribute(r,a),Tr.fromBufferAttribute(r,l),Ar.fromBufferAttribute(r,c),u.uv1=Ji.getInterpolation(Rr,Gi,Wi,Xi,wr,Tr,Ar,new oe),u.uv2=u.uv1),o&&($c.fromBufferAttribute(o,a),Qc.fromBufferAttribute(o,l),eu.fromBufferAttribute(o,c),u.normal=Ji.getInterpolation(Rr,Gi,Wi,Xi,$c,Qc,eu,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a,b:l,c,normal:new L,materialIndex:0};Ji.getNormal(Gi,Wi,Xi,h.normal),u.face=h}return u}var bi=class i extends Ot{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],h=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new lt(c,3)),this.setAttribute("normal",new lt(u,3)),this.setAttribute("uv",new lt(h,2));function g(_,m,p,E,x,w,D,R,A,H,M){let T=w/A,B=D/H,q=w/2,re=D/2,U=R/2,F=A+1,G=H+1,J=0,Z=0,X=new L;for(let te=0;te<G;te++){let ie=te*B-re;for(let ge=0;ge<F;ge++){let W=ge*T-q;X[_]=W*E,X[m]=ie*x,X[p]=U,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[p]=R>0?1:-1,u.push(X.x,X.y,X.z),h.push(ge/A),h.push(1-te/H),J+=1}}for(let te=0;te<H;te++)for(let ie=0;ie<A;ie++){let ge=d+ie+F*te,W=d+ie+F*(te+1),ne=d+(ie+1)+F*(te+1),_e=d+(ie+1)+F*te;l.push(ge,W,_e),l.push(W,ne,_e),Z+=6}a.addGroup(f,Z,M),f+=Z,d+=J}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function os(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Wt(i){let e={};for(let t=0;t<i.length;t++){let n=os(i[t]);for(let s in n)e[s]=n[s]}return e}function xf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Zu(i){return i.getRenderTarget()===null?i.outputColorSpace:ot.workingColorSpace}var yf={clone:os,merge:Wt},vf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,kn=class extends si{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=vf,this.fragmentShader=bf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=os(e.uniforms),this.uniformsGroups=xf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},ea=class extends Pt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ze,this.projectionMatrix=new Ze,this.projectionMatrixInverse=new Ze,this.coordinateSystem=On}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Xt=class extends ea{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ns*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ts*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ns*2*Math.atan(Math.tan(Ts*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ts*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},qi=-90,Yi=1,Oo=class extends Pt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Xt(qi,Yi,e,t);s.layers=this.layers,this.add(s);let r=new Xt(qi,Yi,e,t);r.layers=this.layers,this.add(r);let o=new Xt(qi,Yi,e,t);o.layers=this.layers,this.add(o);let a=new Xt(qi,Yi,e,t);a.layers=this.layers,this.add(a);let l=new Xt(qi,Yi,e,t);l.layers=this.layers,this.add(l);let c=new Xt(qi,Yi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===On)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Xr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,u),e.setRenderTarget(h,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ta=class extends ln{constructor(e,t,n,s,r,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:is,super(e,t,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Fo=class extends Bn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];t.encoding!==void 0&&(Rs("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===vi?yt:on),this.texture=new ta(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:an}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new bi(5,5,5),r=new kn({name:"CubemapFromEquirect",uniforms:os(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:qt,blending:Qn});r.uniforms.tEquirect.value=t;let o=new Nt(s,r),a=t.minFilter;return t.minFilter===Ds&&(t.minFilter=an),new Oo(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},mo=new L,Mf=new L,Sf=new tt,xn=class{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=mo.subVectors(n,t).cross(Mf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(mo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Sf.getNormalMatrix(e),s=this.coplanarPoint(mo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},pi=new ii,Lr=new L,Os=class{constructor(e=new xn,t=new xn,n=new xn,s=new xn,r=new xn,o=new xn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=On){let n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],h=s[6],d=s[7],f=s[8],g=s[9],_=s[10],m=s[11],p=s[12],E=s[13],x=s[14],w=s[15];if(n[0].setComponents(l-r,d-c,m-f,w-p).normalize(),n[1].setComponents(l+r,d+c,m+f,w+p).normalize(),n[2].setComponents(l+o,d+u,m+g,w+E).normalize(),n[3].setComponents(l-o,d-u,m-g,w-E).normalize(),n[4].setComponents(l-a,d-h,m-_,w-x).normalize(),t===On)n[5].setComponents(l+a,d+h,m+_,w+x).normalize();else if(t===Xr)n[5].setComponents(a,h,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),pi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),pi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(pi)}intersectsSprite(e){return pi.center.set(0,0,0),pi.radius=.7071067811865476,pi.applyMatrix4(e.matrixWorld),this.intersectsSphere(pi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Lr.x=s.normal.x>0?e.max.x:e.min.x,Lr.y=s.normal.y>0?e.max.y:e.min.y,Lr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Lr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Ju(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Ef(i,e){let t=e.isWebGL2,n=new WeakMap;function s(c,u){let h=c.array,d=c.usage,f=h.byteLength,g=i.createBuffer();i.bindBuffer(u,g),i.bufferData(u,h,d),c.onUploadCallback();let _;if(h instanceof Float32Array)_=i.FLOAT;else if(h instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)_=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else _=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)_=i.SHORT;else if(h instanceof Uint32Array)_=i.UNSIGNED_INT;else if(h instanceof Int32Array)_=i.INT;else if(h instanceof Int8Array)_=i.BYTE;else if(h instanceof Uint8Array)_=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)_=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:g,type:_,bytesPerElement:h.BYTES_PER_ELEMENT,version:c.version,size:f}}function r(c,u,h){let d=u.array,f=u._updateRange,g=u.updateRanges;if(i.bindBuffer(h,c),f.count===-1&&g.length===0&&i.bufferSubData(h,0,d),g.length!==0){for(let _=0,m=g.length;_<m;_++){let p=g[_];t?i.bufferSubData(h,p.start*d.BYTES_PER_ELEMENT,d,p.start,p.count):i.bufferSubData(h,p.start*d.BYTES_PER_ELEMENT,d.subarray(p.start,p.start+p.count))}u.clearUpdateRanges()}f.count!==-1&&(t?i.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d,f.offset,f.count):i.bufferSubData(h,f.offset*d.BYTES_PER_ELEMENT,d.subarray(f.offset,f.offset+f.count)),f.count=-1),u.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),n.get(c)}function a(c){c.isInterleavedBufferAttribute&&(c=c.data);let u=n.get(c);u&&(i.deleteBuffer(u.buffer),n.delete(c))}function l(c,u){if(c.isGLBufferAttribute){let d=n.get(c);(!d||d.version<c.version)&&n.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);let h=n.get(c);if(h===void 0)n.set(c,s(c,u));else if(h.version<c.version){if(h.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(h.buffer,c,u),h.version=c.version}}return{get:o,remove:a,update:l}}var ls=class i extends Ot{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=e/a,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){let E=p*d-o;for(let x=0;x<c;x++){let w=x*h-r;g.push(w,-E,0),_.push(0,0,1),m.push(x/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let E=0;E<a;E++){let x=E+c*p,w=E+c*(p+1),D=E+1+c*(p+1),R=E+1+c*p;f.push(x,w,R),f.push(w,D,R)}this.setIndex(f),this.setAttribute("position",new lt(g,3)),this.setAttribute("normal",new lt(_,3)),this.setAttribute("uv",new lt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},wf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Tf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Af=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Rf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Cf=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Pf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Lf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,If=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Df=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Uf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Nf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Of=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ff=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Bf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,zf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,kf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Hf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Gf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Xf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,qf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Yf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,jf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Zf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Jf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Kf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,$f=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Qf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ep=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,tp="gl_FragColor = linearToOutputTexel( gl_FragColor );",np=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,ip=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,sp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,rp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ap=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,op=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,lp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,cp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,up=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,hp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,dp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,fp=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,pp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,_p=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,xp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,yp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,vp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Sp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ep=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,wp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Tp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ap=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Rp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Cp=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Lp=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Ip=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Dp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Up=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Np=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Op=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Fp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Bp=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,zp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,kp=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Hp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Vp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Wp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Yp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,jp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Zp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Jp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Kp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$p=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Qp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,e0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,t0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,n0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,i0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,s0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,r0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,a0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,o0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,l0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,c0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,u0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,h0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,d0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,f0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,p0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,m0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,g0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,_0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,x0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,y0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,v0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,b0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,M0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,S0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,E0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,w0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,T0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,A0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,R0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,C0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,P0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,L0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,I0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,D0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,U0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,N0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,O0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,F0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,B0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,z0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,G0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,W0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,X0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,q0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Y0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Z0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,K0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Q0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,em=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,nm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,im=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:wf,alphahash_pars_fragment:Tf,alphamap_fragment:Af,alphamap_pars_fragment:Rf,alphatest_fragment:Cf,alphatest_pars_fragment:Pf,aomap_fragment:Lf,aomap_pars_fragment:If,batching_pars_vertex:Df,batching_vertex:Uf,begin_vertex:Nf,beginnormal_vertex:Of,bsdfs:Ff,iridescence_fragment:Bf,bumpmap_pars_fragment:zf,clipping_planes_fragment:kf,clipping_planes_pars_fragment:Hf,clipping_planes_pars_vertex:Vf,clipping_planes_vertex:Gf,color_fragment:Wf,color_pars_fragment:Xf,color_pars_vertex:qf,color_vertex:Yf,common:jf,cube_uv_reflection_fragment:Zf,defaultnormal_vertex:Jf,displacementmap_pars_vertex:Kf,displacementmap_vertex:$f,emissivemap_fragment:Qf,emissivemap_pars_fragment:ep,colorspace_fragment:tp,colorspace_pars_fragment:np,envmap_fragment:ip,envmap_common_pars_fragment:sp,envmap_pars_fragment:rp,envmap_pars_vertex:ap,envmap_physical_pars_fragment:xp,envmap_vertex:op,fog_vertex:lp,fog_pars_vertex:cp,fog_fragment:up,fog_pars_fragment:hp,gradientmap_pars_fragment:dp,lightmap_fragment:fp,lightmap_pars_fragment:pp,lights_lambert_fragment:mp,lights_lambert_pars_fragment:gp,lights_pars_begin:_p,lights_toon_fragment:yp,lights_toon_pars_fragment:vp,lights_phong_fragment:bp,lights_phong_pars_fragment:Mp,lights_physical_fragment:Sp,lights_physical_pars_fragment:Ep,lights_fragment_begin:wp,lights_fragment_maps:Tp,lights_fragment_end:Ap,logdepthbuf_fragment:Rp,logdepthbuf_pars_fragment:Cp,logdepthbuf_pars_vertex:Pp,logdepthbuf_vertex:Lp,map_fragment:Ip,map_pars_fragment:Dp,map_particle_fragment:Up,map_particle_pars_fragment:Np,metalnessmap_fragment:Op,metalnessmap_pars_fragment:Fp,morphcolor_vertex:Bp,morphnormal_vertex:zp,morphtarget_pars_vertex:kp,morphtarget_vertex:Hp,normal_fragment_begin:Vp,normal_fragment_maps:Gp,normal_pars_fragment:Wp,normal_pars_vertex:Xp,normal_vertex:qp,normalmap_pars_fragment:Yp,clearcoat_normal_fragment_begin:jp,clearcoat_normal_fragment_maps:Zp,clearcoat_pars_fragment:Jp,iridescence_pars_fragment:Kp,opaque_fragment:$p,packing:Qp,premultiplied_alpha_fragment:e0,project_vertex:t0,dithering_fragment:n0,dithering_pars_fragment:i0,roughnessmap_fragment:s0,roughnessmap_pars_fragment:r0,shadowmap_pars_fragment:a0,shadowmap_pars_vertex:o0,shadowmap_vertex:l0,shadowmask_pars_fragment:c0,skinbase_vertex:u0,skinning_pars_vertex:h0,skinning_vertex:d0,skinnormal_vertex:f0,specularmap_fragment:p0,specularmap_pars_fragment:m0,tonemapping_fragment:g0,tonemapping_pars_fragment:_0,transmission_fragment:x0,transmission_pars_fragment:y0,uv_pars_fragment:v0,uv_pars_vertex:b0,uv_vertex:M0,worldpos_vertex:S0,background_vert:E0,background_frag:w0,backgroundCube_vert:T0,backgroundCube_frag:A0,cube_vert:R0,cube_frag:C0,depth_vert:P0,depth_frag:L0,distanceRGBA_vert:I0,distanceRGBA_frag:D0,equirect_vert:U0,equirect_frag:N0,linedashed_vert:O0,linedashed_frag:F0,meshbasic_vert:B0,meshbasic_frag:z0,meshlambert_vert:k0,meshlambert_frag:H0,meshmatcap_vert:V0,meshmatcap_frag:G0,meshnormal_vert:W0,meshnormal_frag:X0,meshphong_vert:q0,meshphong_frag:Y0,meshphysical_vert:j0,meshphysical_frag:Z0,meshtoon_vert:J0,meshtoon_frag:K0,points_vert:$0,points_frag:Q0,shadow_vert:em,shadow_frag:tm,sprite_vert:nm,sprite_frag:im},pe={common:{diffuse:{value:new We(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new tt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new tt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new tt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new tt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new tt},normalScale:{value:new oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new tt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new tt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new tt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new tt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new We(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new We(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0},uvTransform:{value:new tt}},sprite:{diffuse:{value:new We(16777215)},opacity:{value:1},center:{value:new oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}}},Tn={basic:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new We(0)}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:Wt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new We(0)},specular:{value:new We(1118481)},shininess:{value:30}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:Wt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new We(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:Wt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new We(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:Wt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:Wt([pe.points,pe.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:Wt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:Wt([pe.common,pe.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:Wt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:Wt([pe.sprite,pe.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new tt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distanceRGBA:{uniforms:Wt([pe.common,pe.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distanceRGBA_vert,fragmentShader:je.distanceRGBA_frag},shadow:{uniforms:Wt([pe.lights,pe.fog,{color:{value:new We(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Tn.physical={uniforms:Wt([Tn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new tt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new tt},clearcoatNormalScale:{value:new oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new tt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new tt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new tt},sheen:{value:0},sheenColor:{value:new We(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new tt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new tt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new tt},transmissionSamplerSize:{value:new oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new tt},attenuationDistance:{value:0},attenuationColor:{value:new We(0)},specularColor:{value:new We(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new tt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new tt},anisotropyVector:{value:new oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new tt}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};var Ir={r:0,b:0,g:0};function sm(i,e,t,n,s,r,o){let a=new We(0),l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(m,p){let E=!1,x=p.isScene===!0?p.background:null;x&&x.isTexture&&(x=(p.backgroundBlurriness>0?t:e).get(x)),x===null?_(a,l):x&&x.isColor&&(_(x,1),E=!0);let w=i.xr.getEnvironmentBlendMode();w==="additive"?n.buffers.color.setClear(0,0,0,1,o):w==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||E)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),x&&(x.isCubeTexture||x.mapping===ya)?(u===void 0&&(u=new Nt(new bi(1,1,1),new kn({name:"BackgroundCubeMaterial",uniforms:os(Tn.backgroundCube.uniforms),vertexShader:Tn.backgroundCube.vertexShader,fragmentShader:Tn.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(D,R,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),u.material.uniforms.envMap.value=x,u.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=p.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,u.material.toneMapped=ot.getTransfer(x.colorSpace)!==ht,(h!==x||d!==x.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=x,d=x.version,f=i.toneMapping),u.layers.enableAll(),m.unshift(u,u.geometry,u.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new Nt(new ls(2,2),new kn({name:"BackgroundMaterial",uniforms:os(Tn.background.uniforms),vertexShader:Tn.background.vertexShader,fragmentShader:Tn.background.fragmentShader,side:ni,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=p.backgroundIntensity,c.material.toneMapped=ot.getTransfer(x.colorSpace)!==ht,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,f=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function _(m,p){m.getRGB(Ir,Zu(i)),n.buffers.color.setClear(Ir.r,Ir.g,Ir.b,p,o)}return{getClearColor:function(){return a},setClearColor:function(m,p=1){a.set(m),l=p,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,_(a,l)},render:g}}function rm(i,e,t,n){let s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),o=n.isWebGL2||r!==null,a={},l=m(null),c=l,u=!1;function h(U,F,G,J,Z){let X=!1;if(o){let te=_(J,G,F);c!==te&&(c=te,f(c.object)),X=p(U,J,G,Z),X&&E(U,J,G,Z)}else{let te=F.wireframe===!0;(c.geometry!==J.id||c.program!==G.id||c.wireframe!==te)&&(c.geometry=J.id,c.program=G.id,c.wireframe=te,X=!0)}Z!==null&&t.update(Z,i.ELEMENT_ARRAY_BUFFER),(X||u)&&(u=!1,H(U,F,G,J),Z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Z).buffer))}function d(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function f(U){return n.isWebGL2?i.bindVertexArray(U):r.bindVertexArrayOES(U)}function g(U){return n.isWebGL2?i.deleteVertexArray(U):r.deleteVertexArrayOES(U)}function _(U,F,G){let J=G.wireframe===!0,Z=a[U.id];Z===void 0&&(Z={},a[U.id]=Z);let X=Z[F.id];X===void 0&&(X={},Z[F.id]=X);let te=X[J];return te===void 0&&(te=m(d()),X[J]=te),te}function m(U){let F=[],G=[],J=[];for(let Z=0;Z<s;Z++)F[Z]=0,G[Z]=0,J[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:G,attributeDivisors:J,object:U,attributes:{},index:null}}function p(U,F,G,J){let Z=c.attributes,X=F.attributes,te=0,ie=G.getAttributes();for(let ge in ie)if(ie[ge].location>=0){let ne=Z[ge],_e=X[ge];if(_e===void 0&&(ge==="instanceMatrix"&&U.instanceMatrix&&(_e=U.instanceMatrix),ge==="instanceColor"&&U.instanceColor&&(_e=U.instanceColor)),ne===void 0||ne.attribute!==_e||_e&&ne.data!==_e.data)return!0;te++}return c.attributesNum!==te||c.index!==J}function E(U,F,G,J){let Z={},X=F.attributes,te=0,ie=G.getAttributes();for(let ge in ie)if(ie[ge].location>=0){let ne=X[ge];ne===void 0&&(ge==="instanceMatrix"&&U.instanceMatrix&&(ne=U.instanceMatrix),ge==="instanceColor"&&U.instanceColor&&(ne=U.instanceColor));let _e={};_e.attribute=ne,ne&&ne.data&&(_e.data=ne.data),Z[ge]=_e,te++}c.attributes=Z,c.attributesNum=te,c.index=J}function x(){let U=c.newAttributes;for(let F=0,G=U.length;F<G;F++)U[F]=0}function w(U){D(U,0)}function D(U,F){let G=c.newAttributes,J=c.enabledAttributes,Z=c.attributeDivisors;G[U]=1,J[U]===0&&(i.enableVertexAttribArray(U),J[U]=1),Z[U]!==F&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](U,F),Z[U]=F)}function R(){let U=c.newAttributes,F=c.enabledAttributes;for(let G=0,J=F.length;G<J;G++)F[G]!==U[G]&&(i.disableVertexAttribArray(G),F[G]=0)}function A(U,F,G,J,Z,X,te){te===!0?i.vertexAttribIPointer(U,F,G,Z,X):i.vertexAttribPointer(U,F,G,J,Z,X)}function H(U,F,G,J){if(n.isWebGL2===!1&&(U.isInstancedMesh||J.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;x();let Z=J.attributes,X=G.getAttributes(),te=F.defaultAttributeValues;for(let ie in X){let ge=X[ie];if(ge.location>=0){let W=Z[ie];if(W===void 0&&(ie==="instanceMatrix"&&U.instanceMatrix&&(W=U.instanceMatrix),ie==="instanceColor"&&U.instanceColor&&(W=U.instanceColor)),W!==void 0){let ne=W.normalized,_e=W.itemSize,Ae=t.get(W);if(Ae===void 0)continue;let be=Ae.buffer,Oe=Ae.type,ze=Ae.bytesPerElement,Te=n.isWebGL2===!0&&(Oe===i.INT||Oe===i.UNSIGNED_INT||W.gpuType===Fu);if(W.isInterleavedBufferAttribute){let ke=W.data,P=ke.stride,ce=W.offset;if(ke.isInstancedInterleavedBuffer){for(let Y=0;Y<ge.locationSize;Y++)D(ge.location+Y,ke.meshPerAttribute);U.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=ke.meshPerAttribute*ke.count)}else for(let Y=0;Y<ge.locationSize;Y++)w(ge.location+Y);i.bindBuffer(i.ARRAY_BUFFER,be);for(let Y=0;Y<ge.locationSize;Y++)A(ge.location+Y,_e/ge.locationSize,Oe,ne,P*ze,(ce+_e/ge.locationSize*Y)*ze,Te)}else{if(W.isInstancedBufferAttribute){for(let ke=0;ke<ge.locationSize;ke++)D(ge.location+ke,W.meshPerAttribute);U.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let ke=0;ke<ge.locationSize;ke++)w(ge.location+ke);i.bindBuffer(i.ARRAY_BUFFER,be);for(let ke=0;ke<ge.locationSize;ke++)A(ge.location+ke,_e/ge.locationSize,Oe,ne,_e*ze,_e/ge.locationSize*ke*ze,Te)}}else if(te!==void 0){let ne=te[ie];if(ne!==void 0)switch(ne.length){case 2:i.vertexAttrib2fv(ge.location,ne);break;case 3:i.vertexAttrib3fv(ge.location,ne);break;case 4:i.vertexAttrib4fv(ge.location,ne);break;default:i.vertexAttrib1fv(ge.location,ne)}}}}R()}function M(){q();for(let U in a){let F=a[U];for(let G in F){let J=F[G];for(let Z in J)g(J[Z].object),delete J[Z];delete F[G]}delete a[U]}}function T(U){if(a[U.id]===void 0)return;let F=a[U.id];for(let G in F){let J=F[G];for(let Z in J)g(J[Z].object),delete J[Z];delete F[G]}delete a[U.id]}function B(U){for(let F in a){let G=a[F];if(G[U.id]===void 0)continue;let J=G[U.id];for(let Z in J)g(J[Z].object),delete J[Z];delete G[U.id]}}function q(){re(),u=!0,c!==l&&(c=l,f(c.object))}function re(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:q,resetDefaultState:re,dispose:M,releaseStatesOfGeometry:T,releaseStatesOfProgram:B,initAttributes:x,enableAttribute:w,disableUnusedAttributes:R}}function am(i,e,t,n){let s=n.isWebGL2,r;function o(u){r=u}function a(u,h){i.drawArrays(r,u,h),t.update(h,r,1)}function l(u,h,d){if(d===0)return;let f,g;if(s)f=i,g="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),g="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[g](r,u,h,d),t.update(h,r,d)}function c(u,h,d){if(d===0)return;let f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<d;g++)this.render(u[g],h[g]);else{f.multiDrawArraysWEBGL(r,u,0,h,0,d);let g=0;for(let _=0;_<d;_++)g+=h[_];t.update(g,r,1)}}this.setMode=o,this.render=a,this.renderInstances=l,this.renderMultiDraw=c}function om(i,e,t){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext",a=t.precision!==void 0?t.precision:"highp",l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);let c=o||e.has("WEBGL_draw_buffers"),u=t.logarithmicDepthBuffer===!0,h=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),p=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),x=d>0,w=o||e.has("OES_texture_float"),D=x&&w,R=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:s,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:u,maxTextures:h,maxVertexTextures:d,maxTextureSize:f,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:m,maxVaryings:p,maxFragmentUniforms:E,vertexTextures:x,floatFragmentTextures:w,floatVertexTextures:D,maxSamples:R}}function lm(i){let e=this,t=null,n=0,s=!1,r=!1,o=new xn,a=new tt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){let f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,f){let g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let E=r?0:n,x=E*4,w=p.clippingState||null;l.value=w,w=u(g,d,x,f);for(let D=0;D!==x;++D)w[D]=t[D];p.clippingState=w,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=E}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,f,g){let _=h!==null?h.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,E=d.matrixWorldInverse;a.getNormalMatrix(E),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,w=f;x!==_;++x,w+=4)o.copy(h[x]).applyMatrix4(E,a),o.normal.toArray(m,w),m[w+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function cm(i){let e=new WeakMap;function t(o,a){return a===Ro?o.mapping=is:a===Co&&(o.mapping=ss),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Ro||a===Co)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new Fo(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var na=class extends ea{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ki=4,tu=[.125,.215,.35,.446,.526,.582],_i=20,go=new na,nu=new We,_o=null,xo=0,yo=0,mi=(1+Math.sqrt(5))/2,ji=1/mi,iu=[new L(1,1,1),new L(-1,1,1),new L(1,1,-1),new L(-1,1,-1),new L(0,mi,ji),new L(0,mi,-ji),new L(ji,0,mi),new L(-ji,0,mi),new L(mi,ji,0),new L(-mi,ji,0)],ia=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){_o=this._renderer.getRenderTarget(),xo=this._renderer.getActiveCubeFace(),yo=this._renderer.getActiveMipmapLevel(),this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=au(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ru(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(_o,xo,yo),e.scissorTest=!1,Dr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===is||e.mapping===ss?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),_o=this._renderer.getRenderTarget(),xo=this._renderer.getActiveCubeFace(),yo=this._renderer.getActiveMipmapLevel();let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:an,minFilter:an,generateMipmaps:!1,type:Us,format:bn,colorSpace:Fn,depthBuffer:!1},s=su(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=su(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=um(r)),this._blurMaterial=hm(r,e,t)}return s}_compileMaterial(e){let t=new Nt(this._lodPlanes[0],e);this._renderer.compile(t,go)}_sceneToCubeUV(e,t,n,s){let a=new Xt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(nu),u.toneMapping=ei,u.autoClear=!1;let f=new zn({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1}),g=new Nt(new bi,f),_=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(nu),_=!0);for(let p=0;p<6;p++){let E=p%3;E===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):E===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));let x=this._cubeSize;Dr(s,E*x,p>2?x:0,x,x),u.setRenderTarget(s),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===is||e.mapping===ss;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=au()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ru());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Nt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;Dr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,go)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){let r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=iu[(s-1)%iu.length];this._blur(e,s-1,s,r,o)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,h=new Nt(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*_i-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):_i;m>_i&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${_i}`);let p=[],E=0;for(let A=0;A<_i;++A){let H=A/_,M=Math.exp(-H*H/2);p.push(M),A===0?E+=M:A<m&&(E+=2*M)}for(let A=0;A<p.length;A++)p[A]=p[A]/E;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:x}=this;d.dTheta.value=g,d.mipInt.value=x-n;let w=this._sizeLods[s],D=3*w*(s>x-Ki?s-x+Ki:0),R=4*(this._cubeSize-w);Dr(t,D,R,3*w,2*w),l.setRenderTarget(t),l.render(h,go)}};function um(i){let e=[],t=[],n=[],s=i,r=i-Ki+1+tu.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Ki?l=tu[o-i+Ki-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,E=new Float32Array(_*g*f),x=new Float32Array(m*g*f),w=new Float32Array(p*g*f);for(let R=0;R<f;R++){let A=R%3*2/3-1,H=R>2?0:-1,M=[A,H,0,A+2/3,H,0,A+2/3,H+1,0,A,H,0,A+2/3,H+1,0,A,H+1,0];E.set(M,_*g*R),x.set(d,m*g*R);let T=[R,R,R,R,R,R];w.set(T,p*g*R)}let D=new Ot;D.setAttribute("position",new Yt(E,_)),D.setAttribute("uv",new Yt(x,m)),D.setAttribute("faceIndex",new Yt(w,p)),e.push(D),s>Ki&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function su(i,e,t){let n=new Bn(i,e,t);return n.texture.mapping=ya,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Dr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function hm(i,e,t){let n=new Float32Array(_i),s=new L(0,1,0);return new kn({name:"SphericalGaussianBlur",defines:{n:_i,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:yl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function ru(){return new kn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:yl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function au(){return new kn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:yl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function yl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function dm(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Ro||l===Co,u=l===is||l===ss;if(c||u)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new ia(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{let h=a.image;if(c&&h&&h.height>0||u&&h&&s(h)){t===null&&(t=new ia(i));let d=c?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,d),a.addEventListener("dispose",r),d.texture}else return null}}}return a}function s(a){let l=0,c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function fm(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){let s=t(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function pm(i,e,t,n){let s={},r=new WeakMap;function o(h){let d=h.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);for(let g in d.morphAttributes){let _=d.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)e.remove(_[m])}d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function l(h){let d=h.attributes;for(let g in d)e.update(d[g],i.ARRAY_BUFFER);let f=h.morphAttributes;for(let g in f){let _=f[g];for(let m=0,p=_.length;m<p;m++)e.update(_[m],i.ARRAY_BUFFER)}}function c(h){let d=[],f=h.index,g=h.attributes.position,_=0;if(f!==null){let E=f.array;_=f.version;for(let x=0,w=E.length;x<w;x+=3){let D=E[x+0],R=E[x+1],A=E[x+2];d.push(D,R,R,A,A,D)}}else if(g!==void 0){let E=g.array;_=g.version;for(let x=0,w=E.length/3-1;x<w;x+=3){let D=x+0,R=x+1,A=x+2;d.push(D,R,R,A,A,D)}}else return;let m=new(Yu(d)?Qr:$r)(d,1);m.version=_;let p=r.get(h);p&&e.remove(p),r.set(h,m)}function u(h){let d=r.get(h);if(d){let f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function mm(i,e,t,n){let s=n.isWebGL2,r;function o(f){r=f}let a,l;function c(f){a=f.type,l=f.bytesPerElement}function u(f,g){i.drawElements(r,g,a,f*l),t.update(g,r,1)}function h(f,g,_){if(_===0)return;let m,p;if(s)m=i,p="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),p="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[p](r,g,a,f*l,_),t.update(g,r,_)}function d(f,g,_){if(_===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<_;p++)this.render(f[p]/l,g[p]);else{m.multiDrawElementsWEBGL(r,g,0,a,f,0,_);let p=0;for(let E=0;E<_;E++)p+=g[E];t.update(p,r,1)}}this.setMode=o,this.setIndex=c,this.render=u,this.renderInstances=h,this.renderMultiDraw=d}function gm(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function _m(i,e){return i[0]-e[0]}function xm(i,e){return Math.abs(e[1])-Math.abs(i[1])}function ym(i,e,t){let n={},s=new Float32Array(8),r=new WeakMap,o=new Ct,a=[];for(let c=0;c<8;c++)a[c]=[c,0];function l(c,u,h){let d=c.morphTargetInfluences;if(e.isWebGL2===!0){let f=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,g=f!==void 0?f.length:0,_=r.get(u);if(_===void 0||_.count!==g){let U=function(){q.dispose(),r.delete(u),u.removeEventListener("dispose",U)};_!==void 0&&_.texture.dispose();let E=u.morphAttributes.position!==void 0,x=u.morphAttributes.normal!==void 0,w=u.morphAttributes.color!==void 0,D=u.morphAttributes.position||[],R=u.morphAttributes.normal||[],A=u.morphAttributes.color||[],H=0;E===!0&&(H=1),x===!0&&(H=2),w===!0&&(H=3);let M=u.attributes.position.count*H,T=1;M>e.maxTextureSize&&(T=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let B=new Float32Array(M*T*4*g),q=new Jr(B,M,T,g);q.type=$n,q.needsUpdate=!0;let re=H*4;for(let F=0;F<g;F++){let G=D[F],J=R[F],Z=A[F],X=M*T*4*F;for(let te=0;te<G.count;te++){let ie=te*re;E===!0&&(o.fromBufferAttribute(G,te),B[X+ie+0]=o.x,B[X+ie+1]=o.y,B[X+ie+2]=o.z,B[X+ie+3]=0),x===!0&&(o.fromBufferAttribute(J,te),B[X+ie+4]=o.x,B[X+ie+5]=o.y,B[X+ie+6]=o.z,B[X+ie+7]=0),w===!0&&(o.fromBufferAttribute(Z,te),B[X+ie+8]=o.x,B[X+ie+9]=o.y,B[X+ie+10]=o.z,B[X+ie+11]=Z.itemSize===4?o.w:1)}}_={count:g,texture:q,size:new oe(M,T)},r.set(u,_),u.addEventListener("dispose",U)}let m=0;for(let E=0;E<d.length;E++)m+=d[E];let p=u.morphTargetsRelative?1:1-m;h.getUniforms().setValue(i,"morphTargetBaseInfluence",p),h.getUniforms().setValue(i,"morphTargetInfluences",d),h.getUniforms().setValue(i,"morphTargetsTexture",_.texture,t),h.getUniforms().setValue(i,"morphTargetsTextureSize",_.size)}else{let f=d===void 0?0:d.length,g=n[u.id];if(g===void 0||g.length!==f){g=[];for(let x=0;x<f;x++)g[x]=[x,0];n[u.id]=g}for(let x=0;x<f;x++){let w=g[x];w[0]=x,w[1]=d[x]}g.sort(xm);for(let x=0;x<8;x++)x<f&&g[x][1]?(a[x][0]=g[x][0],a[x][1]=g[x][1]):(a[x][0]=Number.MAX_SAFE_INTEGER,a[x][1]=0);a.sort(_m);let _=u.morphAttributes.position,m=u.morphAttributes.normal,p=0;for(let x=0;x<8;x++){let w=a[x],D=w[0],R=w[1];D!==Number.MAX_SAFE_INTEGER&&R?(_&&u.getAttribute("morphTarget"+x)!==_[D]&&u.setAttribute("morphTarget"+x,_[D]),m&&u.getAttribute("morphNormal"+x)!==m[D]&&u.setAttribute("morphNormal"+x,m[D]),s[x]=R,p+=R):(_&&u.hasAttribute("morphTarget"+x)===!0&&u.deleteAttribute("morphTarget"+x),m&&u.hasAttribute("morphNormal"+x)===!0&&u.deleteAttribute("morphNormal"+x),s[x]=0)}let E=u.morphTargetsRelative?1:1-p;h.getUniforms().setValue(i,"morphTargetBaseInfluence",E),h.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:l}}function vm(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,u=l.geometry,h=e.get(l,u);if(s.get(h)!==c&&(e.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var sa=class extends ln{constructor(e,t,n,s,r,o,a,l,c,u){if(u=u!==void 0?u:yi,u!==yi&&u!==rs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===yi&&(n=Kn),n===void 0&&u===rs&&(n=xi),super(null,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Ut,this.minFilter=l!==void 0?l:Ut,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Ku=new ln,$u=new sa(1,1);$u.compareFunction=qu;var Qu=new Jr,eh=new No,th=new ta,ou=[],lu=[],cu=new Float32Array(16),uu=new Float32Array(9),hu=new Float32Array(4);function ds(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=ou[s];if(r===void 0&&(r=new Float32Array(s),ou[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Mt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ba(i,e){let t=lu[e];t===void 0&&(t=new Int32Array(e),lu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function bm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Mm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function Sm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Mt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function Em(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function wm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;hu.set(n),i.uniformMatrix2fv(this.addr,!1,hu),St(t,n)}}function Tm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;uu.set(n),i.uniformMatrix3fv(this.addr,!1,uu),St(t,n)}}function Am(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Mt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(Mt(t,n))return;cu.set(n),i.uniformMatrix4fv(this.addr,!1,cu),St(t,n)}}function Rm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Cm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function Pm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function Lm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function Im(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Dm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Mt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function Um(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Mt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function Nm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Mt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function Om(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r=this.type===i.SAMPLER_2D_SHADOW?$u:Ku;t.setTexture2D(e||r,s)}function Fm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||eh,s)}function Bm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||th,s)}function zm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Qu,s)}function km(i){switch(i){case 5126:return bm;case 35664:return Mm;case 35665:return Sm;case 35666:return Em;case 35674:return wm;case 35675:return Tm;case 35676:return Am;case 5124:case 35670:return Rm;case 35667:case 35671:return Cm;case 35668:case 35672:return Pm;case 35669:case 35673:return Lm;case 5125:return Im;case 36294:return Dm;case 36295:return Um;case 36296:return Nm;case 35678:case 36198:case 36298:case 36306:case 35682:return Om;case 35679:case 36299:case 36307:return Fm;case 35680:case 36300:case 36308:case 36293:return Bm;case 36289:case 36303:case 36311:case 36292:return zm}}function Hm(i,e){i.uniform1fv(this.addr,e)}function Vm(i,e){let t=ds(e,this.size,2);i.uniform2fv(this.addr,t)}function Gm(i,e){let t=ds(e,this.size,3);i.uniform3fv(this.addr,t)}function Wm(i,e){let t=ds(e,this.size,4);i.uniform4fv(this.addr,t)}function Xm(i,e){let t=ds(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function qm(i,e){let t=ds(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Ym(i,e){let t=ds(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function jm(i,e){i.uniform1iv(this.addr,e)}function Zm(i,e){i.uniform2iv(this.addr,e)}function Jm(i,e){i.uniform3iv(this.addr,e)}function Km(i,e){i.uniform4iv(this.addr,e)}function $m(i,e){i.uniform1uiv(this.addr,e)}function Qm(i,e){i.uniform2uiv(this.addr,e)}function eg(i,e){i.uniform3uiv(this.addr,e)}function tg(i,e){i.uniform4uiv(this.addr,e)}function ng(i,e,t){let n=this.cache,s=e.length,r=ba(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Ku,r[o])}function ig(i,e,t){let n=this.cache,s=e.length,r=ba(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||eh,r[o])}function sg(i,e,t){let n=this.cache,s=e.length,r=ba(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||th,r[o])}function rg(i,e,t){let n=this.cache,s=e.length,r=ba(t,s);Mt(n,r)||(i.uniform1iv(this.addr,r),St(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Qu,r[o])}function ag(i){switch(i){case 5126:return Hm;case 35664:return Vm;case 35665:return Gm;case 35666:return Wm;case 35674:return Xm;case 35675:return qm;case 35676:return Ym;case 5124:case 35670:return jm;case 35667:case 35671:return Zm;case 35668:case 35672:return Jm;case 35669:case 35673:return Km;case 5125:return $m;case 36294:return Qm;case 36295:return eg;case 36296:return tg;case 35678:case 36198:case 36298:case 36306:case 35682:return ng;case 35679:case 36299:case 36307:return ig;case 35680:case 36300:case 36308:case 36293:return sg;case 36289:case 36303:case 36311:case 36292:return rg}}var Bo=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=km(t.type)}},zo=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ag(t.type)}},ko=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},vo=/(\w+)(\])?(\[|\.)?/g;function du(i,e){i.seq.push(e),i.map[e.id]=e}function og(i,e,t){let n=i.name,s=n.length;for(vo.lastIndex=0;;){let r=vo.exec(n),o=vo.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){du(t,c===void 0?new Bo(a,i,e):new zo(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new ko(a),du(t,h)),t=h}}}var ns=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);og(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function fu(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var lg=37297,cg=0;function ug(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}function hg(i){let e=ot.getPrimaries(ot.workingColorSpace),t=ot.getPrimaries(i),n;switch(e===t?n="":e===Wr&&t===Gr?n="LinearDisplayP3ToLinearSRGB":e===Gr&&t===Wr&&(n="LinearSRGBToLinearDisplayP3"),i){case Fn:case va:return[n,"LinearTransferOETF"];case yt:case _l:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function pu(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+ug(i.getShaderSource(e),o)}else return s}function dg(i,e){let t=hg(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function fg(i,e){let t;switch(e){case xd:t="Linear";break;case yd:t="Reinhard";break;case vd:t="OptimizedCineon";break;case ml:t="ACESFilmic";break;case Md:t="AgX";break;case bd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function pg(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter($i).join(`
`)}function mg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter($i).join(`
`)}function gg(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function _g(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function $i(i){return i!==""}function mu(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function gu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var xg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ho(i){return i.replace(xg,vg)}var yg=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function vg(i,e){let t=je[e];if(t===void 0){let n=yg.get(e);if(n!==void 0)t=je[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ho(t)}var bg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _u(i){return i.replace(bg,Mg)}function Mg(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function xu(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Sg(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Uu?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===pl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Nn&&(e="SHADOWMAP_TYPE_VSM"),e}function Eg(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case is:case ss:e="ENVMAP_TYPE_CUBE";break;case ya:e="ENVMAP_TYPE_CUBE_UV";break}return e}function wg(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===ss&&(e="ENVMAP_MODE_REFRACTION"),e}function Tg(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Nu:e="ENVMAP_BLENDING_MULTIPLY";break;case gd:e="ENVMAP_BLENDING_MIX";break;case _d:e="ENVMAP_BLENDING_ADD";break}return e}function Ag(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Rg(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=Sg(t),c=Eg(t),u=wg(t),h=Tg(t),d=Ag(t),f=t.isWebGL2?"":pg(t),g=mg(t),_=gg(r),m=s.createProgram(),p,E,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter($i).join(`
`),p.length>0&&(p+=`
`),E=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter($i).join(`
`),E.length>0&&(E+=`
`)):(p=[xu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($i).join(`
`),E=[f,xu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ei?"#define TONE_MAPPING":"",t.toneMapping!==ei?je.tonemapping_pars_fragment:"",t.toneMapping!==ei?fg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,dg("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($i).join(`
`)),o=Ho(o),o=mu(o,t),o=gu(o,t),a=Ho(a),a=mu(a,t),a=gu(a,t),o=_u(o),a=_u(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[g,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,E=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Fc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Fc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+E);let w=x+p+o,D=x+E+a,R=fu(s,s.VERTEX_SHADER,w),A=fu(s,s.FRAGMENT_SHADER,D);s.attachShader(m,R),s.attachShader(m,A),t.index0AttributeName!==void 0?s.bindAttribLocation(m,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(m,0,"position"),s.linkProgram(m);function H(q){if(i.debug.checkShaderErrors){let re=s.getProgramInfoLog(m).trim(),U=s.getShaderInfoLog(R).trim(),F=s.getShaderInfoLog(A).trim(),G=!0,J=!0;if(s.getProgramParameter(m,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,m,R,A);else{let Z=pu(s,R,"vertex"),X=pu(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(m,s.VALIDATE_STATUS)+`

Program Info Log: `+re+`
`+Z+`
`+X)}else re!==""?console.warn("THREE.WebGLProgram: Program Info Log:",re):(U===""||F==="")&&(J=!1);J&&(q.diagnostics={runnable:G,programLog:re,vertexShader:{log:U,prefix:p},fragmentShader:{log:F,prefix:E}})}s.deleteShader(R),s.deleteShader(A),M=new ns(s,m),T=_g(s,m)}let M;this.getUniforms=function(){return M===void 0&&H(this),M};let T;this.getAttributes=function(){return T===void 0&&H(this),T};let B=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return B===!1&&(B=s.getProgramParameter(m,lg)),B},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(m),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=cg++,this.cacheKey=e,this.usedTimes=1,this.program=m,this.vertexShader=R,this.fragmentShader=A,this}var Cg=0,Vo=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Go(e),t.set(e,n)),n}},Go=class{constructor(e){this.id=Cg++,this.code=e,this.usedTimes=0}};function Pg(i,e,t,n,s,r,o){let a=new Kr,l=new Vo,c=[],u=s.isWebGL2,h=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(M){return M===0?"uv":`uv${M}`}function m(M,T,B,q,re){let U=q.fog,F=re.geometry,G=M.isMeshStandardMaterial?q.environment:null,J=(M.isMeshStandardMaterial?t:e).get(M.envMap||G),Z=J&&J.mapping===ya?J.image.height:null,X=g[M.type];M.precision!==null&&(f=s.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));let te=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,ie=te!==void 0?te.length:0,ge=0;F.morphAttributes.position!==void 0&&(ge=1),F.morphAttributes.normal!==void 0&&(ge=2),F.morphAttributes.color!==void 0&&(ge=3);let W,ne,_e,Ae;if(X){let Ht=Tn[X];W=Ht.vertexShader,ne=Ht.fragmentShader}else W=M.vertexShader,ne=M.fragmentShader,l.update(M),_e=l.getVertexShaderID(M),Ae=l.getFragmentShaderID(M);let be=i.getRenderTarget(),Oe=re.isInstancedMesh===!0,ze=re.isBatchedMesh===!0,Te=!!M.map,ke=!!M.matcap,P=!!J,ce=!!M.aoMap,Y=!!M.lightMap,ae=!!M.bumpMap,j=!!M.normalMap,Re=!!M.displacementMap,xe=!!M.emissiveMap,b=!!M.metalnessMap,v=!!M.roughnessMap,O=M.anisotropy>0,se=M.clearcoat>0,$=M.iridescence>0,K=M.sheen>0,Se=M.transmission>0,me=O&&!!M.anisotropyMap,ye=se&&!!M.clearcoatMap,Ue=se&&!!M.clearcoatNormalMap,Ge=se&&!!M.clearcoatRoughnessMap,Q=$&&!!M.iridescenceMap,$e=$&&!!M.iridescenceThicknessMap,C=K&&!!M.sheenColorMap,ee=K&&!!M.sheenRoughnessMap,fe=!!M.specularMap,le=!!M.specularColorMap,Ce=!!M.specularIntensityMap,Qe=Se&&!!M.transmissionMap,nt=Se&&!!M.thicknessMap,Je=!!M.gradientMap,de=!!M.alphaMap,I=M.alphaTest>0,ue=!!M.alphaHash,he=!!M.extensions,Ne=!!F.attributes.uv1,Ie=!!F.attributes.uv2,it=!!F.attributes.uv3,rt=ei;return M.toneMapped&&(be===null||be.isXRRenderTarget===!0)&&(rt=i.toneMapping),{isWebGL2:u,shaderID:X,shaderType:M.type,shaderName:M.name,vertexShader:W,fragmentShader:ne,defines:M.defines,customVertexShaderID:_e,customFragmentShaderID:Ae,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:ze,instancing:Oe,instancingColor:Oe&&re.instanceColor!==null,supportsVertexTextures:d,outputColorSpace:be===null?i.outputColorSpace:be.isXRRenderTarget===!0?be.texture.colorSpace:Fn,map:Te,matcap:ke,envMap:P,envMapMode:P&&J.mapping,envMapCubeUVHeight:Z,aoMap:ce,lightMap:Y,bumpMap:ae,normalMap:j,displacementMap:d&&Re,emissiveMap:xe,normalMapObjectSpace:j&&M.normalMapType===Ud,normalMapTangentSpace:j&&M.normalMapType===Xu,metalnessMap:b,roughnessMap:v,anisotropy:O,anisotropyMap:me,clearcoat:se,clearcoatMap:ye,clearcoatNormalMap:Ue,clearcoatRoughnessMap:Ge,iridescence:$,iridescenceMap:Q,iridescenceThicknessMap:$e,sheen:K,sheenColorMap:C,sheenRoughnessMap:ee,specularMap:fe,specularColorMap:le,specularIntensityMap:Ce,transmission:Se,transmissionMap:Qe,thicknessMap:nt,gradientMap:Je,opaque:M.transparent===!1&&M.blending===es,alphaMap:de,alphaTest:I,alphaHash:ue,combine:M.combine,mapUv:Te&&_(M.map.channel),aoMapUv:ce&&_(M.aoMap.channel),lightMapUv:Y&&_(M.lightMap.channel),bumpMapUv:ae&&_(M.bumpMap.channel),normalMapUv:j&&_(M.normalMap.channel),displacementMapUv:Re&&_(M.displacementMap.channel),emissiveMapUv:xe&&_(M.emissiveMap.channel),metalnessMapUv:b&&_(M.metalnessMap.channel),roughnessMapUv:v&&_(M.roughnessMap.channel),anisotropyMapUv:me&&_(M.anisotropyMap.channel),clearcoatMapUv:ye&&_(M.clearcoatMap.channel),clearcoatNormalMapUv:Ue&&_(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ge&&_(M.clearcoatRoughnessMap.channel),iridescenceMapUv:Q&&_(M.iridescenceMap.channel),iridescenceThicknessMapUv:$e&&_(M.iridescenceThicknessMap.channel),sheenColorMapUv:C&&_(M.sheenColorMap.channel),sheenRoughnessMapUv:ee&&_(M.sheenRoughnessMap.channel),specularMapUv:fe&&_(M.specularMap.channel),specularColorMapUv:le&&_(M.specularColorMap.channel),specularIntensityMapUv:Ce&&_(M.specularIntensityMap.channel),transmissionMapUv:Qe&&_(M.transmissionMap.channel),thicknessMapUv:nt&&_(M.thicknessMap.channel),alphaMapUv:de&&_(M.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(j||O),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,vertexUv1s:Ne,vertexUv2s:Ie,vertexUv3s:it,pointsUvs:re.isPoints===!0&&!!F.attributes.uv&&(Te||de),fog:!!U,useFog:M.fog===!0,fogExp2:U&&U.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:re.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:ge,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&B.length>0,shadowMapType:i.shadowMap.type,toneMapping:rt,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Te&&M.map.isVideoTexture===!0&&ot.getTransfer(M.map.colorSpace)===ht,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===yn,flipSided:M.side===qt,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionDerivatives:he&&M.extensions.derivatives===!0,extensionFragDepth:he&&M.extensions.fragDepth===!0,extensionDrawBuffers:he&&M.extensions.drawBuffers===!0,extensionShaderTextureLOD:he&&M.extensions.shaderTextureLOD===!0,extensionClipCullDistance:he&&M.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:u||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:u||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:u||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()}}function p(M){let T=[];if(M.shaderID?T.push(M.shaderID):(T.push(M.customVertexShaderID),T.push(M.customFragmentShaderID)),M.defines!==void 0)for(let B in M.defines)T.push(B),T.push(M.defines[B]);return M.isRawShaderMaterial===!1&&(E(T,M),x(T,M),T.push(i.outputColorSpace)),T.push(M.customProgramCacheKey),T.join()}function E(M,T){M.push(T.precision),M.push(T.outputColorSpace),M.push(T.envMapMode),M.push(T.envMapCubeUVHeight),M.push(T.mapUv),M.push(T.alphaMapUv),M.push(T.lightMapUv),M.push(T.aoMapUv),M.push(T.bumpMapUv),M.push(T.normalMapUv),M.push(T.displacementMapUv),M.push(T.emissiveMapUv),M.push(T.metalnessMapUv),M.push(T.roughnessMapUv),M.push(T.anisotropyMapUv),M.push(T.clearcoatMapUv),M.push(T.clearcoatNormalMapUv),M.push(T.clearcoatRoughnessMapUv),M.push(T.iridescenceMapUv),M.push(T.iridescenceThicknessMapUv),M.push(T.sheenColorMapUv),M.push(T.sheenRoughnessMapUv),M.push(T.specularMapUv),M.push(T.specularColorMapUv),M.push(T.specularIntensityMapUv),M.push(T.transmissionMapUv),M.push(T.thicknessMapUv),M.push(T.combine),M.push(T.fogExp2),M.push(T.sizeAttenuation),M.push(T.morphTargetsCount),M.push(T.morphAttributeCount),M.push(T.numDirLights),M.push(T.numPointLights),M.push(T.numSpotLights),M.push(T.numSpotLightMaps),M.push(T.numHemiLights),M.push(T.numRectAreaLights),M.push(T.numDirLightShadows),M.push(T.numPointLightShadows),M.push(T.numSpotLightShadows),M.push(T.numSpotLightShadowsWithMaps),M.push(T.numLightProbes),M.push(T.shadowMapType),M.push(T.toneMapping),M.push(T.numClippingPlanes),M.push(T.numClipIntersection),M.push(T.depthPacking)}function x(M,T){a.disableAll(),T.isWebGL2&&a.enable(0),T.supportsVertexTextures&&a.enable(1),T.instancing&&a.enable(2),T.instancingColor&&a.enable(3),T.matcap&&a.enable(4),T.envMap&&a.enable(5),T.normalMapObjectSpace&&a.enable(6),T.normalMapTangentSpace&&a.enable(7),T.clearcoat&&a.enable(8),T.iridescence&&a.enable(9),T.alphaTest&&a.enable(10),T.vertexColors&&a.enable(11),T.vertexAlphas&&a.enable(12),T.vertexUv1s&&a.enable(13),T.vertexUv2s&&a.enable(14),T.vertexUv3s&&a.enable(15),T.vertexTangents&&a.enable(16),T.anisotropy&&a.enable(17),T.alphaHash&&a.enable(18),T.batching&&a.enable(19),M.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.skinning&&a.enable(4),T.morphTargets&&a.enable(5),T.morphNormals&&a.enable(6),T.morphColors&&a.enable(7),T.premultipliedAlpha&&a.enable(8),T.shadowMapEnabled&&a.enable(9),T.useLegacyLights&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),M.push(a.mask)}function w(M){let T=g[M.type],B;if(T){let q=Tn[T];B=yf.clone(q.uniforms)}else B=M.uniforms;return B}function D(M,T){let B;for(let q=0,re=c.length;q<re;q++){let U=c[q];if(U.cacheKey===T){B=U,++B.usedTimes;break}}return B===void 0&&(B=new Rg(i,T,M,r),c.push(B)),B}function R(M){if(--M.usedTimes===0){let T=c.indexOf(M);c[T]=c[c.length-1],c.pop(),M.destroy()}}function A(M){l.remove(M)}function H(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:w,acquireProgram:D,releaseProgram:R,releaseShaderCache:A,programs:c,dispose:H}}function Lg(){let i=new WeakMap;function e(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function t(r){i.delete(r)}function n(r,o,a){i.get(r)[o]=a}function s(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:s}}function Ig(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function yu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function vu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h,d,f,g,_,m){let p=i[e];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[e]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),e++,p}function a(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(h,d,f,g,_,m){let p=o(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(h,d){t.length>1&&t.sort(h||Ig),n.length>1&&n.sort(d||yu),s.length>1&&s.sort(d||yu)}function u(){for(let h=e,d=i.length;h<d;h++){let f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function Dg(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new vu,i.set(n,[o])):s>=r.length?(o=new vu,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Ug(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new We};break;case"SpotLight":t={position:new L,direction:new L,color:new We,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new We,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new We,groundColor:new We};break;case"RectAreaLight":t={color:new We,position:new L,halfWidth:new L,halfHeight:new L};break}return i[e.id]=t,t}}}function Ng(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Og=0;function Fg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Bg(i,e){let t=new Ug,n=Ng(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)s.probe.push(new L);let r=new L,o=new Ze,a=new Ze;function l(u,h){let d=0,f=0,g=0;for(let q=0;q<9;q++)s.probe[q].set(0,0,0);let _=0,m=0,p=0,E=0,x=0,w=0,D=0,R=0,A=0,H=0,M=0;u.sort(Fg);let T=h===!0?Math.PI:1;for(let q=0,re=u.length;q<re;q++){let U=u[q],F=U.color,G=U.intensity,J=U.distance,Z=U.shadow&&U.shadow.map?U.shadow.map.texture:null;if(U.isAmbientLight)d+=F.r*G*T,f+=F.g*G*T,g+=F.b*G*T;else if(U.isLightProbe){for(let X=0;X<9;X++)s.probe[X].addScaledVector(U.sh.coefficients[X],G);M++}else if(U.isDirectionalLight){let X=t.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity*T),U.castShadow){let te=U.shadow,ie=n.get(U);ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize=te.mapSize,s.directionalShadow[_]=ie,s.directionalShadowMap[_]=Z,s.directionalShadowMatrix[_]=U.shadow.matrix,w++}s.directional[_]=X,_++}else if(U.isSpotLight){let X=t.get(U);X.position.setFromMatrixPosition(U.matrixWorld),X.color.copy(F).multiplyScalar(G*T),X.distance=J,X.coneCos=Math.cos(U.angle),X.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),X.decay=U.decay,s.spot[p]=X;let te=U.shadow;if(U.map&&(s.spotLightMap[A]=U.map,A++,te.updateMatrices(U),U.castShadow&&H++),s.spotLightMatrix[p]=te.matrix,U.castShadow){let ie=n.get(U);ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize=te.mapSize,s.spotShadow[p]=ie,s.spotShadowMap[p]=Z,R++}p++}else if(U.isRectAreaLight){let X=t.get(U);X.color.copy(F).multiplyScalar(G),X.halfWidth.set(U.width*.5,0,0),X.halfHeight.set(0,U.height*.5,0),s.rectArea[E]=X,E++}else if(U.isPointLight){let X=t.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity*T),X.distance=U.distance,X.decay=U.decay,U.castShadow){let te=U.shadow,ie=n.get(U);ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize=te.mapSize,ie.shadowCameraNear=te.camera.near,ie.shadowCameraFar=te.camera.far,s.pointShadow[m]=ie,s.pointShadowMap[m]=Z,s.pointShadowMatrix[m]=U.shadow.matrix,D++}s.point[m]=X,m++}else if(U.isHemisphereLight){let X=t.get(U);X.skyColor.copy(U.color).multiplyScalar(G*T),X.groundColor.copy(U.groundColor).multiplyScalar(G*T),s.hemi[x]=X,x++}}E>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=pe.LTC_FLOAT_1,s.rectAreaLTC2=pe.LTC_FLOAT_2):(s.rectAreaLTC1=pe.LTC_HALF_1,s.rectAreaLTC2=pe.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=pe.LTC_FLOAT_1,s.rectAreaLTC2=pe.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=pe.LTC_HALF_1,s.rectAreaLTC2=pe.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=d,s.ambient[1]=f,s.ambient[2]=g;let B=s.hash;(B.directionalLength!==_||B.pointLength!==m||B.spotLength!==p||B.rectAreaLength!==E||B.hemiLength!==x||B.numDirectionalShadows!==w||B.numPointShadows!==D||B.numSpotShadows!==R||B.numSpotMaps!==A||B.numLightProbes!==M)&&(s.directional.length=_,s.spot.length=p,s.rectArea.length=E,s.point.length=m,s.hemi.length=x,s.directionalShadow.length=w,s.directionalShadowMap.length=w,s.pointShadow.length=D,s.pointShadowMap.length=D,s.spotShadow.length=R,s.spotShadowMap.length=R,s.directionalShadowMatrix.length=w,s.pointShadowMatrix.length=D,s.spotLightMatrix.length=R+A-H,s.spotLightMap.length=A,s.numSpotLightShadowsWithMaps=H,s.numLightProbes=M,B.directionalLength=_,B.pointLength=m,B.spotLength=p,B.rectAreaLength=E,B.hemiLength=x,B.numDirectionalShadows=w,B.numPointShadows=D,B.numSpotShadows=R,B.numSpotMaps=A,B.numLightProbes=M,s.version=Og++)}function c(u,h){let d=0,f=0,g=0,_=0,m=0,p=h.matrixWorldInverse;for(let E=0,x=u.length;E<x;E++){let w=u[E];if(w.isDirectionalLight){let D=s.directional[d];D.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),D.direction.sub(r),D.direction.transformDirection(p),d++}else if(w.isSpotLight){let D=s.spot[g];D.position.setFromMatrixPosition(w.matrixWorld),D.position.applyMatrix4(p),D.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),D.direction.sub(r),D.direction.transformDirection(p),g++}else if(w.isRectAreaLight){let D=s.rectArea[_];D.position.setFromMatrixPosition(w.matrixWorld),D.position.applyMatrix4(p),a.identity(),o.copy(w.matrixWorld),o.premultiply(p),a.extractRotation(o),D.halfWidth.set(w.width*.5,0,0),D.halfHeight.set(0,w.height*.5,0),D.halfWidth.applyMatrix4(a),D.halfHeight.applyMatrix4(a),_++}else if(w.isPointLight){let D=s.point[f];D.position.setFromMatrixPosition(w.matrixWorld),D.position.applyMatrix4(p),f++}else if(w.isHemisphereLight){let D=s.hemi[m];D.direction.setFromMatrixPosition(w.matrixWorld),D.direction.transformDirection(p),m++}}}return{setup:l,setupView:c,state:s}}function bu(i,e){let t=new Bg(i,e),n=[],s=[];function r(){n.length=0,s.length=0}function o(h){n.push(h)}function a(h){s.push(h)}function l(h){t.setup(n,h)}function c(h){t.setupView(n,h)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function zg(i,e){let t=new WeakMap;function n(r,o=0){let a=t.get(r),l;return a===void 0?(l=new bu(i,e),t.set(r,[l])):o>=a.length?(l=new bu(i,e),a.push(l)):l=a[o],l}function s(){t=new WeakMap}return{get:n,dispose:s}}var Wo=class extends si{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Id,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Xo=class extends si{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},kg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Hg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Vg(i,e,t){let n=new Os,s=new oe,r=new oe,o=new Ct,a=new Wo({depthPacking:Dd}),l=new Xo,c={},u=t.maxTextureSize,h={[ni]:qt,[qt]:ni,[yn]:yn},d=new kn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new oe},radius:{value:4}},vertexShader:kg,fragmentShader:Hg}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new Ot;g.setAttribute("position",new Yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Nt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Uu;let p=this.type;this.render=function(R,A,H){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;let M=i.getRenderTarget(),T=i.getActiveCubeFace(),B=i.getActiveMipmapLevel(),q=i.state;q.setBlending(Qn),q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);let re=p!==Nn&&this.type===Nn,U=p===Nn&&this.type!==Nn;for(let F=0,G=R.length;F<G;F++){let J=R[F],Z=J.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",J,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;s.copy(Z.mapSize);let X=Z.getFrameExtents();if(s.multiply(X),r.copy(Z.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/X.x),s.x=r.x*X.x,Z.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/X.y),s.y=r.y*X.y,Z.mapSize.y=r.y)),Z.map===null||re===!0||U===!0){let ie=this.type!==Nn?{minFilter:Ut,magFilter:Ut}:{};Z.map!==null&&Z.map.dispose(),Z.map=new Bn(s.x,s.y,ie),Z.map.texture.name=J.name+".shadowMap",Z.camera.updateProjectionMatrix()}i.setRenderTarget(Z.map),i.clear();let te=Z.getViewportCount();for(let ie=0;ie<te;ie++){let ge=Z.getViewport(ie);o.set(r.x*ge.x,r.y*ge.y,r.x*ge.z,r.y*ge.w),q.viewport(o),Z.updateMatrices(J,ie),n=Z.getFrustum(),w(A,H,Z.camera,J,this.type)}Z.isPointLightShadow!==!0&&this.type===Nn&&E(Z,H),Z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(M,T,B)};function E(R,A){let H=e.update(_);d.defines.VSM_SAMPLES!==R.blurSamples&&(d.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Bn(s.x,s.y)),d.uniforms.shadow_pass.value=R.map.texture,d.uniforms.resolution.value=R.mapSize,d.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(A,null,H,d,_,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(A,null,H,f,_,null)}function x(R,A,H,M){let T=null,B=H.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(B!==void 0)T=B;else if(T=H.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let q=T.uuid,re=A.uuid,U=c[q];U===void 0&&(U={},c[q]=U);let F=U[re];F===void 0&&(F=T.clone(),U[re]=F,A.addEventListener("dispose",D)),T=F}if(T.visible=A.visible,T.wireframe=A.wireframe,M===Nn?T.side=A.shadowSide!==null?A.shadowSide:A.side:T.side=A.shadowSide!==null?A.shadowSide:h[A.side],T.alphaMap=A.alphaMap,T.alphaTest=A.alphaTest,T.map=A.map,T.clipShadows=A.clipShadows,T.clippingPlanes=A.clippingPlanes,T.clipIntersection=A.clipIntersection,T.displacementMap=A.displacementMap,T.displacementScale=A.displacementScale,T.displacementBias=A.displacementBias,T.wireframeLinewidth=A.wireframeLinewidth,T.linewidth=A.linewidth,H.isPointLight===!0&&T.isMeshDistanceMaterial===!0){let q=i.properties.get(T);q.light=H}return T}function w(R,A,H,M,T){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&T===Nn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,R.matrixWorld);let re=e.update(R),U=R.material;if(Array.isArray(U)){let F=re.groups;for(let G=0,J=F.length;G<J;G++){let Z=F[G],X=U[Z.materialIndex];if(X&&X.visible){let te=x(R,X,M,T);R.onBeforeShadow(i,R,A,H,re,te,Z),i.renderBufferDirect(H,null,re,te,R,Z),R.onAfterShadow(i,R,A,H,re,te,Z)}}}else if(U.visible){let F=x(R,U,M,T);R.onBeforeShadow(i,R,A,H,re,F,null),i.renderBufferDirect(H,null,re,F,R,null),R.onAfterShadow(i,R,A,H,re,F,null)}}let q=R.children;for(let re=0,U=q.length;re<U;re++)w(q[re],A,H,M,T)}function D(R){R.target.removeEventListener("dispose",D);for(let H in c){let M=c[H],T=R.target.uuid;T in M&&(M[T].dispose(),delete M[T])}}}function Gg(i,e,t){let n=t.isWebGL2;function s(){let I=!1,ue=new Ct,he=null,Ne=new Ct(0,0,0,0);return{setMask:function(Ie){he!==Ie&&!I&&(i.colorMask(Ie,Ie,Ie,Ie),he=Ie)},setLocked:function(Ie){I=Ie},setClear:function(Ie,it,rt,wt,Ht){Ht===!0&&(Ie*=wt,it*=wt,rt*=wt),ue.set(Ie,it,rt,wt),Ne.equals(ue)===!1&&(i.clearColor(Ie,it,rt,wt),Ne.copy(ue))},reset:function(){I=!1,he=null,Ne.set(-1,0,0,0)}}}function r(){let I=!1,ue=null,he=null,Ne=null;return{setTest:function(Ie){Ie?ze(i.DEPTH_TEST):Te(i.DEPTH_TEST)},setMask:function(Ie){ue!==Ie&&!I&&(i.depthMask(Ie),ue=Ie)},setFunc:function(Ie){if(he!==Ie){switch(Ie){case cd:i.depthFunc(i.NEVER);break;case ud:i.depthFunc(i.ALWAYS);break;case hd:i.depthFunc(i.LESS);break;case zr:i.depthFunc(i.LEQUAL);break;case dd:i.depthFunc(i.EQUAL);break;case fd:i.depthFunc(i.GEQUAL);break;case pd:i.depthFunc(i.GREATER);break;case md:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}he=Ie}},setLocked:function(Ie){I=Ie},setClear:function(Ie){Ne!==Ie&&(i.clearDepth(Ie),Ne=Ie)},reset:function(){I=!1,ue=null,he=null,Ne=null}}}function o(){let I=!1,ue=null,he=null,Ne=null,Ie=null,it=null,rt=null,wt=null,Ht=null;return{setTest:function(ut){I||(ut?ze(i.STENCIL_TEST):Te(i.STENCIL_TEST))},setMask:function(ut){ue!==ut&&!I&&(i.stencilMask(ut),ue=ut)},setFunc:function(ut,Vt,wn){(he!==ut||Ne!==Vt||Ie!==wn)&&(i.stencilFunc(ut,Vt,wn),he=ut,Ne=Vt,Ie=wn)},setOp:function(ut,Vt,wn){(it!==ut||rt!==Vt||wt!==wn)&&(i.stencilOp(ut,Vt,wn),it=ut,rt=Vt,wt=wn)},setLocked:function(ut){I=ut},setClear:function(ut){Ht!==ut&&(i.clearStencil(ut),Ht=ut)},reset:function(){I=!1,ue=null,he=null,Ne=null,Ie=null,it=null,rt=null,wt=null,Ht=null}}}let a=new s,l=new r,c=new o,u=new WeakMap,h=new WeakMap,d={},f={},g=new WeakMap,_=[],m=null,p=!1,E=null,x=null,w=null,D=null,R=null,A=null,H=null,M=new We(0,0,0),T=0,B=!1,q=null,re=null,U=null,F=null,G=null,J=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Z=!1,X=0,te=i.getParameter(i.VERSION);te.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(te)[1]),Z=X>=1):te.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),Z=X>=2);let ie=null,ge={},W=i.getParameter(i.SCISSOR_BOX),ne=i.getParameter(i.VIEWPORT),_e=new Ct().fromArray(W),Ae=new Ct().fromArray(ne);function be(I,ue,he,Ne){let Ie=new Uint8Array(4),it=i.createTexture();i.bindTexture(I,it),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let rt=0;rt<he;rt++)n&&(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)?i.texImage3D(ue,0,i.RGBA,1,1,Ne,0,i.RGBA,i.UNSIGNED_BYTE,Ie):i.texImage2D(ue+rt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Ie);return it}let Oe={};Oe[i.TEXTURE_2D]=be(i.TEXTURE_2D,i.TEXTURE_2D,1),Oe[i.TEXTURE_CUBE_MAP]=be(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Oe[i.TEXTURE_2D_ARRAY]=be(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Oe[i.TEXTURE_3D]=be(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),c.setClear(0),ze(i.DEPTH_TEST),l.setFunc(zr),xe(!1),b(ec),ze(i.CULL_FACE),j(Qn);function ze(I){d[I]!==!0&&(i.enable(I),d[I]=!0)}function Te(I){d[I]!==!1&&(i.disable(I),d[I]=!1)}function ke(I,ue){return f[I]!==ue?(i.bindFramebuffer(I,ue),f[I]=ue,n&&(I===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=ue),I===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=ue)),!0):!1}function P(I,ue){let he=_,Ne=!1;if(I)if(he=g.get(ue),he===void 0&&(he=[],g.set(ue,he)),I.isWebGLMultipleRenderTargets){let Ie=I.texture;if(he.length!==Ie.length||he[0]!==i.COLOR_ATTACHMENT0){for(let it=0,rt=Ie.length;it<rt;it++)he[it]=i.COLOR_ATTACHMENT0+it;he.length=Ie.length,Ne=!0}}else he[0]!==i.COLOR_ATTACHMENT0&&(he[0]=i.COLOR_ATTACHMENT0,Ne=!0);else he[0]!==i.BACK&&(he[0]=i.BACK,Ne=!0);Ne&&(t.isWebGL2?i.drawBuffers(he):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(he))}function ce(I){return m!==I?(i.useProgram(I),m=I,!0):!1}let Y={[gi]:i.FUNC_ADD,[jh]:i.FUNC_SUBTRACT,[Zh]:i.FUNC_REVERSE_SUBTRACT};if(n)Y[sc]=i.MIN,Y[rc]=i.MAX;else{let I=e.get("EXT_blend_minmax");I!==null&&(Y[sc]=I.MIN_EXT,Y[rc]=I.MAX_EXT)}let ae={[Jh]:i.ZERO,[Kh]:i.ONE,[$h]:i.SRC_COLOR,[To]:i.SRC_ALPHA,[sd]:i.SRC_ALPHA_SATURATE,[nd]:i.DST_COLOR,[ed]:i.DST_ALPHA,[Qh]:i.ONE_MINUS_SRC_COLOR,[Ao]:i.ONE_MINUS_SRC_ALPHA,[id]:i.ONE_MINUS_DST_COLOR,[td]:i.ONE_MINUS_DST_ALPHA,[rd]:i.CONSTANT_COLOR,[ad]:i.ONE_MINUS_CONSTANT_COLOR,[od]:i.CONSTANT_ALPHA,[ld]:i.ONE_MINUS_CONSTANT_ALPHA};function j(I,ue,he,Ne,Ie,it,rt,wt,Ht,ut){if(I===Qn){p===!0&&(Te(i.BLEND),p=!1);return}if(p===!1&&(ze(i.BLEND),p=!0),I!==Yh){if(I!==E||ut!==B){if((x!==gi||R!==gi)&&(i.blendEquation(i.FUNC_ADD),x=gi,R=gi),ut)switch(I){case es:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case tc:i.blendFunc(i.ONE,i.ONE);break;case nc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ic:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case es:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case tc:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case nc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ic:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}w=null,D=null,A=null,H=null,M.set(0,0,0),T=0,E=I,B=ut}return}Ie=Ie||ue,it=it||he,rt=rt||Ne,(ue!==x||Ie!==R)&&(i.blendEquationSeparate(Y[ue],Y[Ie]),x=ue,R=Ie),(he!==w||Ne!==D||it!==A||rt!==H)&&(i.blendFuncSeparate(ae[he],ae[Ne],ae[it],ae[rt]),w=he,D=Ne,A=it,H=rt),(wt.equals(M)===!1||Ht!==T)&&(i.blendColor(wt.r,wt.g,wt.b,Ht),M.copy(wt),T=Ht),E=I,B=!1}function Re(I,ue){I.side===yn?Te(i.CULL_FACE):ze(i.CULL_FACE);let he=I.side===qt;ue&&(he=!he),xe(he),I.blending===es&&I.transparent===!1?j(Qn):j(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),l.setFunc(I.depthFunc),l.setTest(I.depthTest),l.setMask(I.depthWrite),a.setMask(I.colorWrite);let Ne=I.stencilWrite;c.setTest(Ne),Ne&&(c.setMask(I.stencilWriteMask),c.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),c.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),O(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ze(i.SAMPLE_ALPHA_TO_COVERAGE):Te(i.SAMPLE_ALPHA_TO_COVERAGE)}function xe(I){q!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),q=I)}function b(I){I!==Xh?(ze(i.CULL_FACE),I!==re&&(I===ec?i.cullFace(i.BACK):I===qh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Te(i.CULL_FACE),re=I}function v(I){I!==U&&(Z&&i.lineWidth(I),U=I)}function O(I,ue,he){I?(ze(i.POLYGON_OFFSET_FILL),(F!==ue||G!==he)&&(i.polygonOffset(ue,he),F=ue,G=he)):Te(i.POLYGON_OFFSET_FILL)}function se(I){I?ze(i.SCISSOR_TEST):Te(i.SCISSOR_TEST)}function $(I){I===void 0&&(I=i.TEXTURE0+J-1),ie!==I&&(i.activeTexture(I),ie=I)}function K(I,ue,he){he===void 0&&(ie===null?he=i.TEXTURE0+J-1:he=ie);let Ne=ge[he];Ne===void 0&&(Ne={type:void 0,texture:void 0},ge[he]=Ne),(Ne.type!==I||Ne.texture!==ue)&&(ie!==he&&(i.activeTexture(he),ie=he),i.bindTexture(I,ue||Oe[I]),Ne.type=I,Ne.texture=ue)}function Se(){let I=ge[ie];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function me(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ye(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ue(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ge(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Q(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function $e(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function C(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ee(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function fe(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function le(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ce(I){_e.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),_e.copy(I))}function Qe(I){Ae.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Ae.copy(I))}function nt(I,ue){let he=h.get(ue);he===void 0&&(he=new WeakMap,h.set(ue,he));let Ne=he.get(I);Ne===void 0&&(Ne=i.getUniformBlockIndex(ue,I.name),he.set(I,Ne))}function Je(I,ue){let Ne=h.get(ue).get(I);u.get(ue)!==Ne&&(i.uniformBlockBinding(ue,Ne,I.__bindingPointIndex),u.set(ue,Ne))}function de(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},ie=null,ge={},f={},g=new WeakMap,_=[],m=null,p=!1,E=null,x=null,w=null,D=null,R=null,A=null,H=null,M=new We(0,0,0),T=0,B=!1,q=null,re=null,U=null,F=null,G=null,_e.set(0,0,i.canvas.width,i.canvas.height),Ae.set(0,0,i.canvas.width,i.canvas.height),a.reset(),l.reset(),c.reset()}return{buffers:{color:a,depth:l,stencil:c},enable:ze,disable:Te,bindFramebuffer:ke,drawBuffers:P,useProgram:ce,setBlending:j,setMaterial:Re,setFlipSided:xe,setCullFace:b,setLineWidth:v,setPolygonOffset:O,setScissorTest:se,activeTexture:$,bindTexture:K,unbindTexture:Se,compressedTexImage2D:me,compressedTexImage3D:ye,texImage2D:fe,texImage3D:le,updateUBOMapping:nt,uniformBlockBinding:Je,texStorage2D:C,texStorage3D:ee,texSubImage2D:Ue,texSubImage3D:Ge,compressedTexSubImage2D:Q,compressedTexSubImage3D:$e,scissor:Ce,viewport:Qe,reset:de}}function Wg(i,e,t,n,s,r,o){let a=s.isWebGL2,l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new WeakMap,h,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,v){return f?new OffscreenCanvas(b,v):Yr("canvas")}function _(b,v,O,se){let $=1;if((b.width>se||b.height>se)&&($=se/Math.max(b.width,b.height)),$<1||v===!0)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap){let K=v?qr:Math.floor,Se=K($*b.width),me=K($*b.height);h===void 0&&(h=g(Se,me));let ye=O?g(Se,me):h;return ye.width=Se,ye.height=me,ye.getContext("2d").drawImage(b,0,0,Se,me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+b.width+"x"+b.height+") to ("+Se+"x"+me+")."),ye}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+b.width+"x"+b.height+")."),b;return b}function m(b){return Do(b.width)&&Do(b.height)}function p(b){return a?!1:b.wrapS!==vn||b.wrapT!==vn||b.minFilter!==Ut&&b.minFilter!==an}function E(b,v){return b.generateMipmaps&&v&&b.minFilter!==Ut&&b.minFilter!==an}function x(b){i.generateMipmap(b)}function w(b,v,O,se,$=!1){if(a===!1)return v;if(b!==null){if(i[b]!==void 0)return i[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let K=v;if(v===i.RED&&(O===i.FLOAT&&(K=i.R32F),O===i.HALF_FLOAT&&(K=i.R16F),O===i.UNSIGNED_BYTE&&(K=i.R8)),v===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(K=i.R8UI),O===i.UNSIGNED_SHORT&&(K=i.R16UI),O===i.UNSIGNED_INT&&(K=i.R32UI),O===i.BYTE&&(K=i.R8I),O===i.SHORT&&(K=i.R16I),O===i.INT&&(K=i.R32I)),v===i.RG&&(O===i.FLOAT&&(K=i.RG32F),O===i.HALF_FLOAT&&(K=i.RG16F),O===i.UNSIGNED_BYTE&&(K=i.RG8)),v===i.RGBA){let Se=$?Vr:ot.getTransfer(se);O===i.FLOAT&&(K=i.RGBA32F),O===i.HALF_FLOAT&&(K=i.RGBA16F),O===i.UNSIGNED_BYTE&&(K=Se===ht?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function D(b,v,O){return E(b,O)===!0||b.isFramebufferTexture&&b.minFilter!==Ut&&b.minFilter!==an?Math.log2(Math.max(v.width,v.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?v.mipmaps.length:1}function R(b){return b===Ut||b===ac||b===Xa?i.NEAREST:i.LINEAR}function A(b){let v=b.target;v.removeEventListener("dispose",A),M(v),v.isVideoTexture&&u.delete(v)}function H(b){let v=b.target;v.removeEventListener("dispose",H),B(v)}function M(b){let v=n.get(b);if(v.__webglInit===void 0)return;let O=b.source,se=d.get(O);if(se){let $=se[v.__cacheKey];$.usedTimes--,$.usedTimes===0&&T(b),Object.keys(se).length===0&&d.delete(O)}n.remove(b)}function T(b){let v=n.get(b);i.deleteTexture(v.__webglTexture);let O=b.source,se=d.get(O);delete se[v.__cacheKey],o.memory.textures--}function B(b){let v=b.texture,O=n.get(b),se=n.get(v);if(se.__webglTexture!==void 0&&(i.deleteTexture(se.__webglTexture),o.memory.textures--),b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(O.__webglFramebuffer[$]))for(let K=0;K<O.__webglFramebuffer[$].length;K++)i.deleteFramebuffer(O.__webglFramebuffer[$][K]);else i.deleteFramebuffer(O.__webglFramebuffer[$]);O.__webglDepthbuffer&&i.deleteRenderbuffer(O.__webglDepthbuffer[$])}else{if(Array.isArray(O.__webglFramebuffer))for(let $=0;$<O.__webglFramebuffer.length;$++)i.deleteFramebuffer(O.__webglFramebuffer[$]);else i.deleteFramebuffer(O.__webglFramebuffer);if(O.__webglDepthbuffer&&i.deleteRenderbuffer(O.__webglDepthbuffer),O.__webglMultisampledFramebuffer&&i.deleteFramebuffer(O.__webglMultisampledFramebuffer),O.__webglColorRenderbuffer)for(let $=0;$<O.__webglColorRenderbuffer.length;$++)O.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(O.__webglColorRenderbuffer[$]);O.__webglDepthRenderbuffer&&i.deleteRenderbuffer(O.__webglDepthRenderbuffer)}if(b.isWebGLMultipleRenderTargets)for(let $=0,K=v.length;$<K;$++){let Se=n.get(v[$]);Se.__webglTexture&&(i.deleteTexture(Se.__webglTexture),o.memory.textures--),n.remove(v[$])}n.remove(v),n.remove(b)}let q=0;function re(){q=0}function U(){let b=q;return b>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),q+=1,b}function F(b){let v=[];return v.push(b.wrapS),v.push(b.wrapT),v.push(b.wrapR||0),v.push(b.magFilter),v.push(b.minFilter),v.push(b.anisotropy),v.push(b.internalFormat),v.push(b.format),v.push(b.type),v.push(b.generateMipmaps),v.push(b.premultiplyAlpha),v.push(b.flipY),v.push(b.unpackAlignment),v.push(b.colorSpace),v.join()}function G(b,v){let O=n.get(b);if(b.isVideoTexture&&Re(b),b.isRenderTargetTexture===!1&&b.version>0&&O.__version!==b.version){let se=b.image;if(se===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(se.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{_e(O,b,v);return}}t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+v)}function J(b,v){let O=n.get(b);if(b.version>0&&O.__version!==b.version){_e(O,b,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+v)}function Z(b,v){let O=n.get(b);if(b.version>0&&O.__version!==b.version){_e(O,b,v);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+v)}function X(b,v){let O=n.get(b);if(b.version>0&&O.__version!==b.version){Ae(O,b,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+v)}let te={[Po]:i.REPEAT,[vn]:i.CLAMP_TO_EDGE,[Lo]:i.MIRRORED_REPEAT},ie={[Ut]:i.NEAREST,[ac]:i.NEAREST_MIPMAP_NEAREST,[Xa]:i.NEAREST_MIPMAP_LINEAR,[an]:i.LINEAR,[Sd]:i.LINEAR_MIPMAP_NEAREST,[Ds]:i.LINEAR_MIPMAP_LINEAR},ge={[Nd]:i.NEVER,[Hd]:i.ALWAYS,[Od]:i.LESS,[qu]:i.LEQUAL,[Fd]:i.EQUAL,[kd]:i.GEQUAL,[Bd]:i.GREATER,[zd]:i.NOTEQUAL};function W(b,v,O){if(O?(i.texParameteri(b,i.TEXTURE_WRAP_S,te[v.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,te[v.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,te[v.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,ie[v.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,ie[v.minFilter])):(i.texParameteri(b,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(b,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(v.wrapS!==vn||v.wrapT!==vn)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(b,i.TEXTURE_MAG_FILTER,R(v.magFilter)),i.texParameteri(b,i.TEXTURE_MIN_FILTER,R(v.minFilter)),v.minFilter!==Ut&&v.minFilter!==an&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),v.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,ge[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){let se=e.get("EXT_texture_filter_anisotropic");if(v.magFilter===Ut||v.minFilter!==Xa&&v.minFilter!==Ds||v.type===$n&&e.has("OES_texture_float_linear")===!1||a===!1&&v.type===Us&&e.has("OES_texture_half_float_linear")===!1)return;(v.anisotropy>1||n.get(v).__currentAnisotropy)&&(i.texParameterf(b,se.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy)}}function ne(b,v){let O=!1;b.__webglInit===void 0&&(b.__webglInit=!0,v.addEventListener("dispose",A));let se=v.source,$=d.get(se);$===void 0&&($={},d.set(se,$));let K=F(v);if(K!==b.__cacheKey){$[K]===void 0&&($[K]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,O=!0),$[K].usedTimes++;let Se=$[b.__cacheKey];Se!==void 0&&($[b.__cacheKey].usedTimes--,Se.usedTimes===0&&T(v)),b.__cacheKey=K,b.__webglTexture=$[K].texture}return O}function _e(b,v,O){let se=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(se=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(se=i.TEXTURE_3D);let $=ne(b,v),K=v.source;t.bindTexture(se,b.__webglTexture,i.TEXTURE0+O);let Se=n.get(K);if(K.version!==Se.__version||$===!0){t.activeTexture(i.TEXTURE0+O);let me=ot.getPrimaries(ot.workingColorSpace),ye=v.colorSpace===on?null:ot.getPrimaries(v.colorSpace),Ue=v.colorSpace===on||me===ye?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ue);let Ge=p(v)&&m(v.image)===!1,Q=_(v.image,Ge,!1,s.maxTextureSize);Q=xe(v,Q);let $e=m(Q)||a,C=r.convert(v.format,v.colorSpace),ee=r.convert(v.type),fe=w(v.internalFormat,C,ee,v.colorSpace,v.isVideoTexture);W(se,v,$e);let le,Ce=v.mipmaps,Qe=a&&v.isVideoTexture!==!0&&fe!==Gu,nt=Se.__version===void 0||$===!0,Je=D(v,Q,$e);if(v.isDepthTexture)fe=i.DEPTH_COMPONENT,a?v.type===$n?fe=i.DEPTH_COMPONENT32F:v.type===Kn?fe=i.DEPTH_COMPONENT24:v.type===xi?fe=i.DEPTH24_STENCIL8:fe=i.DEPTH_COMPONENT16:v.type===$n&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),v.format===yi&&fe===i.DEPTH_COMPONENT&&v.type!==gl&&v.type!==Kn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),v.type=Kn,ee=r.convert(v.type)),v.format===rs&&fe===i.DEPTH_COMPONENT&&(fe=i.DEPTH_STENCIL,v.type!==xi&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),v.type=xi,ee=r.convert(v.type))),nt&&(Qe?t.texStorage2D(i.TEXTURE_2D,1,fe,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,fe,Q.width,Q.height,0,C,ee,null));else if(v.isDataTexture)if(Ce.length>0&&$e){Qe&&nt&&t.texStorage2D(i.TEXTURE_2D,Je,fe,Ce[0].width,Ce[0].height);for(let de=0,I=Ce.length;de<I;de++)le=Ce[de],Qe?t.texSubImage2D(i.TEXTURE_2D,de,0,0,le.width,le.height,C,ee,le.data):t.texImage2D(i.TEXTURE_2D,de,fe,le.width,le.height,0,C,ee,le.data);v.generateMipmaps=!1}else Qe?(nt&&t.texStorage2D(i.TEXTURE_2D,Je,fe,Q.width,Q.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,Q.width,Q.height,C,ee,Q.data)):t.texImage2D(i.TEXTURE_2D,0,fe,Q.width,Q.height,0,C,ee,Q.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Qe&&nt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Je,fe,Ce[0].width,Ce[0].height,Q.depth);for(let de=0,I=Ce.length;de<I;de++)le=Ce[de],v.format!==bn?C!==null?Qe?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,de,0,0,0,le.width,le.height,Q.depth,C,le.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,de,fe,le.width,le.height,Q.depth,0,le.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Qe?t.texSubImage3D(i.TEXTURE_2D_ARRAY,de,0,0,0,le.width,le.height,Q.depth,C,ee,le.data):t.texImage3D(i.TEXTURE_2D_ARRAY,de,fe,le.width,le.height,Q.depth,0,C,ee,le.data)}else{Qe&&nt&&t.texStorage2D(i.TEXTURE_2D,Je,fe,Ce[0].width,Ce[0].height);for(let de=0,I=Ce.length;de<I;de++)le=Ce[de],v.format!==bn?C!==null?Qe?t.compressedTexSubImage2D(i.TEXTURE_2D,de,0,0,le.width,le.height,C,le.data):t.compressedTexImage2D(i.TEXTURE_2D,de,fe,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Qe?t.texSubImage2D(i.TEXTURE_2D,de,0,0,le.width,le.height,C,ee,le.data):t.texImage2D(i.TEXTURE_2D,de,fe,le.width,le.height,0,C,ee,le.data)}else if(v.isDataArrayTexture)Qe?(nt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Je,fe,Q.width,Q.height,Q.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,C,ee,Q.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,fe,Q.width,Q.height,Q.depth,0,C,ee,Q.data);else if(v.isData3DTexture)Qe?(nt&&t.texStorage3D(i.TEXTURE_3D,Je,fe,Q.width,Q.height,Q.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,C,ee,Q.data)):t.texImage3D(i.TEXTURE_3D,0,fe,Q.width,Q.height,Q.depth,0,C,ee,Q.data);else if(v.isFramebufferTexture){if(nt)if(Qe)t.texStorage2D(i.TEXTURE_2D,Je,fe,Q.width,Q.height);else{let de=Q.width,I=Q.height;for(let ue=0;ue<Je;ue++)t.texImage2D(i.TEXTURE_2D,ue,fe,de,I,0,C,ee,null),de>>=1,I>>=1}}else if(Ce.length>0&&$e){Qe&&nt&&t.texStorage2D(i.TEXTURE_2D,Je,fe,Ce[0].width,Ce[0].height);for(let de=0,I=Ce.length;de<I;de++)le=Ce[de],Qe?t.texSubImage2D(i.TEXTURE_2D,de,0,0,C,ee,le):t.texImage2D(i.TEXTURE_2D,de,fe,C,ee,le);v.generateMipmaps=!1}else Qe?(nt&&t.texStorage2D(i.TEXTURE_2D,Je,fe,Q.width,Q.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,C,ee,Q)):t.texImage2D(i.TEXTURE_2D,0,fe,C,ee,Q);E(v,$e)&&x(se),Se.__version=K.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function Ae(b,v,O){if(v.image.length!==6)return;let se=ne(b,v),$=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+O);let K=n.get($);if($.version!==K.__version||se===!0){t.activeTexture(i.TEXTURE0+O);let Se=ot.getPrimaries(ot.workingColorSpace),me=v.colorSpace===on?null:ot.getPrimaries(v.colorSpace),ye=v.colorSpace===on||Se===me?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);let Ue=v.isCompressedTexture||v.image[0].isCompressedTexture,Ge=v.image[0]&&v.image[0].isDataTexture,Q=[];for(let de=0;de<6;de++)!Ue&&!Ge?Q[de]=_(v.image[de],!1,!0,s.maxCubemapSize):Q[de]=Ge?v.image[de].image:v.image[de],Q[de]=xe(v,Q[de]);let $e=Q[0],C=m($e)||a,ee=r.convert(v.format,v.colorSpace),fe=r.convert(v.type),le=w(v.internalFormat,ee,fe,v.colorSpace),Ce=a&&v.isVideoTexture!==!0,Qe=K.__version===void 0||se===!0,nt=D(v,$e,C);W(i.TEXTURE_CUBE_MAP,v,C);let Je;if(Ue){Ce&&Qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,nt,le,$e.width,$e.height);for(let de=0;de<6;de++){Je=Q[de].mipmaps;for(let I=0;I<Je.length;I++){let ue=Je[I];v.format!==bn?ee!==null?Ce?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I,0,0,ue.width,ue.height,ee,ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I,le,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ce?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I,0,0,ue.width,ue.height,ee,fe,ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I,le,ue.width,ue.height,0,ee,fe,ue.data)}}}else{Je=v.mipmaps,Ce&&Qe&&(Je.length>0&&nt++,t.texStorage2D(i.TEXTURE_CUBE_MAP,nt,le,Q[0].width,Q[0].height));for(let de=0;de<6;de++)if(Ge){Ce?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,Q[de].width,Q[de].height,ee,fe,Q[de].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,le,Q[de].width,Q[de].height,0,ee,fe,Q[de].data);for(let I=0;I<Je.length;I++){let he=Je[I].image[de].image;Ce?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I+1,0,0,he.width,he.height,ee,fe,he.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I+1,le,he.width,he.height,0,ee,fe,he.data)}}else{Ce?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,0,0,ee,fe,Q[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,le,ee,fe,Q[de]);for(let I=0;I<Je.length;I++){let ue=Je[I];Ce?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I+1,0,0,ee,fe,ue.image[de]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,I+1,le,ee,fe,ue.image[de])}}}E(v,C)&&x(i.TEXTURE_CUBE_MAP),K.__version=$.version,v.onUpdate&&v.onUpdate(v)}b.__version=v.version}function be(b,v,O,se,$,K){let Se=r.convert(O.format,O.colorSpace),me=r.convert(O.type),ye=w(O.internalFormat,Se,me,O.colorSpace);if(!n.get(v).__hasExternalTextures){let Ge=Math.max(1,v.width>>K),Q=Math.max(1,v.height>>K);$===i.TEXTURE_3D||$===i.TEXTURE_2D_ARRAY?t.texImage3D($,K,ye,Ge,Q,v.depth,0,Se,me,null):t.texImage2D($,K,ye,Ge,Q,0,Se,me,null)}t.bindFramebuffer(i.FRAMEBUFFER,b),j(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,se,$,n.get(O).__webglTexture,0,ae(v)):($===i.TEXTURE_2D||$>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,se,$,n.get(O).__webglTexture,K),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(b,v,O){if(i.bindRenderbuffer(i.RENDERBUFFER,b),v.depthBuffer&&!v.stencilBuffer){let se=a===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(O||j(v)){let $=v.depthTexture;$&&$.isDepthTexture&&($.type===$n?se=i.DEPTH_COMPONENT32F:$.type===Kn&&(se=i.DEPTH_COMPONENT24));let K=ae(v);j(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,K,se,v.width,v.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,K,se,v.width,v.height)}else i.renderbufferStorage(i.RENDERBUFFER,se,v.width,v.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,b)}else if(v.depthBuffer&&v.stencilBuffer){let se=ae(v);O&&j(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,se,i.DEPTH24_STENCIL8,v.width,v.height):j(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,se,i.DEPTH24_STENCIL8,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,b)}else{let se=v.isWebGLMultipleRenderTargets===!0?v.texture:[v.texture];for(let $=0;$<se.length;$++){let K=se[$],Se=r.convert(K.format,K.colorSpace),me=r.convert(K.type),ye=w(K.internalFormat,Se,me,K.colorSpace),Ue=ae(v);O&&j(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ue,ye,v.width,v.height):j(v)?l.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ue,ye,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ye,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ze(b,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,b),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),G(v.depthTexture,0);let se=n.get(v.depthTexture).__webglTexture,$=ae(v);if(v.depthTexture.format===yi)j(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,se,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,se,0);else if(v.depthTexture.format===rs)j(v)?l.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,se,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,se,0);else throw new Error("Unknown depthTexture format")}function Te(b){let v=n.get(b),O=b.isWebGLCubeRenderTarget===!0;if(b.depthTexture&&!v.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");ze(v.__webglFramebuffer,b)}else if(O){v.__webglDepthbuffer=[];for(let se=0;se<6;se++)t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[se]),v.__webglDepthbuffer[se]=i.createRenderbuffer(),Oe(v.__webglDepthbuffer[se],b,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer=i.createRenderbuffer(),Oe(v.__webglDepthbuffer,b,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function ke(b,v,O){let se=n.get(b);v!==void 0&&be(se.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&Te(b)}function P(b){let v=b.texture,O=n.get(b),se=n.get(v);b.addEventListener("dispose",H),b.isWebGLMultipleRenderTargets!==!0&&(se.__webglTexture===void 0&&(se.__webglTexture=i.createTexture()),se.__version=v.version,o.memory.textures++);let $=b.isWebGLCubeRenderTarget===!0,K=b.isWebGLMultipleRenderTargets===!0,Se=m(b)||a;if($){O.__webglFramebuffer=[];for(let me=0;me<6;me++)if(a&&v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer[me]=[];for(let ye=0;ye<v.mipmaps.length;ye++)O.__webglFramebuffer[me][ye]=i.createFramebuffer()}else O.__webglFramebuffer[me]=i.createFramebuffer()}else{if(a&&v.mipmaps&&v.mipmaps.length>0){O.__webglFramebuffer=[];for(let me=0;me<v.mipmaps.length;me++)O.__webglFramebuffer[me]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(K)if(s.drawBuffers){let me=b.texture;for(let ye=0,Ue=me.length;ye<Ue;ye++){let Ge=n.get(me[ye]);Ge.__webglTexture===void 0&&(Ge.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&b.samples>0&&j(b)===!1){let me=K?v:[v];O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ye=0;ye<me.length;ye++){let Ue=me[ye];O.__webglColorRenderbuffer[ye]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[ye]);let Ge=r.convert(Ue.format,Ue.colorSpace),Q=r.convert(Ue.type),$e=w(Ue.internalFormat,Ge,Q,Ue.colorSpace,b.isXRRenderTarget===!0),C=ae(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,C,$e,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,O.__webglColorRenderbuffer[ye])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),Oe(O.__webglDepthRenderbuffer,b,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if($){t.bindTexture(i.TEXTURE_CUBE_MAP,se.__webglTexture),W(i.TEXTURE_CUBE_MAP,v,Se);for(let me=0;me<6;me++)if(a&&v.mipmaps&&v.mipmaps.length>0)for(let ye=0;ye<v.mipmaps.length;ye++)be(O.__webglFramebuffer[me][ye],b,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+me,ye);else be(O.__webglFramebuffer[me],b,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0);E(v,Se)&&x(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(K){let me=b.texture;for(let ye=0,Ue=me.length;ye<Ue;ye++){let Ge=me[ye],Q=n.get(Ge);t.bindTexture(i.TEXTURE_2D,Q.__webglTexture),W(i.TEXTURE_2D,Ge,Se),be(O.__webglFramebuffer,b,Ge,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,0),E(Ge,Se)&&x(i.TEXTURE_2D)}t.unbindTexture()}else{let me=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(a?me=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(me,se.__webglTexture),W(me,v,Se),a&&v.mipmaps&&v.mipmaps.length>0)for(let ye=0;ye<v.mipmaps.length;ye++)be(O.__webglFramebuffer[ye],b,v,i.COLOR_ATTACHMENT0,me,ye);else be(O.__webglFramebuffer,b,v,i.COLOR_ATTACHMENT0,me,0);E(v,Se)&&x(me),t.unbindTexture()}b.depthBuffer&&Te(b)}function ce(b){let v=m(b)||a,O=b.isWebGLMultipleRenderTargets===!0?b.texture:[b.texture];for(let se=0,$=O.length;se<$;se++){let K=O[se];if(E(K,v)){let Se=b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,me=n.get(K).__webglTexture;t.bindTexture(Se,me),x(Se),t.unbindTexture()}}}function Y(b){if(a&&b.samples>0&&j(b)===!1){let v=b.isWebGLMultipleRenderTargets?b.texture:[b.texture],O=b.width,se=b.height,$=i.COLOR_BUFFER_BIT,K=[],Se=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,me=n.get(b),ye=b.isWebGLMultipleRenderTargets===!0;if(ye)for(let Ue=0;Ue<v.length;Ue++)t.bindFramebuffer(i.FRAMEBUFFER,me.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ue,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,me.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ue,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,me.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,me.__webglFramebuffer);for(let Ue=0;Ue<v.length;Ue++){K.push(i.COLOR_ATTACHMENT0+Ue),b.depthBuffer&&K.push(Se);let Ge=me.__ignoreDepthValues!==void 0?me.__ignoreDepthValues:!1;if(Ge===!1&&(b.depthBuffer&&($|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&($|=i.STENCIL_BUFFER_BIT)),ye&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,me.__webglColorRenderbuffer[Ue]),Ge===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[Se]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[Se])),ye){let Q=n.get(v[Ue]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Q,0)}i.blitFramebuffer(0,0,O,se,0,0,O,se,$,i.NEAREST),c&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,K)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ye)for(let Ue=0;Ue<v.length;Ue++){t.bindFramebuffer(i.FRAMEBUFFER,me.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ue,i.RENDERBUFFER,me.__webglColorRenderbuffer[Ue]);let Ge=n.get(v[Ue]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,me.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ue,i.TEXTURE_2D,Ge,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,me.__webglMultisampledFramebuffer)}}function ae(b){return Math.min(s.maxSamples,b.samples)}function j(b){let v=n.get(b);return a&&b.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Re(b){let v=o.render.frame;u.get(b)!==v&&(u.set(b,v),b.update())}function xe(b,v){let O=b.colorSpace,se=b.format,$=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||b.format===Io||O!==Fn&&O!==on&&(ot.getTransfer(O)===ht?a===!1?e.has("EXT_sRGB")===!0&&se===bn?(b.format=Io,b.minFilter=an,b.generateMipmaps=!1):v=jr.sRGBToLinear(v):(se!==bn||$!==ti)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),v}this.allocateTextureUnit=U,this.resetTextureUnits=re,this.setTexture2D=G,this.setTexture2DArray=J,this.setTexture3D=Z,this.setTextureCube=X,this.rebindTextures=ke,this.setupRenderTarget=P,this.updateRenderTargetMipmap=ce,this.updateMultisampleRenderTarget=Y,this.setupDepthRenderbuffer=Te,this.setupFrameBufferTexture=be,this.useMultisampledRTT=j}function Xg(i,e,t){let n=t.isWebGL2;function s(r,o=on){let a,l=ot.getTransfer(o);if(r===ti)return i.UNSIGNED_BYTE;if(r===Bu)return i.UNSIGNED_SHORT_4_4_4_4;if(r===zu)return i.UNSIGNED_SHORT_5_5_5_1;if(r===Ed)return i.BYTE;if(r===wd)return i.SHORT;if(r===gl)return i.UNSIGNED_SHORT;if(r===Fu)return i.INT;if(r===Kn)return i.UNSIGNED_INT;if(r===$n)return i.FLOAT;if(r===Us)return n?i.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===Td)return i.ALPHA;if(r===bn)return i.RGBA;if(r===Ad)return i.LUMINANCE;if(r===Rd)return i.LUMINANCE_ALPHA;if(r===yi)return i.DEPTH_COMPONENT;if(r===rs)return i.DEPTH_STENCIL;if(r===Io)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===Cd)return i.RED;if(r===ku)return i.RED_INTEGER;if(r===Pd)return i.RG;if(r===Hu)return i.RG_INTEGER;if(r===Vu)return i.RGBA_INTEGER;if(r===qa||r===Ya||r===ja||r===Za)if(l===ht)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===qa)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ya)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===ja)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Za)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===qa)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ya)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===ja)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Za)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===oc||r===lc||r===cc||r===uc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===oc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===lc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===cc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===uc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Gu)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===hc||r===dc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(r===hc)return l===ht?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===dc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===fc||r===pc||r===mc||r===gc||r===_c||r===xc||r===yc||r===vc||r===bc||r===Mc||r===Sc||r===Ec||r===wc||r===Tc)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(r===fc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===pc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===mc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===gc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===_c)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===xc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===yc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===vc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===bc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Mc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Sc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Ec)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===wc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Tc)return l===ht?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Ja||r===Ac||r===Rc)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(r===Ja)return l===ht?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Ac)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Rc)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===Ld||r===Cc||r===Pc||r===Lc)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(r===Ja)return a.COMPRESSED_RED_RGTC1_EXT;if(r===Cc)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Pc)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Lc)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===xi?n?i.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}var qo=class extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},tn=class extends Pt{constructor(){super(),this.isGroup=!0,this.type="Group"}},qg={type:"move"},Cs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new tn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new tn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new tn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(qg)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new tn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Yo=class extends An{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null,_=t.getContextAttributes(),m=null,p=null,E=[],x=[],w=new oe,D=null,R=new Xt;R.layers.enable(1),R.viewport=new Ct;let A=new Xt;A.layers.enable(2),A.viewport=new Ct;let H=[R,A],M=new qo;M.layers.enable(1),M.layers.enable(2);let T=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let ne=E[W];return ne===void 0&&(ne=new Cs,E[W]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(W){let ne=E[W];return ne===void 0&&(ne=new Cs,E[W]=ne),ne.getGripSpace()},this.getHand=function(W){let ne=E[W];return ne===void 0&&(ne=new Cs,E[W]=ne),ne.getHandSpace()};function q(W){let ne=x.indexOf(W.inputSource);if(ne===-1)return;let _e=E[ne];_e!==void 0&&(_e.update(W.inputSource,W.frame,c||o),_e.dispatchEvent({type:W.type,data:W.inputSource}))}function re(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",re),s.removeEventListener("inputsourceschange",U);for(let W=0;W<E.length;W++){let ne=x[W];ne!==null&&(x[W]=null,E[W].disconnect(ne))}T=null,B=null,e.setRenderTarget(m),f=null,d=null,h=null,s=null,p=null,ge.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){r=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){a=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(W){if(s=W,s!==null){if(m=e.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",re),s.addEventListener("inputsourceschange",U),_.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(w),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){let ne={antialias:s.renderState.layers===void 0?_.antialias:!0,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ne),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),p=new Bn(f.framebufferWidth,f.framebufferHeight,{format:bn,type:ti,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}else{let ne=null,_e=null,Ae=null;_.depth&&(Ae=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=_.stencil?rs:yi,_e=_.stencil?xi:Kn);let be={colorFormat:t.RGBA8,depthFormat:Ae,scaleFactor:r};h=new XRWebGLBinding(s,t),d=h.createProjectionLayer(be),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),p=new Bn(d.textureWidth,d.textureHeight,{format:bn,type:ti,depthTexture:new sa(d.textureWidth,d.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0});let Oe=e.properties.get(p);Oe.__ignoreDepthValues=d.ignoreDepthValues}p.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),ge.setContext(s),ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function U(W){for(let ne=0;ne<W.removed.length;ne++){let _e=W.removed[ne],Ae=x.indexOf(_e);Ae>=0&&(x[Ae]=null,E[Ae].disconnect(_e))}for(let ne=0;ne<W.added.length;ne++){let _e=W.added[ne],Ae=x.indexOf(_e);if(Ae===-1){for(let Oe=0;Oe<E.length;Oe++)if(Oe>=x.length){x.push(_e),Ae=Oe;break}else if(x[Oe]===null){x[Oe]=_e,Ae=Oe;break}if(Ae===-1)break}let be=E[Ae];be&&be.connect(_e)}}let F=new L,G=new L;function J(W,ne,_e){F.setFromMatrixPosition(ne.matrixWorld),G.setFromMatrixPosition(_e.matrixWorld);let Ae=F.distanceTo(G),be=ne.projectionMatrix.elements,Oe=_e.projectionMatrix.elements,ze=be[14]/(be[10]-1),Te=be[14]/(be[10]+1),ke=(be[9]+1)/be[5],P=(be[9]-1)/be[5],ce=(be[8]-1)/be[0],Y=(Oe[8]+1)/Oe[0],ae=ze*ce,j=ze*Y,Re=Ae/(-ce+Y),xe=Re*-ce;ne.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(xe),W.translateZ(Re),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert();let b=ze+Re,v=Te+Re,O=ae-xe,se=j+(Ae-xe),$=ke*Te/v*b,K=P*Te/v*b;W.projectionMatrix.makePerspective(O,se,$,K,b,v),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}function Z(W,ne){ne===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(ne.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(s===null)return;M.near=A.near=R.near=W.near,M.far=A.far=R.far=W.far,(T!==M.near||B!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),T=M.near,B=M.far);let ne=W.parent,_e=M.cameras;Z(M,ne);for(let Ae=0;Ae<_e.length;Ae++)Z(_e[Ae],ne);_e.length===2?J(M,R,A):M.projectionMatrix.copy(R.projectionMatrix),X(W,M,ne)};function X(W,ne,_e){_e===null?W.matrix.copy(ne.matrixWorld):(W.matrix.copy(_e.matrixWorld),W.matrix.invert(),W.matrix.multiply(ne.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(ne.projectionMatrix),W.projectionMatrixInverse.copy(ne.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Ns*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(W){l=W,d!==null&&(d.fixedFoveation=W),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=W)};let te=null;function ie(W,ne){if(u=ne.getViewerPose(c||o),g=ne,u!==null){let _e=u.views;f!==null&&(e.setRenderTargetFramebuffer(p,f.framebuffer),e.setRenderTarget(p));let Ae=!1;_e.length!==M.cameras.length&&(M.cameras.length=0,Ae=!0);for(let be=0;be<_e.length;be++){let Oe=_e[be],ze=null;if(f!==null)ze=f.getViewport(Oe);else{let ke=h.getViewSubImage(d,Oe);ze=ke.viewport,be===0&&(e.setRenderTargetTextures(p,ke.colorTexture,d.ignoreDepthValues?void 0:ke.depthStencilTexture),e.setRenderTarget(p))}let Te=H[be];Te===void 0&&(Te=new Xt,Te.layers.enable(be),Te.viewport=new Ct,H[be]=Te),Te.matrix.fromArray(Oe.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(Oe.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(ze.x,ze.y,ze.width,ze.height),be===0&&(M.matrix.copy(Te.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),Ae===!0&&M.cameras.push(Te)}}for(let _e=0;_e<E.length;_e++){let Ae=x[_e],be=E[_e];Ae!==null&&be!==void 0&&be.update(Ae,ne,c||o)}te&&te(W,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),g=null}let ge=new Ju;ge.setAnimationLoop(ie),this.setAnimationLoop=function(W){te=W},this.dispose=function(){}}};function Yg(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Zu(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,E,x,w){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,w)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,E,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===qt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===qt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let E=e.get(p).envMap;if(E&&(m.envMap.value=E,m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap){m.lightMap.value=p.lightMap;let x=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=p.lightMapIntensity*x,t(p.lightMap,m.lightMapTransform)}p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,E,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*E,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),e.get(p).envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,E){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===qt&&m.clearcoatNormalScale.value.negate())),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=E.texture,m.transmissionSamplerSize.value.set(E.width,E.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let E=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(E.matrixWorld),m.nearDistance.value=E.shadow.camera.near,m.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function jg(i,e,t,n){let s={},r={},o=[],a=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(E,x){let w=x.program;n.uniformBlockBinding(E,w)}function c(E,x){let w=s[E.id];w===void 0&&(g(E),w=u(E),s[E.id]=w,E.addEventListener("dispose",m));let D=x.program;n.updateUBOMapping(E,D);let R=e.render.frame;r[E.id]!==R&&(d(E),r[E.id]=R)}function u(E){let x=h();E.__bindingPointIndex=x;let w=i.createBuffer(),D=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,D,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,x,w),w}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(E){let x=s[E.id],w=E.uniforms,D=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,x);for(let R=0,A=w.length;R<A;R++){let H=Array.isArray(w[R])?w[R]:[w[R]];for(let M=0,T=H.length;M<T;M++){let B=H[M];if(f(B,R,M,D)===!0){let q=B.__offset,re=Array.isArray(B.value)?B.value:[B.value],U=0;for(let F=0;F<re.length;F++){let G=re[F],J=_(G);typeof G=="number"||typeof G=="boolean"?(B.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,q+U,B.__data)):G.isMatrix3?(B.__data[0]=G.elements[0],B.__data[1]=G.elements[1],B.__data[2]=G.elements[2],B.__data[3]=0,B.__data[4]=G.elements[3],B.__data[5]=G.elements[4],B.__data[6]=G.elements[5],B.__data[7]=0,B.__data[8]=G.elements[6],B.__data[9]=G.elements[7],B.__data[10]=G.elements[8],B.__data[11]=0):(G.toArray(B.__data,U),U+=J.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,q,B.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(E,x,w,D){let R=E.value,A=x+"_"+w;if(D[A]===void 0)return typeof R=="number"||typeof R=="boolean"?D[A]=R:D[A]=R.clone(),!0;{let H=D[A];if(typeof R=="number"||typeof R=="boolean"){if(H!==R)return D[A]=R,!0}else if(H.equals(R)===!1)return H.copy(R),!0}return!1}function g(E){let x=E.uniforms,w=0,D=16;for(let A=0,H=x.length;A<H;A++){let M=Array.isArray(x[A])?x[A]:[x[A]];for(let T=0,B=M.length;T<B;T++){let q=M[T],re=Array.isArray(q.value)?q.value:[q.value];for(let U=0,F=re.length;U<F;U++){let G=re[U],J=_(G),Z=w%D;Z!==0&&D-Z<J.boundary&&(w+=D-Z),q.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=w,w+=J.storage}}}let R=w%D;return R>0&&(w+=D-R),E.__size=w,E.__cache={},this}function _(E){let x={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(x.boundary=4,x.storage=4):E.isVector2?(x.boundary=8,x.storage=8):E.isVector3||E.isColor?(x.boundary=16,x.storage=12):E.isVector4?(x.boundary=16,x.storage=16):E.isMatrix3?(x.boundary=48,x.storage=48):E.isMatrix4?(x.boundary=64,x.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),x}function m(E){let x=E.target;x.removeEventListener("dispose",m);let w=o.indexOf(x.__bindingPointIndex);o.splice(w,1),i.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(let E in s)i.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Fs=class{constructor(e={}){let{canvas:t=nf(),context:n=null,depth:s=!0,stencil:r=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let d;n!==null?d=n.getContextAttributes().alpha:d=o;let f=new Uint32Array(4),g=new Int32Array(4),_=null,m=null,p=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yt,this._useLegacyLights=!1,this.toneMapping=ei,this.toneMappingExposure=1;let x=this,w=!1,D=0,R=0,A=null,H=-1,M=null,T=new Ct,B=new Ct,q=null,re=new We(0),U=0,F=t.width,G=t.height,J=1,Z=null,X=null,te=new Ct(0,0,F,G),ie=new Ct(0,0,F,G),ge=!1,W=new Os,ne=!1,_e=!1,Ae=null,be=new Ze,Oe=new oe,ze=new L,Te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ke(){return A===null?J:1}let P=n;function ce(S,N){for(let k=0;k<S.length;k++){let V=S[k],z=t.getContext(V,N);if(z!==null)return z}return null}try{let S={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r160"),t.addEventListener("webglcontextlost",de,!1),t.addEventListener("webglcontextrestored",I,!1),t.addEventListener("webglcontextcreationerror",ue,!1),P===null){let N=["webgl2","webgl","experimental-webgl"];if(x.isWebGL1Renderer===!0&&N.shift(),P=ce(N,S),P===null)throw ce(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&P instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),P.getShaderPrecisionFormat===void 0&&(P.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Y,ae,j,Re,xe,b,v,O,se,$,K,Se,me,ye,Ue,Ge,Q,$e,C,ee,fe,le,Ce,Qe;function nt(){Y=new fm(P),ae=new om(P,Y,e),Y.init(ae),le=new Xg(P,Y,ae),j=new Gg(P,Y,ae),Re=new gm(P),xe=new Lg,b=new Wg(P,Y,j,xe,ae,le,Re),v=new cm(x),O=new dm(x),se=new Ef(P,ae),Ce=new rm(P,Y,se,ae),$=new pm(P,se,Re,Ce),K=new vm(P,$,se,Re),C=new ym(P,ae,b),Ge=new lm(xe),Se=new Pg(x,v,O,Y,ae,Ce,Ge),me=new Yg(x,xe),ye=new Dg,Ue=new zg(Y,ae),$e=new sm(x,v,O,j,K,d,l),Q=new Vg(x,K,ae),Qe=new jg(P,Re,ae,j),ee=new am(P,Y,Re,ae),fe=new mm(P,Y,Re,ae),Re.programs=Se.programs,x.capabilities=ae,x.extensions=Y,x.properties=xe,x.renderLists=ye,x.shadowMap=Q,x.state=j,x.info=Re}nt();let Je=new Yo(x,P);this.xr=Je,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let S=Y.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=Y.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return J},this.setPixelRatio=function(S){S!==void 0&&(J=S,this.setSize(F,G,!1))},this.getSize=function(S){return S.set(F,G)},this.setSize=function(S,N,k=!0){if(Je.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=S,G=N,t.width=Math.floor(S*J),t.height=Math.floor(N*J),k===!0&&(t.style.width=S+"px",t.style.height=N+"px"),this.setViewport(0,0,S,N)},this.getDrawingBufferSize=function(S){return S.set(F*J,G*J).floor()},this.setDrawingBufferSize=function(S,N,k){F=S,G=N,J=k,t.width=Math.floor(S*k),t.height=Math.floor(N*k),this.setViewport(0,0,S,N)},this.getCurrentViewport=function(S){return S.copy(T)},this.getViewport=function(S){return S.copy(te)},this.setViewport=function(S,N,k,V){S.isVector4?te.set(S.x,S.y,S.z,S.w):te.set(S,N,k,V),j.viewport(T.copy(te).multiplyScalar(J).floor())},this.getScissor=function(S){return S.copy(ie)},this.setScissor=function(S,N,k,V){S.isVector4?ie.set(S.x,S.y,S.z,S.w):ie.set(S,N,k,V),j.scissor(B.copy(ie).multiplyScalar(J).floor())},this.getScissorTest=function(){return ge},this.setScissorTest=function(S){j.setScissorTest(ge=S)},this.setOpaqueSort=function(S){Z=S},this.setTransparentSort=function(S){X=S},this.getClearColor=function(S){return S.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor.apply($e,arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha.apply($e,arguments)},this.clear=function(S=!0,N=!0,k=!0){let V=0;if(S){let z=!1;if(A!==null){let ve=A.texture.format;z=ve===Vu||ve===Hu||ve===ku}if(z){let ve=A.texture.type,De=ve===ti||ve===Kn||ve===gl||ve===xi||ve===Bu||ve===zu,Fe=$e.getClearColor(),He=$e.getClearAlpha(),Ke=Fe.r,Xe=Fe.g,Ye=Fe.b;De?(f[0]=Ke,f[1]=Xe,f[2]=Ye,f[3]=He,P.clearBufferuiv(P.COLOR,0,f)):(g[0]=Ke,g[1]=Xe,g[2]=Ye,g[3]=He,P.clearBufferiv(P.COLOR,0,g))}else V|=P.COLOR_BUFFER_BIT}N&&(V|=P.DEPTH_BUFFER_BIT),k&&(V|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",de,!1),t.removeEventListener("webglcontextrestored",I,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),ye.dispose(),Ue.dispose(),xe.dispose(),v.dispose(),O.dispose(),K.dispose(),Ce.dispose(),Qe.dispose(),Se.dispose(),Je.dispose(),Je.removeEventListener("sessionstart",Ht),Je.removeEventListener("sessionend",ut),Ae&&(Ae.dispose(),Ae=null),Vt.stop()};function de(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function I(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;let S=Re.autoReset,N=Q.enabled,k=Q.autoUpdate,V=Q.needsUpdate,z=Q.type;nt(),Re.autoReset=S,Q.enabled=N,Q.autoUpdate=k,Q.needsUpdate=V,Q.type=z}function ue(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function he(S){let N=S.target;N.removeEventListener("dispose",he),Ne(N)}function Ne(S){Ie(S),xe.remove(S)}function Ie(S){let N=xe.get(S).programs;N!==void 0&&(N.forEach(function(k){Se.releaseProgram(k)}),S.isShaderMaterial&&Se.releaseShaderCache(S))}this.renderBufferDirect=function(S,N,k,V,z,ve){N===null&&(N=Te);let De=z.isMesh&&z.matrixWorld.determinant()<0,Fe=Hh(S,N,k,V,z);j.setMaterial(V,De);let He=k.index,Ke=1;if(V.wireframe===!0){if(He=$.getWireframeAttribute(k),He===void 0)return;Ke=2}let Xe=k.drawRange,Ye=k.attributes.position,xt=Xe.start*Ke,$t=(Xe.start+Xe.count)*Ke;ve!==null&&(xt=Math.max(xt,ve.start*Ke),$t=Math.min($t,(ve.start+ve.count)*Ke)),He!==null?(xt=Math.max(xt,0),$t=Math.min($t,He.count)):Ye!=null&&(xt=Math.max(xt,0),$t=Math.min($t,Ye.count));let Tt=$t-xt;if(Tt<0||Tt===1/0)return;Ce.setup(z,V,Fe,k,He);let Cn,pt=ee;if(He!==null&&(Cn=se.get(He),pt=fe,pt.setIndex(Cn)),z.isMesh)V.wireframe===!0?(j.setLineWidth(V.wireframeLinewidth*ke()),pt.setMode(P.LINES)):pt.setMode(P.TRIANGLES);else if(z.isLine){let et=V.linewidth;et===void 0&&(et=1),j.setLineWidth(et*ke()),z.isLineSegments?pt.setMode(P.LINES):z.isLineLoop?pt.setMode(P.LINE_LOOP):pt.setMode(P.LINE_STRIP)}else z.isPoints?pt.setMode(P.POINTS):z.isSprite&&pt.setMode(P.TRIANGLES);if(z.isBatchedMesh)pt.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else if(z.isInstancedMesh)pt.renderInstances(xt,Tt,z.count);else if(k.isInstancedBufferGeometry){let et=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,Ha=Math.min(k.instanceCount,et);pt.renderInstances(xt,Tt,Ha)}else pt.render(xt,Tt)};function it(S,N,k){S.transparent===!0&&S.side===yn&&S.forceSinglePass===!1?(S.side=qt,S.needsUpdate=!0,hr(S,N,k),S.side=ni,S.needsUpdate=!0,hr(S,N,k),S.side=yn):hr(S,N,k)}this.compile=function(S,N,k=null){k===null&&(k=S),m=Ue.get(k),m.init(),E.push(m),k.traverseVisible(function(z){z.isLight&&z.layers.test(N.layers)&&(m.pushLight(z),z.castShadow&&m.pushShadow(z))}),S!==k&&S.traverseVisible(function(z){z.isLight&&z.layers.test(N.layers)&&(m.pushLight(z),z.castShadow&&m.pushShadow(z))}),m.setupLights(x._useLegacyLights);let V=new Set;return S.traverse(function(z){let ve=z.material;if(ve)if(Array.isArray(ve))for(let De=0;De<ve.length;De++){let Fe=ve[De];it(Fe,k,z),V.add(Fe)}else it(ve,k,z),V.add(ve)}),E.pop(),m=null,V},this.compileAsync=function(S,N,k=null){let V=this.compile(S,N,k);return new Promise(z=>{function ve(){if(V.forEach(function(De){xe.get(De).currentProgram.isReady()&&V.delete(De)}),V.size===0){z(S);return}setTimeout(ve,10)}Y.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let rt=null;function wt(S){rt&&rt(S)}function Ht(){Vt.stop()}function ut(){Vt.start()}let Vt=new Ju;Vt.setAnimationLoop(wt),typeof self<"u"&&Vt.setContext(self),this.setAnimationLoop=function(S){rt=S,Je.setAnimationLoop(S),S===null?Vt.stop():Vt.start()},Je.addEventListener("sessionstart",Ht),Je.addEventListener("sessionend",ut),this.render=function(S,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Je.enabled===!0&&Je.isPresenting===!0&&(Je.cameraAutoUpdate===!0&&Je.updateCamera(N),N=Je.getCamera()),S.isScene===!0&&S.onBeforeRender(x,S,N,A),m=Ue.get(S,E.length),m.init(),E.push(m),be.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),W.setFromProjectionMatrix(be),_e=this.localClippingEnabled,ne=Ge.init(this.clippingPlanes,_e),_=ye.get(S,p.length),_.init(),p.push(_),wn(S,N,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(Z,X),this.info.render.frame++,ne===!0&&Ge.beginShadows();let k=m.state.shadowsArray;if(Q.render(k,S,N),ne===!0&&Ge.endShadows(),this.info.autoReset===!0&&this.info.reset(),$e.render(_,S),m.setupLights(x._useLegacyLights),N.isArrayCamera){let V=N.cameras;for(let z=0,ve=V.length;z<ve;z++){let De=V[z];jl(_,S,De,De.viewport)}}else jl(_,S,N);A!==null&&(b.updateMultisampleRenderTarget(A),b.updateRenderTargetMipmap(A)),S.isScene===!0&&S.onAfterRender(x,S,N),Ce.resetDefaultState(),H=-1,M=null,E.pop(),E.length>0?m=E[E.length-1]:m=null,p.pop(),p.length>0?_=p[p.length-1]:_=null};function wn(S,N,k,V){if(S.visible===!1)return;if(S.layers.test(N.layers)){if(S.isGroup)k=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(N);else if(S.isLight)m.pushLight(S),S.castShadow&&m.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||W.intersectsSprite(S)){V&&ze.setFromMatrixPosition(S.matrixWorld).applyMatrix4(be);let De=K.update(S),Fe=S.material;Fe.visible&&_.push(S,De,Fe,k,ze.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||W.intersectsObject(S))){let De=K.update(S),Fe=S.material;if(V&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),ze.copy(S.boundingSphere.center)):(De.boundingSphere===null&&De.computeBoundingSphere(),ze.copy(De.boundingSphere.center)),ze.applyMatrix4(S.matrixWorld).applyMatrix4(be)),Array.isArray(Fe)){let He=De.groups;for(let Ke=0,Xe=He.length;Ke<Xe;Ke++){let Ye=He[Ke],xt=Fe[Ye.materialIndex];xt&&xt.visible&&_.push(S,De,xt,k,ze.z,Ye)}}else Fe.visible&&_.push(S,De,Fe,k,ze.z,null)}}let ve=S.children;for(let De=0,Fe=ve.length;De<Fe;De++)wn(ve[De],N,k,V)}function jl(S,N,k,V){let z=S.opaque,ve=S.transmissive,De=S.transparent;m.setupLightsView(k),ne===!0&&Ge.setGlobalState(x.clippingPlanes,k),ve.length>0&&kh(z,ve,N,k),V&&j.viewport(T.copy(V)),z.length>0&&ur(z,N,k),ve.length>0&&ur(ve,N,k),De.length>0&&ur(De,N,k),j.buffers.depth.setTest(!0),j.buffers.depth.setMask(!0),j.buffers.color.setMask(!0),j.setPolygonOffset(!1)}function kh(S,N,k,V){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;let ve=ae.isWebGL2;Ae===null&&(Ae=new Bn(1,1,{generateMipmaps:!0,type:Y.has("EXT_color_buffer_half_float")?Us:ti,minFilter:Ds,samples:ve?4:0})),x.getDrawingBufferSize(Oe),ve?Ae.setSize(Oe.x,Oe.y):Ae.setSize(qr(Oe.x),qr(Oe.y));let De=x.getRenderTarget();x.setRenderTarget(Ae),x.getClearColor(re),U=x.getClearAlpha(),U<1&&x.setClearColor(16777215,.5),x.clear();let Fe=x.toneMapping;x.toneMapping=ei,ur(S,k,V),b.updateMultisampleRenderTarget(Ae),b.updateRenderTargetMipmap(Ae);let He=!1;for(let Ke=0,Xe=N.length;Ke<Xe;Ke++){let Ye=N[Ke],xt=Ye.object,$t=Ye.geometry,Tt=Ye.material,Cn=Ye.group;if(Tt.side===yn&&xt.layers.test(V.layers)){let pt=Tt.side;Tt.side=qt,Tt.needsUpdate=!0,Zl(xt,k,V,$t,Tt,Cn),Tt.side=pt,Tt.needsUpdate=!0,He=!0}}He===!0&&(b.updateMultisampleRenderTarget(Ae),b.updateRenderTargetMipmap(Ae)),x.setRenderTarget(De),x.setClearColor(re,U),x.toneMapping=Fe}function ur(S,N,k){let V=N.isScene===!0?N.overrideMaterial:null;for(let z=0,ve=S.length;z<ve;z++){let De=S[z],Fe=De.object,He=De.geometry,Ke=V===null?De.material:V,Xe=De.group;Fe.layers.test(k.layers)&&Zl(Fe,N,k,He,Ke,Xe)}}function Zl(S,N,k,V,z,ve){S.onBeforeRender(x,N,k,V,z,ve),S.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),z.onBeforeRender(x,N,k,V,S,ve),z.transparent===!0&&z.side===yn&&z.forceSinglePass===!1?(z.side=qt,z.needsUpdate=!0,x.renderBufferDirect(k,N,V,z,S,ve),z.side=ni,z.needsUpdate=!0,x.renderBufferDirect(k,N,V,z,S,ve),z.side=yn):x.renderBufferDirect(k,N,V,z,S,ve),S.onAfterRender(x,N,k,V,z,ve)}function hr(S,N,k){N.isScene!==!0&&(N=Te);let V=xe.get(S),z=m.state.lights,ve=m.state.shadowsArray,De=z.state.version,Fe=Se.getParameters(S,z.state,ve,N,k),He=Se.getProgramCacheKey(Fe),Ke=V.programs;V.environment=S.isMeshStandardMaterial?N.environment:null,V.fog=N.fog,V.envMap=(S.isMeshStandardMaterial?O:v).get(S.envMap||V.environment),Ke===void 0&&(S.addEventListener("dispose",he),Ke=new Map,V.programs=Ke);let Xe=Ke.get(He);if(Xe!==void 0){if(V.currentProgram===Xe&&V.lightsStateVersion===De)return Kl(S,Fe),Xe}else Fe.uniforms=Se.getUniforms(S),S.onBuild(k,Fe,x),S.onBeforeCompile(Fe,x),Xe=Se.acquireProgram(Fe,He),Ke.set(He,Xe),V.uniforms=Fe.uniforms;let Ye=V.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ye.clippingPlanes=Ge.uniform),Kl(S,Fe),V.needsLights=Gh(S),V.lightsStateVersion=De,V.needsLights&&(Ye.ambientLightColor.value=z.state.ambient,Ye.lightProbe.value=z.state.probe,Ye.directionalLights.value=z.state.directional,Ye.directionalLightShadows.value=z.state.directionalShadow,Ye.spotLights.value=z.state.spot,Ye.spotLightShadows.value=z.state.spotShadow,Ye.rectAreaLights.value=z.state.rectArea,Ye.ltc_1.value=z.state.rectAreaLTC1,Ye.ltc_2.value=z.state.rectAreaLTC2,Ye.pointLights.value=z.state.point,Ye.pointLightShadows.value=z.state.pointShadow,Ye.hemisphereLights.value=z.state.hemi,Ye.directionalShadowMap.value=z.state.directionalShadowMap,Ye.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Ye.spotShadowMap.value=z.state.spotShadowMap,Ye.spotLightMatrix.value=z.state.spotLightMatrix,Ye.spotLightMap.value=z.state.spotLightMap,Ye.pointShadowMap.value=z.state.pointShadowMap,Ye.pointShadowMatrix.value=z.state.pointShadowMatrix),V.currentProgram=Xe,V.uniformsList=null,Xe}function Jl(S){if(S.uniformsList===null){let N=S.currentProgram.getUniforms();S.uniformsList=ns.seqWithValue(N.seq,S.uniforms)}return S.uniformsList}function Kl(S,N){let k=xe.get(S);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function Hh(S,N,k,V,z){N.isScene!==!0&&(N=Te),b.resetTextureUnits();let ve=N.fog,De=V.isMeshStandardMaterial?N.environment:null,Fe=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Fn,He=(V.isMeshStandardMaterial?O:v).get(V.envMap||De),Ke=V.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Xe=!!k.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ye=!!k.morphAttributes.position,xt=!!k.morphAttributes.normal,$t=!!k.morphAttributes.color,Tt=ei;V.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Tt=x.toneMapping);let Cn=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,pt=Cn!==void 0?Cn.length:0,et=xe.get(V),Ha=m.state.lights;if(ne===!0&&(_e===!0||S!==M)){let sn=S===M&&V.id===H;Ge.setState(V,S,sn)}let gt=!1;V.version===et.__version?(et.needsLights&&et.lightsStateVersion!==Ha.state.version||et.outputColorSpace!==Fe||z.isBatchedMesh&&et.batching===!1||!z.isBatchedMesh&&et.batching===!0||z.isInstancedMesh&&et.instancing===!1||!z.isInstancedMesh&&et.instancing===!0||z.isSkinnedMesh&&et.skinning===!1||!z.isSkinnedMesh&&et.skinning===!0||z.isInstancedMesh&&et.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&et.instancingColor===!1&&z.instanceColor!==null||et.envMap!==He||V.fog===!0&&et.fog!==ve||et.numClippingPlanes!==void 0&&(et.numClippingPlanes!==Ge.numPlanes||et.numIntersection!==Ge.numIntersection)||et.vertexAlphas!==Ke||et.vertexTangents!==Xe||et.morphTargets!==Ye||et.morphNormals!==xt||et.morphColors!==$t||et.toneMapping!==Tt||ae.isWebGL2===!0&&et.morphTargetsCount!==pt)&&(gt=!0):(gt=!0,et.__version=V.version);let ci=et.currentProgram;gt===!0&&(ci=hr(V,N,z));let $l=!1,bs=!1,Va=!1,Bt=ci.getUniforms(),ui=et.uniforms;if(j.useProgram(ci.program)&&($l=!0,bs=!0,Va=!0),V.id!==H&&(H=V.id,bs=!0),$l||M!==S){Bt.setValue(P,"projectionMatrix",S.projectionMatrix),Bt.setValue(P,"viewMatrix",S.matrixWorldInverse);let sn=Bt.map.cameraPosition;sn!==void 0&&sn.setValue(P,ze.setFromMatrixPosition(S.matrixWorld)),ae.logarithmicDepthBuffer&&Bt.setValue(P,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Bt.setValue(P,"isOrthographic",S.isOrthographicCamera===!0),M!==S&&(M=S,bs=!0,Va=!0)}if(z.isSkinnedMesh){Bt.setOptional(P,z,"bindMatrix"),Bt.setOptional(P,z,"bindMatrixInverse");let sn=z.skeleton;sn&&(ae.floatVertexTextures?(sn.boneTexture===null&&sn.computeBoneTexture(),Bt.setValue(P,"boneTexture",sn.boneTexture,b)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}z.isBatchedMesh&&(Bt.setOptional(P,z,"batchingTexture"),Bt.setValue(P,"batchingTexture",z._matricesTexture,b));let Ga=k.morphAttributes;if((Ga.position!==void 0||Ga.normal!==void 0||Ga.color!==void 0&&ae.isWebGL2===!0)&&C.update(z,k,ci),(bs||et.receiveShadow!==z.receiveShadow)&&(et.receiveShadow=z.receiveShadow,Bt.setValue(P,"receiveShadow",z.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(ui.envMap.value=He,ui.flipEnvMap.value=He.isCubeTexture&&He.isRenderTargetTexture===!1?-1:1),bs&&(Bt.setValue(P,"toneMappingExposure",x.toneMappingExposure),et.needsLights&&Vh(ui,Va),ve&&V.fog===!0&&me.refreshFogUniforms(ui,ve),me.refreshMaterialUniforms(ui,V,J,G,Ae),ns.upload(P,Jl(et),ui,b)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(ns.upload(P,Jl(et),ui,b),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Bt.setValue(P,"center",z.center),Bt.setValue(P,"modelViewMatrix",z.modelViewMatrix),Bt.setValue(P,"normalMatrix",z.normalMatrix),Bt.setValue(P,"modelMatrix",z.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){let sn=V.uniformsGroups;for(let Wa=0,Wh=sn.length;Wa<Wh;Wa++)if(ae.isWebGL2){let Ql=sn[Wa];Qe.update(Ql,ci),Qe.bind(Ql,ci)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return ci}function Vh(S,N){S.ambientLightColor.needsUpdate=N,S.lightProbe.needsUpdate=N,S.directionalLights.needsUpdate=N,S.directionalLightShadows.needsUpdate=N,S.pointLights.needsUpdate=N,S.pointLightShadows.needsUpdate=N,S.spotLights.needsUpdate=N,S.spotLightShadows.needsUpdate=N,S.rectAreaLights.needsUpdate=N,S.hemisphereLights.needsUpdate=N}function Gh(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return D},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(S,N,k){xe.get(S.texture).__webglTexture=N,xe.get(S.depthTexture).__webglTexture=k;let V=xe.get(S);V.__hasExternalTextures=!0,V.__hasExternalTextures&&(V.__autoAllocateDepthBuffer=k===void 0,V.__autoAllocateDepthBuffer||Y.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),V.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(S,N){let k=xe.get(S);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(S,N=0,k=0){A=S,D=N,R=k;let V=!0,z=null,ve=!1,De=!1;if(S){let He=xe.get(S);He.__useDefaultFramebuffer!==void 0?(j.bindFramebuffer(P.FRAMEBUFFER,null),V=!1):He.__webglFramebuffer===void 0?b.setupRenderTarget(S):He.__hasExternalTextures&&b.rebindTextures(S,xe.get(S.texture).__webglTexture,xe.get(S.depthTexture).__webglTexture);let Ke=S.texture;(Ke.isData3DTexture||Ke.isDataArrayTexture||Ke.isCompressedArrayTexture)&&(De=!0);let Xe=xe.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Xe[N])?z=Xe[N][k]:z=Xe[N],ve=!0):ae.isWebGL2&&S.samples>0&&b.useMultisampledRTT(S)===!1?z=xe.get(S).__webglMultisampledFramebuffer:Array.isArray(Xe)?z=Xe[k]:z=Xe,T.copy(S.viewport),B.copy(S.scissor),q=S.scissorTest}else T.copy(te).multiplyScalar(J).floor(),B.copy(ie).multiplyScalar(J).floor(),q=ge;if(j.bindFramebuffer(P.FRAMEBUFFER,z)&&ae.drawBuffers&&V&&j.drawBuffers(S,z),j.viewport(T),j.scissor(B),j.setScissorTest(q),ve){let He=xe.get(S.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+N,He.__webglTexture,k)}else if(De){let He=xe.get(S.texture),Ke=N||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,He.__webglTexture,k||0,Ke)}H=-1},this.readRenderTargetPixels=function(S,N,k,V,z,ve,De){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Fe=xe.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&De!==void 0&&(Fe=Fe[De]),Fe){j.bindFramebuffer(P.FRAMEBUFFER,Fe);try{let He=S.texture,Ke=He.format,Xe=He.type;if(Ke!==bn&&le.convert(Ke)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}let Ye=Xe===Us&&(Y.has("EXT_color_buffer_half_float")||ae.isWebGL2&&Y.has("EXT_color_buffer_float"));if(Xe!==ti&&le.convert(Xe)!==P.getParameter(P.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Xe===$n&&(ae.isWebGL2||Y.has("OES_texture_float")||Y.has("WEBGL_color_buffer_float")))&&!Ye){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=S.width-V&&k>=0&&k<=S.height-z&&P.readPixels(N,k,V,z,le.convert(Ke),le.convert(Xe),ve)}finally{let He=A!==null?xe.get(A).__webglFramebuffer:null;j.bindFramebuffer(P.FRAMEBUFFER,He)}}},this.copyFramebufferToTexture=function(S,N,k=0){let V=Math.pow(2,-k),z=Math.floor(N.image.width*V),ve=Math.floor(N.image.height*V);b.setTexture2D(N,0),P.copyTexSubImage2D(P.TEXTURE_2D,k,0,0,S.x,S.y,z,ve),j.unbindTexture()},this.copyTextureToTexture=function(S,N,k,V=0){let z=N.image.width,ve=N.image.height,De=le.convert(k.format),Fe=le.convert(k.type);b.setTexture2D(k,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment),N.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,V,S.x,S.y,z,ve,De,Fe,N.image.data):N.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,V,S.x,S.y,N.mipmaps[0].width,N.mipmaps[0].height,De,N.mipmaps[0].data):P.texSubImage2D(P.TEXTURE_2D,V,S.x,S.y,De,Fe,N.image),V===0&&k.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),j.unbindTexture()},this.copyTextureToTexture3D=function(S,N,k,V,z=0){if(x.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}let ve=S.max.x-S.min.x+1,De=S.max.y-S.min.y+1,Fe=S.max.z-S.min.z+1,He=le.convert(V.format),Ke=le.convert(V.type),Xe;if(V.isData3DTexture)b.setTexture3D(V,0),Xe=P.TEXTURE_3D;else if(V.isDataArrayTexture||V.isCompressedArrayTexture)b.setTexture2DArray(V,0),Xe=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,V.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,V.unpackAlignment);let Ye=P.getParameter(P.UNPACK_ROW_LENGTH),xt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),$t=P.getParameter(P.UNPACK_SKIP_PIXELS),Tt=P.getParameter(P.UNPACK_SKIP_ROWS),Cn=P.getParameter(P.UNPACK_SKIP_IMAGES),pt=k.isCompressedTexture?k.mipmaps[z]:k.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,pt.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,pt.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,S.min.x),P.pixelStorei(P.UNPACK_SKIP_ROWS,S.min.y),P.pixelStorei(P.UNPACK_SKIP_IMAGES,S.min.z),k.isDataTexture||k.isData3DTexture?P.texSubImage3D(Xe,z,N.x,N.y,N.z,ve,De,Fe,He,Ke,pt.data):k.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),P.compressedTexSubImage3D(Xe,z,N.x,N.y,N.z,ve,De,Fe,He,pt.data)):P.texSubImage3D(Xe,z,N.x,N.y,N.z,ve,De,Fe,He,Ke,pt),P.pixelStorei(P.UNPACK_ROW_LENGTH,Ye),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,xt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,$t),P.pixelStorei(P.UNPACK_SKIP_ROWS,Tt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Cn),z===0&&V.generateMipmaps&&P.generateMipmap(Xe),j.unbindTexture()},this.initTexture=function(S){S.isCubeTexture?b.setTextureCube(S,0):S.isData3DTexture?b.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?b.setTexture2DArray(S,0):b.setTexture2D(S,0),j.unbindTexture()},this.resetState=function(){D=0,R=0,A=null,j.reset(),Ce.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=e===_l?"display-p3":"srgb",t.unpackColorSpace=ot.workingColorSpace===va?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===yt?vi:Wu}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===vi?yt:Fn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}},jo=class extends Fs{};jo.prototype.isWebGL1Renderer=!0;var ra=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new We(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},aa=class extends Pt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}};var cs=class extends si{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new We(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Mu=new L,Su=new L,Eu=new Ze,bo=new as,Ur=new ii,Zo=class extends Pt{constructor(e=new Ot,t=new cs){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Mu.fromBufferAttribute(t,s-1),Su.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Mu.distanceTo(Su);e.setAttribute("lineDistance",new lt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ur.copy(n.boundingSphere),Ur.applyMatrix4(s),Ur.radius+=r,e.ray.intersectsSphere(Ur)===!1)return;Eu.copy(s).invert(),bo.copy(e.ray).applyMatrix4(Eu);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=new L,u=new L,h=new L,d=new L,f=this.isLineSegments?2:1,g=n.index,m=n.attributes.position;if(g!==null){let p=Math.max(0,o.start),E=Math.min(g.count,o.start+o.count);for(let x=p,w=E-1;x<w;x+=f){let D=g.getX(x),R=g.getX(x+1);if(c.fromBufferAttribute(m,D),u.fromBufferAttribute(m,R),bo.distanceSqToSegment(c,u,d,h)>l)continue;d.applyMatrix4(this.matrixWorld);let H=e.ray.origin.distanceTo(d);H<e.near||H>e.far||t.push({distance:H,point:h.clone().applyMatrix4(this.matrixWorld),index:x,face:null,faceIndex:null,object:this})}}else{let p=Math.max(0,o.start),E=Math.min(m.count,o.start+o.count);for(let x=p,w=E-1;x<w;x+=f){if(c.fromBufferAttribute(m,x),u.fromBufferAttribute(m,x+1),bo.distanceSqToSegment(c,u,d,h)>l)continue;d.applyMatrix4(this.matrixWorld);let R=e.ray.origin.distanceTo(d);R<e.near||R>e.far||t.push({distance:R,point:h.clone().applyMatrix4(this.matrixWorld),index:x,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}},wu=new L,Tu=new L,Bs=class extends Zo{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)wu.fromBufferAttribute(t,s),Tu.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+wu.distanceTo(Tu);e.setAttribute("lineDistance",new lt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var zs=class extends ln{constructor(e,t,n,s,r,o,a,l,c){super(e,t,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},hn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let u=n[s],d=n[s+1]-u,f=(o-u)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new oe:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){let n=new L,s=[],r=[],o=[],a=new L,l=new Ze;for(let f=0;f<=e;f++){let g=f/e;s[f]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let c=Number.MAX_VALUE,u=Math.abs(s[0].x),h=Math.abs(s[0].y),d=Math.abs(s[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(Rt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Rt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ks=class extends hn{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){let n=t||new oe,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*u-f*h+this.aX,c=d*h+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Jo=class extends ks{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function vl(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,u,h){let d=(o-r)/c-(a-r)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,f*=u,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var Nr=new L,Mo=new vl,So=new vl,Eo=new vl,Hs=class extends hn{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new L){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,u;this.closed||a>0?c=s[(a-1)%r]:(Nr.subVectors(s[0],s[1]).add(s[0]),c=Nr);let h=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(Nr.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=Nr),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(h),f),_=Math.pow(h.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Mo.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,_,m),So.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,_,m),Eo.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(Mo.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),So.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Eo.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Mo.calc(l),So.calc(l),Eo.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Au(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function Zg(i,e){let t=1-i;return t*t*e}function Jg(i,e){return 2*(1-i)*i*e}function Kg(i,e){return i*i*e}function Ps(i,e,t,n){return Zg(i,e)+Jg(i,t)+Kg(i,n)}function $g(i,e){let t=1-i;return t*t*t*e}function Qg(i,e){let t=1-i;return 3*t*t*i*e}function e_(i,e){return 3*(1-i)*i*i*e}function t_(i,e){return i*i*i*e}function Ls(i,e,t,n,s){return $g(i,e)+Qg(i,t)+e_(i,n)+t_(i,s)}var oa=class extends hn{constructor(e=new oe,t=new oe,n=new oe,s=new oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new oe){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ls(e,s.x,r.x,o.x,a.x),Ls(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ko=class extends hn{constructor(e=new L,t=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new L){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ls(e,s.x,r.x,o.x,a.x),Ls(e,s.y,r.y,o.y,a.y),Ls(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},la=class extends hn{constructor(e=new oe,t=new oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new oe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},$o=class extends hn{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ca=class extends hn{constructor(e=new oe,t=new oe,n=new oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new oe){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Ps(e,s.x,r.x,o.x),Ps(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ua=class extends hn{constructor(e=new L,t=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new L){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Ps(e,s.x,r.x,o.x),Ps(e,s.y,r.y,o.y),Ps(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ha=class extends hn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new oe){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],u=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return n.set(Au(a,l.x,c.x,u.x,h.x),Au(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new oe().fromArray(s))}return this}},da=Object.freeze({__proto__:null,ArcCurve:Jo,CatmullRomCurve3:Hs,CubicBezierCurve:oa,CubicBezierCurve3:Ko,EllipseCurve:ks,LineCurve:la,LineCurve3:$o,QuadraticBezierCurve:ca,QuadraticBezierCurve3:ua,SplineCurve:ha}),Qo=class extends hn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new da[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new da[s.type]().fromJSON(s))}return this}},us=class extends Qo{constructor(e){super(),this.type="Path",this.currentPoint=new oe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new la(this.currentPoint.clone(),new oe(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new ca(this.currentPoint.clone(),new oe(e,t),new oe(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new oa(this.currentPoint.clone(),new oe(e,t),new oe(n,s),new oe(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new ha(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new ks(e,t,n,s,r,o,a,l);if(this.curves.length>0){let h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);let u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}};var fa=class i extends Ot{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],c=new L,u=new oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){let f=n+h/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new lt(o,3)),this.setAttribute("normal",new lt(a,3)),this.setAttribute("uv",new lt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Vs=class i extends Ot{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],h=[],d=[],f=[],g=0,_=[],m=n/2,p=0;E(),o===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(u),this.setAttribute("position",new lt(h,3)),this.setAttribute("normal",new lt(d,3)),this.setAttribute("uv",new lt(f,2));function E(){let w=new L,D=new L,R=0,A=(t-e)/n;for(let H=0;H<=r;H++){let M=[],T=H/r,B=T*(t-e)+e;for(let q=0;q<=s;q++){let re=q/s,U=re*l+a,F=Math.sin(U),G=Math.cos(U);D.x=B*F,D.y=-T*n+m,D.z=B*G,h.push(D.x,D.y,D.z),w.set(F,A,G).normalize(),d.push(w.x,w.y,w.z),f.push(re,1-T),M.push(g++)}_.push(M)}for(let H=0;H<s;H++)for(let M=0;M<r;M++){let T=_[M][H],B=_[M+1][H],q=_[M+1][H+1],re=_[M][H+1];u.push(T,B,re),u.push(B,q,re),R+=6}c.addGroup(p,R,0),p+=R}function x(w){let D=g,R=new oe,A=new L,H=0,M=w===!0?e:t,T=w===!0?1:-1;for(let q=1;q<=s;q++)h.push(0,m*T,0),d.push(0,T,0),f.push(.5,.5),g++;let B=g;for(let q=0;q<=s;q++){let U=q/s*l+a,F=Math.cos(U),G=Math.sin(U);A.x=M*G,A.y=m*T,A.z=M*F,h.push(A.x,A.y,A.z),d.push(0,T,0),R.x=F*.5+.5,R.y=G*.5*T+.5,f.push(R.x,R.y),g++}for(let q=0;q<s;q++){let re=D+q,U=B+q;w===!0?u.push(U,U+1,re):u.push(U+1,U,re),H+=3}c.addGroup(p,H,w===!0?1:2),p+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Gs=class i extends Vs{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}};var Ws=class extends us{constructor(e){super(e),this.uuid=Ai(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new us().fromJSON(s))}return this}},n_={triangulate:function(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=nh(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c,u,h,d,f;if(n&&(r=o_(i,e,r,t)),i.length>80*t){a=c=i[0],l=u=i[1];for(let g=t;g<s;g+=t)h=i[g],d=i[g+1],h<a&&(a=h),d<l&&(l=d),h>c&&(c=h),d>u&&(u=d);f=Math.max(c-a,u-l),f=f!==0?32767/f:0}return Xs(r,o,t,a,l,f,0),o}};function nh(i,e,t,n,s){let r,o;if(s===x_(i,e,t,n)>0)for(r=e;r<t;r+=n)o=Ru(r,i[r],i[r+1],o);else for(r=t-n;r>=e;r-=n)o=Ru(r,i[r],i[r+1],o);return o&&Ma(o,o.next)&&(Ys(o),o=o.next),o}function Mi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Ma(t,t.next)||mt(t.prev,t,t.next)===0)){if(Ys(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Xs(i,e,t,n,s,r,o){if(!i)return;!o&&r&&d_(i,n,s,r);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,r?s_(i,n,s,r):i_(i)){e.push(l.i/t|0),e.push(i.i/t|0),e.push(c.i/t|0),Ys(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=r_(Mi(i),e,t),Xs(i,e,t,n,s,r,2)):o===2&&a_(i,e,t,n,s,r):Xs(Mi(i),e,t,n,s,r,1);break}}}function i_(i){let e=i.prev,t=i,n=i.next;if(mt(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,u=s<r?s<o?s:o:r<o?r:o,h=a<l?a<c?a:c:l<c?l:c,d=s>r?s>o?s:o:r>o?r:o,f=a>l?a>c?a:c:l>c?l:c,g=n.next;for(;g!==e;){if(g.x>=u&&g.x<=d&&g.y>=h&&g.y<=f&&Qi(s,a,r,l,o,c,g.x,g.y)&&mt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function s_(i,e,t,n){let s=i.prev,r=i,o=i.next;if(mt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,u=s.y,h=r.y,d=o.y,f=a<l?a<c?a:c:l<c?l:c,g=u<h?u<d?u:d:h<d?h:d,_=a>l?a>c?a:c:l>c?l:c,m=u>h?u>d?u:d:h>d?h:d,p=el(f,g,e,t,n),E=el(_,m,e,t,n),x=i.prevZ,w=i.nextZ;for(;x&&x.z>=p&&w&&w.z<=E;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==s&&x!==o&&Qi(a,u,l,h,c,d,x.x,x.y)&&mt(x.prev,x,x.next)>=0||(x=x.prevZ,w.x>=f&&w.x<=_&&w.y>=g&&w.y<=m&&w!==s&&w!==o&&Qi(a,u,l,h,c,d,w.x,w.y)&&mt(w.prev,w,w.next)>=0))return!1;w=w.nextZ}for(;x&&x.z>=p;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==s&&x!==o&&Qi(a,u,l,h,c,d,x.x,x.y)&&mt(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;w&&w.z<=E;){if(w.x>=f&&w.x<=_&&w.y>=g&&w.y<=m&&w!==s&&w!==o&&Qi(a,u,l,h,c,d,w.x,w.y)&&mt(w.prev,w,w.next)>=0)return!1;w=w.nextZ}return!0}function r_(i,e,t){let n=i;do{let s=n.prev,r=n.next.next;!Ma(s,r)&&ih(s,n,n.next,r)&&qs(s,r)&&qs(r,s)&&(e.push(s.i/t|0),e.push(n.i/t|0),e.push(r.i/t|0),Ys(n),Ys(n.next),n=i=r),n=n.next}while(n!==i);return Mi(n)}function a_(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&m_(o,a)){let l=sh(o,a);o=Mi(o,o.next),l=Mi(l,l.next),Xs(o,e,t,n,s,r,0),Xs(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function o_(i,e,t,n){let s=[],r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=nh(i,a,l,n,!1),c===c.next&&(c.steiner=!0),s.push(p_(c));for(s.sort(l_),r=0;r<s.length;r++)t=c_(s[r],t);return t}function l_(i,e){return i.x-e.x}function c_(i,e){let t=u_(i,e);if(!t)return e;let n=sh(t,i);return Mi(n,n.next),Mi(t,t.next)}function u_(i,e){let t=e,n=-1/0,s,r=i.x,o=i.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){let d=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=r&&d>n&&(n=d,s=t.x<t.next.x?t:t.next,d===r))return s}t=t.next}while(t!==e);if(!s)return null;let a=s,l=s.x,c=s.y,u=1/0,h;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&Qi(o<c?r:n,o,l,c,o<c?n:r,o,t.x,t.y)&&(h=Math.abs(o-t.y)/(r-t.x),qs(t,i)&&(h<u||h===u&&(t.x>s.x||t.x===s.x&&h_(s,t)))&&(s=t,u=h)),t=t.next;while(t!==a);return s}function h_(i,e){return mt(i.prev,i,e.prev)<0&&mt(e.next,i,i.next)<0}function d_(i,e,t,n){let s=i;do s.z===0&&(s.z=el(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,f_(s)}function f_(i){let e,t,n,s,r,o,a,l,c=1;do{for(t=i,i=null,r=null,o=0;t;){for(o++,n=t,a=0,e=0;e<c&&(a++,n=n.nextZ,!!n);e++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||t.z<=n.z)?(s=t,t=t.nextZ,a--):(s=n,n=n.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;t=n}r.nextZ=null,c*=2}while(o>1);return i}function el(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function p_(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Qi(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function m_(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!g_(i,e)&&(qs(i,e)&&qs(e,i)&&__(i,e)&&(mt(i.prev,i,e.prev)||mt(i,e.prev,e))||Ma(i,e)&&mt(i.prev,i,i.next)>0&&mt(e.prev,e,e.next)>0)}function mt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Ma(i,e){return i.x===e.x&&i.y===e.y}function ih(i,e,t,n){let s=Fr(mt(i,e,t)),r=Fr(mt(i,e,n)),o=Fr(mt(t,n,i)),a=Fr(mt(t,n,e));return!!(s!==r&&o!==a||s===0&&Or(i,t,e)||r===0&&Or(i,n,e)||o===0&&Or(t,i,n)||a===0&&Or(t,e,n))}function Or(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Fr(i){return i>0?1:i<0?-1:0}function g_(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&ih(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function qs(i,e){return mt(i.prev,i,i.next)<0?mt(i,e,i.next)>=0&&mt(i,i.prev,e)>=0:mt(i,e,i.prev)<0||mt(i,i.next,e)<0}function __(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function sh(i,e){let t=new tl(i.i,i.x,i.y),n=new tl(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Ru(i,e,t,n){let s=new tl(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Ys(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function tl(i,e,t){this.i=i,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function x_(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Is=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Cu(e),Pu(n,e);let o=e.length;t.forEach(Cu);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Pu(n,t[l]);let a=n_.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Cu(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Pu(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var js=class i extends Ot{constructor(e=new Ws([new oe(.5,.5),new oe(-.5,.5),new oe(-.5,-.5),new oe(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){let c=e[a];o(c)}this.setAttribute("position",new lt(s,3)),this.setAttribute("uv",new lt(r,2)),this.computeVertexNormals();function o(a){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,h=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,E=t.UVGenerator!==void 0?t.UVGenerator:y_,x,w=!1,D,R,A,H;p&&(x=p.getSpacedPoints(u),w=!0,d=!1,D=p.computeFrenetFrames(u,!1),R=new L,A=new L,H=new L),d||(m=0,f=0,g=0,_=0);let M=a.extractPoints(c),T=M.shape,B=M.holes;if(!Is.isClockWise(T)){T=T.reverse();for(let P=0,ce=B.length;P<ce;P++){let Y=B[P];Is.isClockWise(Y)&&(B[P]=Y.reverse())}}let re=Is.triangulateShape(T,B),U=T;for(let P=0,ce=B.length;P<ce;P++){let Y=B[P];T=T.concat(Y)}function F(P,ce,Y){return ce||console.error("THREE.ExtrudeGeometry: vec does not exist"),P.clone().addScaledVector(ce,Y)}let G=T.length,J=re.length;function Z(P,ce,Y){let ae,j,Re,xe=P.x-ce.x,b=P.y-ce.y,v=Y.x-P.x,O=Y.y-P.y,se=xe*xe+b*b,$=xe*O-b*v;if(Math.abs($)>Number.EPSILON){let K=Math.sqrt(se),Se=Math.sqrt(v*v+O*O),me=ce.x-b/K,ye=ce.y+xe/K,Ue=Y.x-O/Se,Ge=Y.y+v/Se,Q=((Ue-me)*O-(Ge-ye)*v)/(xe*O-b*v);ae=me+xe*Q-P.x,j=ye+b*Q-P.y;let $e=ae*ae+j*j;if($e<=2)return new oe(ae,j);Re=Math.sqrt($e/2)}else{let K=!1;xe>Number.EPSILON?v>Number.EPSILON&&(K=!0):xe<-Number.EPSILON?v<-Number.EPSILON&&(K=!0):Math.sign(b)===Math.sign(O)&&(K=!0),K?(ae=-b,j=xe,Re=Math.sqrt(se)):(ae=xe,j=b,Re=Math.sqrt(se/2))}return new oe(ae/Re,j/Re)}let X=[];for(let P=0,ce=U.length,Y=ce-1,ae=P+1;P<ce;P++,Y++,ae++)Y===ce&&(Y=0),ae===ce&&(ae=0),X[P]=Z(U[P],U[Y],U[ae]);let te=[],ie,ge=X.concat();for(let P=0,ce=B.length;P<ce;P++){let Y=B[P];ie=[];for(let ae=0,j=Y.length,Re=j-1,xe=ae+1;ae<j;ae++,Re++,xe++)Re===j&&(Re=0),xe===j&&(xe=0),ie[ae]=Z(Y[ae],Y[Re],Y[xe]);te.push(ie),ge=ge.concat(ie)}for(let P=0;P<m;P++){let ce=P/m,Y=f*Math.cos(ce*Math.PI/2),ae=g*Math.sin(ce*Math.PI/2)+_;for(let j=0,Re=U.length;j<Re;j++){let xe=F(U[j],X[j],ae);be(xe.x,xe.y,-Y)}for(let j=0,Re=B.length;j<Re;j++){let xe=B[j];ie=te[j];for(let b=0,v=xe.length;b<v;b++){let O=F(xe[b],ie[b],ae);be(O.x,O.y,-Y)}}}let W=g+_;for(let P=0;P<G;P++){let ce=d?F(T[P],ge[P],W):T[P];w?(A.copy(D.normals[0]).multiplyScalar(ce.x),R.copy(D.binormals[0]).multiplyScalar(ce.y),H.copy(x[0]).add(A).add(R),be(H.x,H.y,H.z)):be(ce.x,ce.y,0)}for(let P=1;P<=u;P++)for(let ce=0;ce<G;ce++){let Y=d?F(T[ce],ge[ce],W):T[ce];w?(A.copy(D.normals[P]).multiplyScalar(Y.x),R.copy(D.binormals[P]).multiplyScalar(Y.y),H.copy(x[P]).add(A).add(R),be(H.x,H.y,H.z)):be(Y.x,Y.y,h/u*P)}for(let P=m-1;P>=0;P--){let ce=P/m,Y=f*Math.cos(ce*Math.PI/2),ae=g*Math.sin(ce*Math.PI/2)+_;for(let j=0,Re=U.length;j<Re;j++){let xe=F(U[j],X[j],ae);be(xe.x,xe.y,h+Y)}for(let j=0,Re=B.length;j<Re;j++){let xe=B[j];ie=te[j];for(let b=0,v=xe.length;b<v;b++){let O=F(xe[b],ie[b],ae);w?be(O.x,O.y+x[u-1].y,x[u-1].x+Y):be(O.x,O.y,h+Y)}}}ne(),_e();function ne(){let P=s.length/3;if(d){let ce=0,Y=G*ce;for(let ae=0;ae<J;ae++){let j=re[ae];Oe(j[2]+Y,j[1]+Y,j[0]+Y)}ce=u+m*2,Y=G*ce;for(let ae=0;ae<J;ae++){let j=re[ae];Oe(j[0]+Y,j[1]+Y,j[2]+Y)}}else{for(let ce=0;ce<J;ce++){let Y=re[ce];Oe(Y[2],Y[1],Y[0])}for(let ce=0;ce<J;ce++){let Y=re[ce];Oe(Y[0]+G*u,Y[1]+G*u,Y[2]+G*u)}}n.addGroup(P,s.length/3-P,0)}function _e(){let P=s.length/3,ce=0;Ae(U,ce),ce+=U.length;for(let Y=0,ae=B.length;Y<ae;Y++){let j=B[Y];Ae(j,ce),ce+=j.length}n.addGroup(P,s.length/3-P,1)}function Ae(P,ce){let Y=P.length;for(;--Y>=0;){let ae=Y,j=Y-1;j<0&&(j=P.length-1);for(let Re=0,xe=u+m*2;Re<xe;Re++){let b=G*Re,v=G*(Re+1),O=ce+ae+b,se=ce+j+b,$=ce+j+v,K=ce+ae+v;ze(O,se,$,K)}}}function be(P,ce,Y){l.push(P),l.push(ce),l.push(Y)}function Oe(P,ce,Y){Te(P),Te(ce),Te(Y);let ae=s.length/3,j=E.generateTopUV(n,s,ae-3,ae-2,ae-1);ke(j[0]),ke(j[1]),ke(j[2])}function ze(P,ce,Y,ae){Te(P),Te(ce),Te(ae),Te(ce),Te(Y),Te(ae);let j=s.length/3,Re=E.generateSideWallUV(n,s,j-6,j-3,j-2,j-1);ke(Re[0]),ke(Re[1]),ke(Re[3]),ke(Re[1]),ke(Re[2]),ke(Re[3])}function Te(P){s.push(l[P*3+0]),s.push(l[P*3+1]),s.push(l[P*3+2])}function ke(P){r.push(P.x),r.push(P.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return v_(t,n,e)}static fromJSON(e,t){let n=[];for(let r=0,o=e.shapes.length;r<o;r++){let a=t[e.shapes[r]];n.push(a)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new da[s.type]().fromJSON(s)),new i(n,e.options)}},y_={generateTopUV:function(i,e,t,n,s){let r=e[t*3],o=e[t*3+1],a=e[n*3],l=e[n*3+1],c=e[s*3],u=e[s*3+1];return[new oe(r,o),new oe(a,l),new oe(c,u)]},generateSideWallUV:function(i,e,t,n,s,r){let o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[n*3],u=e[n*3+1],h=e[n*3+2],d=e[s*3],f=e[s*3+1],g=e[s*3+2],_=e[r*3],m=e[r*3+1],p=e[r*3+2];return Math.abs(a-u)<Math.abs(o-c)?[new oe(o,1-l),new oe(c,1-h),new oe(d,1-g),new oe(_,1-p)]:[new oe(a,1-l),new oe(u,1-h),new oe(f,1-g),new oe(m,1-p)]}};function v_(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var pa=class i extends Ot{constructor(e=new ua(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new L,l=new L,c=new oe,u=new L,h=[],d=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new lt(h,3)),this.setAttribute("normal",new lt(d,3)),this.setAttribute("uv",new lt(f,2));function _(){for(let x=0;x<t;x++)m(x);m(r===!1?t:0),E(),p()}function m(x){u=e.getPointAt(x/t,u);let w=o.normals[x],D=o.binormals[x];for(let R=0;R<=s;R++){let A=R/s*Math.PI*2,H=Math.sin(A),M=-Math.cos(A);l.x=M*w.x+H*D.x,l.y=M*w.y+H*D.y,l.z=M*w.z+H*D.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=u.x+n*l.x,a.y=u.y+n*l.y,a.z=u.z+n*l.z,h.push(a.x,a.y,a.z)}}function p(){for(let x=1;x<=t;x++)for(let w=1;w<=s;w++){let D=(s+1)*(x-1)+(w-1),R=(s+1)*x+(w-1),A=(s+1)*x+w,H=(s+1)*(x-1)+w;g.push(D,R,H),g.push(R,A,H)}}function E(){for(let x=0;x<=t;x++)for(let w=0;w<=s;w++)c.x=x/t,c.y=w/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new da[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}};var Zs=class extends si{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new We(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new We(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xu,this.normalScale=new oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function Br(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function b_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var hs=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},nl=class extends hs{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ic,endingEnd:Ic}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Dc:r=e,a=2*t-n;break;case Uc:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Dc:o=e,l=2*n-t;break;case Uc:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,h=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,E=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,x=(-1-f)*m+(1.5+f)*_+.5*g,w=f*m-f*_;for(let D=0;D!==a;++D)r[D]=p*o[u+D]+E*o[c+D]+x*o[l+D]+w*o[h+D];return r}},il=class extends hs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(s-t),h=1-u;for(let d=0;d!==a;++d)r[d]=o[c+d]*h+o[l+d]*u;return r}},sl=class extends hs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Mn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Br(t,this.TimeBufferType),this.values=Br(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Br(e.times,Array),values:Br(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new sl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new il(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new nl(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case kr:t=this.InterpolantFactoryMethodDiscrete;break;case Hr:t=this.InterpolantFactoryMethodLinear;break;case Ka:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return kr;case this.InterpolantFactoryMethodLinear:return Hr;case this.InterpolantFactoryMethodSmooth:return Ka}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&b_(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Ka,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(s)l=!0;else{let h=a*n,d=h-n,f=h+n;for(let g=0;g!==n;++g){let _=t[h+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let h=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[h+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};Mn.prototype.TimeBufferType=Float32Array;Mn.prototype.ValueBufferType=Float32Array;Mn.prototype.DefaultInterpolation=Hr;var Si=class extends Mn{};Si.prototype.ValueTypeName="bool";Si.prototype.ValueBufferType=Array;Si.prototype.DefaultInterpolation=kr;Si.prototype.InterpolantFactoryMethodLinear=void 0;Si.prototype.InterpolantFactoryMethodSmooth=void 0;var rl=class extends Mn{};rl.prototype.ValueTypeName="color";var al=class extends Mn{};al.prototype.ValueTypeName="number";var ol=class extends hs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let u=c+a;c!==u;c+=4)ft.slerpFlat(r,0,o,c-a,o,c,l);return r}},Js=class extends Mn{InterpolantFactoryMethodLinear(e){return new ol(this.times,this.values,this.getValueSize(),e)}};Js.prototype.ValueTypeName="quaternion";Js.prototype.DefaultInterpolation=Hr;Js.prototype.InterpolantFactoryMethodSmooth=void 0;var Ei=class extends Mn{};Ei.prototype.ValueTypeName="string";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=kr;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;var ll=class extends Mn{};ll.prototype.ValueTypeName="vector";var cl=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,h){return c.push(u,h),this},this.removeHandler=function(u){let h=c.indexOf(u);return h!==-1&&c.splice(h,2),this},this.getHandler=function(u){for(let h=0,d=c.length;h<d;h+=2){let f=c[h],g=c[h+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}},M_=new cl,ul=class{constructor(e){this.manager=e!==void 0?e:M_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};ul.DEFAULT_MATERIAL_NAME="__DEFAULT";var ma=class extends Pt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new We(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}},ga=class extends ma{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Pt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new We(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},wo=new Ze,Lu=new L,Iu=new L,hl=class{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new oe(512,512),this.map=null,this.mapPass=null,this.matrix=new Ze,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Os,this._frameExtents=new oe(1,1),this._viewportCount=1,this._viewports=[new Ct(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Lu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Lu),Iu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Iu),t.updateMatrixWorld(),wo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(wo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var dl=class extends hl{constructor(){super(new na(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ks=class extends ma{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Pt.DEFAULT_UP),this.updateMatrix(),this.target=new Pt,this.shadow=new dl}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var _a=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Du(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=Du();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function Du(){return(typeof performance>"u"?Date:performance).now()}var bl="\\[\\]\\.:\\/",S_=new RegExp("["+bl+"]","g"),Ml="[^"+bl+"]",E_="[^"+bl.replace("\\.","")+"]",w_=/((?:WC+[\/:])*)/.source.replace("WC",Ml),T_=/(WCOD+)?/.source.replace("WCOD",E_),A_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ml),R_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ml),C_=new RegExp("^"+w_+T_+A_+R_+"$"),P_=["material","materials","bones","map"],fl=class{constructor(e,t,n){let s=n||dt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},dt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(S_,"")}static parseTrackName(e){let t=C_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);P_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};dt.Composite=fl;dt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};dt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};dt.prototype.GetterByBindingType=[dt.prototype._getValue_direct,dt.prototype._getValue_array,dt.prototype._getValue_arrayElement,dt.prototype._getValue_toArray];dt.prototype.SetterByBindingTypeAndVersioning=[[dt.prototype._setValue_direct,dt.prototype._setValue_direct_setNeedsUpdate,dt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_array,dt.prototype._setValue_array_setNeedsUpdate,dt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_arrayElement,dt.prototype._setValue_arrayElement_setNeedsUpdate,dt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[dt.prototype._setValue_fromArray,dt.prototype._setValue_fromArray_setNeedsUpdate,dt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var _x=new Float32Array(1);var $s=class{constructor(e=1,t=0,n=0){return this.radius=e,this.phi=t,this.theta=n,this}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(Rt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var xa=class extends Bs{constructor(e=10,t=10,n=4473924,s=8947848){n=new We(n),s=new We(s);let r=t/2,o=e/t,a=e/2,l=[],c=[];for(let d=0,f=0,g=-a;d<=t;d++,g+=o){l.push(-a,0,g,a,0,g),l.push(g,0,-a,g,0,a);let _=d===r?n:s;_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3,_.toArray(c,f),f+=3}let u=new Ot;u.setAttribute("position",new lt(l,3)),u.setAttribute("color",new lt(c,3));let h=new cs({vertexColors:!0,toneMapped:!1});super(u,h),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"160"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="160");var rh={type:"change"},Sl={type:"start"},ah={type:"end"},Sa=new as,oh=new xn,I_=Math.cos(70*Qs.DEG2RAD),Ea=class extends An{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new L,this.cursor=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:wi.ROTATE,MIDDLE:wi.DOLLY,RIGHT:wi.PAN},this.touches={ONE:Ti.ROTATE,TWO:Ti.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return a.phi},this.getAzimuthalAngle=function(){return a.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(C){C.addEventListener("keydown",K),this._domElementKeyEvents=C},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",K),this._domElementKeyEvents=null},this.saveState=function(){n.target0.copy(n.target),n.position0.copy(n.object.position),n.zoom0=n.object.zoom},this.reset=function(){n.target.copy(n.target0),n.object.position.copy(n.position0),n.object.zoom=n.zoom0,n.object.updateProjectionMatrix(),n.dispatchEvent(rh),n.update(),r=s.NONE},this.update=(function(){let C=new L,ee=new ft().setFromUnitVectors(e.up,new L(0,1,0)),fe=ee.clone().invert(),le=new L,Ce=new ft,Qe=new L,nt=2*Math.PI;return function(de=null){let I=n.object.position;C.copy(I).sub(n.target),C.applyQuaternion(ee),a.setFromVector3(C),n.autoRotate&&r===s.NONE&&B(M(de)),n.enableDamping?(a.theta+=l.theta*n.dampingFactor,a.phi+=l.phi*n.dampingFactor):(a.theta+=l.theta,a.phi+=l.phi);let ue=n.minAzimuthAngle,he=n.maxAzimuthAngle;isFinite(ue)&&isFinite(he)&&(ue<-Math.PI?ue+=nt:ue>Math.PI&&(ue-=nt),he<-Math.PI?he+=nt:he>Math.PI&&(he-=nt),ue<=he?a.theta=Math.max(ue,Math.min(he,a.theta)):a.theta=a.theta>(ue+he)/2?Math.max(ue,a.theta):Math.min(he,a.theta)),a.phi=Math.max(n.minPolarAngle,Math.min(n.maxPolarAngle,a.phi)),a.makeSafe(),n.enableDamping===!0?n.target.addScaledVector(u,n.dampingFactor):n.target.add(u),n.target.sub(n.cursor),n.target.clampLength(n.minTargetRadius,n.maxTargetRadius),n.target.add(n.cursor),n.zoomToCursor&&R||n.object.isOrthographicCamera?a.radius=X(a.radius):a.radius=X(a.radius*c),C.setFromSpherical(a),C.applyQuaternion(fe),I.copy(n.target).add(C),n.object.lookAt(n.target),n.enableDamping===!0?(l.theta*=1-n.dampingFactor,l.phi*=1-n.dampingFactor,u.multiplyScalar(1-n.dampingFactor)):(l.set(0,0,0),u.set(0,0,0));let Ne=!1;if(n.zoomToCursor&&R){let Ie=null;if(n.object.isPerspectiveCamera){let it=C.length();Ie=X(it*c);let rt=it-Ie;n.object.position.addScaledVector(w,rt),n.object.updateMatrixWorld()}else if(n.object.isOrthographicCamera){let it=new L(D.x,D.y,0);it.unproject(n.object),n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),Ne=!0;let rt=new L(D.x,D.y,0);rt.unproject(n.object),n.object.position.sub(rt).add(it),n.object.updateMatrixWorld(),Ie=C.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),n.zoomToCursor=!1;Ie!==null&&(this.screenSpacePanning?n.target.set(0,0,-1).transformDirection(n.object.matrix).multiplyScalar(Ie).add(n.object.position):(Sa.origin.copy(n.object.position),Sa.direction.set(0,0,-1).transformDirection(n.object.matrix),Math.abs(n.object.up.dot(Sa.direction))<I_?e.lookAt(n.target):(oh.setFromNormalAndCoplanarPoint(n.object.up,n.target),Sa.intersectPlane(oh,n.target))))}else n.object.isOrthographicCamera&&(n.object.zoom=Math.max(n.minZoom,Math.min(n.maxZoom,n.object.zoom/c)),n.object.updateProjectionMatrix(),Ne=!0);return c=1,R=!1,Ne||le.distanceToSquared(n.object.position)>o||8*(1-Ce.dot(n.object.quaternion))>o||Qe.distanceToSquared(n.target)>0?(n.dispatchEvent(rh),le.copy(n.object.position),Ce.copy(n.object.quaternion),Qe.copy(n.target),!0):!1}})(),this.dispose=function(){n.domElement.removeEventListener("contextmenu",ye),n.domElement.removeEventListener("pointerdown",xe),n.domElement.removeEventListener("pointercancel",v),n.domElement.removeEventListener("wheel",$),n.domElement.removeEventListener("pointermove",b),n.domElement.removeEventListener("pointerup",v),n._domElementKeyEvents!==null&&(n._domElementKeyEvents.removeEventListener("keydown",K),n._domElementKeyEvents=null)};let n=this,s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},r=s.NONE,o=1e-6,a=new $s,l=new $s,c=1,u=new L,h=new oe,d=new oe,f=new oe,g=new oe,_=new oe,m=new oe,p=new oe,E=new oe,x=new oe,w=new L,D=new oe,R=!1,A=[],H={};function M(C){return C!==null?2*Math.PI/60*n.autoRotateSpeed*C:2*Math.PI/60/60*n.autoRotateSpeed}function T(C){let ee=Math.abs(C)/(100*(window.devicePixelRatio|0));return Math.pow(.95,n.zoomSpeed*ee)}function B(C){l.theta-=C}function q(C){l.phi-=C}let re=(function(){let C=new L;return function(fe,le){C.setFromMatrixColumn(le,0),C.multiplyScalar(-fe),u.add(C)}})(),U=(function(){let C=new L;return function(fe,le){n.screenSpacePanning===!0?C.setFromMatrixColumn(le,1):(C.setFromMatrixColumn(le,0),C.crossVectors(n.object.up,C)),C.multiplyScalar(fe),u.add(C)}})(),F=(function(){let C=new L;return function(fe,le){let Ce=n.domElement;if(n.object.isPerspectiveCamera){let Qe=n.object.position;C.copy(Qe).sub(n.target);let nt=C.length();nt*=Math.tan(n.object.fov/2*Math.PI/180),re(2*fe*nt/Ce.clientHeight,n.object.matrix),U(2*le*nt/Ce.clientHeight,n.object.matrix)}else n.object.isOrthographicCamera?(re(fe*(n.object.right-n.object.left)/n.object.zoom/Ce.clientWidth,n.object.matrix),U(le*(n.object.top-n.object.bottom)/n.object.zoom/Ce.clientHeight,n.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),n.enablePan=!1)}})();function G(C){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c/=C:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function J(C){n.object.isPerspectiveCamera||n.object.isOrthographicCamera?c*=C:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),n.enableZoom=!1)}function Z(C,ee){if(!n.zoomToCursor)return;R=!0;let fe=n.domElement.getBoundingClientRect(),le=C-fe.left,Ce=ee-fe.top,Qe=fe.width,nt=fe.height;D.x=le/Qe*2-1,D.y=-(Ce/nt)*2+1,w.set(D.x,D.y,1).unproject(n.object).sub(n.object.position).normalize()}function X(C){return Math.max(n.minDistance,Math.min(n.maxDistance,C))}function te(C){h.set(C.clientX,C.clientY)}function ie(C){Z(C.clientX,C.clientX),p.set(C.clientX,C.clientY)}function ge(C){g.set(C.clientX,C.clientY)}function W(C){d.set(C.clientX,C.clientY),f.subVectors(d,h).multiplyScalar(n.rotateSpeed);let ee=n.domElement;B(2*Math.PI*f.x/ee.clientHeight),q(2*Math.PI*f.y/ee.clientHeight),h.copy(d),n.update()}function ne(C){E.set(C.clientX,C.clientY),x.subVectors(E,p),x.y>0?G(T(x.y)):x.y<0&&J(T(x.y)),p.copy(E),n.update()}function _e(C){_.set(C.clientX,C.clientY),m.subVectors(_,g).multiplyScalar(n.panSpeed),F(m.x,m.y),g.copy(_),n.update()}function Ae(C){Z(C.clientX,C.clientY),C.deltaY<0?J(T(C.deltaY)):C.deltaY>0&&G(T(C.deltaY)),n.update()}function be(C){let ee=!1;switch(C.code){case n.keys.UP:C.ctrlKey||C.metaKey||C.shiftKey?q(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):F(0,n.keyPanSpeed),ee=!0;break;case n.keys.BOTTOM:C.ctrlKey||C.metaKey||C.shiftKey?q(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):F(0,-n.keyPanSpeed),ee=!0;break;case n.keys.LEFT:C.ctrlKey||C.metaKey||C.shiftKey?B(2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):F(n.keyPanSpeed,0),ee=!0;break;case n.keys.RIGHT:C.ctrlKey||C.metaKey||C.shiftKey?B(-2*Math.PI*n.rotateSpeed/n.domElement.clientHeight):F(-n.keyPanSpeed,0),ee=!0;break}ee&&(C.preventDefault(),n.update())}function Oe(C){if(A.length===1)h.set(C.pageX,C.pageY);else{let ee=$e(C),fe=.5*(C.pageX+ee.x),le=.5*(C.pageY+ee.y);h.set(fe,le)}}function ze(C){if(A.length===1)g.set(C.pageX,C.pageY);else{let ee=$e(C),fe=.5*(C.pageX+ee.x),le=.5*(C.pageY+ee.y);g.set(fe,le)}}function Te(C){let ee=$e(C),fe=C.pageX-ee.x,le=C.pageY-ee.y,Ce=Math.sqrt(fe*fe+le*le);p.set(0,Ce)}function ke(C){n.enableZoom&&Te(C),n.enablePan&&ze(C)}function P(C){n.enableZoom&&Te(C),n.enableRotate&&Oe(C)}function ce(C){if(A.length==1)d.set(C.pageX,C.pageY);else{let fe=$e(C),le=.5*(C.pageX+fe.x),Ce=.5*(C.pageY+fe.y);d.set(le,Ce)}f.subVectors(d,h).multiplyScalar(n.rotateSpeed);let ee=n.domElement;B(2*Math.PI*f.x/ee.clientHeight),q(2*Math.PI*f.y/ee.clientHeight),h.copy(d)}function Y(C){if(A.length===1)_.set(C.pageX,C.pageY);else{let ee=$e(C),fe=.5*(C.pageX+ee.x),le=.5*(C.pageY+ee.y);_.set(fe,le)}m.subVectors(_,g).multiplyScalar(n.panSpeed),F(m.x,m.y),g.copy(_)}function ae(C){let ee=$e(C),fe=C.pageX-ee.x,le=C.pageY-ee.y,Ce=Math.sqrt(fe*fe+le*le);E.set(0,Ce),x.set(0,Math.pow(E.y/p.y,n.zoomSpeed)),G(x.y),p.copy(E);let Qe=(C.pageX+ee.x)*.5,nt=(C.pageY+ee.y)*.5;Z(Qe,nt)}function j(C){n.enableZoom&&ae(C),n.enablePan&&Y(C)}function Re(C){n.enableZoom&&ae(C),n.enableRotate&&ce(C)}function xe(C){n.enabled!==!1&&(A.length===0&&(n.domElement.setPointerCapture(C.pointerId),n.domElement.addEventListener("pointermove",b),n.domElement.addEventListener("pointerup",v)),Ue(C),C.pointerType==="touch"?Se(C):O(C))}function b(C){n.enabled!==!1&&(C.pointerType==="touch"?me(C):se(C))}function v(C){Ge(C),A.length===0&&(n.domElement.releasePointerCapture(C.pointerId),n.domElement.removeEventListener("pointermove",b),n.domElement.removeEventListener("pointerup",v)),n.dispatchEvent(ah),r=s.NONE}function O(C){let ee;switch(C.button){case 0:ee=n.mouseButtons.LEFT;break;case 1:ee=n.mouseButtons.MIDDLE;break;case 2:ee=n.mouseButtons.RIGHT;break;default:ee=-1}switch(ee){case wi.DOLLY:if(n.enableZoom===!1)return;ie(C),r=s.DOLLY;break;case wi.ROTATE:if(C.ctrlKey||C.metaKey||C.shiftKey){if(n.enablePan===!1)return;ge(C),r=s.PAN}else{if(n.enableRotate===!1)return;te(C),r=s.ROTATE}break;case wi.PAN:if(C.ctrlKey||C.metaKey||C.shiftKey){if(n.enableRotate===!1)return;te(C),r=s.ROTATE}else{if(n.enablePan===!1)return;ge(C),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Sl)}function se(C){switch(r){case s.ROTATE:if(n.enableRotate===!1)return;W(C);break;case s.DOLLY:if(n.enableZoom===!1)return;ne(C);break;case s.PAN:if(n.enablePan===!1)return;_e(C);break}}function $(C){n.enabled===!1||n.enableZoom===!1||r!==s.NONE||(C.preventDefault(),n.dispatchEvent(Sl),Ae(C),n.dispatchEvent(ah))}function K(C){n.enabled===!1||n.enablePan===!1||be(C)}function Se(C){switch(Q(C),A.length){case 1:switch(n.touches.ONE){case Ti.ROTATE:if(n.enableRotate===!1)return;Oe(C),r=s.TOUCH_ROTATE;break;case Ti.PAN:if(n.enablePan===!1)return;ze(C),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(n.touches.TWO){case Ti.DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;ke(C),r=s.TOUCH_DOLLY_PAN;break;case Ti.DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;P(C),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&n.dispatchEvent(Sl)}function me(C){switch(Q(C),r){case s.TOUCH_ROTATE:if(n.enableRotate===!1)return;ce(C),n.update();break;case s.TOUCH_PAN:if(n.enablePan===!1)return;Y(C),n.update();break;case s.TOUCH_DOLLY_PAN:if(n.enableZoom===!1&&n.enablePan===!1)return;j(C),n.update();break;case s.TOUCH_DOLLY_ROTATE:if(n.enableZoom===!1&&n.enableRotate===!1)return;Re(C),n.update();break;default:r=s.NONE}}function ye(C){n.enabled!==!1&&C.preventDefault()}function Ue(C){A.push(C.pointerId)}function Ge(C){delete H[C.pointerId];for(let ee=0;ee<A.length;ee++)if(A[ee]==C.pointerId){A.splice(ee,1);return}}function Q(C){let ee=H[C.pointerId];ee===void 0&&(ee=new oe,H[C.pointerId]=ee),ee.set(C.pageX,C.pageY)}function $e(C){let ee=C.pointerId===A[0]?A[1]:A[0];return H[ee]}n.domElement.addEventListener("contextmenu",ye),n.domElement.addEventListener("pointerdown",xe),n.domElement.addEventListener("pointercancel",v),n.domElement.addEventListener("wheel",$,{passive:!1}),this.update()}};var ps=class extends Pt{constructor(e=document.createElement("div")){super(),this.isCSS2DObject=!0,this.element=e,this.element.style.position="absolute",this.element.style.userSelect="none",this.element.setAttribute("draggable",!1),this.center=new oe(.5,.5),this.addEventListener("removed",function(){this.traverse(function(t){t.element instanceof Element&&t.element.parentNode!==null&&t.element.parentNode.removeChild(t.element)})})}copy(e,t){return super.copy(e,t),this.element=e.element.cloneNode(!0),this.center=e.center,this}},fs=new L,lh=new Ze,ch=new Ze,uh=new L,hh=new L,wa=class{constructor(e={}){let t=this,n,s,r,o,a={objects:new WeakMap},l=e.element!==void 0?e.element:document.createElement("div");l.style.overflow="hidden",this.domElement=l,this.getSize=function(){return{width:n,height:s}},this.render=function(f,g){f.matrixWorldAutoUpdate===!0&&f.updateMatrixWorld(),g.parent===null&&g.matrixWorldAutoUpdate===!0&&g.updateMatrixWorld(),lh.copy(g.matrixWorldInverse),ch.multiplyMatrices(g.projectionMatrix,lh),c(f,f,g),d(f)},this.setSize=function(f,g){n=f,s=g,r=n/2,o=s/2,l.style.width=f+"px",l.style.height=g+"px"};function c(f,g,_){if(f.isCSS2DObject){fs.setFromMatrixPosition(f.matrixWorld),fs.applyMatrix4(ch);let m=f.visible===!0&&fs.z>=-1&&fs.z<=1&&f.layers.test(_.layers)===!0;if(f.element.style.display=m===!0?"":"none",m===!0){f.onBeforeRender(t,g,_);let E=f.element;E.style.transform="translate("+-100*f.center.x+"%,"+-100*f.center.y+"%)translate("+(fs.x*r+r)+"px,"+(-fs.y*o+o)+"px)",E.parentNode!==l&&l.appendChild(E),f.onAfterRender(t,g,_)}let p={distanceToCameraSquared:u(_,f)};a.objects.set(f,p)}for(let m=0,p=f.children.length;m<p;m++)c(f.children[m],g,_)}function u(f,g){return uh.setFromMatrixPosition(f.matrixWorld),hh.setFromMatrixPosition(g.matrixWorld),uh.distanceToSquared(hh)}function h(f){let g=[];return f.traverse(function(_){_.isCSS2DObject&&g.push(_)}),g}function d(f){let g=h(f).sort(function(m,p){if(m.renderOrder!==p.renderOrder)return p.renderOrder-m.renderOrder;let E=a.objects.get(m).distanceToCameraSquared,x=a.objects.get(p).distanceToCameraSquared;return E-x}),_=g.length;for(let m=0,p=g.length;m<p;m++)g[m].element.style.zIndex=_-m}}};function fh(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new Ot,c=0;for(let u=0;u<i.length;++u){let h=i[u],d=0;if(t!==(h.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in h.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(h.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==h.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in h.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(h.morphAttributes[f])}if(e){let f;if(t)f=h.index.count;else if(h.attributes.position!==void 0)f=h.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,u),c+=f}}if(t){let u=0,h=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let g=0;g<f.count;++g)h.push(f.getX(g)+u);u+=i[d].attributes.position.count}l.setIndex(h)}for(let u in r){let h=dh(r[u]);if(!h)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;l.setAttribute(u,h)}for(let u in o){let h=o[u][0].length;if(h===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[u]=[];for(let d=0;d<h;++d){let f=[];for(let _=0;_<o[u].length;++_)f.push(o[u][_][d]);let g=dh(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;l.morphAttributes[u].push(g)}}return l}function dh(i){let e,t,n,s=-1,r=0;for(let c=0;c<i.length;++c){let u=i[c];if(u.isInterleavedBufferAttribute)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."),null;if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=u.normalized),n!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=u.gpuType),s!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=u.array.length}let o=new e(r),a=0;for(let c=0;c<i.length;++c)o.set(i[c].array,a),a+=i[c].array.length;let l=new Yt(o,t,n);return s!==void 0&&(l.gpuType=s),l}var y={L:.5,W:.4,PF:.03,H0:.09,POST:.95,get HT(){return this.H0+this.POST},XI:.22,ZI:.17,XP:.235,ZP:.185,YB:.105,get YT(){return this.HT-.015},COLXF:.235,COLXB:0,COLZC:.114,COLL:.89,YSC:1.025,YEMP:.955,WR:.051,WW:.045,WX:.07,WZ:.1425,CX:.2,CZ:.178,BAT:{l:.166,w:.175,h:.125},XC:.133,COLX0:.023,COLX1:.243,COLZ:.095,FL:.21,FW:.18,PITCH:.07,BELT:.83,WIN0:.818,WIN1:.915,WINZ:.12,LOAD0:.827,UNL0:.832,LSLO:.392,LSHI:.84,SX:.183,SZ:.165,RZ:.128,GL:.018,GT:.004,GB:.38,GTB:.905,GTF:.818,PY0:.836,PY1:.866,P0:.008,STROKE:.25,PINDX:.035,RODY:.874,RODZ:.045,RACKY:.886,PANX:.25,PANT:.003};y.LEVEL=i=>y.LOAD0-i*y.PITCH;y.UNLV=i=>y.UNL0-(i-1)*y.PITCH;var Da={est:{name:"Estructura",color:9280427,accent:5268862},trac:{name:"Tracci\xF3n",color:3108831,accent:3108831},torre:{name:"Torre y elevador",color:15761182,accent:15761182},emp:{name:"Empujador y u\xF1a",color:9133302,accent:9133302},elec:{name:"Electr\xF3nica",color:1483594,accent:1483594},fix:{name:"Fixtures",color:889992,accent:889992},sta:{name:"Estaciones",color:12026698,accent:12026698}},D_=[["Altura total","Con postes de 950 mm sobre rodajas de 9 cm el tope queda en 104 cm; la gu\xEDa dice ~1.03 m."],["Base del marco","Se tom\xF3 a 9.0 cm del piso (alto de la rodaja con su espiga dentro de un bloque impreso de ~3 cm)."],["Ruedas M0601","Ancho de rueda ~45 mm. El eje queda ~7 cm adelante del travesa\xF1o central: con \xD8102 mm la rueda sube a 10.2 cm y chocar\xEDa con un perfil a 9 cm."],["Suspensi\xF3n","Forma de la placa pivotante, del soporte del pivote y del asiento del resorte (bajo el larguero) dibujada a criterio."],["Bater\xEDa","Medidas ~16.6 \xD7 17.5 \xD7 12.5 cm (t\xEDpicas de 12 V 24 Ah). Cuna impresa y barra superior con 2 varillas M6."],["Columnas de la torre (propuesta)",'Los documentos no dicen a qu\xE9 se atornillan las gu\xEDas, los husillos ni el empujador. Se agregan 4 columnas de 890 mm (2 junto a los postes delanteros y 2 sobre el travesa\xF1o central), un travesa\xF1o superior central de 340 mm y un travesa\xF1o de 198 mm para el empujador. Los 2 "travesa\xF1os de la torre" de la lista se usan para estos dos \xFAltimos.'],["Perfil extra","Con las columnas son 19 cortes (~11.4 m): 7 barras de 2 m, o sea comprar 6 en lugar de 4. Si lo venden cortado a medida, ~3.6 m m\xE1s."],["Ventana","Las columnas delanteras quedan detr\xE1s del panel: entre ellas hay 19.8 cm y el fixture mide 18 cm (9 mm por lado). La gu\xEDa lateral de la banda (2\u20133 mm) lo centra."],["Escuadras y placas","Las 36 escuadras cubren las 16 uniones de las esquinas y las 2 del travesa\xF1o central. Las columnas y sus travesa\xF1os necesitan ~22 piezas impresas m\xE1s (placas de uni\xF3n planas y escuadras)."],["Husillos y varillas","Cerca del frente (x \u2248 18 cm desde el centro), husillo a 16.5 cm y varilla a 12.8 cm del eje. Sus soportes impresos (abajo y arriba) se atornillan a la cara trasera de la columna delantera y del poste."],["NEMA 17, KFL08, SC8UU, cople","Medidas de cat\xE1logo aproximadas (42 \xD7 42 \xD7 40 mm, brida 48 \xD7 27 mm, bloque 34 \xD7 30 \xD7 22 mm, \xD819 \xD7 25 mm)."],["Gu\xEDas en L","Alas de 18 \xD7 4 mm. Las traseras llegan a 90.5 cm; las delanteras terminan en el borde de la ventana (81.8 cm)."],["Plataforma","12 mm de grueso, con 2 brazos laterales de 35 mm de ancho que salen entre las gu\xEDas."],["Empujador","Varillas a 87.4 cm y cremallera a 88.6 cm, centradas detr\xE1s de la torre. Adelante cuelgan del travesa\xF1o del empujador; atr\xE1s, del travesa\xF1o superior trasero. En home, la cola de la cremallera y las varillas asoman ~4 cm por atr\xE1s del carrito: revisarlo en el CAD."],["U\xF1a","El pin baja en l\xEDnea recta dentro de una gu\xEDa; en el real lo mueve el brazo del servo. El pin va 35 mm adelante de la placa."],["Punto donde la banda deja el fixture","~9 cm afuera de la ventana es la estimaci\xF3n de la gu\xEDa; se mide con la banda real (Etapa 15)."],["Fixture","Base de 6 mm, barras de 12 \xD7 34 mm, ECU como bloque de ~14 \xD7 13 \xD7 5.8 cm."],["Electr\xF3nica","Bandeja detr\xE1s de la bater\xEDa; tama\xF1os de m\xF3dulos aproximados. Cables simplificados y rutas aproximadas."],["Jetson y c\xE1mara","Jetson (~10 \xD7 9 \xD7 3.5 cm) sobre una placa en el marco superior trasero; c\xE1mara arriba al frente."],["Sensores","VL53L0X de obst\xE1culos a ~15 cm del piso en el frente y los costados; el de la pila colgado del larguero superior, a ~96 cm."],["Estaci\xF3n de descarga","Rodillos de \xD830 \xD7 22 cm, mesa y bastidor dibujados a criterio."],["Tiempos","La animaci\xF3n va m\xE1s r\xE1pida que el carrito real (un nivel real tarda 7 s; cargar un fixture ~18 s)."]],Me=i=>document.getElementById(i),Be=(i=0,e=0,t=0)=>new L(i,e,t),xs=i=>Math.max(0,Math.min(1,i)),bt=(i,e,t)=>i+(e-i)*t,sr=i=>i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2,nn=(i,e,t)=>xs((i-e)/(t-e)),Et=(i,e,t)=>sr(nn(i,e,t)),rr=Me("view"),Ua=()=>matchMedia("(max-width: 820px)").matches,Rn=new URLSearchParams(location.search).get("embed")==="1",Dl=document.documentElement.classList.contains("limpio"),pn=new Fs({antialias:!0,alpha:Rn,powerPreference:"high-performance"});pn.setPixelRatio(Math.min(devicePixelRatio,Ua()?1.75:2));pn.shadowMap.enabled=!0;pn.shadowMap.type=pl;pn.outputColorSpace=yt;pn.toneMapping=ml;pn.toneMappingExposure=1.05;rr.appendChild(pn.domElement);var Ba=new wa;Ba.domElement.className="labels";rr.appendChild(Ba.domElement);var It=new aa,Jt=new Xt(38,1,.02,40);Jt.position.set(1.6,1.3,1.6);var Ft=new Ea(Jt,pn.domElement);Ft.enableDamping=!0;Ft.dampingFactor=.08;Ft.target.set(0,.5,0);Ft.maxDistance=9;Ft.minDistance=.15;Ft.maxPolarAngle=Math.PI*.495;It.add(new ga(16777215,9410982,1));var Xn=new Ks(16777215,2.2);Xn.position.set(2,3.4,1.4);Xn.castShadow=!0;Xn.shadow.mapSize.set(Ua()?1024:2048,Ua()?1024:2048);Object.assign(Xn.shadow.camera,{left:-1.6,right:1.6,top:1.6,bottom:-1.6,near:.5,far:8});Xn.shadow.bias=-4e-4;Xn.shadow.normalBias=.01;Xn.shadow.radius=4;It.add(Xn);It.add(Xn.target);var Mh=new Ks(14674175,.7);Mh.position.set(-2.2,1.4,-1.6);It.add(Mh);var Sh=new Zs({color:14278372,roughness:.95}),cr=new Nt(new fa(6,48),Sh);cr.rotation.x=-Math.PI/2;cr.receiveShadow=!0;It.add(cr);var vs=new xa(6,60,0,0);vs.material.transparent=!0;vs.material.opacity=.06;vs.position.y=5e-4;It.add(vs);var Ci=new tn;It.add(Ci);var za=new tn;It.add(za);var Hn={bg:new We,dim:new We,dimLine:"#000"};function Ul(){let i=getComputedStyle(document.documentElement);Hn.bg.set(i.getPropertyValue("--scene").trim()||"#e6eaef"),Sh.color.set(i.getPropertyValue("--floor").trim()||"#d9dee4"),Hn.dim.copy(Hn.bg),Hn.dimLine=i.getPropertyValue("--dim").trim()||"#123",It.background=Rn?null:Hn.bg.clone(),It.fog=Rn?null:new ra(Hn.bg,6,14),Rn&&(pn.setClearColor(0,0),cr.visible=!1,vs.visible=!1);for(let e of wh)e.mat.color.set(Hn.dimLine);li=!0,fn()}var U_={alu:{c:11845321,m:.55,r:.38},steel:{c:14212579,m:.85,r:.22},dark:{c:2764339,m:.25,r:.55},black:{c:1711135,m:.1,r:.7},brass:{c:13214247,m:.75,r:.32},rubber:{c:2303272,m:0,r:.92},nylon:{c:15526108,m:0,r:.6},ecu:{c:12173512,m:.7,r:.35},pcb:{c:2060099,m:.1,r:.6},pcbB:{c:1916810,m:.1,r:.6},perf:{c:13148517,m:.05,r:.8},mdf:{c:12950125,m:0,r:.85},wood:{c:11895888,m:0,r:.8},bat:{c:3159355,m:.1,r:.6},red:{c:14034984,m:.1,r:.45},yellow:{c:15909912,m:.05,r:.5},orange:{c:16347926,m:.05,r:.5},blue:{c:2450411,m:.05,r:.5},white:{c:16053490,m:0,r:.6},green:{c:2278750,m:0,r:.5},belt:{c:2369323,m:0,r:.9},glass:{c:1119256,m:.3,r:.15},cRed:{c:14427686,m:0,r:.5},cOra:{c:16347926,m:0,r:.5},cBlk:{c:2040616,m:0,r:.6},cBlu:{c:3900150,m:0,r:.5},cYel:{c:15381256,m:0,r:.5},cGrn:{c:1483594,m:0,r:.5},cWht:{c:15067115,m:0,r:.5},cPur:{c:11032055,m:0,r:.5}};function N_(i,e){return i==="P"?{c:Da[e].color,m:.05,r:.55}:i==="Pd"?{c:Da[e].accent,m:.05,r:.55}:U_[i]}var Dt=new Map,li=!0,Eh=(()=>{let i=new Ws,e=.015,t=.004,n=.0035,s=[],r=(a,l,c,u,h,d)=>{let f=(a+c)/2,g=(l+u)/2,_=(c-a)/(2*e),m=(u-l)/(2*e);s.push([a,l],[f-_*t,g-m*t],[f-_*t+h*n,g-m*t+d*n],[f+_*t+h*n,g+m*t+d*n],[f+_*t,g+m*t])};r(-e,-e,e,-e,0,1),r(e,-e,e,e,-1,0),r(e,e,-e,e,0,-1),r(-e,e,-e,-e,1,0),i.moveTo(...s[0]);for(let a=1;a<s.length;a++)i.lineTo(...s[a]);i.closePath();let o=new us;return o.absarc(0,0,.0034,0,Math.PI*2,!0),i.holes.push(o),i})(),El=new Map;function La(i,e){return El.has(i)||El.set(i,e()),El.get(i)}var wl=class{constructor(e){this.sub=e,this.items=[]}add(e,t,n=0,s=0,r=0,o=0,a=0,l=0,c=1,u=1,h=1){let d=new Ze().compose(Be(n,s,r),new ft().setFromEuler(new un(o,a,l)),Be(c,u,h));return this.items.push({geo:e,mat:t,m:d}),this}box(e,t,n,s,r,o,a="P",l=0,c=0,u=0){return this.add(La("box",()=>new bi(1,1,1)),a,s,r,o,l,c,u,e,t,n)}bb(e,t,n,s,r,o,a="P"){return this.box(t-e,s-n,o-r,(e+t)/2,(n+s)/2,(r+o)/2,a)}cyl(e,t,n,s,r,o="y",a="P",l=20,c=e){let u=La(`cyl${l}_${(c/e).toFixed(3)}`,()=>new Vs(c/e,1,1,l)),h=o==="z"?Math.PI/2:0,d=o==="x"?-Math.PI/2:0;return this.add(u,a,n,s,r,h,0,d,e,t,e)}hex(e,t,n,s,r,o="y",a="steel"){return this.cyl(e,t,n,s,r,o,a,6)}tube(e,t,n,s=48,r=!1){let o=new Hs(e.map(a=>Be(...a)),r,"catmullrom",.2);return this.add(new pa(o,s,t,6,r),n)}profile(e,t,n,s,r){let o=La("pf"+e,()=>{let l=new js(Eh,{depth:e,bevelEnabled:!1,curveSegments:6});return l.translate(0,0,-e/2),l}),a=t==="x"?[0,Math.PI/2,0]:t==="y"?[Math.PI/2,0,0]:[0,0,0];return this.add(o,"alu",n,s,r,...a)}bracket(e,t,n,s,r,o=.02,a=.036,l=.006,c="Pd"){let u=Be(...s),h=Be(...r),d=u.clone().cross(h).normalize(),f=(p,E,x)=>{let w=Be(e,t,n).addScaledVector(E,p/2).addScaledVector(x,l/2),D=new Ze().makeBasis(E,x,E.clone().cross(x)),R=new ft().setFromRotationMatrix(D),A=new un().setFromQuaternion(R);this.box(p,l,o,w.x,w.y,w.z,c,A.x,A.y,A.z)};f(a,u,h),f(a,h,u);let g=Be(e,t,n).addScaledVector(u,.014).addScaledVector(h,.014),_=new Ze().makeBasis(u.clone().add(h).normalize(),d,u.clone().sub(h).normalize()),m=new un().setFromQuaternion(new ft().setFromRotationMatrix(_));return this.box(.022,.004,.004,g.x,g.y,g.z,c,m.x,m.y,m.z),this}};function we(i,e,t,n,s={}){let r=new wl(e);n(r);let o=r.items.filter(m=>m.geo.type!=="TubeGeometry").map(m=>(m.geo.boundingBox||m.geo.computeBoundingBox(),m.geo.boundingBox.clone().applyMatrix4(m.m))),a=new Map;for(let m of r.items){let p=m.mat;a.has(p)||a.set(p,[]);let E=m.geo.index?m.geo.toNonIndexed():m.geo.clone();E.attributes.uv||E.setAttribute("uv",new lt(new Float32Array(E.attributes.position.count*2),2)),E.applyMatrix4(m.m),a.get(p).push(E)}let l=[],c=new cn;for(let[m,p]of a){let E=fh(p,!1);E.computeBoundingBox(),c.union(E.boundingBox),l.push([m,E]),p.forEach(x=>x.dispose())}let u=s.pivot?Be(...s.pivot):c.getCenter(Be()),h=new tn;h.name=i;let d=[],f=c.getSize(Be()),g=Math.max(f.x,f.y,f.z)>.025;for(let[m,p]of l){p.translate(-u.x,-u.y,-u.z);let E=N_(m,e),x=new Zs({color:E.c,metalness:E.m,roughness:E.r,flatShading:!1}),w=new Nt(p,x);w.castShadow=s.shadow??g,w.receiveShadow=!0,h.add(w),d.push({mat:x,base:new We(E.c)})}h.position.copy(u),(s.world?za:Ci).add(h);let _={id:i,sub:e,name:t,group:h,mats:d,home:u.clone(),homeQ:new ft,explode:s.explode?Be(...s.explode):null,from:s.from?Be(...s.from):null,mount:s.mount||null,track:[],mode:"",localBox:c.clone().translate(u.clone().negate()),nest:s.nest||[],world:!!s.world,noCheck:!!s.noCheck,only:s.only||null,prims:o};return Dt.set(i,_),_}function O_(i){let e=i.home,t=Be(e.x,0,e.z);return t.length()<.02&&t.set(0,0,0),t.normalize().multiplyScalar(.28),t.y=.12+Math.max(0,e.y-.5)*.15,t}function F_(i,e,t=0){let n=Ee.transp&&i.sub==="est"&&i.track.length&&e!=="hidden",s=i.fade==null?1:i.fade,r=n?.13*s:s,o=e+(r<.999?"F"+r.toFixed(2):"")+(e==="new"?t.toFixed(2):"")+(li?Math.random():"");if(i.mode===o||(i.mode=o,i.group.visible=e!=="hidden",e==="hidden"))return;let a=new We(Da[i.sub].accent);for(let{mat:l,base:c}of i.mats)l.color.copy(c),l.emissive.setRGB(0,0,0),e==="old"&&l.color.lerp(Hn.dim,.55),e==="new"&&l.emissive.copy(a).multiplyScalar(.1+.22*t),e==="focus"&&l.emissive.copy(a).multiplyScalar(.16),(l.opacity!==r||l.transparent!==r<1)&&(l.opacity=r,l.transparent=r<1,l.depthWrite=r===1,l.needsUpdate=!0);for(let l of i.group.children)l.castShadow=l.castShadow&&r>.9}function B_(i,e,t=""){let n=document.createElement("div");n.className="tag3d "+t,n.innerHTML=`<span class="tag-dot"></span><span class="tag-box"><b></b>${e?"<small></small>":""}</span>`,n.querySelector("b").textContent=i,e&&(n.querySelector("small").textContent=e);let s=new ps(n);return s.visible=!1,It.add(s),s}var wh=[],z_=new Gs(.0055,.016,10);function k_(i,e,t,n,s={}){let r=Be(...i),o=Be(...e),a=Be(...t||[0,0,0]),l=r.clone().add(a),c=o.clone().add(a),u=new cs({color:Hn.dimLine,depthTest:!1,transparent:!0}),h=new tn,d=[l,c];if(a.length()>1e-4){let w=a.clone().normalize().multiplyScalar(.012);d.push(r,l.clone().add(w),o,c.clone().add(w))}let f=new Ot().setFromPoints(d),g=new Bs(f,u);g.renderOrder=10,h.add(g);let _=c.clone().sub(l).normalize(),m=new zn({color:16777215,depthTest:!1,transparent:!0});for(let[w,D]of[[l,-1],[c,1]]){let R=new Nt(z_,m);R.position.copy(w).addScaledVector(_,-D*.008),R.quaternion.setFromUnitVectors(Be(0,1,0),_.clone().multiplyScalar(D)),R.renderOrder=11,h.add(R)}let p=document.createElement("div");p.className="dim3d"+(s.cls?" "+s.cls:""),p.textContent=n;let E=new ps(p);E.position.copy(l).lerp(c,s.labAt??.5),h.add(E),h.visible=!1,It.add(h);let x={g:h,mat:u,amat:m,lab:E,mount:s.mount||null,t:s.t??.8,grow:!!s.grow,A2:l,B2:c,geo:f,lines:d};return wh.push(x),x}var Lt={active:!1,t:0,dur:1.1,p0:Be(),t0:Be(),p1:Be(),t1:Be()};function H_(i){let e=Qs.degToRad(Jt.fov),t=2*Math.atan(Math.tan(e/2)*Jt.aspect);return i/Math.sin(Math.min(e,t)/2)}function V_(i,e){let t=Be(...i.t),n=Be(...i.d).normalize();return i.follow&&e&&t.applyMatrix4(e),{target:t,pos:t.clone().addScaledVector(n,H_(i.r))}}function Li(i,e=!1,t=null){let n=V_(i,t);if(e){Jt.position.copy(n.pos),Ft.target.copy(n.target),Lt.active=!1;return}Object.assign(Lt,{active:!0,t:0}),Lt.p0.copy(Jt.position),Lt.t0.copy(Ft.target),Lt.p1.copy(n.pos),Lt.t1.copy(n.target)}Ft.addEventListener("start",()=>{Lt.active=!1,Ee.userCam=!0,fn()});var Tl=!1;Ft.addEventListener("change",()=>{Tl||fn()});var ys=[];{let{XP:i,ZP:e,YB:t,H0:n,POST:s}=y,r=y.YT,o=n+s/2,a=(c,u,h,d,f)=>ys.push({id:c,L:u,axis:h,pos:d,name:f});a("post_FL",.95,"y",[i,o,-e],"Poste delantero izq."),a("post_FR",.95,"y",[i,o,e],"Poste delantero der."),a("post_BL",.95,"y",[-i,o,-e],"Poste trasero izq."),a("post_BR",.95,"y",[-i,o,e],"Poste trasero der."),a("larg_bL",.44,"x",[0,t,-e],"Larguero inferior izq."),a("larg_bR",.44,"x",[0,t,e],"Larguero inferior der."),a("larg_tL",.44,"x",[0,r,-e],"Larguero superior izq."),a("larg_tR",.44,"x",[0,r,e],"Larguero superior der."),a("trav_bF",.34,"z",[i,t,0],"Travesa\xF1o inferior delantero"),a("trav_bB",.34,"z",[-i,t,0],"Travesa\xF1o inferior trasero"),a("trav_tF",.34,"z",[i,r,0],"Travesa\xF1o superior delantero"),a("trav_tB",.34,"z",[-i,r,0],"Travesa\xF1o superior trasero"),a("trav_c",.34,"z",[0,t,0],"Travesa\xF1o central (motores)");let l=n+y.PF+y.COLL/2;a("col_FL",y.COLL,"y",[y.COLXF,l,-y.COLZC],"Columna delantera izq."),a("col_FR",y.COLL,"y",[y.COLXF,l,y.COLZC],"Columna delantera der."),a("col_BL",y.COLL,"y",[y.COLXB,l,-y.COLZC],"Columna trasera izq."),a("col_BR",y.COLL,"y",[y.COLXB,l,y.COLZC],"Columna trasera der."),a("trav_sc",.34,"z",[0,y.YSC,0],"Travesa\xF1o superior central"),a("trav_emp",.198,"z",[0,y.YEMP,0],"Travesa\xF1o del empujador");for(let c of ys)we(c.id,"est",c.name,u=>u.profile(c.L,c.axis,...c.pos),{pivot:c.pos})}var ai=[{ids:["post_FL","post_FR"],waste:.094,note:"950 + 950 \xB7 sobra ~95 mm"},{ids:["post_BL","post_BR"],waste:.094,note:"950 + 950 \xB7 sobra ~95 mm"},{ids:["col_FL","col_FR"],waste:.214,note:"890 + 890 \xB7 sobra ~214 mm"},{ids:["col_BL","col_BR"],waste:.214,note:"890 + 890 \xB7 sobra ~214 mm"},{ids:["larg_bL","larg_bR","larg_tL","larg_tR"],waste:.228,note:"440 \xD7 4 \xB7 sobra ~228 mm"},{ids:["trav_bF","trav_bB","trav_tF","trav_tB","trav_c","trav_emp"],waste:.084,note:"340 \xD7 5 + 198 \xB7 sobra ~84 mm"},{ids:["trav_sc"],waste:1.657,note:"340 \xB7 sobra ~1.66 m (repuesto)"}],Na=-1,ms=.62,ka=.12,Th={x:new ft,y:new ft().setFromEuler(new un(0,0,Math.PI/2)),z:new ft().setFromEuler(new un(0,Math.PI/2,0))},Nl=i=>ys.find(e=>e.id===i);function Ol(i,e){for(let t=0;t<ai.length;t++){let n=Na,s=ai[t];for(let r of s.ids){let o=Nl(r);if(r===i)return{pos:Be(n+o.L/2,.0151,ms+t*ka),q:Th[o.axis].clone()};n+=o.L+e}}}function G_(i){let e=Nl(i),t=Th[e.axis].clone(),n=c=>c.startsWith("post")?0:c.startsWith("col")?1:c.startsWith("larg")?2:3,s=n(i),o=ys.filter(c=>n(c.id)===s).indexOf(e),a=[-.5,-.5,.28,.86][s],l=[.62,.86,.62,.62][s];return{pos:Be(a,.0151,l+o*.05),q:t}}ai.forEach((i,e)=>{let t=i.ids.reduce((s,r)=>s+Nl(r).L+.003,0),n=Na+t+i.waste/2;we("waste"+e,"est","Sobra",s=>{s.add(La("pfw"+e,()=>{let r=new js(Eh,{depth:i.waste,bevelEnabled:!1,curveSegments:6});return r.translate(0,0,-i.waste/2),r}),"alu",n,.0151,ms+e*ka,0,Math.PI/2,0)},{world:!0,noCheck:!0})});{let{XI:i,ZI:e,H0:t,PF:n}=y,s=y.H0+n,r=y.HT-n,o=[],a=[];for(let h of[-1,1])for(let d of[-1,1])o.push([h*i,s,d*y.ZP,[-h,0,0],[0,1,0]]),o.push([h*y.XP,s,d*e,[0,0,-d],[0,1,0]]),o.push([h*i,t+.0075,d*e,[-h,0,0],[0,0,-d],.014]),o.push([h*i,t+.0225,d*e,[0,0,-d],[-h,0,0],.014]),a.push([h*i,r,d*y.ZP,[-h,0,0],[0,-1,0]]),a.push([h*y.XP,r,d*e,[0,0,-d],[0,-1,0]]),a.push([h*i,y.HT-.0075,d*e,[-h,0,0],[0,0,-d],.014]),a.push([h*i,y.HT-.0225,d*e,[0,0,-d],[-h,0,0],.014]);let l=[];for(let h of[-1,1])l.push([0,s,h*e,[0,0,-h],[0,1,0]]),l.push([-.015,t+.015,h*e,[-1,0,0],[0,0,-h],.014]);let c=[];for(let h of[-1,1])c.push([y.COLXF,s,h*.099,[0,0,-h],[0,1,0]]),c.push([y.COLXF,r,h*.099,[0,0,-h],[0,-1,0]]),c.push([0,r,h*e,[0,0,-h],[0,-1,0]]);let u=(h,d,f)=>we(h,"est",d,g=>{for(let _ of f)g.bracket(_[0],_[1],_[2],_[3],_[4],_[5]||.02)},{nest:["*pf"]});u("esc_b","Escuadras del marco inferior (16)",o),u("esc_c","Escuadras del travesa\xF1o central (4)",l),u("esc_t","Escuadras del marco superior (16)",a),u("esc_tw","Escuadras de la torre (6)",c),we("placas","est","Placas de uni\xF3n de la torre (16)",h=>{let d=(f,g,_,m,p,E)=>{h.bb(f,g,_,m,p,E,"Pd");for(let x of[_+.015,m-.015])h.cyl(.005,.003,f<0?f-.0015:g+.0015,x,(p+E)/2,"x","steel",10)};for(let f of[-1,1]){let g=(_,m)=>[Math.min(f*_,f*m),Math.max(f*_,f*m)];d(.214,.22,.094,.165,...g(.1,.128)),d(.214,.22,.96,1.036,...g(.1,.128));for(let[_,m]of[[.015,.021],[-.021,-.015]])d(_,m,.094,.165,...g(.1,.118)),d(_,m,.975,1.036,...g(.1,.128)),d(_,m,.94,.97,...g(.07,.128))}},{nest:["*pf"]})}function ri(i,e,t,n,s,r,o){return we(i,"est",e,a=>{for(let l of s){let c=t==="x"?[l,r,n]:[n,r,l];a.hex(.0058,.005,c[0],c[1],c[2],"y","steel")}},{from:o,nest:["*pf"],noCheck:!0})}{let i=y.H0+y.PF-.0045,e=y.HT-y.PF+.0045,t=[-.2,-.17,-.06,.06,.17,.2],n=[-.15,-.12,.12,.15];ri("nut_bL","Tuercas M6 en la ranura","x",-y.ZP,t,i,[-.55,0,0]),ri("nut_bR","Tuercas M6 en la ranura","x",y.ZP,t,i,[.55,0,0]),ri("nut_bF","Tuercas M6 en la ranura","z",y.XP,n,i,[0,0,.45]),ri("nut_bB","Tuercas M6 en la ranura","z",-y.XP,n,i,[0,0,-.45]),ri("nut_tL","Tuercas M6 en la ranura","x",-y.ZP,t,e,[-.55,0,0]),ri("nut_tR","Tuercas M6 en la ranura","x",y.ZP,t,e,[.55,0,0]),ri("nut_tF","Tuercas M6 en la ranura","z",y.XP,n,e,[0,0,.45]),ri("nut_tB","Tuercas M6 en la ranura","z",-y.XP,n,e,[0,0,-.45])}for(let i of[-1,1])for(let e of[-1,1]){let t="cast_"+(i>0?"F":"B")+(e<0?"L":"R"),n=i*y.CX,s=e*y.CZ;we(t,"trac","Rodaja twin 50 mm",r=>{r.bb(n-.02,n+.02,.06,.09,s-.016,s+.016,"P"),r.cyl(.017,.004,n,.058,s,"y","dark"),r.cyl(.006,.01,n,.052,s,"y","steel"),r.bb(n-.026,n+.006,.03,.05,s-.017,s+.017,"dark");for(let o of[-1,1])r.cyl(.025,.013,n-.016,.025,s+o*.0105,"z","nylon",18);r.cyl(.006,.04,n-.016,.025,s,"z","steel",10)})}for(let i of[-1,1]){let e=i<0?"L":"R",t=i*.17;we("susp_"+e,"trac","Placa pivotante",s=>{s.bb(-.015,.015,.05,y.H0,Math.min(i*.15,i*.166),Math.max(i*.15,i*.166),"Pd"),s.bb(-.02,.1,.03,.085,Math.min(i*.166,i*.174),Math.max(i*.166,i*.174),"P"),s.bb(.055,.085,.037,.043,Math.min(i*.174,i*.198),Math.max(i*.174,i*.198),"P"),s.cyl(.011,.0082,0,.068,t,"z","steel",18),s.cyl(.004,.044,0,.068,i*.168,"z","steel",10),s.hex(.0075,.006,0,.068,i*.193,"z","steel"),s.cyl(.0155,.004,y.WX,y.WR,i*.1655,"z","dark",18),s.cyl(.004,.072,y.WX,.065,i*.186,"y","steel",10),s.hex(.0075,.006,y.WX,.034,i*.186,"y","steel")},{nest:["*pf","mot_"+e,"spring_"+e]});let n=[];for(let s=0;s<=220;s++){let r=s/220*Math.PI*2*9.5;n.push([y.WX+.009*Math.cos(r),.043+s/220*.047,i*.186+.009*Math.sin(r)])}we("spring_"+e,"trac","Resorte de compresi\xF3n",s=>s.tube(n,.001,"steel",300),{pivot:[y.WX,.043,i*.186],mount:"spring",nest:["susp_"+e],shadow:!1}),we("mot_"+e,"trac",i<0?"M0601 izquierdo":"M0601 derecho",s=>{let r=i*y.WZ;s.cyl(y.WR,y.WW,y.WX,y.WR,r,"z","rubber",28),s.cyl(.036,y.WW+.002,y.WX,y.WR,r,"z","P",28);for(let o=0;o<5;o++){let a=o/5*Math.PI*2;s.box(.03,.006,.003,y.WX+Math.cos(a)*.018,y.WR+Math.sin(a)*.018,r-i*(y.WW/2+.002),"Pd",0,0,a)}s.cyl(.01,.004,y.WX,y.WR,r-i*(y.WW/2+.003),"z","dark",16)},{pivot:[y.WX,y.WR,i*y.WZ],mount:"wheel",nest:["susp_"+e]})}{let{l:i,w:e,h:t}=y.BAT,n=.126;we("bat_cradle","elec","Cuna de la bater\xEDa",s=>{s.bb(-.11,-.023,.12,n,-.198,.198,"P"),s.bb(.023,.11,.12,n,-.198,.198,"P"),s.bb(-.023,.023,.12,n,-.097,.097,"P")},{nest:["*pf"]}),we("bat","elec","Bater\xEDa BR-1224",s=>{s.bb(-i/2,i/2,n,n+t,-e/2,e/2,"bat"),s.bb(-i/2+.004,i/2-.004,n+t,n+t+.003,-e/2+.004,e/2-.004,"dark"),s.bb(-i/2-5e-4,-i/2,n+.03,n+.07,-.06,.06,"green"),s.cyl(.006,.012,-.06,n+t+.009,.055,"y","red",12),s.cyl(.006,.012,-.06,n+t+.009,-.055,"y","black",12)}),we("bat_hold","elec","Sujeci\xF3n de la bater\xEDa",s=>{s.bb(-.108,.108,n+t+.003,n+t+.011,-.012,.012,"P");for(let r of[-.1,.1])s.cyl(.003,n+t+.022-.108,r,(.108+n+t+.022)/2,0,"y","steel",8),s.hex(.0055,.005,r,n+t+.0135,0,"y","steel")},{nest:["bat_cradle","bat","*pf"]})}{let{COLX0:i,COLX1:e,COLZ:t,GL:n,GT:s,GB:r}=y;for(let o of[!1,!0])for(let a of[-1,1]){let l="guide_"+(o?"F":"B")+(a<0?"L":"R"),c=o?y.GTF:y.GTB,u=o?[e,e+s]:[i-s,i],h=o?[e-n,e]:[i,i+n],d=a*(t-n+s),f=a*(t+s);we(l,"torre","Gu\xEDa en L",g=>{g.bb(u[0],u[1],r,c,Math.min(d,f),Math.max(d,f),"P"),g.bb(h[0],h[1],r,c,Math.min(a*t,f),Math.max(a*t,f),"P");let _=(m,p)=>[Math.min(a*m,a*p),Math.max(a*m,a*p)];if(o)for(let m of[r+.04,(r+c)/2,c-.04])g.cyl(.0045,.0012,y.COLXF,m,a*(t-6e-4),"z","steel",10);else{g.bb(.015,i,r,c,..._(.099,.125),"Pd");for(let m of[r+.04,(r+c)/2,c-.04])g.cyl(.005,.003,i+.0015,m,a*.114,"x","steel",10)}},{nest:o?["col_F"+(a<0?"L":"R")]:["col_B"+(a<0?"L":"R")]})}}for(let i of[-1,1]){let e=i<0?"L":"R",t=i*y.SZ,n=i*y.RZ,s=y.SX,r=(a,l)=>[Math.min(i*a,i*l),Math.max(i*a,i*l)];we("brk_lo_"+e,"torre","Soporte inferior (NEMA + KFL08)",a=>{a.bb(.214,.22,.232,.336,...r(.11,.192),"Pd");for(let l of[.25,.318])for(let c of[.114,.185])a.cyl(.005,.003,.2125,l,i*c,"x","steel",10);a.bb(.155,.214,.275,.281,...r(.14,.192),"Pd"),a.bb(.155,.214,.312,.318,...r(.11,.192),"Pd"),a.bb(.172,.194,.318,.334,...r(.118,.138),"Pd"),a.cyl(.003,.034,s,.335,i*.188,"y","Pd",8)},{nest:["*pf","nema_"+e,"rod_"+e,"lsw_"+e,"screw_"+e]}),we("nema_"+e,"torre","NEMA 17 del elevador",a=>{a.bb(s-.021,s+.021,.239,.271,t-.021,t+.021,"black"),a.bb(s-.021,s+.021,.235,.239,t-.021,t+.021,"alu"),a.bb(s-.021,s+.021,.271,.275,t-.021,t+.021,"alu"),a.cyl(.011,.003,s,.2765,t,"y","alu",16),a.cyl(.0025,.024,s,.287,t,"y","steel",10),a.bb(s-.008,s+.008,.24,.248,t+i*.021,t+i*.026,"white")},{nest:["brk_lo_"+e,"cople_"+e]}),we("cople_"+e,"torre","Cople flexible 5 \u2192 8 mm",a=>{a.cyl(.0095,.025,s,.2995,t,"y","alu",18);for(let l of[.291,.296,.303,.308])a.cyl(.0097,.0012,s,l,t,"y","dark",18);for(let l of[.29,.309])a.cyl(.0016,.006,s+.0095,l,t,"x","black",6)},{nest:["nema_"+e,"screw_"+e]}),we("kflLo_"+e,"torre","KFL08 inferior",a=>{a.bb(s-.024,s+.024,.318,.33,t-.0135,t+.0135,"alu"),a.cyl(.011,.006,s,.333,t,"y","alu",18),a.cyl(.0055,.004,s,.338,t,"y","steel",14);for(let l of[-1,1])a.cyl(.0018,.006,s+l*.012,.333,t,"x","red",6)},{nest:["screw_"+e,"brk_lo_"+e]}),we("screw_"+e,"torre","Husillo TR8 de 60 cm",a=>{a.cyl(.004,.6,s,.6,t,"y","steel",14),a.bb(s+.0032,s+.0046,.302,.898,t-8e-4,t+8e-4,"black")},{pivot:[s,.6,t],mount:"screw",nest:["*","plat"]}),we("rod_"+e,"torre","Varilla lisa 8 mm \xD7 60 cm",a=>a.cyl(.004,.6,s,.6,n,"y","steel",14),{nest:["brk_lo_"+e,"brk_up_"+e,"sc_"+e]}),we("kflUp_"+e,"torre","KFL08 superior",a=>{a.bb(s-.024,s+.024,.872,.884,t-.0135,t+.0135,"alu"),a.cyl(.011,.006,s,.869,t,"y","alu",18)},{nest:["screw_"+e,"brk_up_"+e]}),we("brk_up_"+e,"torre","Soporte superior (KFL08)",a=>{a.bb(.214,.22,.884,.955,...r(.11,.192),"Pd");for(let l of[.9,.94])for(let c of[.114,.185])a.cyl(.005,.003,.2125,l,i*c,"x","steel",10);a.bb(.155,.214,.884,.89,...r(.11,.192),"Pd"),a.bb(.172,.194,.874,.884,...r(.118,.138),"Pd")},{nest:["*pf","rod_"+e,"screw_"+e,"kflUp_"+e]}),we("lsw_"+e,"torre","Final de carrera inferior",a=>{a.bb(s-.01,s+.01,.352,.372,...r(.181,.195),"black"),a.bb(s-.01,s+.006,.3725,.3745,...r(.184,.192),"steel"),a.cyl(.0025,.004,s+.007,.3775,i*.188,"z","steel",8)},{nest:["brk_lo_"+e]});let o=y.LOAD0;we("nutsc_"+e,"torre","Tuerca de lat\xF3n",a=>{a.cyl(.011,.006,s,o-.015,t,"y","brass",18),a.cyl(.005,.009,s,o-.0225,t,"y","brass",14)},{mount:"plat",nest:["screw_"+e,"plat"]}),we("sc_"+e,"torre","SC8UU \xD72",a=>{for(let[l,c]of[[o,o+.03],[o-.042,o-.012]])a.bb(s-.011,s+.011,l,c,n-.017,n+.017,"alu"),a.bb(s-.0115,s-.0105,l+.004,c-.004,n-.012,n+.012,"dark")},{mount:"plat",nest:["rod_"+e,"plat"]})}we("plat","torre","Plataforma",i=>{let e=y.LOAD0,t=y.XC-y.FL/2,n=y.XC+y.FL/2;i.bb(t,n,e-.012,e,-y.FW/2,y.FW/2,"P");for(let s of[-.06,0,.06])i.bb(t+.01,n-.01,e-.02,e-.012,s-.004,s+.004,"Pd");for(let s of[-1,1])i.bb(.165,.2,e-.012,e,Math.min(s*.09,s*.19),Math.max(s*.09,s*.19),"P")},{mount:"plat",nest:["nutsc_L","nutsc_R","sc_L","sc_R","screw_L","screw_R","rod_L","rod_R"]});var at=y.P0;we("prod_L","emp","Varilla 8 mm \xD7 30 cm",i=>i.cyl(.004,.3,-.134,y.RODY,-y.RODZ,"x","steel",12),{nest:["pframe","pframe_r","sled"]});we("prod_R","emp","Varilla 8 mm \xD7 30 cm",i=>i.cyl(.004,.3,-.134,y.RODY,y.RODZ,"x","steel",12),{nest:["pframe","pframe_r","sled"]});we("pframe","emp","Soportes delanteros y del NEMA",i=>{for(let e of[-1,1]){let t=(n,s)=>[Math.min(e*n,e*s),Math.max(e*n,e*s)];i.bb(.008,.016,.868,.882,...t(.035,.055),"Pd"),i.bb(.008,.015,.882,.94,...t(.04,.05),"Pd")}i.bb(-.04,.005,.888,.94,.006,.01,"Pd"),i.bb(-.015,.005,.934,.94,.006,.05,"Pd")},{nest:["pnema","prod_L","prod_R","*pf"]});we("pframe_r","emp","Soporte trasero y final de carrera",i=>{for(let e of[-1,1]){let t=(n,s)=>[Math.min(e*n,e*s),Math.max(e*n,e*s)];i.bb(-.284,-.276,.868,.882,...t(.035,.055),"Pd"),i.bb(-.284,-.276,.882,1.048,...t(.04,.05),"Pd"),i.bb(-.284,-.218,1.04,1.048,...t(.035,.055),"Pd")}i.bb(-.284,-.278,.878,.892,.05,.064,"Pd"),i.bb(-.284,-.278,.88,.89,.064,.08,"black"),i.bb(-.278,-.2755,.884,.886,.064,.078,"steel")},{nest:["*pf","prod_L","prod_R"]});we("sled","emp","Carro, placa y cremallera",i=>{i.bb(at-.012,at,y.PY0,y.PY1,-.075,.075,"P"),i.bb(at-.012,at-.002,y.PY1,.876,-.03,.03,"Pd"),i.bb(at-.012,at+.045,.876,.886,-.03,.03,"Pd"),i.bb(at+.027,at+.043,.886,.902,-.008,.008,"Pd"),i.bb(at-.296,at-.004,.886,.8935,-.006,.006,"P");for(let e=0;e<61;e++)i.bb(at-.294+e*.00471,at-.294+e*.00471+.0022,.8935,.898,-.006,.006,"P");i.bb(at-.152,at-.14,.879,.886,-.012,.012,"Pd"),i.bb(at-.283,at-.253,.88,.886,-.062,.062,"Pd");for(let e of[-1,1]){let t=e*y.RODZ;i.bb(at-.283,at-.253,.863,.88,t-.017,t+.017,"alu")}},{mount:"push",nest:["prod_L","prod_R","pin","servo","pinion"]});we("pinion","emp","Pi\xF1\xF3n m1.5 \xB7 20 dientes",i=>{i.cyl(.0145,.012,-.017,.913,0,"z","P",24);for(let n=0;n<20;n++){let s=n/20*Math.PI*2;i.box(.004,.003,.012,-.017+Math.cos(s)*.0155,.913+Math.sin(s)*.0155,0,"P",0,0,s+Math.PI/2)}i.cyl(.004,.014,-.017,.913,.001,"z","Pd",10)},{pivot:[-.017,.913,0],mount:"pinion",nest:["sled","pnema","pframe"]});we("pnema","emp","NEMA 17 del empujador",i=>{i.bb(-.038,.004,.892,.934,.014,.046,"black"),i.bb(-.038,.004,.892,.934,.01,.014,"alu"),i.bb(-.038,.004,.892,.934,.046,.05,"alu"),i.cyl(.0025,.016,-.017,.913,.002,"z","steel",8)},{nest:["pframe","pinion"]});we("servo","emp","Microservo MG90S",i=>{i.bb(at+.002,at+.025,.886,.898,-.038,-.01,"blue"),i.bb(at-.002,at+.029,.891,.893,-.038,-.01,"blue"),i.cyl(.0035,.004,at+.02,.892,-.008,"z","white",10)},{mount:"push",nest:["sled"]});we("horn","emp","Brazo del servo",i=>{i.bb(at+.018,at+.036,.8905,.8935,-.006,-.0045,"white")},{pivot:[at+.02,.892,-.005],mount:"horn",nest:["servo","sled","pin"]});we("pin","emp","Pin de la u\xF1a 10 \xD7 10 mm",i=>{i.bb(at+y.PINDX-.005,at+y.PINDX+.005,.878,.902,-.005,.005,"Pd"),i.bb(at+y.PINDX-.005,at+y.PINDX+.005,.902,.906,-.007,.007,"Pd")},{mount:"pin",nest:["sled","horn","fx*"]});function W_(i){let e=document.createElement("canvas");e.width=e.height=64;let t=e.getContext("2d");t.fillStyle="#fff",t.fillRect(0,0,64,64),t.fillStyle="#111";let n=i*9301+49297,s=()=>(n=(n*9301+49297)%233280)/233280;for(let o=0;o<8;o++)for(let a=0;a<8;a++)(o<2&&a<2||o>5&&a<2||o<2&&a>5||s()>.55)&&t.fillRect(4+o*7,4+a*7,7,7);t.fillStyle="#0d9488",t.font="bold 26px sans-serif",t.textAlign="center",t.fillText(String(i),32,41);let r=new zs(e);return r.colorSpace=yt,r}var X_=[];for(let i=0;i<6;i++){let e=we("fx"+i,"fix",`Fixture ${i+1} con ECU`,n=>{n.bb(-.102,.102,0,.003,-.087,.087,"P"),n.bb(-.105,-.093,.003,.006,-.09,.09,"P"),n.bb(-.093,-.065,.003,.006,.008,.09,"P"),n.bb(-.093,-.065,.003,.006,-.09,-.008,"P"),n.bb(-.065,.105,.003,.006,-.09,.09,"P");for(let r of[-1,1])n.bb(-.099,.099,.006,.07,Math.min(r*.072,r*.084),Math.max(r*.072,r*.084),"Pd");n.bb(-.105,-.093,.006,.04,-.06,.06,"Pd"),n.bb(.093,.105,.006,.04,-.06,.06,"Pd");let s=i%2?"dark":"ecu";n.bb(-.06,.08,.006,.052,-.065,.065,s);for(let r=0;r<6;r++)n.bb(-.045,.065,.052,.064,-.055+r*.022,-.049+r*.022,s);n.bb(.06,.08,.02,.044,-.04,.01,"black")},{pivot:[0,0,0],mount:"fx"}),t=new Nt(new ls(.026,.026),new zn({map:W_(i+1)}));t.position.set(.1052,.023,0),t.rotation.y=Math.PI/2,e.group.add(t),e.fixIndex=i,X_.push(e)}var _t={x0:-.245,x1:-.112,z:.13,y:.132},qe=_t.y+.006;we("tray","elec","Bandeja de electr\xF3nica",i=>{i.bb(_t.x0,_t.x1,.126,_t.y,-_t.z,_t.z,"P"),i.bb(_t.x0,_t.x0+.02,.12,.126,-_t.z,_t.z,"Pd");for(let[e,t]of[[-.236,-.118],[-.236,.018],[-.159,-.118],[-.159,.018]])i.cyl(.0025,.006,e,_t.y+.003,t,"y","white",8)},{nest:["*pf","bat_cradle"]});we("perf","elec","Placa perforada 9 \xD7 15 cm",i=>{let e=qe;i.bb(-.242,-.152,e,e+.0016,-.125,.025,"perf"),i.bb(-.214,-.186,e+.0016,e+.0096,-.072,-.068,"black"),i.bb(-.214,-.186,e+.0016,e+.0096,-.022,-.018,"black"),i.bb(-.214,-.186,e+.0096,e+.0112,-.072,-.018,"pcb"),i.bb(-.209,-.191,e+.0112,e+.0142,-.04,-.022,"steel");for(let t=0;t<3;t++){let n=-.115+t*.022;i.bb(-.24,-.224,e+.0016,e+.0096,n-.0085,n+.0085,"black"),i.bb(-.24,-.224,e+.0096,e+.0112,n-.0085,n+.0085,"pcbB"),i.bb(-.236,-.228,e+.0112,e+.0172,n-.004,n+.004,"alu"),i.cyl(.003,.01,-.219,e+.0066,n,"y","blue",10)}i.bb(-.18,-.165,e+.0016,e+.0056,-.122,-.078,"pcbB"),i.bb(-.18,-.167,e+.0016,e+.0056,-.068,-.054,"pcb"),i.bb(-.18,-.164,e+.0016,e+.0056,-.045,-.008,"pcbB");for(let t=0;t<7;t++)i.bb(-.16,-.153,e+.0016,e+.0116,-.12+t*.02,-.11+t*.02,"green")},{nest:["tray"]});we("boost","elec","Elevador de voltaje 400 W",i=>{i.bb(-.242,-.182,qe,qe+.0016,.035,.125,"pcbB"),i.bb(-.236,-.188,qe+.0016,qe+.026,.045,.06,"alu"),i.bb(-.236,-.188,qe+.0016,qe+.026,.1,.115,"alu"),i.cyl(.009,.02,-.225,qe+.0116,.08,"y","dark",14),i.cyl(.009,.02,-.2,qe+.0116,.08,"y","dark",14),i.cyl(.003,.01,-.188,qe+.0066,.12,"y","blue",8)},{nest:["tray"]});we("xl4005","elec","Reductor XL4005",i=>{i.bb(-.145,-.118,qe,qe+.0016,-.122,-.068,"pcbB"),i.cyl(.006,.01,-.131,qe+.0066,-.105,"y","dark",12),i.bb(-.14,-.13,qe+.0016,qe+.0076,-.085,-.075,"black")},{nest:["tray"]});we("relay","elec","M\xF3dulo rel\xE9 T90 30 A",i=>{i.bb(-.175,-.118,qe,qe+.0016,.035,.085,"pcb"),i.bb(-.17,-.142,qe+.0016,qe+.0266,.04,.06,"blue"),i.bb(-.17,-.142,qe+.0016,qe+.0266,.062,.082,"blue"),i.bb(-.136,-.122,qe+.0016,qe+.0116,.04,.08,"green")},{nest:["tray"]});we("fuses","elec","Fusibles 15 A y 10 A",i=>{for(let[e,t]of[[.098,"cBlu"],[.115,"cRed"]])i.bb(-.165,-.125,_t.y,_t.y+.012,e-.007,e+.007,"black"),i.bb(-.15,-.14,_t.y+.012,_t.y+.02,e-.003,e+.003,t)},{nest:["tray"]});we("trayCab","elec","Cables de la bandeja",i=>{let e=qe+.012;i.tube([[-.14,_t.y+.016,.098],[-.15,e+.012,.09],[-.13,e+.01,.078]],.0018,"cRed",16),i.tube([[-.16,e+.015,.075],[-.18,e+.02,.09],[-.2,e+.02,.105],[-.214,e+.005,.11]],.0018,"cRed",20),i.tube([[-.13,e,.04],[-.14,e+.01,.02],[-.155,e+.004,-.002],[-.156,qe+.012,-.01]],.0016,"cRed",20),i.tube([[-.14,_t.y+.016,.115],[-.128,e+.015,0],[-.125,e+.01,-.07]],.0012,"cRed",20),i.tube([[-.124,qe+.003,-.09],[-.14,e+.006,-.1],[-.156,qe+.012,-.11]],.0012,"cRed",16),i.tube([[-.13,qe+.003,-.075],[-.145,e+.008,-.06],[-.156,qe+.012,-.09]],.0012,"cBlk",16),i.tube([[-.188,qe+.012,.122],[-.17,e+.014,.128],[-.13,e+.012,.127],[-.116,_t.y+.012,.126]],.0018,"cOra",20),i.tube([[-.186,qe+.01,.118],[-.165,e+.01,.123],[-.128,e+.008,.121],[-.116,_t.y+.012,.119]],.0018,"cBlk",20)},{noCheck:!0,shadow:!1});we("kcd1","elec","Interruptor KCD1",i=>{i.bb(-.258,-.25,.124,.17,.06,.1,"Pd"),i.bb(-.264,-.258,.137,.157,.07,.09,"black"),i.bb(-.268,-.262,.143,.155,.073,.087,"red",.2)},{nest:["*pf"]});we("estop","elec","Paro de emergencia LAY37",i=>{i.bb(-.25,-.205,1.04,1.046,.09,.15,"Pd"),i.cyl(.02,.008,-.225,1.05,.12,"y","yellow",20),i.cyl(.011,.02,-.225,1.064,.12,"y","black",16),i.cyl(.019,.012,-.225,1.08,.12,"y","red",20,.016)},{nest:["*pf"]});function Fl(i,e,t,n,s,r){if(s===0&&r===0){i.bb(e-.007,e+.007,t-.0016,t,n-.012,n+.012,"pcbB"),i.bb(e-.002,e+.002,t-.0036,t-.0016,n-.003,n+.003,"black");return}let o=.0125,a=.0016;s?(i.bb(e,e+s*a,t-.007,t+.007,n-o,n+o,"pcbB"),i.bb(e+s*a,e+s*.0036,t-.002,t+.002,n-.003,n+.003,"black")):(i.bb(e-o,e+o,t-.007,t+.007,n,n+r*a,"pcbB"),i.bb(e-.003,e+.003,t-.002,t+.002,n+r*a,n+r*.0036,"black"))}we("vl_front","elec","VL53L0X frontal",i=>{i.bb(.226,.246,.12,.126,-.015,.015,"Pd"),i.bb(.24,.244,.126,.165,-.015,.015,"Pd"),Fl(i,.244,.15,0,1,0)},{nest:["*pf"]});for(let i of[-1,1])we("vl_side"+(i<0?"L":"R"),"elec","VL53L0X lateral",e=>{let t=(n,s)=>[Math.min(i*n,i*s),Math.max(i*n,i*s)];e.bb(-.17,-.13,.12,.126,...t(.175,.2),"Pd"),e.bb(-.165,-.135,.126,.165,...t(.196,.2),"Pd"),Fl(e,-.15,.15,i*.2,0,i)},{nest:["*pf"]});we("vl_pile","elec","VL53L0X de la pila",i=>{i.bb(.03,.05,.955,y.YT-.015,.164,.17,"Pd"),i.bb(.03,.05,.955,.961,.066,.17,"Pd"),Fl(i,.04,.955,.078,0,0)},{nest:["*pf"]});we("qtr","elec","Barra IR QTR-8A",i=>{i.bb(.22,.226,.006,y.H0,-.012,.012,"Pd"),i.bb(.22,.242,.084,y.H0,-.012,.012,"Pd"),i.bb(.196,.22,.006,.0076,-.0375,.0375,"pcbB");for(let e=0;e<8;e++)i.bb(.205,.211,.004,.006,-.033+e*.0095,-.029+e*.0095,"black")},{nest:["*pf"]});we("jet_plate","elec","Placa del Jetson",i=>i.bb(-.202,-.04,y.HT,y.HT+.006,-.198,.198,"mdf"),{nest:["*pf"]});we("jetson","elec","Jetson Orin Nano Super",i=>{let e=y.HT+.006;i.bb(-.2,-.1,e,e+.004,-.05,.04,"pcb");for(let[t,n]of[[-.196,-.046],[-.104,-.046],[-.196,.036],[-.104,.036]])i.cyl(.002,.004,t,e+.006,n,"y","steel",6);i.bb(-.19,-.11,e+.008,e+.03,-.04,.03,"alu"),i.cyl(.02,.006,-.15,e+.033,-.005,"y","black",18),i.bb(-.202,-.198,e+.006,e+.016,-.04,.02,"dark")},{nest:["jet_plate"]});we("camera","elec","C\xE1mara Logitech 1080p",i=>{i.bb(.226,.244,y.HT,y.HT+.006,-.02,.02,"Pd"),i.bb(.222,.248,y.HT+.006,y.HT+.034,-.045,.045,"black"),i.cyl(.009,.004,.25,y.HT+.02,0,"x","glass",16)},{nest:["*pf"]});function Kt(i,e,t,n,s,r={}){return we(i,"elec",e,o=>o.tube(s,n,t,Math.max(24,s.length*10)),{noCheck:!0,shadow:!1,...r})}var gs=.126+y.BAT.h;Kt("cab_bat","Bater\xEDa \u2192 fusibles (14 AWG)","cRed",.0022,[[-.06,gs+.014,.055],[-.075,gs+.03,.075],[-.11,gs-.02,.095],[-.13,_t.y+.02,.098]]);Kt("cab_batN","Bater\xEDa \u2212 \u2192 GND","cBlk",.0022,[[-.06,gs+.014,-.055],[-.08,gs+.03,-.075],[-.112,gs-.02,-.09],[-.13,qe+.004,-.08]]);for(let i of[-1,1]){let e=i<0?"L":"R";Kt("cab_18_"+e,"Elevador \u2192 M0601 (18 V)","cOra",.0018,[[-.116,_t.y+.012,.122],[-.105,.124,i*.135],[-.02,.123,i*.15],[.05,.11,i*.118],[.07,.09,i*.115]]),Kt("cab_485_"+e,"RS485 (A, B, GND)","cGrn",.0011,[[-.165,qe+.006,-.1],[-.15,.15,i*.11],[-.03,.132,i*.14],[.06,.104,i*.116],[.078,.084,i*.115]]),Kt("cab_nema_"+e,"NEMA del elevador \u2192 A4988","cBlu",.0012,[[.183,.243,i*.188],[.16,.215,i*.195],[0,.18,i*.15],[-.15,.16,i*.1],[-.226,qe+.012,-.1+(i+1)*.011]]),Kt("cab_lsw_"+e,"Final de carrera \u2192 GPIO","cWht",.001,[[.183,.355,i*.196],[.195,.33,i*.198],[.12,.23,i*.18],[-.1,.17,i*.11],[-.175,qe+.012,-.03]])}Kt("cab_pnema","NEMA del empujador \u2192 A4988","cBlu",.0012,[[-.04,.913,.04],[-.12,.95,.09],[-.214,.9,.14],[-.214,.4,.155],[-.214,.2,.12],[-.226,qe+.012,-.071]]);Kt("cab_servo","Servo de la u\xF1a (curva floja de ~30 cm)","cOra",.0011,[[.01,.9,-.03],[-.04,.96,-.05],[-.12,.975,-.07],[-.18,.93,-.09],[-.214,.88,-.12],[-.214,.4,-.15],[-.214,.2,-.12],[-.19,qe+.012,-.05]]);Kt("cab_i2c","I\xB2C a los VL53L0X","cYel",.001,[[.04,.958,.09],[.04,.99,.15],[-.05,1,.16],[-.214,.95,.16],[-.214,.4,.16],[-.214,.2,.115],[-.17,qe+.01,-.02]]);Kt("cab_i2cF","I\xB2C sensores bajos","cYel",.001,[[.24,.15,.004],[.2,.135,.01],[0,.13,.105],[-.15,.15,.192],[-.175,qe+.01,-.01]]);Kt("cab_qtr","QTR-8A (5 sensores)","cPur",.0011,[[.222,.03,0],[.2,.1,-.105],[0,.125,-.112],[-.155,.14,-.11],[-.18,qe+.012,-.02]]);Kt("cab_jet","Rama auxiliar \u2192 Jetson (12 V)","cRed",.0016,[[-.14,_t.y+.02,.115],[-.238,.2,.15],[-.238,.8,.15],[-.205,1.03,.13],[-.2,y.HT+.012,.01]]);Kt("cab_stop","Paro (NC) \u2192 rel\xE9","cRed",.0011,[[-.225,1.046,.12],[-.236,1,.15],[-.236,.4,.156],[-.225,.2,.14],[-.15,qe+.02,.07]]);Kt("cab_usb","USB Jetson \u2194 ESP32","cWht",.0014,[[-.198,y.HT+.011,-.03],[-.232,1,-.15],[-.232,.4,-.156],[-.23,.2,-.13],[-.2,qe+.016,-.045]]);we("panel","est","Panel frontal MDF 3 mm",i=>{let e=y.PANX,t=y.PANX+y.PANT,n=y.W/2;i.bb(e,t,y.H0,y.WIN0,-n,n,"mdf"),i.bb(e,t,y.WIN1,y.HT,-n,n,"mdf"),i.bb(e,t,y.WIN0,y.WIN1,-n,-y.WINZ,"mdf"),i.bb(e,t,y.WIN0,y.WIN1,y.WINZ,n,"mdf")},{explode:[.35,.05,0],nest:["*pf"]});var Zt=y.PANX+y.PANT+.003,ar=4*Math.PI/180;function Ah(i,e){for(let t of[-1,1]){let n=Math.atan2(.14,.42)*-t,s=Math.hypot(.42,.14);i.box(s,.02,.02,.05,.01,t*(.212+.07),"P",0,n,0)}i.bb(.345,.365,0,.5,.29,.31,"alu")}function Rh(i,e,t,n){let s=document.createElement("canvas");s.width=s.height=64;let r=s.getContext("2d");r.fillStyle="#fff",r.fillRect(0,0,64,64),r.fillStyle="#000",r.fillRect(6,6,52,52),r.fillStyle="#fff",[[1,1],[3,1],[2,2],[4,2],[1,3],[3,4],[2,4],[4,4]].forEach(([l,c])=>r.fillRect(6+l*8.7,6+c*8.7,8.7,8.7));let o=new zs(s);o.colorSpace=yt,o.magFilter=Ut;let a=new Nt(new ls(.1,.1),new zn({map:o}));a.position.set(e,t,n),a.rotation.y=-Math.PI/2,i.add(a)}var Ta=1.25,Aa=we("st_belt","sta","Banda transportadora",i=>{let e=y.BELT;i.bb(Zt+.004,Ta,e-.04,e,-.15,.15,"belt");for(let t of[-1,1])i.bb(Zt,Ta,e-.055,e-.005,Math.min(t*.155,t*.175),Math.max(t*.155,t*.175),"alu");i.cyl(.02,.3,Zt+.02,e-.02,0,"z","alu",18);for(let t of[Zt+.1,Ta-.06])for(let n of[-1,1])i.bb(t-.015,t+.015,0,e-.055,n*.165-.015,n*.165+.015,"alu");for(let t of[-1,1])i.bb(Zt+.008,Ta,e,e+.03,Math.min(t*(y.FW/2+.0025),t*(y.FW/2+.0085)),Math.max(t*(y.FW/2+.0025),t*(y.FW/2+.0085)),"P");Ah(i)},{world:!0,noCheck:!0});Rh(Aa.group,.344-Aa.home.x,.45-Aa.home.y,.3-Aa.home.z);we("st_stripes","sta","Banda en movimiento",i=>{for(let e=0;e<11;e++)i.bb(Zt+.03+e*.09,Zt+.036+e*.09,y.BELT,y.BELT+6e-4,-.148,.148,"dark")},{world:!0,noCheck:!0,mount:"belt",shadow:!1});var Vn={x0:Zt,y0:y.BELT,len:1.4,r:.015},Ri=i=>Be(Vn.x0+i*Math.cos(ar),Vn.y0-i*Math.sin(ar),0),Ra=we("st_ramp","sta","Rampa de rodillos",i=>{let e=-ar,t=Ri(Vn.len/2);for(let s of[-1,1])i.box(Vn.len+.02,.07,.015,t.x,t.y-.03,s*.1325,"wood",0,0,e),i.box(Vn.len,.035,.01,t.x,t.y+.0175,s*.115,"P",0,0,e);let n=Ri(Vn.len);i.box(.012,.06,.24,n.x,n.y+.02,0,"P",0,0,e);for(let s of[-1,1])for(let r of[.15,1.25]){let o=Ri(r);i.bb(o.x-.02,o.x+.02,0,o.y-.065,s*.13-.02,s*.13+.02,"wood")}for(let s=0;s<14;s++){let r=Ri(.012+s*.1);i.cyl(.004,.25,r.x,r.y-Vn.r,0,"z","steel",8)}Ah(i)},{world:!0,noCheck:!0});Rh(Ra.group,.344-Ra.home.x,.45-Ra.home.y,.3-Ra.home.z);we("st_rollers","sta","Rodillos",i=>{for(let e=0;e<14;e++){let t=Ri(.012+e*.1);i.cyl(Vn.r,.22,t.x,t.y-Vn.r,0,"z","P",14),i.bb(t.x-.0015,t.x+.0015,t.y-5e-4,t.y+3e-4,-.1,.1,"Pd")}},{world:!0,noCheck:!0});function Ch(i){let e=Ri(i);return{pos:Be(e.x,e.y,0),rz:-ar}}var Al=Be(.1,.596,.8);we("mesa","sta","Mesa de trabajo",i=>{i.bb(-.36,.2,.7,.726,.55,1.05,"wood");for(let e of[-.33,.17])for(let t of[.58,1.02])i.bb(e-.02,e+.02,0,.7,t-.02,t+.02,"wood")},{world:!0,noCheck:!0});var Bl=[];function q_(i){let t=Dt.get(i).group.clone(!0),n=[];return t.traverse(s=>{s.isMesh&&(s.material=s.material.clone(),s.castShadow=!0,s.material.emissive&&n.push({mat:s.material,base:s.material.color.clone()}))}),{g:t,mats:n}}function st(i,e,t,n,s,r){let o=new tn;o.name=i,za.add(o);let a=[],l=Be(0,0,0),c=0,u=0;for(let d of s){let[f,g,_,m=0,p=0,E=0,x=0]=d,{g:w,mats:D}=q_(f);w.position.set(0,0,0),w.quaternion.setFromEuler(new un(m,p,E)),w.updateMatrixWorld(!0);let R=new cn().setFromObject(w);w.position.set(g-(R.min.x+R.max.x)/2,-R.min.y+x,_-(R.min.z+R.max.z)/2),o.add(w),a.push(...D),l.add(Be(g,0,_)),c++,u=Math.max(u,R.max.y-R.min.y+x)}l.divideScalar(c),l.y=u+.015;let h={id:i,sub:r||Dt.get(s[0][0]).sub,name:t,group:o,mats:a,home:Be(),homeQ:new ft,explode:Be(0,.15,0),from:Be(0,.25,0),mount:null,track:[],mode:"",localBox:new cn,nest:[],world:!0,noCheck:!0,only:null,inv:e};Dt.set(i,h),Bl.push({id:i,zone:e,name:t,qty:n,anchor:l})}var Ia={A:-1.32,B:0,C:1.32},Y_=(i,e,t)=>[Ia[i]+(e-1.5)*.3,(t-1.5)*.3],Pe=(i,e,t,n=0,s=0)=>{let[r,o]=Y_(i,e,t);return[r+n,o+s]},En=[0,0,Math.PI/2],Ph=[0,Math.PI/2,0],Le=(i,e,t=[0,0,0])=>[i,e[0],e[1],...t];st("inv_post","A","Postes 950 mm","\xD74",[Le("post_FL",Pe("A",1.5,0,0,-.03),En),Le("post_FR",Pe("A",1.5,0,0,.03),En)]);st("inv_col","A","Columnas de la torre 890 mm","\xD74 (propuesta)",[Le("col_FL",Pe("A",1.5,0,0,.09),En),Le("col_FR",Pe("A",1.5,0,0,.14),En)]);st("inv_pf","A","Largueros 440 \xB7 travesa\xF1os 340","\xD74 \xB7 \xD76 (+1 de 198)",[Le("larg_bL",Pe("A",.5,1,0,-.05)),Le("trav_bF",Pe("A",.5,1,0,.04),Ph)]);st("inv_esc","A","Escuadras impresas","\xD736 + ~22 de la torre",[Le("esc_c",Pe("A",2,1))]);st("inv_nut","A","Tuercas y tornillos M6","~80 juegos",[Le("nut_bF",Pe("A",3,1))]);st("inv_cast","A","Rodaja twin 50 mm","\xD74",[Le("cast_FL",Pe("A",0,2,-.04,-.04)),Le("cast_FR",Pe("A",0,2,.04,-.04)),Le("cast_BL",Pe("A",0,2,-.04,.04)),Le("cast_BR",Pe("A",0,2,.04,.04))]);st("inv_mot","A","Motor-rueda M0601","izq. FIT1042 \xB7 der. FIT1038",[Le("mot_L",Pe("A",1,2,-.05)),Le("mot_R",Pe("A",1,2,.05))]);st("inv_susp","A","Placas pivotantes y resortes","M8 \xB7 608ZZ \xB7 k \u2248 3 N/mm",[Le("susp_L",Pe("A",2,2,-.03)),Le("spring_R",Pe("A",2,2,.08))]);st("inv_bat","A","Bater\xEDa BR-1224","12 V \xB7 24 Ah \xB7 8.3 kg",[Le("bat",Pe("A",3,2))],"elec");st("inv_bat2","A","Barra y varillas M6 de la bater\xEDa","+ cuna impresa",[Le("bat_hold",Pe("A",1.5,3),Ph)],"elec");st("inv_screw","B","Husillos TR8 60 cm + tuerca","\xD72 \xB7 esperar: confirmar 1 entrada",[Le("screw_L",Pe("B",.5,0,0,-.05),En),Le("screw_R",Pe("B",.5,0,0,-.015),En),Le("rod_L",Pe("B",.5,0,0,.03),En),Le("rod_R",Pe("B",.5,0,0,.065),En)]);st("inv_guide","B","Gu\xEDas en L impresas","\xD74 \xB7 ~50 cm",[Le("guide_BL",Pe("B",2.5,0,0,-.03),En),Le("guide_BR",Pe("B",2.5,0,0,.04),En)]);st("inv_nema","B","NEMA 17 17HS4401","\xD73",[Le("nema_L",Pe("B",0,1,-.05)),Le("nema_R",Pe("B",0,1,.01)),Le("pnema",Pe("B",0,1,.07))]);st("inv_kfl","B","KFL08 \xD74 \xB7 cople \xD72","5 \u2192 8 mm",[Le("kflLo_L",Pe("B",1,1,-.04,-.03)),Le("kflLo_R",Pe("B",1,1,.04,-.03)),Le("kflUp_L",Pe("B",1,1,-.04,.04)),Le("kflUp_R",Pe("B",1,1,.04,.04)),Le("cople_L",Pe("B",1,1,.1,0))]);st("inv_sc","B","SC8UU","\xD76 \xB7 varillas 8 mm",[Le("sc_L",Pe("B",2,1))]);st("inv_lsw","B","Final de carrera","\xD73",[Le("lsw_L",Pe("B",3,1,-.03)),Le("lsw_R",Pe("B",3,1,.03))]);st("inv_plat","B","Plataforma impresa","21 \xD7 18 cm, 2 brazos",[Le("plat",Pe("B",0,2,.02))]);st("inv_sled","B","Carro, placa 15 \xD7 3 y cremallera","2 tramos de 15 cm",[Le("sled",Pe("B",1.5,2,.02))]);st("inv_pin","B","Pi\xF1\xF3n m1.5 z20 \xB7 MG90S \xB7 pin","servo de 180\xB0",[Le("pinion",Pe("B",3,2,-.05)),Le("servo",Pe("B",3,2,.03)),Le("pin",Pe("B",3,2,.08))]);st("inv_fx","B","Fixtures con costados","\xD76 \xB7 nivel de 7.0 cm",[Le("fx0",Pe("B",1,3,-.04)),Le("fx1",Pe("B",2,3,.04))]);st("inv_perf","C","Placa con ESP32 y 3 A4988","MAX485 \xB7 convertidor \xB7 PCF8574",[Le("perf",Pe("C",0,0,.04))]);st("inv_boost","C","Elevador 400 W","12 \u2192 18 V",[Le("boost",Pe("C",1,0,.05))]);st("inv_xl","C","Reductor XL4005","12 \u2192 5 V",[Le("xl4005",Pe("C",2,0))]);st("inv_relay","C","Rel\xE9 T90 30 A","2 canales",[Le("relay",Pe("C",3,0))]);st("inv_fuse","C","Fusibles y portafusibles","15 A \xB7 10 A",[Le("fuses",Pe("C",0,1,.03))]);st("inv_stop","C","KCD1 y paro LAY37","encendido \xB7 paro NC",[Le("kcd1",Pe("C",1,1,-.05)),Le("estop",Pe("C",1,1,.04))]);st("inv_vl","C","VL53L0X","\xD74 \xB7 3 obst\xE1culos + 1 pila",[Le("vl_front",Pe("C",2,1,-.03)),Le("vl_pile",Pe("C",2,1,.04))]);st("inv_qtr","C","Barra IR QTR-8A","respaldo, a 3.3 V",[Le("qtr",Pe("C",3,1))]);st("inv_jet","C","Jetson Orin Nano Super","ya comprado",[Le("jetson",Pe("C",0,2,.05))]);st("inv_cam","C","C\xE1mara Logitech 1080p","ya la tiene Mario",[Le("camera",Pe("C",1,2,.03))]);st("inv_tray","C","Bandeja impresa","separadores M3",[Le("tray",Pe("C",2.5,2,.06))]);st("inv_panel","C","Panel frontal MDF 3 mm","ventana 24 \xD7 9.7 cm",[Le("panel",Pe("C",1.5,3,0,.03),En)],"est");var j_=[{n:"0",name:"Inventario"},{n:"E6",name:"Perfil"},{n:"E7",name:"Base"},{n:"E8",name:"Estructura"},{n:"E9",name:"Elevador"},{n:"E10",name:"Empujador y u\xF1a"},{n:"E11\xB713",name:"Electr\xF3nica"},{n:"\u25B6",name:"Funcionamiento"}],ct=[];function Ve(i){ct.push(Object.assign({dur:8,add:[],labels:[],dims:[],dimOld:!0,addStart:.3,stagger:.45,addDur:1.3},i))}var Z_=i=>Bl.filter(e=>e.zone===i),Oa=ys.map(i=>i.id);var Lh=i=>1.4-.008-y.FL/2-i*(y.FL+.004),J_=.878-(y.LOAD0+.0015),ph=.13-.009;function Gn(i,e,t){e.forEach((n,s)=>{i.fx[n]={x:y.XC,y:t+s*y.PITCH,z:0,rz:0}})}function zl(i,e,t,n,s=1){let r=g=>g*s,o=y.LEVEL(t),a=y.LEVEL(t+1);i.plat=bt(o,a,Et(e,r(8.8),r(11.2)));let l=y.P0;l=bt(l,ph,Et(e,0,r(1)));let c=.01;e>r(4.2)&&(l=bt(ph,c,nn(e,r(4.2),r(7)))),e>r(7)&&(l=bt(c,c+.002,nn(e,r(7),r(7.3)))),e>r(8)&&(l=bt(c+.002,y.P0,Et(e,r(8),r(8.8)))),i.push=l,i.pin=Et(e,r(3.5),r(4.2))*(1-Et(e,r(7.3),r(8)));let u=.13,h=y.XC-y.FL/2,d=bt(.88,u,nn(e,r(.5),r(3.5)));e>r(4.2)&&(d=Math.min(u,Math.max(h,i.push+.018)));let f=nn(d,u-.02,h);i.fx[n]={x:d+y.FL/2,y:bt(y.BELT,o+t*y.PITCH,f>.95?1:0)-(e>r(8.8)?o-i.plat:0),z:0,rz:0},i.belt=(i.beltBase||0)+(.88-Math.max(d,u))*(e<r(3.6),1),e<r(.5)&&(i.fx[n].x=.88+y.FL/2)}function Ih(i,e,t,n,s,r=1){let o=_=>_*r,a=y.UNLV(t);i.plat=a;let l=bt(y.P0,y.P0+y.STROKE,Et(e,o(.3),o(3.4)));e>o(3.4)&&(l=bt(y.P0+y.STROKE,y.P0,Et(e,o(3.6),o(5)))),i.push=l;let c=y.XC-y.FL/2,u=y.P0+y.STROKE,h=Math.max(c,Math.min(u,l>c?e>o(3.4)?u:l:c)),d=h+y.FL/2,f=Lh(s),g=u+y.FL/2-Zt;if(e<=o(3.4)){let _=a+(t-1)*y.PITCH,m=nn(d,Zt,Zt+y.FL/2),p=d-Zt,E=Ri(Math.max(0,p));i.fx[n]={x:d,y:bt(_,E.y,m),z:0,rz:-ar*nn(h,Zt-.01,Zt+.03)}}else{let _=bt(g,f,Et(e,o(3.5),o(5.6))),m=Ch(_);i.fx[n]={x:m.pos.x,y:m.pos.y,z:0,rz:m.rz}}i.roll=(i.rollBase||0)+(e>o(.3)?(Math.min(e,o(5.6))-o(.3))*6:0)}function K_(i,e){e.forEach((t,n)=>{let s=Ch(Lh(n));i.fx[t]={x:s.pos.x,y:s.pos.y,z:0,rz:s.rz}})}var mh={A:["Estructura, tracci\xF3n y energ\xEDa",{que:"Antes de armar, cuenten cada pieza contra la lista de compras y gu\xE1rdenla en cajas etiquetadas por subsistema: tracci\xF3n, torre, empujador, electr\xF3nica y torniller\xEDa.",porque:"Si falta una pieza a media etapa, se detiene todo. Y lo que se mide al recibir (espiga de las rodajas, conectores del M0601, resortes) corrige el CAD.",herr:"Vernier, flex\xF3metro, b\xE1scula de cocina, cajas con etiqueta.",check:"Hay un M0601 izquierdo (FIT1042) y uno derecho (FIT1038), no dos iguales.",error:"Comprar dos M0601 del mismo lado: una rueda girar\xEDa al rev\xE9s de lo esperado y no embona igual."}],B:["Torre, empujador y fixtures",{que:"Revisen las piezas de la torre y el empujador. Los husillos se compran hasta confirmar que son de 1 entrada.",porque:"Solo el husillo de 1 entrada (avance 2 mm) se autobloquea: si se va la energ\xEDa, la pila no se cae.",herr:"Plum\xF3n y vernier para la prueba del husillo.",check:"Prueba del husillo: con una vuelta la tuerca avanza 2 mm. Si avanza 8 mm es de 4 entradas y no sirve para la demo.",error:"Comprar el MG90S de 360\xB0: no se queda en un \xE1ngulo. La u\xF1a necesita el de 180\xB0."}],C:["Electr\xF3nica",{que:"Cuenten los m\xF3dulos y pru\xE9benlos sueltos en el banco de pruebas (Etapa 2B) antes de soldar nada.",porque:"Un m\xF3dulo da\xF1ado se descubre en la mesa, no con el carrito armado.",herr:"Mult\xEDmetro, protoboards y cables dupont.",check:"Bater\xEDa cargada con el BR-700, marcando ~12.8 V en reposo.",error:'Probar un motor conect\xE1ndolo "a ver qu\xE9 pasa" a una fuente: nada se conecta hasta la Etapa 11.'}]},$_={A:{t:[Ia.A,0,.02],d:[0,1,.42],r:.66},B:{t:[Ia.B,0,.02],d:[0,1,.42],r:.66},C:{t:[Ia.C,0,.02],d:[0,1,.42],r:.66}};for(let i of["A","B","C"]){let e=Z_(i);Ve({ch:0,et:"Inventario",title:mh[i][0],txt:mh[i][1],dur:11,cam:$_[i],inv:i,add:i==="A"?Bl.map(t=>t.id):[],addStart:.1,stagger:.05,addDur:.8,labels:e.map((t,n)=>({at:t.anchor.toArray(),t:t.name,s:t.qty,when:.6+n*.15,cls:"inv"}))})}var Dx=Ol("post_FL",.003).pos;Ve({ch:1,et:"Etapa 6",title:"Las 7 barras de 2 m",dur:8,cam:{t:[.22,0,ms+3*ka],d:[0,1,.18],r:1.3},add:[{ids:Oa,pose:i=>Ol(i,.003),from:[0,.35,0]},...ai.map((i,e)=>"waste"+e)],stagger:.12,show:ai.map((i,e)=>"waste"+e),labels:ai.map((i,e)=>({p:"waste"+e,o:[0,.02,0],t:`Barra ${e+1}${e===ai.length-1?" (ya la tienen)":""} \xB7 ${i.note}`,when:1.2+e*.25,cls:"inv"})),dims:[{a:[Na,.03,ms-.016],b:[Na+2,.03,ms-.016],off:[0,0,-.05],text:"2000 mm",when:1.5}],txt:{que:"El perfil se compra en barras de 2 m. Con las 4 columnas de la torre (propuesta) son 19 cortes y 7 barras: tienen 1 y compran 6 (la lista original eran 15 cortes en 5 barras).",porque:"Cada corte se come ~3 mm (el grueso del disco) y las sobras no alcanzan para otra pieza; por eso se acomoda barra por barra.",herr:"Ingletadora con disco para aluminio (o segueta de 24 dientes y caja de ingletes), escuadra, flex\xF3metro, plum\xF3n, lentes y guantes.",check:"La punta de cada barra est\xE1 a escuadra; si no, recorten 5 mm para emparejarla.",error:"Medir cada pieza desde la anterior y no desde la punta: los errores se suman."}});Ve({ch:1,et:"Etapa 6",title:"Cortar a escuadra y limar",dur:8,cam:{t:[.08,0,ms+3*ka],d:[0,1,.18],r:1.28},add:[{ids:Oa,pose:i=>Ol(i,.06)}],stagger:.05,show:ai.map((i,e)=>"waste"+e),focus:Oa,labels:[{p:"post_FL",o:[0,.03,0],t:"Poste \xB7 950 mm",s:"\xB11 mm",when:1.6},{p:"larg_bL",o:[0,.03,0],t:"Larguero \xB7 440 mm",when:1.9},{p:"trav_bF",o:[0,.03,0],t:"Travesa\xF1o \xB7 340 mm",when:2.2}],txt:{que:"Marquen desde la punta, midan otra vez y corten del lado de afuera de la l\xEDnea con la barra sujeta con prensa. Limen las rebabas por fuera y dentro de las ranuras.",porque:"Un corte chueco hace que todo el marco quede torcido.",herr:"Ingletadora o segueta, prensa (sargento), lima plana y media ca\xF1a.",check:"Largo final \xB11 mm, corte a escuadra y una tuerca M6 desliza por la ranura de cada pieza.",error:"No limar dentro de la ranura: las tuercas no entran y con el marco armado ya no se puede limar."}});Ve({ch:1,et:"Etapa 6",title:"Las 19 piezas, marcadas y ordenadas",dur:8,cam:{t:[.15,0,.78],d:[.25,1,.8],r:.95},add:[{ids:Oa,pose:i=>G_(i)}],stagger:.04,labels:[{at:[-.5,.04,.62+.075],t:"4 \xD7 950 mm",s:"postes",when:1.8},{at:[-.5,.04,.86+.075],t:"4 \xD7 890 mm",s:"columnas de la torre (propuesta)",when:2},{at:[.28,.04,.62+.075],t:"4 \xD7 440 mm",s:"largueros de los marcos",when:2.2},{at:[.86,.04,.62+.15],t:"6 \xD7 340 + 1 \xD7 198 mm",s:"marcos, central, superior central y empujador",when:2.4}],txt:{que:'Marquen cada pieza con su nombre ("poste 1", "larguero arriba") y limpien la viruta de las ranuras con aire o una brocha.',porque:"Las 19 piezas se ven casi iguales; marcadas, cada una va a su lugar a la primera.",herr:"Plum\xF3n, brocha o aire.",check:"Los 4 postes miden lo mismo (m\xE1ximo 1 mm de diferencia); las 4 columnas, los 4 largueros y los travesa\xF1os, tambi\xE9n.",error:"Postes de distinto largo: el carrito queda cojo y la torre se tuerce."}});var Rl=y.H0+y.PF;Ve({ch:2,et:"Etapa 7",title:"Tuercas en la ranura, antes de cerrar",dur:8,cam:{t:[.12,.1,.1],d:[.85,.9,1],r:.24},add:[["larg_bL","larg_bR","trav_bF","trav_bB"],["nut_bL","nut_bR","nut_bF","nut_bB"]],addStart:.2,stagger:1.6,addDur:1.6,labels:[{p:"nut_bR",o:[.17,.02,0],t:"Tuercas M6 por la punta de la ranura",s:"2 por escuadra + 2\u20133 extra",when:3.6},{p:"larg_bL",o:[-.1,.03,0],t:"Larguero 440 mm",when:1.6},{p:"trav_bF",o:[0,.03,.08],t:"Travesa\xF1o 340 mm",when:1.8}],txt:{que:"Antes de unir nada, metan las tuercas hexagonales M6 por la punta de cada ranura: 2 por cada escuadra que va en esa ranura, m\xE1s 2\u20133 extra donde despu\xE9s se atornillar\xE1 algo (rodajas, motores, bandeja, bater\xEDa).",porque:"Con el marco cerrado ya no entran. Sobran tuercas, pero nunca faltan.",herr:"Tuercas M6 y tornillos M6 \xD7 16 (si la tuerca gira en la ranura, tuercas T).",check:"Cada tuerca desliza por toda la ranura sin atorarse.",error:"Cerrar el marco sin tuercas extra y tener que desarmarlo despu\xE9s."}});Ve({ch:2,et:"Etapa 7",title:"Postes y marco inferior con escuadras",dur:9,cam:{t:[0,.48,0],d:[.9,.5,1.05],r:.72},add:[["post_FL","post_FR","post_BL","post_BR"],"esc_b"],stagger:2,addDur:1.6,labels:[{p:"post_FR",o:[.02,.36,.02],t:"Poste 950 mm",s:"en cada esquina",when:1.8},{p:"esc_b",o:[.2,.06,.2],t:"Escuadras impresas",s:"2 por uni\xF3n, por dentro \xB7 M6 \xD7 16 a medias",when:3.8}],dims:[{a:[y.L/2,.02,y.W/2+.002],b:[-y.L/2,.02,y.W/2+.002],off:[0,0,.07],text:"500 mm",when:4.5},{a:[y.L/2+.002,.02,-y.W/2],b:[y.L/2+.002,.02,y.W/2],off:[.07,0,0],text:"400 mm (frente)",when:4.8},{a:[y.XP+.016,y.H0,y.ZP+.016],b:[y.XP+.016,y.HT,y.ZP+.016],off:[.05,0,.05],text:"950 mm",when:2.4}],txt:{que:"Paren los 4 postes en las esquinas y unan sus pies con los 2 largueros de 440 mm (lados largos) y los 2 travesa\xF1os de 340 mm (frente y atr\xE1s), al ras de abajo. En cada uni\xF3n, 2 escuadras impresas por dentro.",porque:"Los tornillos M6 \xD7 16 se aprietan solo a medias: primero hay que escuadrar.",herr:"Llaves Allen, tornillos M6 \xD7 16.",check:"Las escuadras asientan planas contra el perfil y los tornillos entran sin forzar.",error:"Escuadras impresas con poco relleno: se quiebran al apretar. Usen las de 40 % de relleno y 5 per\xEDmetros."}});var er=Rl+.003;Ve({ch:2,et:"Etapa 7",title:"Escuadrar: las 2 diagonales iguales",dur:8,cam:{t:[0,.1,0],d:[.32,1,.42],r:.42},dims:[{a:[y.L/2,er,-y.W/2],b:[-y.L/2,er,y.W/2],text:"\u2248 640 mm",when:.6,grow:[.6,2.4],cls:"hot",labAt:.25},{a:[y.L/2,er+.004,y.W/2],b:[-y.L/2,er+.004,-y.W/2],text:"\u2248 640 mm (\xB12 mm)",when:2.8,grow:[2.8,4.6],cls:"hot",labAt:.75}],labels:[{at:[0,er+.02,0],t:"Diagonales iguales = esquinas a 90\xB0",s:"\u221A(500\xB2 + 400\xB2) \u2248 640 mm",when:5}],txt:{que:"Midan las 2 diagonales del rect\xE1ngulo de abajo con el flex\xF3metro, de esquina exterior a esquina exterior. Si no son iguales (\xB12 mm), empujen la esquina larga hasta igualarlas y entonces aprieten firme.",porque:"Un rect\xE1ngulo con diagonales iguales tiene sus 4 esquinas a escuadra; todo lo de arriba hereda este marco.",herr:"Flex\xF3metro y llave Allen.",check:"Diagonales del marco de abajo iguales (\xB12 mm).",error:"Apretar todo antes de escuadrar: luego no hay forma de enderezarlo."}});Ve({ch:2,et:"Etapa 7",title:"Travesa\xF1o central",dur:7,cam:{t:[0,.1,0],d:[.5,.9,.9],r:.4},add:["trav_c","esc_c"],stagger:1.6,labels:[{p:"trav_c",o:[0,.03,.06],t:"Travesa\xF1o central 340 mm",s:"de aqu\xED cuelgan las placas de los motores",when:1.6}],dims:[{a:[y.L/2,Rl,y.ZP+.02],b:[0,Rl,y.ZP+.02],off:[0,.03,.03],text:"250 mm",when:2}],txt:{que:"Pongan el travesa\xF1o central de 340 mm a la mitad de los largueros, con 2 escuadras en cada lado.",porque:"Ah\xED se sujetan las placas pivotantes de los 2 motores.",herr:"Llaves Allen, flex\xF3metro.",check:"Queda a 250 mm de cada extremo y sus escuadras asientan planas.",error:"No dejar tuercas en la ranura de abajo del travesa\xF1o: ah\xED se atornillan los soportes del pivote."}});Ve({ch:2,et:"Etapa 7",title:"Rodajas en las esquinas",dur:8,cam:{t:[.05,.07,.05],d:[1,.3,.75],r:.4},add:[["cast_FL","cast_FR","cast_BL","cast_BR"]],addStart:.3,labels:[{p:"cast_FR",o:[.02,.06,.03],t:"Rodaja twin de nylon 50 mm",s:"20 kg c/u \xB7 carga ~4.7 kg \xB7 de espiga",when:2}],dims:[{a:[y.CX,0,y.CZ+.03],b:[y.CX,y.H0,y.CZ+.03],off:[.05,0,.04],text:"9 cm",when:2.4}],txt:{que:"Atornillen los 4 bloques impresos debajo de las esquinas y metan la espiga de cada rodaja en su bloque hasta que el arillo truene.",porque:"Son de espiga con arillo, no de placa: el bloque impreso tiene el barreno. Su alto (9 cm) fija la altura del marco.",herr:"Llave Allen, tornillos M6.",check:"Paren la base en un piso plano: las 4 rodajas tocan el piso y la base no baila al empujar una esquina.",error:"Medir la rodaja con cat\xE1logo y no la real: midan espiga y alto al recibirlas."}});Ve({ch:2,et:"Etapa 7",title:"Placas pivotantes de la suspensi\xF3n",dur:8,cam:{t:[.03,.06,-.16],d:[.55,.32,-1],r:.18},add:["susp_L","susp_R"],stagger:1.4,labels:[{p:"susp_L",o:[-.06,.015,-.01],t:"Pivote: tornillo M8 + 2 \xD7 608ZZ",s:"tuerca de seguridad",when:2},{p:"susp_L",o:[.07,-.02,-.025],t:"Tornillo gu\xEDa M8 y tuerca de precarga",when:3}],txt:{que:"Armen cada placa pivotante: 2 baleros 608ZZ a presi\xF3n en sus huecos y el tornillo M8 de pivote atravesando, con rondanas y tuerca de seguridad.",porque:"La placa deja que la rueda suba y baje con el piso, y el resorte la empuja contra \xE9l.",herr:"Llaves de 13 mm para M8, prensa para meter los baleros.",check:"La placa gira suave, sin juego.",error:"Meter el balero a golpes chuecos: se da\xF1a y la placa queda con juego."}});Ve({ch:2,et:"Etapa 7",title:"Motores M0601: izquierdo y derecho",dur:8,cam:{t:[.02,.07,0],d:[-1,.42,.18],r:.34},add:["mot_L","mot_R"],stagger:1.6,labels:[{p:"mot_L",o:[0,.07,-.02],t:"M0601 izquierdo \xB7 FIT1042",s:"rueda 102 mm \xB7 18 V \xB7 RS485",when:1.8},{p:"mot_R",o:[0,.07,.02],t:"M0601 derecho \xB7 FIT1038",s:"~8.7 kg por rueda (aguanta 10)",when:3.4}],dims:[{a:[y.WX,0,-y.WZ-.03],b:[y.WX,.102,-y.WZ-.03],off:[0,0,-.03],text:"\xD8 102 mm",when:4}],txt:{que:"Atornillen cada M0601 a su placa. El izquierdo (FIT1042) va del lado izquierdo viendo el carrito desde atr\xE1s hacia el frente, y el derecho (FIT1038) del derecho.",porque:"Cada uno trae su driver y su encoder; si se cruzan, una rueda gira al rev\xE9s.",herr:"Desarmador o Allen para los barrenos M2.5 del motor.",check:"Las 2 ruedas y las 4 rodajas tocan el piso al mismo tiempo.",error:"Montar dos del mismo lado: una rueda girar\xEDa al rev\xE9s de lo esperado y no embona igual."}});Ve({ch:2,et:"Etapa 7",title:"Resortes y precarga de 85 N",dur:9,cam:{t:[y.WX,.06,.18],d:[.55,.22,1],r:.12},add:["spring_L","spring_R"],stagger:.3,mech:(i,e)=>{e.spring=bt(.075/.047,1,Et(i,2.6,5.4))},labels:[{p:"spring_R",o:[.03,.035,.01],t:"Resorte de compresi\xF3n",s:"alambre 2 mm \xB7 \xD820 \xB7 k \u2248 3 N/mm \xB7 ~9 espiras",when:1.4},{p:"susp_R",o:[.07,-.028,.02],t:"Tuerca de precarga",s:"se aprieta con la base parada en el piso",when:3}],dims:[{a:[y.WX+.012,.043,.198],b:[y.WX+.012,.09,.198],off:[.02,0,.01],text:"75 \u2192 47 mm (\u221228 mm \u2248 85 N)",when:5.4}],txt:{que:"Monten el tornillo gu\xEDa M8 de cada resorte, el resorte y su tuerca. Con la base parada en el piso, aprieten la tuerca hasta que el resorte quede 28 mm m\xE1s corto que su largo libre (de 75 a 47 mm).",porque:"Esa compresi\xF3n da ~85 N en la rueda: no patina al arrancar y las rodajas no se levantan. El resorte va en la vertical del eje de la rueda.",herr:"Vernier y llaves de 13 mm.",check:"Resortes comprimidos 28 mm, medidos con vernier.",error:"Demasiada precarga levanta las rodajas y el carrito se mece; muy poca y las ruedas patinan al arrancar."}});Ve({ch:2,et:"Etapa 7",title:"Bater\xEDa al centro, bien sujeta",dur:8,cam:{t:[0,.18,0],d:[.75,.85,.9],r:.42},add:["bat_cradle","bat","bat_hold"],stagger:1.4,labels:[{p:"bat",o:[.02,.09,.03],t:"Bater\xEDa BR-1224",s:"12 V \xB7 24 Ah \xB7 8.3 kg \xB7 bornes hacia atr\xE1s",when:2},{p:"bat_hold",o:[.1,.02,0],t:"Barra y 2 varillas roscadas M6",s:"sin juego",when:3.6}],txt:{que:"Coloquen la bater\xEDa al centro y lo m\xE1s abajo posible, con los bornes hacia donde ir\xE1 la bandeja. Suj\xE9tenla con las escuadras impresas y las 2 varillas roscadas M6 con tuerca. Tapen los bornes con cinta de aislar.",porque:"8.3 kg sueltos en un frenazo rompen algo. Abajo y al centro, baja el centro de gravedad.",herr:"Llaves, cinta de aislar.",check:"La bater\xEDa no se mueve aunque sacudan la base; empujada a mano, la base rueda derecho unos 3 m.",error:"Conectar algo en esta etapa: los bornes se quedan tapados hasta la Etapa 11."}});Ve({ch:3,et:"Etapa 8",title:"Tuercas y marco superior",dur:9,cam:{t:[0,.6,0],d:[.9,.62,1.05],r:.78},add:[["larg_tL","larg_tR","trav_tF","trav_tB"],["nut_tL","nut_tR","nut_tF","nut_tB"],"esc_t"],stagger:1.7,addDur:1.5,labels:[{p:"larg_tR",o:[0,.04,.02],t:"Marco superior al ras de la punta",s:"2 \xD7 440 mm + 2 \xD7 340 mm",when:1.6},{p:"nut_tF",o:[.02,-.03,.15],t:"Tuercas antes de cerrar",s:"+2\u20133 extra para torre, empujador y paneles",when:3.4}],dims:[{a:[y.XP+.016,0,y.ZP+.016],b:[y.XP+.016,y.HT,y.ZP+.016],off:[.07,0,.07],text:"\u2248 1.04 m (gu\xEDa: ~1.03)",when:4}],txt:{que:"Igual que abajo: primero las tuercas en todas las ranuras que se van a cerrar, con 2\u20133 extra donde ir\xE1n la torre, el empujador, la bandeja y los paneles. Luego 2 largueros y 2 travesa\xF1os arriba, al ras de la punta de los postes, con 2 escuadras por uni\xF3n, apretadas a medias.",porque:"Se cierra el cubo de aluminio; si se tuerce al empujar una esquina de arriba, la torre se va a trabar.",herr:"Llaves Allen, tornillos M6 \xD7 16.",check:"Todas las escuadras asientan y los tornillos est\xE1n a medias, listos para escuadrar.",error:"Apretar de m\xE1s el tornillo M6 en una pieza impresa: se raja. Firme, pero sin forzar."}});Ve({ch:3,et:"Etapa 8",title:"Plomo, escuadra y diagonales de arriba",dur:8,cam:{t:[.05,.55,.05],d:[1,.55,.85],r:.75},show:["tool_level"],dims:[{a:[y.L/2,y.HT+.004,-y.W/2],b:[-y.L/2,y.HT+.004,y.W/2],text:"\u2248 640 mm",when:2.2,grow:[2.2,3.6],cls:"hot",labAt:.25},{a:[y.L/2,y.HT+.008,y.W/2],b:[-y.L/2,y.HT+.008,-y.W/2],text:"\u2248 640 mm",when:3.8,grow:[3.8,5.2],cls:"hot",labAt:.75}],labels:[{p:"tool_level",o:[.03,.1,.02],t:"Nivel de burbuja en 2 caras",s:"cada poste vertical",when:.8}],txt:{que:"Con el nivel de burbuja pegado a cada poste revisen que est\xE9 vertical en sus 2 caras, y con la escuadra met\xE1lica los 90\xB0 de cada esquina de arriba. Las diagonales de arriba, iguales (\xB12 mm). Midan el alto en las 4 esquinas y aprieten firme.",porque:"Un poste fuera de plomo tuerce la torre y el elevador se traba.",herr:"Nivel de burbuja, escuadra met\xE1lica, flex\xF3metro.",check:"Al empujar una esquina de arriba con la mano, la estructura no se tuerce visiblemente; mismo alto en las 4 esquinas.",error:'Si queda floja, agreguen una escuadra m\xE1s por fuera en las esquinas de arriba; no la armen "as\xED".'}});Ve({ch:3,et:"Etapa 8",title:"Columnas de la torre",dur:11,cam:{t:[.1,.56,0],d:[1,.42,.75],r:.68},add:[["col_FL","col_FR"],["col_BL","col_BR"],["trav_sc","trav_emp"],["esc_tw","placas"]],stagger:1.7,addDur:1.6,labels:[{p:"col_FR",o:[.02,.3,.03],t:"Columnas delanteras \xB7 890 mm",s:"gu\xEDas delanteras y soportes del elevador",when:1.6,until:5},{p:"col_BR",o:[0,.22,.03],t:"Columnas traseras \xB7 890 mm",s:"sobre el travesa\xF1o central: gu\xEDas traseras y empujador",when:3.2,until:7},{p:"trav_sc",o:[0,.03,.12],t:"Travesa\xF1o superior central \xB7 340 mm",when:4.8},{p:"trav_emp",o:[0,-.02,.05],t:"Travesa\xF1o del empujador \xB7 198 mm",s:"de aqu\xED cuelgan las varillas y el NEMA",when:5.2},{p:"placas",o:[.22,-.4,.11],t:"Placas de uni\xF3n impresas",s:"atornilladas a tuercas en las ranuras",when:7}],dims:[{a:[y.COLXF+.016,y.H0+y.PF,y.COLZC],b:[y.COLXF+.016,y.HT-y.PF,y.COLZC],off:[.06,0,0],text:"890 mm",when:2.4},{a:[y.COLXF-.015,.7,-.099],b:[y.COLXF-.015,.7,.099],off:[0,0,0],text:"19.8 cm (fixture: 18)",when:3}],txt:{que:"Antes de colocarlas, metan tuercas en las ranuras de las columnas y en las del travesa\xF1o central y de los marcos donde van a ir. Deslicen de lado las 4 columnas de 890 mm entre el marco de abajo y el de arriba: 2 junto a los postes delanteros y 2 sobre el travesa\xF1o central. Arriba, el travesa\xF1o superior central; entre las columnas traseras, el travesa\xF1o del empujador. Todo con placas de uni\xF3n impresas, a medias.",porque:"Las gu\xEDas, los husillos y el empujador necesitan algo firme a qu\xE9 atornillarse en toda su altura. Las columnas forman una jaula alrededor de la torre (propuesta: no viene en la lista de cortes original).",herr:"Llaves Allen, nivel de burbuja, escuadra met\xE1lica, flex\xF3metro.",check:"Las 4 columnas a plomo y entre las caras interiores de cada par hay 19.8 cm a lo largo de toda la altura.",error:"Olvidar las tuercas en las ranuras antes de deslizar las columnas: despu\xE9s no entran sin desarmar."}});var Dh=i=>({t:[.15,.6,.02],d:[.85,.42,1],r:i});Ve({ch:4,et:"Etapa 9",title:"Gu\xEDas en L: el hueco de 22.0 \xD7 19.0 cm",dur:8,cam:{t:[.133,.62,0],d:[.55,.85,1],r:.44},add:[["guide_BL","guide_BR"],["guide_FL","guide_FR"]],stagger:1.4,labels:[{p:"guide_BR",o:[0,.27,.02],t:"Gu\xEDas traseras",s:"siguen hasta ~90 cm",when:2.4},{p:"guide_FR",o:[0,.23,.02],t:"Gu\xEDas delanteras",s:"terminan en el borde de la ventana (81.8 cm)",when:2.9}],dims:[{a:[y.COLX0,y.GTF,-y.COLZ-.004],b:[y.COLX1,y.GTF,-y.COLZ-.004],off:[0,0,-.05],text:"220 mm",when:3.4},{a:[y.COLX1+.004,y.GTF,-y.COLZ],b:[y.COLX1+.004,y.GTF,y.COLZ],off:[.05,0,0],text:"190 mm",when:3.7}],txt:{que:"Atornillen las 4 gu\xEDas en L a las columnas de la torre, en las esquinas del hueco de 22.0 \xD7 19.0 cm: las traseras con su pesta\xF1a a la cara frontal de la columna, las delanteras a la cara interior (tornillo avellanado).",porque:"El fixture mide 21 \xD7 18 cm: quedan 5 mm por lado. Con 3 mm se acu\xF1aba al bajar.",herr:"Llaves Allen, tuercas M6, flex\xF3metro.",check:"Las 4 gu\xEDas a plomo y el hueco medido en arriba y abajo.",error:"Atornillar las gu\xEDas sin probar el hueco: si roza, el fixture se atora a media pila."}});Ve({ch:4,et:"Etapa 9",title:"Prueba del hueco con un fixture",dur:8,cam:{t:[.133,.6,0],d:[.6,.45,1],r:.42},mech:(i,e)=>{let t=.82-.4*Math.sin(Math.PI*nn(i,.6,7.2));e.fx[0]={x:y.XC,y:t,z:0,rz:0}},focus:["fx0"],labels:[{p:"fx0",o:[0,.09,0],t:"Fixture de prueba",s:"21 \xD7 18 cm en un hueco de 22 \xD7 19",when:.8}],txt:{que:"Suban y bajen a mano un fixture por todo el hueco.",porque:"Si a mano se traba, con motor se va a trabar peor.",herr:"Un fixture impreso con sus costados.",check:"Un fixture sube y baja a mano por el hueco sin rozar.",error:"Si roza, aflojen la gu\xEDa y mu\xE9vanla; no lijen el fixture."}});Ve({ch:4,et:"Etapa 9",title:"NEMA 17 y coples",dur:8,cam:{t:[.183,.28,.05],d:[.35,.45,1],r:.22},add:[["brk_lo_L","brk_lo_R"],["nema_L","nema_R"],["cople_L","cople_R"]],stagger:1.5,labels:[{p:"nema_R",o:[.03,-.01,.03],t:"NEMA 17 \xB7 eje hacia arriba",s:"un A4988 por motor (1.0 A)",when:2.2},{p:"cople_R",o:[.02,.01,.02],t:"Cople flexible 5 \u2192 8 mm",s:"prisionero sobre la cara plana del eje",when:3.8}],txt:{que:"Atornillen cada soporte inferior a la cara trasera de la columna delantera y del poste, y los 2 NEMA 17 en sus soportes con el eje hacia arriba. Pongan un cople en cada eje y aprieten su prisionero sobre la parte plana.",porque:"El eje tiene forma de D: sobre la cara plana el cople no se patina.",herr:"Llaves Allen chicas.",check:"El cople no gira sobre el eje aunque lo fuercen con los dedos.",error:"Prisionero del cople sobre la parte redonda del eje: se patina y la plataforma se desnivela."}});Ve({ch:4,et:"Etapa 9",title:"KFL08 de abajo, husillos y KFL08 de arriba",dur:10,cam:{t:[.183,.6,.12],d:[.55,.18,1],r:.42},add:[["kflLo_L","kflLo_R"],{ids:["screw_L","screw_R","nutsc_L","nutsc_R"],from:[0,.75,0]},["brk_up_L","brk_up_R","kflUp_L","kflUp_R"]],stagger:1.8,addDur:1.6,plat:.7,mech:(i,e)=>{e.plat=.7,e.screwX=18*nn(i,6.5,9.5)},labels:[{p:"kflLo_R",o:[.03,0,.02],t:"KFL08 inferior",s:"prisioneros todav\xEDa sin apretar",when:1.4},{p:"screw_R",o:[0,.05,.02],t:"Husillo TR8 \xB7 60 cm",s:"avance 2 mm (confirmar 1 entrada)",when:3.2},{p:"kflUp_R",o:[.02,.02,.02],t:"KFL08 superior",s:"solo gu\xEDa",when:5.2}],dims:[{a:[y.SX,.336,y.SZ+.03],b:[y.SX,.866,y.SZ+.03],off:[0,0,.05],text:"\u2248 52.7 cm \xFAtiles",when:6}],txt:{que:"Atornillen una KFL08 justo arriba de cada cople, sin apretar sus prisioneros. Pasen cada husillo por su chumacera, m\xE9tanlo en el cople y pongan la chumacera de arriba. Giren cada husillo con los dedos.",porque:"Debe girar suave y sin cabecear (que la punta no dibuje un c\xEDrculo). Si cabecea, motor y chumaceras no est\xE1n en l\xEDnea.",herr:"Llaves Allen, los dedos.",check:"Los 2 husillos giran sin cabecear.",error:"Motor y chumaceras desalineados: el motor vibra, se calienta y pierde pasos."}});Ve({ch:4,et:"Etapa 9",title:"Varillas lisas y SC8UU",dur:7,cam:{t:[.183,.6,.1],d:[.6,.2,1],r:.4},add:[{ids:["rod_L","rod_R"],from:[0,.75,0]},["sc_L","sc_R"]],stagger:1.6,mech:(i,e)=>{e.plat=.7},labels:[{p:"rod_R",o:[0,.12,.02],t:"Varilla lisa 8 mm \xD7 60 cm",when:1.6},{p:"sc_R",o:[.02,.03,.02],t:"SC8UU",s:"2 por varilla",when:3}],txt:{que:"Monten las 2 varillas lisas en sus soportes, con 2 SC8UU en cada una.",porque:"Los husillos suben la plataforma; las varillas la gu\xEDan para que no se ladee ni gire.",herr:"Llaves Allen, trapo y aceite ligero.",check:"Los SC8UU deslizan sin juego por toda la varilla.",error:"Varillas sucias o secas: l\xEDmpienlas y p\xF3nganles una gota de aceite."}});Ve({ch:4,et:"Etapa 9",title:"Plataforma y recorrido completo",dur:10,cam:Dh(.52),add:["plat"],addStart:.3,mech:(i,e)=>{e.plat=.7-.3*Math.sin(Math.PI*nn(i,2.2,9))},labels:[{p:"plat",o:[0,.03,0],t:"Plataforma 21 \xD7 18 cm",s:"2 brazos con tuerca de lat\xF3n y SC8UU",when:1.4}],dims:[{a:[y.COLX0-.01,y.LEVEL(6),-.12],b:[y.COLX0-.01,y.UNL0,-.12],off:[-.04,0,0],text:"40.7 \u2192 83.2 cm",when:2.2}],txt:{que:"Atornillen las tuercas de lat\xF3n y los SC8UU a los brazos de la plataforma. Bajen la plataforma girando los 2 husillos a mano, parejos, hasta que se vea su recorrido completo.",porque:"La carrera de trabajo va de 40.7 cm (pila llena al cargar) a 83.2 cm (descargar el \xFAltimo).",herr:"Los dedos en los coples; grasa ligera o PTFE.",check:"Girando un cople con los dedos, la plataforma recorre toda la carrera sin trabarse.",error:"Husillos secos: chillan y el motor se queda corto de fuerza."}});Ve({ch:4,et:"Etapa 9",title:"Prisioneros de las KFL08 inferiores",dur:8,cam:{t:[y.SX,.33,y.SZ],d:[.65,.32,1],r:.1},focus:["kflLo_L","kflLo_R"],mech:(i,e)=>{e.plat=.6},labels:[{p:"kflLo_R",o:[0,.012,0],t:"KFL08 inferior \xB7 prisioneros apretados",s:"carga ~22 N por husillo",when:.6,cls:"hot"},{p:"nema_R",o:[.03,0,0],t:"Eje del NEMA 17",s:"aguanta ~10 N axiales: no carga peso",when:2.4}],dims:[{a:[y.SX-.016,.45,y.SZ],b:[y.SX-.016,.34,y.SZ],text:"peso de la pila",when:1,arrow:!0,cls:"hot"}],txt:{que:"Ahora s\xED, aprieten los 2 prisioneros de cada KFL08 inferior contra el husillo.",porque:"As\xED el peso de la pila (~22 N por tornillo) se apoya en la chumacera y no en el eje del motor, que solo aguanta ~10 N. El cople flexible no debe cargar peso.",herr:"Llave Allen chica.",check:"Prisioneros de las chumaceras de abajo apretados.",error:"Olvidarlos: el peso queda en el eje del motor y en el cople."}});Ve({ch:4,et:"Etapa 9",title:"Lubricar y nivelar a mano",dur:9,cam:{t:[y.XC,.62,0],d:[.15,.35,1],r:.3},mech:(i,e)=>{e.plat=.62;let t=1-Et(i,2.2,6.5);e.tilt=.035*t,e.screwL=30*Et(i,2.2,6.5)},labels:[{p:"screw_L",o:[0,.05,-.02],t:"Giren solo este husillo",s:"con su motor desconectado",when:1.8}],dims:[{a:[y.XC,.62,-.09],b:[y.XC,.62,.09],off:[0,.03,0],text:"diferencia < 1 mm",when:6.8,mount:"plat"}],txt:{que:"Lubricante seco de PTFE o una capa muy delgada de grasa ligera en la rosca. Midan la altura de la plataforma en sus 4 esquinas y, si un lado est\xE1 m\xE1s alto, giren solo ese husillo hasta que la diferencia sea menor a 1 mm.",porque:"Se hace una vez: despu\xE9s los 2 motores reciben los mismos pasos (STEP, DIR y EN compartidos) y se mueven juntos.",herr:"Lubricante seco de PTFE, flex\xF3metro.",check:"Plataforma nivelada: diferencia menor a 1 mm entre esquinas.",error:"Grasa de m\xE1s: el husillo apenas se autobloquea y la plataforma se escurre con la vibraci\xF3n."}});Ve({ch:4,et:"Etapa 9",title:"Finales de carrera y prueba de autobloqueo",dur:10,cam:Dh(.55),add:[["lsw_L","lsw_R"]],mech:(i,e)=>{if(e.plat=i<4?bt(.62,y.LSLO,Et(i,1.4,3.6)):bt(y.LSLO,.45,Et(i,4,5.5)),i>5.8){let t=Math.min(6,Math.floor((i-5.8)/.35)+1);Gn(e,[...Array(t).keys()],e.plat)}},labels:[{p:"lsw_R",o:[.02,.01,.03],t:"Final de carrera (NC)",s:"home: plataforma a 39.2 cm",when:2.4},{at:[y.XC,.92,.12],t:"Con ~3 kg y sin energ\xEDa: no baja",s:"husillo de 1 entrada (autoblocante)",when:7.5,cls:"hot"}],dims:[{a:[y.COLX0-.01,0,-.12],b:[y.COLX0-.01,y.LSLO,-.12],off:[-.05,0,0],text:"39.2 cm",when:3.4}],txt:{que:"Atornillen un final de carrera abajo de cada husillo, para que su palanca se presione cuando la plataforma llegue a 39.2 cm. Luego suban la plataforma a la mitad, p\xF3nganle 6 fixtures (~3 kg) y su\xE9ltenla.",porque:"El home de cada lado da el cero del elevador; si uno toca y el otro no, la plataforma est\xE1 desnivelada y el ESP32 lo reporta.",herr:"Desarmador, cables, 6 fixtures o 3 kg de peso.",check:"Con 3 kg encima, la plataforma no baja sola.",error:"Si baja sola, el husillo es de 4 entradas: no sirve para la demo."}});Ve({ch:5,et:"Etapa 10",title:"Varillas, carro, placa y cremallera",dur:9,cam:{t:[-.06,.86,0],d:[.3,.45,1],r:.3},add:[["pframe","pframe_r"],["prod_L","prod_R"],"sled"],stagger:1.6,labels:[{p:"prod_R",o:[-.08,0,0],t:"Varillas 8 mm \xD7 30 cm",s:"horizontales, atr\xE1s \u2192 ventana",when:2.2},{p:"pframe",o:[0,.03,.06],t:"Soportes colgados del travesa\xF1o del empujador",when:1.4},{at:[.004,y.PY1,.075],t:"Placa empujadora 15 \xD7 3 cm",s:"empuja el fixture, nunca la ECU",when:4},{at:[-.2,.898,0],t:"Cremallera 30 cm",s:"2 tramos de 15 cm unidos con M3",when:4.6}],dims:[{a:[.012,y.BELT,.08],b:[.012,y.PY0,.08],off:[0,0,.03],text:"0.6 cm",when:5,labAt:.5},{a:[.012,y.BELT,.08],b:[.012,y.PY1,.08],off:[0,0,.075],text:"3.6 cm sobre la banda",when:5.3}],txt:{que:"Atornillen los soportes delanteros de las varillas y del NEMA al travesa\xF1o del empujador, y los traseros al travesa\xF1o superior trasero. Monten las 2 varillas de 30 cm, horizontales. Atornillen la placa empujadora al carro y el carro a los 2 SC8UU. Unan los 2 tramos de la cremallera con tornillos M3, cuidando que los dientes sigan parejos.",porque:"La placa debe quedar entre 0.6 y 3.6 cm arriba de la superficie de la banda: as\xED toca la barra trasera del fixture de arriba y nunca el de abajo.",herr:"Llaves Allen, tornillos M3.",check:"La placa empuja la barra trasera del fixture de arriba sin tocar el de abajo.",error:"Placa muy baja: arrastra el fixture de abajo al descargar."}});Ve({ch:5,et:"Etapa 10",title:"NEMA 17 y pi\xF1\xF3n",dur:8,cam:{t:[-.017,.905,.02],d:[.35,.35,1],r:.12},add:["pnema","pinion"],stagger:1.6,labels:[{p:"pinion",o:[0,.03,0],t:"Pi\xF1\xF3n m1.5 \xB7 20 dientes \xB7 \xD830",s:"prisionero M3 sobre la cara plana",when:2}],txt:{que:"Pongan el pi\xF1\xF3n en el eje del NEMA 17 con su prisionero M3 sobre la cara plana. Acerquen el motor a la cremallera hasta que engrane con un poquito de juego.",porque:"Ni flojo (salta) ni apretado (se traba).",herr:"Llave Allen chica.",check:"El pi\xF1\xF3n engrana con la cremallera sin trabarse en los 30 cm.",error:'Pi\xF1\xF3n muy apretado contra la cremallera: el motor pierde pasos y se oye un "tac-tac".'}});Ve({ch:5,et:"Etapa 10",title:"Prueba a mano: 25 cm de carrera",dur:9,cam:{t:[.1,.86,0],d:[.45,.6,1],r:.38},mech:(i,e)=>{e.push=y.P0+y.STROKE*Math.sin(Math.PI*nn(i,1,8))},labels:[{p:"pframe_r",o:[0,-.12,.08],t:"Final de carrera (home)",s:"atr\xE1s",when:1}],dims:[{a:[y.P0,y.PY0,-.11],b:[y.P0+y.STROKE,y.PY0,-.11],off:[0,-.02,0],text:"250 mm",when:3}],txt:{que:"Giren el pi\xF1\xF3n con los dedos: el carro debe recorrer 25 cm sin trabarse y la placa debe asomarse por la ventana al final.",porque:"Con 25 cm el fixture sale completo hacia la estaci\xF3n de descarga.",herr:"Los dedos.",check:"El carro recorre los 25 cm a mano sin trabarse.",error:"Si a mano se traba, con el motor se traba peor: revisen varillas paralelas y la uni\xF3n de la cremallera."}});Ve({ch:5,et:"Etapa 10",title:"La u\xF1a: MG90S y pin de 10 \xD7 10 mm",dur:8,cam:{t:[.03,.88,-.01],d:[.4,.45,-1],r:.1},add:["servo","horn","pin"],stagger:1.2,mech:(i,e)=>{e.pin=.6*Math.sin(Math.PI*nn(i,4.5,7.5))},labels:[{p:"servo",o:[0,.02,-.01],t:"MG90S de 180\xB0",s:"GPIO 5 \xB7 5 V del XL4005",when:1.6},{p:"pin",o:[0,.03,0],t:"Pin 10 \xD7 10 mm",s:"baja a la ranura del fixture",when:3}],txt:{que:"Atornillen el MG90S a su soporte en el carro. Pongan su brazo con el pin sin apretar del todo.",porque:'Los \xE1ngulos exactos de "arriba" y "abajo" se ajustan con el programa en la Etapa 12.',herr:"Desarmador fino, tornillos M3.",check:"El pin sube y baja sin rozar el carro.",error:"Ajustar el brazo a la fuerza con la mano: se rompen los engranes del servo."}});Ve({ch:5,et:"Etapa 10",title:"Prueba a mano de la u\xF1a",dur:12,cam:{t:[.16,.86,0],d:[.22,.42,1],r:.27},mech:(i,e)=>{zl(e,Math.min(8.7,Math.max(0,i-.4)*.95),0,0),e.plat=y.LOAD0,i<3.8&&(e.fx[0].x=.13+y.FL/2)},focus:["pin","fx0"],labels:[{p:"pin",o:[0,.035,0],t:"La u\xF1a baja a la ranura",s:"28 \xD7 16 mm",when:3.9},{at:[.26,.95,.1],t:"El fixture queda centrado",s:"~5 mm libres atr\xE1s y adelante",when:9.6}],dims:[{a:[y.PANX,y.BELT+.075,.095],b:[.34,y.BELT+.075,.095],off:[0,.02,0],text:"~9 cm afuera",when:1},{a:[.034,y.BELT+.075,-.095],b:[.134,y.BELT+.075,-.095],off:[0,.02,0],text:"jala ~10 cm",when:4.6}],txt:{que:"Con la plataforma a la altura de carga (82.7 cm), pongan un fixture como si la banda lo hubiera dejado: ~9 cm salido por la ventana. Adelanten el carro hasta que el pin quede sobre la ranura, b\xE1jenlo y jalen el carro hacia atr\xE1s.",porque:"La banda empuja por fricci\xF3n y se detiene antes; la u\xF1a jala los ~10 cm que faltan.",herr:"Los dedos y un fixture de prueba.",check:"Jalado a mano, el fixture queda centrado en la torre (holgura de ~5 mm atr\xE1s y adelante).",error:'El pin no entra a la ranura: recalibren el \xE1ngulo "abajo" y la posici\xF3n de espera del empujador.'}});var Q_=["tray","perf","boost","xl4005","relay","fuses","trayCab"],or=i=>({pos:Dt.get(i).home.clone().add(Al),q:new ft}),kl=i=>({t:[-.1785+Al.x,.735,Al.z-.01],d:[.3,1,.62],r:i});Ve({ch:6,et:"Etapa 11",title:"Placa principal en la mesa",dur:9,cam:kl(.16),show:["mesa"],add:[{ids:["tray"],pose:or},{ids:["perf"],pose:or}],stagger:1.4,labels:[{p:"perf",o:[.02,.03,-.02],t:"ESP32 en tira header hembra",when:2.2},{p:"perf",o:[-.035,.03,-.06],t:"3 A4988 \xB7 100 \xB5F c/u",s:"VDD a 3.3 V",when:2.8},{p:"perf",o:[.025,.02,-.075],t:"MAX485 \xB7 convertidor \xB7 PCF8574",when:3.4},{p:"perf",o:[.045,.02,.03],t:"Borneras KF301",when:4}],txt:{que:"Dibujen primero en papel d\xF3nde va cada cosa. Suelden tira header hembra para el ESP32 y cada m\xF3dulo, borneras KF301 en las orillas y un capacitor de 100 \xB5F junto a cada A4988 (pata larga al +).",porque:"Con headers, un driver quemado se cambia en segundos. Todo se arma fuera del carrito, donde es f\xE1cil medir.",herr:"Caut\xEDn de 40\u201360 W, soldadura 60/40, flux, thermofit, mult\xEDmetro.",check:"Todas las tierras unidas: hay continuidad entre bater\xEDa \u2212 y GND del ESP32.",error:"Puentes de soldadura entre pines vecinos: rev\xEDsenlos con lupa y con la prueba de continuidad."}});Ve({ch:6,et:"Etapa 11",title:"Ajustar voltajes antes de conectar nada",dur:9,cam:kl(.17),show:["mesa"],add:[{ids:["boost","xl4005"],pose:or}],labels:[{p:"boost",o:[0,.035,0],t:"Elevador 400 W \u2192 18.0 V",s:"sin carga \xB7 corriente al m\xE1ximo",when:1.8,cls:"hot"},{p:"xl4005",o:[0,.02,0],t:"XL4005 \u2192 5.0\u20135.1 V",when:2.6,cls:"hot"},{p:"perf",o:[-.035,.03,-.06],t:"Vref de cada A4988",s:"0.80 V con R100 \xB7 0.54 V con R068 \u2192 1.0 A",when:3.4,cls:"hot"}],txt:{que:"Conecten 12 V a cada m\xF3dulo y, sin nada a la salida, giren su potenci\xF3metro hasta leer 5.0\u20135.1 V en el XL4005 y 18.0 V en el elevador. Ajusten el Vref de los 3 A4988 sin motor conectado.",porque:"La mayor\xEDa de las piezas se queman por un voltaje equivocado. Marquen cada m\xF3dulo con su voltaje en cinta.",herr:"Mult\xEDmetro y desarmador fino (de pl\xE1stico para el Vref).",check:"XL4005 en 5.0\u20135.1 V y elevador en 18.0 V, medidos.",error:"Conectar o desconectar un motor a pasos con el driver encendido: quema el A4988."}});Ve({ch:6,et:"Etapa 11",title:"Fusibles, rel\xE9 y prueba de humo",dur:9,cam:kl(.17),show:["mesa"],add:[{ids:["relay","fuses"],pose:or},{ids:["trayCab"],pose:or}],stagger:1.6,labels:[{p:"fuses",o:[0,.02,-.01],t:"Fusible 15 A \xB7 rama principal",s:"10 A \xB7 rama auxiliar (Jetson y l\xF3gica)",when:1.6},{p:"relay",o:[0,.035,0],t:"Rel\xE9 T90 30 A",s:"el paro (NC) le corta la alimentaci\xF3n",when:2.4},{p:"trayCab",o:[0,.04,.05],t:"Rojo 12 V \xB7 Naranja 18 V \xB7 Negro GND",when:3.4}],txt:{que:"Del lado de la bater\xEDa, XT60 hembra; del lado del carrito, el macho a 2 portafusibles: 15 A para motores y steppers, 10 A para Jetson y l\xF3gica (con el KCD1). El rel\xE9 se alimenta pasando por el contacto NC del paro. Prueba de humo sin ESP32 ni motores.",porque:"Si alguien aprieta el paro, el rel\xE9 se suelta y corta motores y steppers aunque el programa est\xE9 colgado.",herr:"Caut\xEDn, XT60, terminales de ojillo, mult\xEDmetro.",check:"El paro corta el rel\xE9 y deja 0 V en la rama de motores; nada se calienta en 2 minutos.",error:"Conectar al rev\xE9s (+ con \u2212): quema el ESP32 o el m\xF3dulo al instante. Midan antes de conectar."}});Ve({ch:6,et:"Etapa 13",title:"La bandeja al carrito",dur:9,cam:{t:[-.16,.25,.1],d:[-.85,.75,.75],r:.42},add:[{ids:Q_,pose:"home"},"kcd1"],stagger:2.8,addDur:2.4,labels:[{p:"tray",o:[0,.05,0],t:"Bandeja con separadores M3",s:"nada toca el aluminio",when:3},{p:"kcd1",o:[-.01,.03,.02],t:"Interruptor KCD1",s:"accesible desde afuera",when:4}],txt:{que:"Con el XT60 desconectado, atornillen la bandeja y sobre ella la placa, el elevador, el rel\xE9 y el XL4005 con separadores M3. Pongan portafusibles, KCD1 y paro donde se alcancen desde afuera.",porque:"Lo que ya funcion\xF3 en la mesa solo se pasa al carrito; cualquier falla nueva es del montaje.",herr:"Separadores M3, desarmador, cinchos.",check:"Con el XT60 desconectado, el mult\xEDmetro en continuidad entre + y \u2212 no pita (no hay corto).",error:"Dejar la placa tocando el aluminio: un corto en cuanto el carrito vibra."}});Ve({ch:6,et:"Etapa 13",title:"Sensores: 4 VL53L0X y QTR-8A",dur:9,cam:{t:[.05,.5,.02],d:[1,.32,.85],r:.74},add:["vl_front",["vl_sideL","vl_sideR"],"vl_pile","qtr"],stagger:1.2,mech:(i,e)=>{e.cones=i>1},labels:[{p:"vl_front",o:[.02,.03,0],t:"VL53L0X frontal",s:"~15 cm del piso \xB7 frena a < 40 cm",when:1.2},{p:"vl_sideR",o:[0,.03,.02],t:"VL53L0X lateral (\xD72)",when:2.4},{p:"vl_pile",o:[0,.03,0],t:"VL53L0X de la pila",s:"detecta presencia (\xB125 mm)",when:3.6},{p:"qtr",o:[.02,.03,.03],t:"QTR-8A de respaldo",s:"3\u20135 mm del piso \xB7 a 3.3 V",when:4.8}],txt:{que:"Monten 3 VL53L0X de obst\xE1culos a ~15 cm del piso (frente y los 2 lados) y 1 arriba de la torre mirando hacia abajo, sobre la esquina trasera de un costado. La barra QTR-8A va debajo del frente, a 3\u20135 mm del piso.",porque:"Los 3 de abajo frenan el carrito sin esperar al Jetson; el de arriba confirma que hay un fixture en la pila.",herr:"Desarmador, tornillos M3, soportes impresos.",check:"Los 4 VL53L0X responden en 0x30\u20130x33 y miden bien a 10, 30 y 60 cm.",error:'Cables de se\xF1al pegados a los de potencia: los VL53L0X y el RS485 fallan "al azar".'}});Ve({ch:6,et:"Etapa 13",title:"Jetson, c\xE1mara y paro de emergencia",dur:8,cam:{t:[-.04,1.02,.02],d:[-.5,.9,.8],r:.36},add:[["jet_plate"],["jetson"],["camera","estop"]],stagger:1.2,labels:[{p:"jetson",o:[0,.04,0],t:"Jetson Orin Nano Super",s:"plug 5.5 \xD7 2.5 mm \xB7 centro = +",when:2},{p:"estop",o:[0,.05,0],t:"Paro LAY37",s:"arriba, en una esquina de atr\xE1s",when:3.2},{p:"camera",o:[0,.04,0],t:"C\xE1mara",s:"QR y ArUco",when:3.8}],txt:{que:"Atornillen el Jetson arriba. Antes de enchufarle el plug, midan con el mult\xEDmetro que el centro sea el +. Conecten la c\xE1mara y el USB al ESP32.",porque:"El paro queda al alcance de la mano en cualquier momento del ciclo.",herr:"Mult\xEDmetro, desarmador.",check:"El paro detiene ruedas, elevador y empujador al instante y la plataforma se queda donde estaba.",error:"Plug del Jetson con la polaridad al rev\xE9s: se da\xF1a el Jetson. Midan siempre antes."}});Ve({ch:6,et:"Etapa 13",title:"Cableado por colores",dur:10,cam:{t:[-.02,.46,.02],d:[.85,.45,1],r:.66},add:[["cab_bat","cab_batN"],["cab_18_L","cab_18_R","cab_485_L","cab_485_R"],["cab_nema_L","cab_nema_R","cab_pnema","cab_lsw_L","cab_lsw_R"],["cab_servo","cab_i2c","cab_i2cF","cab_qtr"],["cab_jet","cab_stop","cab_usb"]],stagger:1,addDur:1,labels:[{p:"cab_18_R",o:[0,.02,0],t:"Naranja 18 V \u2192 M0601",s:"rojo 12 V \xB7 negro GND",when:2},{p:"cab_485_L",o:[0,.03,0],t:"Verde: RS485",when:2.6},{p:"cab_nema_R",o:[.03,.03,0],t:"Azul: motores a pasos",when:3.4},{p:"cab_i2c",o:[0,.05,0],t:"Amarillo: I\xB2C",when:4.2},{p:"cab_servo",o:[.02,.02,0],t:"Servo: curva floja de ~30 cm",when:5},{p:"cab_qtr",o:[.05,0,0],t:"Morado: QTR-8A \xB7 Blanco: finales y USB",when:5.6}],txt:{que:"Potencia (14 AWG) por un lado y se\xF1al (22 AWG) por otro, un cincho cada ~10 cm. Cada NEMA a su propio A4988, finales de carrera como NC, y cada cable etiquetado en sus dos puntas.",porque:"Un cable flojo o rozando algo que se mueve es la falla m\xE1s com\xFAn el d\xEDa de la demo.",herr:"Cinchos, etiquetas, mult\xEDmetro.",check:"Ning\xFAn cable roza la plataforma, el empujador ni las ruedas en todo su recorrido.",error:"Cable del servo sin curva floja: se jala en los 25 cm de recorrido."}});Ve({ch:6,et:"Etapa 16",title:"Panel frontal de MDF con la ventana",dur:9,cam:{t:[.25,.72,0],d:[1,.28,.42],r:.45},add:["panel"],labels:[{p:"panel",o:[.01,-.22,.12],t:"Panel MDF 3 mm",s:"es el tope de la pila \xB7 costados abiertos",when:2}],dims:[{a:[y.PANX+.004,y.WIN1+.004,-y.WINZ],b:[y.PANX+.004,y.WIN1+.004,y.WINZ],off:[0,.03,0],text:"24 cm",when:2.4},{a:[y.PANX+.004,y.WIN0,y.WINZ+.004],b:[y.PANX+.004,y.WIN1,y.WINZ+.004],off:[0,0,.04],text:"9.7 cm",when:2.7},{a:[y.PANX+.004,0,-.16],b:[y.PANX+.004,y.WIN0,-.16],off:[0,0,-.04],text:"81.8 cm (banda \u2212 1.2 cm)",when:3.2}],txt:{que:"Corten el MDF con caladora a la medida del frente. Marquen la ventana, barrenen sus 4 esquinas y c\xF3rtenla; lijen y pinten. Se atornilla con tuercas en las ranuras. En la gu\xEDa este paso va al final (Etapa 16), porque estorba para trabajar.",porque:"Debajo de la ventana, la pared frontal es el tope que retiene los fixtures de abajo: solo sale el de arriba.",herr:"Caladora, taladro, lija, pintura en aerosol.",check:"Las pruebas finales se hacen con el panel puesto.",error:"Probar siempre sin el panel: con el panel puesto algo puede rozar."}});var Ii={keepFx:!0,dimOld:!1};Ve({...Ii,ch:7,et:"Funcionamiento",title:"Acople en la banda",dur:9,cam:{t:[.25,.55,0],d:[.75,.6,1],r:.95},mech:(i,e)=>{e.station="belt",e.cart.x=bt(-1.1,0,Et(i,.3,4.5)),e.plat=y.LOAD0,e.fx=Array(6).fill(null),e.fx[0]={x:.88+y.FL/2-e.cart.x,y:y.BELT,z:0,rz:0}},labels:[{at:[.05,.03,.3],t:"Embudo",s:"centra el frente del carrito",when:4.6},{at:[.35,.52,.3],t:"ArUco",s:"el Jetson verifica la posici\xF3n",when:5.2},{at:[.6,y.BELT+.04,.1],t:"Gu\xEDas laterales de la banda",s:"2\u20133 mm por lado",when:5.8}],txt:{que:"El carrito llega por waypoints, el embudo lo centra y el Jetson confirma con el ArUco. Hace home del elevador y del empujador y deja la plataforma a 82.7 cm: 3 mm debajo de la banda.",porque:"Siempre se carga a la misma altura: el tope de la pila queda 3 mm abajo y el chafl\xE1n de 3 mm ayuda a que el fixture no se atore.",herr:"Programa del ESP32 y del Jetson (Etapa 14).",check:"La ventana queda frente a la banda, centrada (\xB15 mm) y a menos de 1 cm.",error:"Banda sin gu\xEDas laterales: el fixture llega chueco y choca con las gu\xEDas de la torre."}});Ve({...Ii,ch:7,et:"Funcionamiento",title:"Carga: la banda, la u\xF1a y un nivel abajo",dur:13,cam:{t:[.17,.83,0],d:[.28,.42,1],r:.36},mech:(i,e)=>{e.station="belt",e.fx=Array(6).fill(null),zl(e,i,0,0,1.08)},focus:["pin","plat","sled"],labels:[{p:"fx0",o:[.06,.09,0],t:"La banda empuja por fricci\xF3n",s:"lo deja ~9 cm afuera",when:2.4,until:4.6},{p:"pin",o:[0,.04,0],t:"La u\xF1a baja a la ranura",s:"y el empujador jala ~10 cm a 25 mm/s",when:4,until:9.4},{p:"plat",o:[-.04,-.03,-.1],t:"Baja un nivel: 7.0 cm",s:"10 mm/s (7 s en el real)",when:9.6}],dims:[{a:[y.PANX,y.BELT+.075,.095],b:[.34,y.BELT+.075,.095],off:[0,.02,0],text:"~9 cm afuera",when:3.4,until:4.6}],txt:{que:'Aviso de "listo": la banda empuja el fixture hasta donde alcanza. La u\xF1a baja, el empujador lo jala hasta el fondo, avanza 2 mm para aflojar, sube la u\xF1a y regresa a home. El VL53L0X confirma, la c\xE1mara lee el QR y la plataforma baja un nivel.',porque:"Una banda empuja por fricci\xF3n y se detiene cuando ~43 % del peso sigue sobre ella; por eso hace falta la u\xF1a.",herr:"\u2014",check:"El VL53L0X de la pila confirma el fixture (\xB125 mm) y la c\xE1mara lee el QR.",error:"El fixture se atora al entrar: revisen gu\xEDas de la banda, chafl\xE1n y altura de carga (banda \u2212 3 mm)."}});Ve({...Ii,ch:7,et:"Funcionamiento",title:"Cargar hasta 6",dur:16,cam:{t:[.13,.62,0],d:[.8,.35,1],r:.55},mech:(i,e)=>{e.station="belt",e.fx=Array(6).fill(null);let t=2.9,n=t/11.2;if(i>=5*t){e.plat=y.LEVEL(6),Gn(e,[0,1,2,3,4,5],e.plat);return}let s=1+Math.floor(i/t),r=i-(s-1)*t;zl(e,r,s,s,n),Gn(e,[...Array(s).keys()],e.plat)},labels:[{p:"plat",o:[0,-.03,-.13],t:"Pila llena: plataforma a 40.7 cm",s:"6 \xD7 7.0 cm",when:14.6},{at:[y.XC,.95,.12],t:"Orden LIFO",s:"sale primero el \xFAltimo que entr\xF3",when:15}],txt:{que:"El ciclo se repite: cada fixture entra a la misma altura y la pila baja 7.0 cm. Al llegar a 6 (o si se acab\xF3 el lote), termina la carga.",porque:"La carga queda entre 40 y 83 cm y la bater\xEDa abajo: el centro de gravedad queda bajo (~39 cm con la pila llena).",herr:"\u2014",check:"n = 6 o se acab\xF3 el lote; cada fixture confirmado por el sensor.",error:"Programar todo de una vez y probarlo junto: cuando falla no se sabe qu\xE9 fue. Suban 1 \u2192 6 cargas."}});Ve({...Ii,ch:7,et:"Funcionamiento",title:"Viaje a la estaci\xF3n de descarga",dur:11,cam:{t:[-.35,.45,0],d:[.45,.55,1.15],r:1.15},mech:(i,e)=>{e.fx=Array(6).fill(null),e.plat=y.LEVEL(6),Gn(e,[0,1,2,3,4,5],e.plat),e.cones=!0,i<4.5?(e.station="belt",e.cart.x=bt(0,-1.4,Et(i,.4,4.4))):(e.station="ramp",e.cart.x=bt(-1.4,0,Et(i,5,10)))},labels:[{at:[-.6,.95,.2],t:"0.35 m/s m\xE1x \xB7 0.4 m/s\xB2",s:"waypoints + odometr\xEDa",when:1.2,until:5},{at:[-.9,.25,.3],t:"Detecci\xF3n reactiva de obst\xE1culos",s:"3 VL53L0X: frena a < 40 cm",when:2,until:5},{at:[.5,.95,.2],t:"Estaci\xF3n de descarga",s:"mesa a 83 cm \xB7 rampa de 14 rodillos",when:6}],txt:{que:"El carrito sale de la banda y navega por waypoints. El ESP32 cuenta las vueltas de los M0601 a 50 Hz para la odometr\xEDa y frena solo si un VL53L0X ve algo a menos de 40 cm. En la estaci\xF3n, el embudo y el ArUco lo centran otra vez.",porque:"Con 6 fixtures el pico de par sigue dentro del l\xEDmite de los motores.",herr:"\u2014",check:"Llega a la estaci\xF3n con un error menor a lo que corrige el embudo.",error:"Desconectar el USB del Jetson y que siga andando: el watchdog debe detener las ruedas en menos de 1 s."}});Ve({...Ii,ch:7,et:"Funcionamiento",title:"Descarga: home y subir al nivel de la ventana",dur:9,cam:{t:[.18,.72,0],d:[.75,.4,1],r:.42},mech:(i,e)=>{e.station="ramp",e.fx=Array(6).fill(null),e.plat=i<3?bt(y.LEVEL(6),y.LSLO,Et(i,.5,2.5)):bt(y.LSLO,y.UNLV(6),Et(i,3.2,7.5)),Gn(e,[0,1,2,3,4,5],e.plat)},labels:[{p:"lsw_R",o:[.03,0,.03],t:"Home al llegar",s:"1.7 cm hasta el final de carrera (~2 s)",when:1.6,until:6},{p:"fx5",o:[.02,.08,0],t:"El de arriba queda en la ventana",s:"base 2 mm sobre la banda",when:7.6}],dims:[{a:[y.PANX+.01,y.WIN0,-.12],b:[y.PANX+.01,y.UNL0,-.12],off:[.03,0,0],text:"1.4 cm",when:7.8}],txt:{que:"Al llegar, el elevador hace home (as\xED se corrige si la plataforma se escurri\xF3 al rodar). Luego sube, por pasos contados, hasta que el fixture de arriba quede en la ventana: su base 2 mm sobre la banda y 1.4 cm sobre el borde.",porque:"El borde de la ventana queda a la altura del fixture de abajo: ese topa con la pared frontal y no se arrastra.",herr:"\u2014",check:"El VL53L0X confirma que el fixture est\xE1 en la ventana.",error:"Plataforma a mala altura o placa muy baja: se arrastra el de abajo."}});Ve({...Ii,ch:7,et:"Funcionamiento",title:"El empujador saca el de arriba",dur:9,cam:{t:[.62,.72,0],d:[.5,.55,1],r:.78},mech:(i,e)=>{e.station="ramp",e.fx=Array(6).fill(null),Gn(e,[0,1,2,3,4],y.UNLV(6)),Ih(e,i,6,5,0,1.4)},focus:["sled","fx5"],labels:[{p:"sled",o:[.13,0,.08],t:"Empujador: 25 cm a 80 mm/s",when:1,until:5.2},{p:"fx5",o:[0,.09,0],t:"Rueda por la rampa",s:"14 rodillos \xB7 1.4 m \xB7 4\xB0",when:5.4}],txt:{que:"El empujador avanza 25 cm y regresa a home. El fixture sale por la ventana, pasa por el primer rodillo (en la orilla, como nariz redonda) y rueda hasta el tope.",porque:"Al rodar, deja libre la entrada para el siguiente; sin rodillos los fixtures se empujar\xEDan en fila y se atorar\xEDan.",herr:"\u2014",check:"El VL53L0X confirma que la ventana qued\xF3 vac\xEDa; n = n \u2212 1.",error:"Rampa con poca inclinaci\xF3n: el fixture se queda frente a la ventana y el siguiente choca con \xE9l."}});Ve({...Ii,ch:7,et:"Funcionamiento",title:"Repetir hasta vaciar la torre",dur:16,cam:{t:[.75,.62,0],d:[.45,.6,1],r:.95},mech:(i,e)=>{e.station="ramp",e.fx=Array(6).fill(null);let t=3,n=t/6.4,s=.7,r=Math.min(5,1+Math.floor(i/(t+s))),o=i-(r-1)*(t+s),a=i>=5*(t+s),l=a?0:6-r;K_(e,[5,4,3,2,1,0].slice(0,a?6:r)),a?(e.plat=y.UNLV(1),e.push=y.P0):o<s?(e.plat=bt(y.UNLV(l+1),y.UNLV(l),Et(o,0,s)),Gn(e,[...Array(l).keys()],e.plat),e.push=y.P0):(Gn(e,[...Array(l-1).keys()],y.UNLV(l)),Ih(e,o-s,l,l-1,r,n))},labels:[{at:[.9,.95,.15],t:"Los 6 caben en la rampa",s:"sin encimarse",when:15},{p:"plat",o:[0,.03,-.12],t:"Torre vac\xEDa: n = 0",when:15.4}],txt:{que:"La plataforma sube otro nivel y el empujador saca el siguiente, hasta que la torre queda vac\xEDa. Despu\xE9s, el carrito regresa a la banda.",porque:"Cada fixture se identific\xF3 por su QR al entrar, as\xED que el orden inverso no importa para el inventario.",herr:"\u2014",check:"Caben los 6 fixtures en la rampa sin encimarse.",error:"Primer rodillo m\xE1s alto que la base del fixture: el empujador lo empuja contra un escal\xF3n."}});we("tool_level","sta","Nivel de burbuja",i=>{i.bb(y.XP+.016,y.XP+.036,.46,.78,y.ZP-.012,y.ZP+.012,"yellow"),i.bb(y.XP+.036,y.XP+.038,.6,.64,y.ZP-.006,y.ZP+.006,"green")},{noCheck:!0});var Hl=new tn;Ci.add(Hl);{let i=new zn({color:1483594,transparent:!0,opacity:.16,depthWrite:!1,side:yn}),e=(t,n,s)=>{let r=s*Math.tan(Qs.degToRad(12.5)),o=new Gs(r,s,24,1,!0);o.translate(0,-s/2,0);let a=new Nt(o,i);a.position.set(...t),a.quaternion.setFromUnitVectors(Be(0,-1,0),Be(...n).normalize()),Hl.add(a)};e([.2465,.15,0],[1,0,0],.4),e([-.15,.15,.2016],[0,0,1],.4),e([-.15,.15,-.2016],[0,0,-1],.4),e([.04,.951,.078],[0,-1,0],.12)}var dn=0;ct.forEach((i,e)=>{i.i=e,i.start=dn,dn+=i.dur,i.add.forEach((t,n)=>{let s=typeof t=="string"?{ids:[t]}:Array.isArray(t)?{ids:t}:t,r=i.addStart+n*i.stagger;s.ids.forEach((o,a)=>{let l=Dt.get(o);if(!l){console.warn("Falta la pieza",o);return}let c=!s.pose||s.pose==="home"?"home":s.pose(o);l.track.push({s:e,pose:c,t0:r+(s.ids.length>6?a*.025:0),td:i.addDur,from:s.from?Be(...s.from):null})})});for(let t of i.show||[]){let n=Dt.get(t);(n.onlySet||=new Set).add(e)}i.focusSet=new Set(i.focus||[]),i.labelObjs=i.labels.map(t=>Object.assign(B_(t.t,t.s,t.cls),{spec:t})),i.dimObjs=i.dims.map(t=>Object.assign(k_(t.a,t.b,t.off,t.text,{mount:t.mount,cls:t.cls,labAt:t.labAt}),{spec:t}))});for(let i of Dt.values())i.explode||(i.explode=O_(i));for(let[i,e]of[["st_belt","belt"],["st_stripes","belt"],["st_ramp","ramp"],["st_rollers","ramp"]])Dt.get(i).station=e;for(let i of ct)i.dimObjs.forEach(e=>{e.spec.arrow&&(e.g.children.filter(t=>t.isMesh)[0].visible=!1)});var Vl=()=>({plat:y.LOAD0,tilt:0,push:y.P0,pin:0,screwX:0,screwL:0,spring:1,belt:0,cart:{x:0,z:0},fx:Array(6).fill(null),station:null,cones:!1}),Cl=i=>({...i,cart:{...i.cart},fx:i.fx.map(e=>e&&{...e})}),Gl=[];{let i=Vl();for(let e of ct){let t=Cl(i);e.keepFx||(t.fx=Array(6).fill(null)),t.station=null,t.cones=!1,t.screwX=0,t.tilt=0,Gl.push(t);let n=Cl(t);e.mech&&e.mech(e.dur,n),i=n}}function Uh(i,e){let t=Cl(Gl[i]);return ct[i].mech&&ct[i].mech(e,t),t}var Ux=new Ze,Nx=new Ze,Ox=new Ze,jt=(i,e,t)=>new Ze().makeTranslation(i,e,t);function Wl(i,e){let t=new Ze,n=i.home;switch(i.mount){case"plat":{t.makeTranslation(0,e.plat-y.LOAD0,0),e.tilt&&t.multiply(jt(y.XC,y.LOAD0,0)).multiply(new Ze().makeRotationX(e.tilt)).multiply(jt(-y.XC,-y.LOAD0,0));break}case"push":t.makeTranslation(e.push-y.P0,0,0);break;case"pin":t.makeTranslation(e.push-y.P0,-e.pin*J_,0);break;case"horn":t.makeTranslation(e.push-y.P0,0,0).multiply(jt(n.x,n.y,n.z)).multiply(new Ze().makeRotationZ(-e.pin*.9)).multiply(jt(-n.x,-n.y,-n.z));break;case"pinion":t.multiply(jt(n.x,n.y,n.z)).multiply(new Ze().makeRotationZ(-(e.push-y.P0)/.015)).multiply(jt(-n.x,-n.y,-n.z));break;case"screw":{let s=(e.plat-.6)*900+e.screwX+(n.z<0?e.screwL:0);t.multiply(jt(n.x,n.y,n.z)).multiply(new Ze().makeRotationY(s)).multiply(jt(-n.x,-n.y,-n.z));break}case"wheel":t.multiply(jt(n.x,n.y,n.z)).multiply(new Ze().makeRotationZ(-e.cart.x/y.WR)).multiply(jt(-n.x,-n.y,-n.z));break;case"spring":t.multiply(jt(n.x,n.y,n.z)).multiply(new Ze().makeScale(1,e.spring,1)).multiply(jt(-n.x,-n.y,-n.z));break;case"belt":t.makeTranslation(-(e.belt%.09+.09)%.09,0,0);break}return t}var Fx=Be(),Bx=new ft,zx=Be();function tr(i,e,t){let n=Wl(i,e).multiply(jt(i.home.x,i.home.y,i.home.z)),s=Be(),r=new ft,o=Be();n.decompose(s,r,o);let a=i.out!=null?i.out:t;return a>0&&s.addScaledVector(i.explode,a*(i.out!=null?1.9:1)),{pos:s,q:r,s:o}}var Ee={labels:!0,dims:!0,explode:new URLSearchParams(location.search).get("e")==="1",transp:!1,explodeAmt:0,playing:!1,speed:1,T:0,userCam:!1,step:-1};function Fa(i){for(let e=ct.length-1;e>=0;e--)if(i>=ct[e].start)return e;return 0}function Nh(i,e=0){let t=Fa(i),n=ct[t],s=Math.min(n.dur,i-n.start),r=Uh(t,s);Ci.position.set(r.cart.x,0,r.cart.z),Hl.visible=!!r.cones;let o=.5+.5*Math.sin(performance.now()/260),a=Ua();for(let l of Dt.values())ex(l,n,s,r,o);li=!1;for(let l of ct){let c=l===n;l.labelObjs.forEach(u=>{let h=u.spec.when??.8,d=u.spec.until??1e9;if(u.spec.cls==="inv"&&n.ch===0&&a){let g=l.labelObjs.indexOf(u),_=l.labelObjs.length,m=(l.dur-1.2)/_;h=.6+g*m,d=g===_-1?1e9:h+m*2.2}if(!(c&&Ee.labels&&!Pi.length&&s>=h&&s<d)){u.visible=!1;return}u.spec.p?(Dt.get(u.spec.p).group.getWorldPosition(u.position),u.spec.o&&u.position.add(Be(...u.spec.o))):u.position.set(...u.spec.at),u.visible=!0,u.element.style.opacity=xs((s-h)/.4)}),l.dimObjs.forEach(u=>{let h=c&&Ee.dims&&!Pi.length&&s>=(u.spec.when??.8)&&s<(u.spec.until??1e9);if(u.g.visible=h,u.lab.visible=h,!!h&&(u.g.matrixAutoUpdate=!1,u.g.matrix.copy(u.mount==="plat"?Wl({mount:"plat",home:Be()},r):new Ze),u.spec.grow)){let d=nn(s,...u.spec.grow),f=u.geo.attributes.position,g=u.A2.clone().lerp(u.B2,Math.max(.001,d));f.setXYZ(1,g.x,g.y,g.z),f.needsUpdate=!0,u.lab.position.copy(u.A2).lerp(g,u.spec.labAt??.5),u.lab.element.style.opacity=d>.98?1:0,u.g.children.filter(_=>_.isMesh)[1].visible=d>.98}})}return{i:t,t:s,m:r}}function ex(i,e,t,n,s){let r=e.i,o="hidden",a=null;if(i.inv){if(e.ch===0){let l=i.track[0],c=l&&r===0?xs((t-l.t0)/l.td):1,u=tr(i,n,0);a={pos:u.pos.clone().addScaledVector(i.from,1-sr(c)),q:u.q,s:u.s},o=i.inv===e.inv?r===0&&c<1?"new":"focus":"old",c<=0&&(o="hidden")}}else if(i.fixIndex!==void 0){let l=n.fx[i.fixIndex];l&&(a={pos:Be(l.x,l.y,l.z),q:new ft().setFromEuler(new un(0,0,l.rz||0)),s:Be(1,1,1)},o=e.focusSet.has(i.id)?"focus":e.ch<7?"new":"normal")}else if(i.station)n.station===i.station&&(a=tr(i,n,0),o="normal");else if(i.onlySet&&!i.track.length)i.onlySet.has(r)&&(a=tr(i,n,0),o="normal");else{let l=-1;for(let c=0;c<i.track.length;c++)i.track[c].s<=r&&(l=c);if(l>=0&&(!i.onlySet||i.onlySet.has(r))){let c=i.track[l],u=d=>d.pose==="home"?tr(i,n,Ee.explodeAmt):{pos:d.pose.pos.clone(),q:d.pose.q.clone(),s:Be(1,1,1)},h=u(c);if(c.s===r){let d=sr(xs((t-c.t0)/c.td)),f;if(l>0)f=u(i.track[l-1]);else{let g=c.from||(c.pose==="home"?i.explode:Be(0,.3,0));f={pos:h.pos.clone().add(g),q:h.q.clone(),s:h.s.clone()}}l===0&&t<c.t0?o="hidden":o="new",a={pos:f.pos.clone().lerp(h.pos,d),q:f.q.clone().slerp(h.q,d),s:f.s.clone().lerp(h.s,d)}}else a=h,o=e.focusSet.has(i.id)?"focus":e.dimOld?"old":"normal"}}o!=="hidden"&&a&&(i.group.position.copy(a.pos),i.group.quaternion.copy(a.q),i.group.scale.copy(a.s)),F_(i,o,o==="new"?Math.round(s*8)/8:0)}var gh=i=>(i=Math.max(0,Math.floor(i)),`${Math.floor(i/60)}:${String(i%60).padStart(2,"0")}`);function tx(){Me("chips").innerHTML=j_.map((n,s)=>`<button class="chip" data-ch="${s}" type="button"><b>${n.n}</b><span>${n.name}</span></button>`).join(""),Me("chips").querySelectorAll(".chip").forEach(n=>n.onclick=()=>{let s=ct.find(r=>r.ch===+n.dataset.ch);Sn(s.start+.001,!0)});let i=Me("ticks");i.innerHTML=ct.map((n,s)=>`<i class="${s===0||ct[s-1].ch!==n.ch?"ch":""}" style="left:${(n.start/dn*100).toFixed(3)}%"></i>`).join(""),Me("timeline").max=dn,Me("timeline").step=.01,Me("legend").innerHTML=Object.values(Da).map(n=>`<li><i style="background:#${n.color.toString(16).padStart(6,"0")}"></i>${n.name}</li>`).join(""),Me("supList").innerHTML=D_.map(([n,s])=>`<li><b>${n}.</b> ${s}</li>`).join(""),Me("bSup").onclick=Me("bSup2").onclick=()=>{Me("supDlg").hidden=!1,Ee.playing=!1,oi()},Me("supClose").onclick=()=>{Me("supDlg").hidden=!0},Me("supDlg").onclick=n=>{n.target===Me("supDlg")&&(Me("supDlg").hidden=!0)},Me("bRestart").onclick=()=>{Me("endCard").hidden=!0,Sn(0,!0),Ee.playing=!0,oi()},Me("bPlay").onclick=()=>{Ee.T>=dn-.01&&Sn(0,!0),Ee.playing=!Ee.playing,oi()},Me("bPrev").onclick=()=>{let n=Fa(Ee.T),s=Ee.T-ct[n].start;Sn(ct[s>1.2||n===0?n:n-1].start+.001,!0)},Me("bNext").onclick=()=>{let n=Fa(Ee.T);n<ct.length-1?Sn(ct[n+1].start+.001,!0):Sn(dn,!0)};let e=Me("timeline");e.addEventListener("input",()=>{Ee.playing=!1,oi(),Sn(+e.value,!1)}),document.querySelectorAll("[data-speed]").forEach(n=>n.onclick=()=>{Ee.speed=+n.dataset.speed,document.querySelectorAll("[data-speed]").forEach(s=>s.setAttribute("aria-pressed",s===n))});let t=(n,s)=>{let r=Me(n);r.checked=Ee[s],r.onchange=()=>{Ee[s]=r.checked,li=!0,fn()}};t("tLabels","labels"),t("tDims","dims"),t("tExplode","explode"),t("tTransp","transp"),Me("tExplode").onchange=()=>{Ee.explode=Me("tExplode").checked,Wn=null;for(let n of Dt.values())n.out=null;li=!0,fn()},Me("sheetHead").onclick=()=>{let n=document.body.classList.toggle("sheet-open");Me("sheetHead").setAttribute("aria-expanded",n),setTimeout(Xl,260)},addEventListener("keydown",n=>{n.target.tagName==="INPUT"&&n.target.type!=="checkbox"||(n.code==="Space"&&(n.preventDefault(),Me("bPlay").click()),n.code==="ArrowRight"&&Me("bNext").click(),n.code==="ArrowLeft"&&Me("bPrev").click(),n.code==="Escape"&&(Me("supDlg").hidden=!0))})}function oi(){Me("bPlay").setAttribute("aria-label",Ee.playing?"Pausa":"Reproducir"),Me("bPlay").classList.toggle("playing",Ee.playing),fn()}function Sn(i,e){Ee.T=Math.max(0,Math.min(dn,i));let t=Fa(Ee.T);t!==Ee.step&&(nx(t),Li(ct[t].cam,!1),Ee.userCam=!1),Me("endCard").hidden=Ee.T<dn-.005,fn()}function nx(i){Ee.step=i;let e=ct[i];Me("etapa").textContent=e.et,Me("stepn").textContent=`Paso ${i+1} de ${ct.length}`,Me("title").textContent=e.title,Me("sheetTitle").textContent=`${e.et} \xB7 ${e.title}`;let t=e.txt;Me("t-que").textContent=t.que,Me("t-porque").textContent=t.porque,Me("t-herr").textContent=t.herr,Me("row-herr").hidden=!t.herr||t.herr==="\u2014",Me("t-check").textContent=t.check,Me("t-error").textContent=t.error,document.querySelectorAll(".chip").forEach(s=>s.setAttribute("aria-current",+s.dataset.ch===e.ch?"step":"false"));let n=document.querySelector('.chip[aria-current="step"]');n&&n.scrollIntoView({block:"nearest",inline:"center",behavior:"smooth"}),Me("vEtapa").textContent=e.et,Me("vTitle").textContent=e.title}var Pl=-1;function Xl(){let i=rr.clientWidth,e=rr.clientHeight;!i||!e||(pn.setSize(i,e,!1),Ba.setSize(i,e),Jt.aspect=i/e,Jt.updateProjectionMatrix(),Rn&&(Pl=-1),li=!0,fn())}new ResizeObserver(Xl).observe(rr);var Ll=new _a,_h=0,_s=0,ir=!1,ql=document.hidden,Oh=!1,xh=new L,yh=new L;function fn(){ir||_s||(_s=requestAnimationFrame(ix))}function Fh(){let i=ql||Oh;if(i!==ir){if(ir=i,ir){_s&&cancelAnimationFrame(_s),_s=0,Ll.getDelta();return}Ll.getDelta(),fn()}}function ix(){if(_s=0,ir)return;let i=Math.min(Ll.getDelta(),.1),e=!1;Ee.playing&&(Sn(Ee.T+i*Ee.speed,!1),Ee.T>=dn&&(Ee.playing=!1,oi()),e=!0);let t=Ee.explode?1:0;Math.abs(Ee.explodeAmt-t)>=.002&&(Ee.explodeAmt+=(t-Ee.explodeAmt)*Math.min(1,i*6),Math.abs(Ee.explodeAmt-t)<.002&&(Ee.explodeAmt=t),e=!0),Wn&&(mx(i),e=!0);let n=Rn&&Math.abs(nr-Pl)>4e-4;n&&(lx(nr),e=!0);let s={i:Math.max(Ee.step,0),t:0},r=e||li;if(r&&(s=Nh(Ee.T,i)),n&&(ox(nr),Pl=nr),Wn&&hx(),Lt.active){Lt.t+=i/Lt.dur;let a=sr(xs(Lt.t));Jt.position.lerpVectors(Lt.p0,Lt.p1,a),Ft.target.lerpVectors(Lt.t0,Lt.t1,a),Lt.t>=1&&(Lt.active=!1),e=!0}let o=!1;if(xh.copy(Jt.position),yh.copy(Ft.target),Tl=!0,Ft.update(),Tl=!1,Ft.enabled&&(o=Jt.position.distanceToSquared(xh)>1e-10||Ft.target.distanceToSquared(yh)>1e-10),(r||e||o)&&(pn.render(It,Jt),Ba.render(It,Jt),li=!1,Ee.playing&&(_h=(_h+1)%4)===0)){let{i:a,t:l}=s;Me("timeline").value=Ee.T,Me("tcur").textContent=gh(Ee.T),Me("ttot").textContent=gh(dn),Me("progbar").style.width=(Ee.T/dn*100).toFixed(2)+"%",Me("vStepBar").style.width=(xs(l/ct[a].dur)*100).toFixed(1)+"%"}(e||o||Lt.active||Ee.playing)&&fn()}var sx=new Set(ys.map(i=>i.id));function rx(i,e){let t=(n,s)=>n.nest.some(r=>r==="*"||r===s.id||r==="*pf"&&sx.has(s.id)||r==="fx*"&&s.fixIndex!==void 0);return t(i,e)||t(e,i)}function ax(i=Vl(),e=4e-4){let t=[];for(let s of Dt.values()){if(s.noCheck||s.world||s.inv||!s.prims||s.station)continue;let r;if(s.fixIndex!==void 0){let o=i.fx[s.fixIndex];if(!o)continue;r=jt(o.x,o.y,o.z).multiply(new Ze().makeRotationZ(o.rz||0))}else r=Wl(s,i);for(let o of s.prims){let a=o.clone().applyMatrix4(r);a.expandByScalar(-e),a.isEmpty()||t.push({p:s,bx:a})}}let n=new Map;for(let s=0;s<t.length;s++)for(let r=s+1;r<t.length;r++){let o=t[s],a=t[r];if(o.p===a.p||!o.bx.intersectsBox(a.bx)||rx(o.p,a.p))continue;let l=o.bx.clone().intersect(a.bx),c=l.getSize(Be()),u=[o.p.id,a.p.id].sort().join(" \xD7 "),h=c.x*c.y*c.z*1e9;(!n.has(u)||n.get(u).mm3<h)&&n.set(u,{mm3:h,at:l.getCenter(Be()).toArray().map(d=>+d.toFixed(3)),size:c.toArray().map(d=>+(d*1e3).toFixed(1))})}return[...n.entries()].map(([s,r])=>({pair:s,...r})).sort((s,r)=>r.mm3-s.mm3)}var Il=new URLSearchParams(location.search),nr=0,Ca=new cn,vh=new ii,Pa=new L;function ox(i){if(Ci.updateWorldMatrix(!0,!0),Ca.setFromObject(Ci),Ca.isEmpty())return;Ca.getCenter(Pa),Ca.getBoundingSphere(vh);let e=.78+.1*i;Li({t:[Pa.x,Pa.y,Pa.z],d:[.85,.32,1],r:Math.max(.2,vh.radius*e)},!0)}function lx(i){let e=(a,l)=>{let c=Math.min(Math.max((i-a)/(l-a),0),1);return c*c*(3-2*c)},t=Math.max(e(.09,.21),e(.25,.35)),n=e(.37,.47),s=e(.5,.6),r=e(.64,.74),o=e(.77,.9);for(let a of Dt.values()){if(a.world||a.inv||a.station){a.out=0;continue}let l=0;a.id==="panel"||a.id==="camera"?l=t:a.id==="bat"||a.id==="bat_cradle"||a.id==="bat_hold"?l=r:a.id.startsWith("cab_")||a.sub==="elec"?l=n:a.sub==="emp"||a.sub==="torre"?l=s:a.sub==="trac"&&(l=o),a.out=l}}var Wn=null,Pi=[],bh=.55;function cx(i){if(i.nameTag)return i.nameTag;let e=document.createElement("div");e.className="pname";let t=document.createElement("span");t.textContent=i.name,e.appendChild(t);let n=new ps(e);return n.visible=!1,It.add(n),i.nameTag=n,n}function ux(){for(let e of Pi)e.fade=null,e.nameTag&&(e.nameTag.visible=!1);Pi=[];let i=Me("revealCap");i&&(i.hidden=!0)}function hx(){for(let i of Pi){let e=i.nameTag;!e||!e.visible||i.group.getWorldPosition(e.position)}}var dx=[{title:"El panel",test:i=>i.id==="panel"},{title:"Los cables",test:i=>i.id.startsWith("cab_")},{title:"La electr\xF3nica",test:i=>i.sub==="elec"},{title:"El empujador",test:i=>i.sub==="emp"},{title:"La torre",test:i=>i.sub==="torre"},{title:"La tracci\xF3n",test:i=>i.sub==="trac"},{title:"La estructura",test:i=>i.sub==="est"}],fx=[{t:[.28,.72,0],d:[1,.22,.28],r:.5},{t:[.02,.55,0],d:[.35,.4,1],r:.85},{t:[-.02,.95,0],d:[-.2,.55,1],r:.7},{t:[.02,.86,0],d:[.2,.35,1],r:.55},{t:[.12,.62,0],d:[.7,.35,1],r:.7},{t:[.04,.28,0],d:[.85,.25,1],r:.8},{t:[.02,.55,0],d:[.9,.4,1],r:1.15}];function Bh(){let i=ct.findIndex(e=>e.ch===7);return i>0?i-1:ct.length-1}function lr(){Wn=null,ux(),Ee.playing=!1,Ee.explode=!1,Me("tExplode").checked=!1;for(let e of Dt.values())e.out=null;let i=ct[Bh()];Sn(i.start+i.dur-.04,!0),Ee.userCam=!1,Li({t:[.08,.55,0],d:[.72,.38,1],r:Dl?.62:1.05},!1),oi(),Me("vEtapa").textContent="Lumina",Me("vTitle").textContent="As\xED estoy armada"}function Yl(){if(Wn)return;lr();let i=Bh(),e=new Set,t=[];dx.forEach((n,s)=>{let r=[...Dt.values()].filter(o=>e.has(o.id)||o.inv||o.station||o.world||!o.track.some(a=>a.s<=i)?!1:n.test(o));r.sort((o,a)=>a.home.y-o.home.y),r.forEach(o=>{e.add(o.id),o.out=0,o.fade=1,cx(o)}),r.length&&t.push({title:n.title,parts:r,cam:fx[s]})}),t.length&&(Pi=t.flatMap(n=>n.parts),Ee.labels=!1,Ee.dims=!1,Wn={layers:t,i:0,t:0},Me("vEtapa").textContent="Interior",Me("vTitle").textContent=t[0].title,Ee.userCam=!1,Li(t[0].cam,!1))}function px(){let i=Wn,e=Me("revealCap");i&&(e&&(e.hidden=!1,e.textContent=i.layers[i.i].title),i.layers.forEach((t,n)=>{let s=n<i.i;for(let r of t.parts){let o=r.nameTag,a=(r.out||0)>.15;o.visible=a,a&&(o.element.firstChild.style.opacity=s?"0.8":String(Math.min(1,((r.out||0)-.15)/.35)))}}))}function mx(i){let e=Wn,t=e.layers[e.i];e.t+=i;let n=.85,s=.1;t.parts.forEach((o,a)=>{let l=e.t-a*s;o.out=l<=0?0:sr(Math.min(1,l/n)),o.out>0&&(o.fade=1)});let r=n+s*Math.max(0,t.parts.length-1)+.45;if(e.t>=r){if(e.i+=1,e.t=0,e.i>=e.layers.length){for(let a=0;a<e.layers.length-1;a++)for(let l of e.layers[a].parts)l.fade=bh;Wn=null,Ee.explode=!0,Ee.explodeAmt=1,Me("tExplode").checked=!0;for(let a of Dt.values())a.out=null;let o=Me("revealCap");o&&(o.hidden=!1,o.textContent="Por dentro");for(let a of Pi)a.nameTag&&(a.nameTag.visible=!0);Me("vTitle").textContent="Por dentro";return}t=e.layers[e.i],Me("vTitle").textContent=t.title,Ee.userCam=!1,Li(t.cam,!1)}for(let o=0;o<e.i;o++)for(let a of e.layers[o].parts){let l=a.fade==null?1:a.fade;a.fade=l+(bh-l)*Math.min(1,i*2.4)}px()}function gx(){let i=window.SpeechRecognition||window.webkitSpeechRecognition;if(!i)return;let e=typeof BroadcastChannel=="function"?new BroadcastChannel("aether-mic"):null,t=!0;e&&e.postMessage("armado");let n=new i;n.lang="es-MX",n.continuous=!0,n.interimResults=!1,addEventListener("pagehide",()=>{t=!1,e&&e.postMessage("robot");try{n.stop()}catch{}});let s=r=>{let o=r.toLowerCase();/\b(lumina|lumia|ilumina|luminia)\b/.test(o)&&(/interior|adentro|por dentro/.test(o)?Yl():/qui[eé]n eres/.test(o)&&lr())};n.onresult=r=>{let o="";for(let a=r.resultIndex;a<r.results.length;a++)r.results[a].isFinal&&(o+=" "+r.results[a][0].transcript);s(o)},n.onend=()=>{t&&setTimeout(()=>{if(t)try{n.start()}catch{}},600)},setTimeout(()=>{if(t)try{n.start()}catch{}},700)}Ul();matchMedia("(prefers-color-scheme: dark)").addEventListener("change",Ul);new MutationObserver(Ul).observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]});tx();Xl();Dl&&(Ee.labels=!1,Ee.dims=!1,It.fog.near=2.5,It.fog.far=6);var zh=Il.get("pose")==="armada"||Il.get("reveal")==="1";Rn?(document.documentElement.classList.add("embed"),Ee.labels=!1,Ee.dims=!1,lr(),za.visible=!1,cr.visible=!1,vs.visible=!1,Ft.enabled=!1,addEventListener("message",i=>{if(i.origin!==location.origin)return;let e=i.data;if(e){if(e.type==="aether-explode"&&typeof e.p=="number"){nr=e.p,fn();return}if(e.type==="aether-pause"){Oh=!!e.paused,ql=document.hidden,Fh();return}}})):zh?lr():(Sn(0,!1),Li(ct[0].cam,!0),oi());document.body.classList.add("ready");!Rn&&!zh&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&(Ee.playing=!0,oi());!Rn&&Il.get("reveal")==="1"&&setTimeout(Yl,900);!Rn&&!Dl&&gx();document.addEventListener("visibilitychange",()=>{ql=document.hidden,Fh()});fn();window.__aether={STEPS:ct,PARTS:Dt,D:y,applyAt:Nh,seek:Sn,ui:Ee,TOTAL:()=>dn,mechAt:Uh,homePose:tr,camera:Jt,controls:Ft,renderer:pn,scene:It,cartRoot:Ci,checkGeometry:ax,M0:Vl,pileSet:Gn,START:Gl,finishCam:()=>Li(ct[Ee.step].cam,!0),showAssembled:lr,revealInterior:Yl};
/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
