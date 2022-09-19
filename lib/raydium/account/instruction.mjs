import{createInitializeAccountInstruction as ke,createCloseAccountInstruction as De,createTransferInstruction as Ae,TOKEN_PROGRAM_ID as We}from"@solana/spl-token";import{Keypair as _e,PublicKey as Re,SystemProgram as Ee}from"@solana/web3.js";import Ie from"bn.js";import{get as F,set as ie}from"lodash";import q from"dayjs";import se from"dayjs/plugin/utc";q.extend(se);var B=class{constructor(e){this.logLevel=e.logLevel!==void 0?e.logLevel:3,this.name=e.name}set level(e){this.logLevel=e}get time(){return q().utc().format("YYYY/MM/DD HH:mm:ss UTC")}get moduleName(){return this.name}isLogLevel(e){return e<=this.logLevel}error(...e){return this.isLogLevel(0)?(console.error(this.time,this.name,"sdk logger error",...e),this):this}logWithError(...e){let t=e.map(r=>typeof r=="object"?JSON.stringify(r):r).join(", ");throw new Error(t)}warning(...e){return this.isLogLevel(1)?(console.warn(this.time,this.name,"sdk logger warning",...e),this):this}info(...e){return this.isLogLevel(2)?(console.info(this.time,this.name,"sdk logger info",...e),this):this}debug(...e){return this.isLogLevel(3)?(console.debug(this.time,this.name,"sdk logger debug",...e),this):this}},M={},ae={};function m(n){let e=F(M,n);if(!e){let t=F(ae,n);e=new B({name:n,logLevel:t}),ie(M,n,e)}return e}import{PublicKey as yn}from"@solana/web3.js";import Pn from"bn.js";import ye from"big.js";import ct from"bn.js";import c from"bn.js";var x=m("Raydium_bignumber");var ce=new c(0),H=new c(1),Ye=new c(2),$e=new c(3),Ve=new c(5),me=new c(10),Y=new c(100),ze=new c(1e3),Ge=new c(1e4),v=9007199254740991;function p(n){if(n instanceof c)return n;if(typeof n=="string"){if(n.match(/^-?[0-9]+$/))return new c(n);x.logWithError(`invalid BigNumberish string: ${n}`)}return typeof n=="number"?(n%1&&x.logWithError(`BigNumberish number underflow: ${n}`),(n>=v||n<=-v)&&x.logWithError(`BigNumberish number overflow: ${n}`),new c(String(n))):typeof n=="bigint"?new c(n.toString()):(x.logWithError(`invalid BigNumberish value: ${n}`),new c(0))}import pe from"toformat";var le=pe,g=le;import T from"big.js";import fe from"decimal.js-light";var w=m("module/fraction"),N=g(T),b=g(fe),ge={[0]:b.ROUND_DOWN,[1]:b.ROUND_HALF_UP,[2]:b.ROUND_UP},be={[0]:T.roundDown,[1]:T.roundHalfUp,[2]:T.roundUp},o=class{constructor(e,t=H){this.numerator=p(e),this.denominator=p(t)}get quotient(){return this.numerator.div(this.denominator)}invert(){return new o(this.denominator,this.numerator)}add(e){let t=e instanceof o?e:new o(p(e));return this.denominator.eq(t.denominator)?new o(this.numerator.add(t.numerator),this.denominator):new o(this.numerator.mul(t.denominator).add(t.numerator.mul(this.denominator)),this.denominator.mul(t.denominator))}sub(e){let t=e instanceof o?e:new o(p(e));return this.denominator.eq(t.denominator)?new o(this.numerator.sub(t.numerator),this.denominator):new o(this.numerator.mul(t.denominator).sub(t.numerator.mul(this.denominator)),this.denominator.mul(t.denominator))}mul(e){let t=e instanceof o?e:new o(p(e));return new o(this.numerator.mul(t.numerator),this.denominator.mul(t.denominator))}div(e){let t=e instanceof o?e:new o(p(e));return new o(this.numerator.mul(t.denominator),this.denominator.mul(t.numerator))}toSignificant(e,t={groupSeparator:""},r=1){Number.isInteger(e)||w.logWithError(`${e} is not an integer.`),e<=0&&w.logWithError(`${e} is not positive.`),b.set({precision:e+1,rounding:ge[r]});let a=new b(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(e);return a.toFormat(a.decimalPlaces(),t)}toFixed(e,t={groupSeparator:""},r=1){return Number.isInteger(e)||w.logWithError(`${e} is not an integer.`),e<0&&w.logWithError(`${e} is negative.`),N.DP=e,N.RM=be[r]||1,new N(this.numerator.toString()).div(this.denominator.toString()).toFormat(e,t)}isZero(){return this.numerator.isZero()}};var yt=m("Raydium_amount"),ht=g(ye);import{PublicKey as he}from"@solana/web3.js";var G={symbol:"SOL",name:"Solana",decimals:9},l={symbol:"WSOL",name:"Wrapped SOL",mint:"So11111111111111111111111111111111111111112",decimals:9,extensions:{coingeckoId:"solana"}},wt={isQuantumSOL:!0,isLp:!1,official:!0,mint:new he(l.mint),decimals:9,symbol:"SOL",id:"sol",name:"solana",icon:"https://img.raydium.io/icon/So11111111111111111111111111111111111111112.png",extensions:{coingeckoId:"solana"}};import{PublicKey as D}from"@solana/web3.js";import{TOKEN_PROGRAM_ID as Pe}from"@solana/spl-token";import{PublicKey as u,SystemProgram as xe,SYSVAR_RENT_PUBKEY as we}from"@solana/web3.js";function k({pubkey:n,isSigner:e=!1,isWritable:t=!0}){return{pubkey:n,isWritable:t,isSigner:e}}var Nt=[k({pubkey:Pe,isWritable:!1}),k({pubkey:xe.programId,isWritable:!1}),k({pubkey:we,isWritable:!1})];function X({publicKey:n,transformSol:e}){if(n instanceof u)return e&&n.equals(y)?J:n;if(e&&n===y.toBase58())return J;if(typeof n=="string")try{return new u(n)}catch{throw new Error("invalid public key")}throw new Error("invalid public key")}var kt=new u("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),Dt=new u("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"),At=new u("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),Wt=new u("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),_t=new u("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),Rt=new u("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),Et=new u("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),It=new u("USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX"),Ut=new u("NRVwhjBQiUPYtfDT5zRBVJajzFQHaBUNtC7SNVvqRFa"),Kt=new u("ANAxByE6G2WjFp7A4NqtWYXb3mgruyzZYg3spfxe6Lbo"),Ct=new u("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),J=new u("So11111111111111111111111111111111111111112"),y=u.default;var A=class{constructor({mint:e,decimals:t,symbol:r="UNKNOWN",name:a="UNKNOWN",skipMint:d=!1}){if(e===y.toBase58()||e instanceof D&&y.equals(e)){this.decimals=l.decimals,this.symbol=l.symbol,this.name=l.name,this.mint=new D(l.mint);return}this.decimals=t,this.symbol=r,this.name=a,this.mint=d?D.default:X({publicKey:e})}equals(e){return this===e?!0:this.mint.equals(e.mint)}},f=A;f.WSOL=new A(l);var _=class{constructor({decimals:e,symbol:t="UNKNOWN",name:r="UNKNOWN"}){this.decimals=e,this.symbol=t,this.name=r}equals(e){return this===e}},W=_;W.SOL=new _(G);var Jt=new o(Y);var on=m("Raydium_price");import{PACKET_DATA_SIZE as Bn,PublicKey as Nn,sendAndConfirmTransaction as Dn,Transaction as _n}from"@solana/web3.js";var In=m("Raydium_txTool");import{PublicKey as jn}from"@solana/web3.js";var $n=m("Raydium_accountInfo_util");import{PublicKey as Ne}from"@solana/web3.js";import Q,{isBN as po}from"bn.js";import{bits as lr,BitStructure as dr,blob as Te,Blob as fr,cstr as gr,f32 as br,f32be as yr,f64 as hr,f64be as Pr,greedy as xr,Layout as Se,ns64 as wr,ns64be as Tr,nu64 as Sr,nu64be as Lr,offset as Br,s16 as Nr,s16be as kr,s24 as Dr,s24be as Ar,s32 as Wr,s32be as _r,s40 as Rr,s40be as Er,s48 as Ir,s48be as Ur,s8 as Kr,seq as Cr,struct as Or,Structure as Le,u16 as Fr,u16be as Mr,u24 as qr,u24be as vr,u32 as jr,u32be as Hr,u40 as Yr,u40be as $r,u48 as Vr,u48be as zr,u8 as Gr,UInt as Be,union as Jr,Union as Xr,unionLayoutDiscriminator as Zr,utf8 as Qr}from"@solana/buffer-layout";var R=Se,Z=Le;var E=Be;var I=Te;var U=class extends R{constructor(t,r,a){super(t,a);this.blob=I(t),this.signed=r}decode(t,r=0){let a=new Q(this.blob.decode(t,r),10,"le");return this.signed?a.fromTwos(this.span*8).clone():a}encode(t,r,a=0){return typeof t=="number"&&(t=new Q(t)),this.signed&&(t=t.toTwos(this.span*8)),this.blob.encode(t.toArrayLike(Buffer,"le",this.span),r,a)}};function ee(n){return new E(1,n)}function S(n){return new E(4,n)}function L(n){return new U(8,!1,n)}var K=class extends R{constructor(t,r,a,d){super(t.span,d);this.layout=t,this.decoder=r,this.encoder=a}decode(t,r){return this.decoder(this.layout.decode(t,r))}encode(t,r,a){return this.layout.encode(this.encoder(t),r,a)}getSpan(t,r){return this.layout.getSpan(t,r)}};function h(n){return new K(I(32),e=>new Ne(e),e=>e.toBuffer(),n)}var C=class extends Z{decode(e,t){return super.decode(e,t)}};function te(n,e,t){return new C(n,e,t)}var O=te([h("mint"),h("owner"),L("amount"),S("delegateOption"),h("delegate"),ee("state"),S("isNativeOption"),L("isNative"),L("delegatedAmount"),S("closeAuthorityOption"),h("closeAuthority")]);function Ue(n){let{mint:e,tokenAccount:t,owner:r}=n;return ke(t,e,r)}function Ke(n){let{tokenAccount:e,payer:t,multiSigners:r=[],owner:a}=n;return De(e,t,a,r)}async function Ao(n){let{connection:e,amount:t,commitment:r,payer:a,owner:d,skipCloseAccount:ne}=n,re=await e.getMinimumBalanceForRentExemption(O.span,r),oe=p(t).add(new Ie(re)),P=_e.generate();return{signers:[P],instructions:[Ee.createAccount({fromPubkey:a,newAccountPubkey:P.publicKey,lamports:oe.toNumber(),space:O.span,programId:We}),Ue({mint:new Re(l.mint),tokenAccount:P.publicKey,owner:d})],endInstructions:ne?[]:[Ke({tokenAccount:P.publicKey,payer:a,owner:d})]}}function Wo({source:n,destination:e,owner:t,amount:r,multiSigners:a=[]}){return Ae(n,e,t,p(r).toNumber(),a)}export{Ke as closeAccountInstruction,Ao as createWSolAccountInstructions,Ue as initTokenAccountInstruction,Wo as makeTransferInstruction};
//# sourceMappingURL=instruction.mjs.map