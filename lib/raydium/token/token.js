var qe=Object.create;var A=Object.defineProperty,je=Object.defineProperties,Ye=Object.getOwnPropertyDescriptor,He=Object.getOwnPropertyDescriptors,ze=Object.getOwnPropertyNames,fe=Object.getOwnPropertySymbols,Je=Object.getPrototypeOf,be=Object.prototype.hasOwnProperty,$e=Object.prototype.propertyIsEnumerable;var ye=(n,t,e)=>t in n?A(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e,P=(n,t)=>{for(var e in t||(t={}))be.call(t,e)&&ye(n,e,t[e]);if(fe)for(var e of fe(t))$e.call(t,e)&&ye(n,e,t[e]);return n},x=(n,t)=>je(n,He(t));var Ve=(n,t)=>{for(var e in t)A(n,e,{get:t[e],enumerable:!0})},he=(n,t,e,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of ze(t))!be.call(n,o)&&o!==e&&A(n,o,{get:()=>t[o],enumerable:!(r=Ye(t,o))||r.enumerable});return n};var T=(n,t,e)=>(e=n!=null?qe(Je(n)):{},he(t||!n||!n.__esModule?A(e,"default",{value:n,enumerable:!0}):e,n)),Ge=n=>he(A({},"__esModule",{value:!0}),n);var ut={};Ve(ut,{default:()=>$});module.exports=Ge(ut);var Ke=require("@solana/web3.js"),ge=T(require("bn.js"));var c=T(require("bn.js"));var Se=T(require("big.js")),M=T(require("bn.js"));var U=require("lodash"),G=T(require("dayjs")),xe=T(require("dayjs/plugin/utc"));G.default.extend(xe.default);var V=class{constructor(t){this.logLevel=t.logLevel!==void 0?t.logLevel:3,this.name=t.name}set level(t){this.logLevel=t}get time(){return(0,G.default)().utc().format("YYYY/MM/DD HH:mm:ss UTC")}get moduleName(){return this.name}isLogLevel(t){return t<=this.logLevel}error(...t){return this.isLogLevel(0)?(console.error(this.time,this.name,"sdk logger error",...t),this):this}logWithError(...t){let e=t.map(r=>typeof r=="object"?JSON.stringify(r):r).join(", ");throw new Error(e)}warning(...t){return this.isLogLevel(1)?(console.warn(this.time,this.name,"sdk logger warning",...t),this):this}info(...t){return this.isLogLevel(2)?(console.info(this.time,this.name,"sdk logger info",...t),this):this}debug(...t){return this.isLogLevel(3)?(console.debug(this.time,this.name,"sdk logger debug",...t),this):this}},Pe={},Xe={};function h(n){let t=(0,U.get)(Pe,n);if(!t){let e=(0,U.get)(Xe,n);t=new V({name:n,logLevel:e}),(0,U.set)(Pe,n,t)}return t}var Te=T(require("toformat")),Ze=Te.default,O=Ze;var E=T(require("big.js")),we=T(require("decimal.js-light"));var q=h("module/fraction"),X=O(E.default),R=O(we.default),Qe={[0]:R.ROUND_DOWN,[1]:R.ROUND_HALF_UP,[2]:R.ROUND_UP},et={[0]:E.default.roundDown,[1]:E.default.roundHalfUp,[2]:E.default.roundUp},a=class{constructor(t,e=Le){this.numerator=b(t),this.denominator=b(e)}get quotient(){return this.numerator.div(this.denominator)}invert(){return new a(this.denominator,this.numerator)}add(t){let e=t instanceof a?t:new a(b(t));return this.denominator.eq(e.denominator)?new a(this.numerator.add(e.numerator),this.denominator):new a(this.numerator.mul(e.denominator).add(e.numerator.mul(this.denominator)),this.denominator.mul(e.denominator))}sub(t){let e=t instanceof a?t:new a(b(t));return this.denominator.eq(e.denominator)?new a(this.numerator.sub(e.numerator),this.denominator):new a(this.numerator.mul(e.denominator).sub(e.numerator.mul(this.denominator)),this.denominator.mul(e.denominator))}mul(t){let e=t instanceof a?t:new a(b(t));return new a(this.numerator.mul(e.numerator),this.denominator.mul(e.denominator))}div(t){let e=t instanceof a?t:new a(b(t));return new a(this.numerator.mul(e.denominator),this.denominator.mul(e.numerator))}toSignificant(t,e={groupSeparator:""},r=1){Number.isInteger(t)||q.logWithError(`${t} is not an integer.`),t<=0&&q.logWithError(`${t} is not positive.`),R.set({precision:t+1,rounding:Qe[r]});let o=new R(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(t);return o.toFormat(o.decimalPlaces(),e)}toFixed(t,e={groupSeparator:""},r=1){return Number.isInteger(t)||q.logWithError(`${t} is not an integer.`),t<0&&q.logWithError(`${t} is negative.`),X.DP=t,X.RM=et[r]||1,new X(this.numerator.toString()).div(this.denominator.toString()).toFormat(t,e)}isZero(){return this.numerator.isZero()}};var nt=h("Raydium_amount"),ke=O(Se.default);function rt(n,t){let e="0",r="0";if(n.includes(".")){let o=n.split(".");o.length===2?([e,r]=o,r=r.padEnd(t,"0")):nt.logWithError(`invalid number string, num: ${n}`)}else e=n;return[e,r.slice(0,t)||r]}var w=class extends a{constructor(e,r,o=!0,s){let l=new M.default(0),u=D.pow(new M.default(e.decimals));if(o)l=b(r);else{let m=new M.default(0),g=new M.default(0);if(typeof r=="string"||typeof r=="number"||typeof r=="bigint"){let[p,y]=rt(r.toString(),e.decimals);m=b(p),g=b(y)}m=m.mul(u),l=m.add(g)}super(l,u);this.logger=h(s||"Amount"),this.token=e}get raw(){return this.numerator}isZero(){return this.raw.isZero()}gt(e){return this.token.equals(e.token)||this.logger.logWithError("gt token not equals"),this.raw.gt(e.raw)}lt(e){return this.token.equals(e.token)||this.logger.logWithError("lt token not equals"),this.raw.lt(e.raw)}add(e){return this.token.equals(e.token)||this.logger.logWithError("add token not equals"),new w(this.token,this.raw.add(e.raw))}subtract(e){return this.token.equals(e.token)||this.logger.logWithError("sub token not equals"),new w(this.token,this.raw.sub(e.raw))}toSignificant(e=this.token.decimals,r,o=0){return super.toSignificant(e,r,o)}toFixed(e=this.token.decimals,r,o=0){return e>this.token.decimals&&this.logger.logWithError("decimals overflow"),super.toFixed(e,r,o)}toExact(e={groupSeparator:""}){return ke.DP=this.token.decimals,new ke(this.numerator.toString()).div(this.denominator.toString()).toFormat(e)}};var Be=require("@solana/web3.js"),Ne={symbol:"SOL",name:"Solana",decimals:9},L={symbol:"WSOL",name:"Wrapped SOL",mint:"So11111111111111111111111111111111111111112",decimals:9,extensions:{coingeckoId:"solana"}},I={isQuantumSOL:!0,isLp:!1,official:!0,mint:new Be.PublicKey(L.mint),decimals:9,symbol:"SOL",id:"sol",name:"solana",icon:"https://img.raydium.io/icon/So11111111111111111111111111111111111111112.png",extensions:{coingeckoId:"solana"}};var j=require("@solana/web3.js");var De=require("@solana/spl-token"),d=require("@solana/web3.js");function Z({pubkey:n,isSigner:t=!1,isWritable:e=!0}){return{pubkey:n,isWritable:e,isSigner:t}}var _t=[Z({pubkey:De.TOKEN_PROGRAM_ID,isWritable:!1}),Z({pubkey:d.SystemProgram.programId,isWritable:!1}),Z({pubkey:d.SYSVAR_RENT_PUBKEY,isWritable:!1})];function v({publicKey:n,transformSol:t}){if(n instanceof d.PublicKey)return t&&n.equals(k)?_e:n;if(t&&n===k.toBase58())return _e;if(typeof n=="string")try{return new d.PublicKey(n)}catch{throw new Error("invalid public key")}throw new Error("invalid public key")}var Dt=new d.PublicKey("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R"),Wt=new d.PublicKey("Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"),At=new d.PublicKey("SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt"),Ut=new d.PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),Ot=new d.PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),Et=new d.PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"),Rt=new d.PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),Mt=new d.PublicKey("USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX"),It=new d.PublicKey("NRVwhjBQiUPYtfDT5zRBVJajzFQHaBUNtC7SNVvqRFa"),vt=new d.PublicKey("ANAxByE6G2WjFp7A4NqtWYXb3mgruyzZYg3spfxe6Lbo"),Ct=new d.PublicKey("7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"),_e=new d.PublicKey("So11111111111111111111111111111111111111112"),k=d.PublicKey.default;var Q=class{constructor({mint:t,decimals:e,symbol:r="UNKNOWN",name:o="UNKNOWN",skipMint:s=!1}){if(t===k.toBase58()||t instanceof j.PublicKey&&k.equals(t)){this.decimals=L.decimals,this.symbol=L.symbol,this.name=L.name,this.mint=new j.PublicKey(L.mint);return}this.decimals=e,this.symbol=r,this.name=o,this.mint=s?j.PublicKey.default:v({publicKey:t})}equals(t){return this===t?!0:this.mint.equals(t.mint)}},S=Q;S.WSOL=new Q(L);var te=class{constructor({decimals:t,symbol:e="UNKNOWN",name:r="UNKNOWN"}){this.decimals=t,this.symbol=e,this.name=r}equals(t){return this===t}},ee=te;ee.SOL=new te(Ne);var We=new a(Ae),Y=class extends a{toSignificant(t=5,e,r){return this.mul(We).toSignificant(t,e,r)}toFixed(t=2,e,r){return this.mul(We).toFixed(t,e,r)}};var ot=h("Raydium_price"),B=class extends a{constructor(e){let{baseToken:r,quoteToken:o,numerator:s,denominator:l}=e;super(s,l);this.baseToken=r,this.quoteToken=o,this.scalar=new a(ne(r.decimals),ne(o.decimals))}get raw(){return new a(this.numerator,this.denominator)}get adjusted(){return super.mul(this.scalar)}invert(){return new B({baseToken:this.quoteToken,quoteToken:this.baseToken,denominator:this.numerator,numerator:this.denominator})}mul(e){this.quoteToken!==e.baseToken&&ot.logWithError("mul token not equals");let r=super.mul(e);return new B({baseToken:this.baseToken,quoteToken:e.quoteToken,denominator:r.denominator,numerator:r.numerator})}toSignificant(e=this.quoteToken.decimals,r,o){return this.adjusted.toSignificant(e,r,o)}toFixed(e=this.quoteToken.decimals,r,o){return this.adjusted.toFixed(e,r,o)}};var H=h("Raydium_bignumber");var it=new c.default(0),Le=new c.default(1),fn=new c.default(2),yn=new c.default(3),bn=new c.default(5),D=new c.default(10),Ae=new c.default(100),hn=new c.default(1e3),Pn=new c.default(1e4),Ue=9007199254740991;function b(n){if(n instanceof c.default)return n;if(typeof n=="string"){if(n.match(/^-?[0-9]+$/))return new c.default(n);H.logWithError(`invalid BigNumberish string: ${n}`)}return typeof n=="number"?(n%1&&H.logWithError(`BigNumberish number underflow: ${n}`),(n>=Ue||n<=-Ue)&&H.logWithError(`BigNumberish number overflow: ${n}`),new c.default(String(n))):typeof n=="bigint"?new c.default(n.toString()):(H.logWithError(`invalid BigNumberish value: ${n}`),new c.default(0))}function ne(n){return D.pow(b(n))}function C(n){var u;if(n===void 0)return{denominator:"1",numerator:"0"};if(n instanceof c.default)return{numerator:n.toString(),denominator:"1"};if(n instanceof a)return{denominator:n.denominator.toString(),numerator:n.numerator.toString()};let t=String(n),[,e="",r="",o=""]=(u=t.replace(",","").match(/(-?)(\d*)\.?(\d*)/))!=null?u:[],s="1"+"0".repeat(o.length),l=e+(r==="0"?"":r)+o||"0";return{denominator:s,numerator:l,sign:e,int:r,dec:o}}function st(n){var r;let[,t="",e=""]=(r=n.toFixed(2).match(/(-?)(\d*)\.?(\d*)/))!=null?r:[];return`${t}${e}`}function Oe(n,t=0){return n instanceof c.default?n:new c.default(st(Ee(n).mul(D.pow(new c.default(String(t))))))}function Ee(n){if(n instanceof Y)return new a(n.numerator,n.denominator);if(n instanceof B)return n.adjusted;if(n instanceof w)try{return Ee(n.toExact())}catch{return new a(it)}if(n instanceof a)return n;let t=String(n),e=C(t);return new a(e.numerator,e.denominator)}function re(n){let{token:t,numberPrice:e,decimalDone:r}=n,o=new S({mint:"",decimals:6,symbol:"usd",name:"usd",skipMint:!0}),{numerator:s,denominator:l}=C(e),u=r?new c.default(s).mul(D.pow(new c.default(t.decimals))):s,m=new c.default(l).mul(D.pow(new c.default(o.decimals)));return new B({baseToken:o,denominator:m.toString(),quoteToken:new S(x(P({},t),{skipMint:!0,mint:""})),numerator:u.toString()})}var _=require("@solana/web3.js");var Nn=h("Raydium_txTool"),z=class{constructor(t){this.instructions=[];this.endInstructions=[];this.signers=[];this.connection=t.connection,this.feePayer=t.feePayer,this.signAllTransactions=t.signAllTransactions,this.owner=t.owner}get AllTxData(){return{instructions:this.instructions,endInstructions:this.endInstructions,signers:this.signers}}get allInstructions(){return[...this.instructions,...this.endInstructions]}addInstruction({instructions:t=[],endInstructions:e=[],signers:r=[]}){return this.instructions.push(...t),this.endInstructions.push(...e),this.signers.push(...r),this}build(t){let e=new _.Transaction;return this.allInstructions.length&&e.add(...this.allInstructions),e.feePayer=this.feePayer,{transaction:e,signers:this.signers,execute:async()=>{var o;let r=await Re(this.connection);if(e.recentBlockhash=r,(o=this.owner)!=null&&o.isKeyPair)return(0,_.sendAndConfirmTransaction)(this.connection,e,this.signers);if(this.signAllTransactions){this.signers.length&&e.partialSign(...this.signers);let s=await this.signAllTransactions([e]);return await this.connection.sendRawTransaction(s[0].serialize(),{skipPreflight:!0})}throw new Error("please connect wallet first")},extInfo:t||{}}}buildMultiTx(t){let{extraPreBuildData:e=[],extInfo:r}=t,{transaction:o}=this.build(r),s=e.filter(m=>m.transaction.instructions.length>0),l=[...s.map(m=>m.transaction),o],u=[...s.map(m=>m.signers),this.signers];return{transactions:l,signers:u,execute:async()=>{var g;let m=await Re(this.connection);if((g=this.owner)!=null&&g.isKeyPair)return await Promise.all(l.map(async(p,y)=>(p.recentBlockhash=m,await(0,_.sendAndConfirmTransaction)(this.connection,p,u[y]))));if(this.signAllTransactions){let p=l.map((N,K)=>(N.recentBlockhash=m,u[K].length&&N.partialSign(...u[K]),N)),y=await this.signAllTransactions(p),W=[];for(let N=0;N<y.length;N+=1){let K=await this.connection.sendRawTransaction(y[N].serialize(),{skipPreflight:!0});W.push(K)}return W}throw new Error("please connect wallet first")},extInfo:r||{}}}};async function Re(n){var t,e;try{return((e=await((t=n.getLatestBlockhash)==null?void 0:t.call(n)))==null?void 0:e.blockhash)||(await n.getRecentBlockhash()).blockhash}catch{return(await n.getRecentBlockhash()).blockhash}}var oe=(...n)=>n.map(t=>{try{return typeof t=="object"?JSON.stringify(t):t}catch{return t}}).join(", "),F=class{constructor({scope:t,moduleName:e}){this.disabled=!1;this.scope=t,this.logger=h(e)}createTxBuilder(t){return this.scope.checkOwner(),new z({connection:this.scope.connection,feePayer:t||this.scope.ownerPubKey,owner:this.scope.owner,signAllTransactions:this.scope.signAllTransactions})}logDebug(...t){this.logger.debug(oe(t))}logInfo(...t){this.logger.info(oe(t))}logAndCreateError(...t){let e=oe(t);throw new Error(e)}checkDisabled(){(this.disabled||!this.scope)&&this.logAndCreateError("module not working")}};var Ie=require("@solana/web3.js"),J=T(require("bn.js"));var i=require("@solana/buffer-layout"),ie=i.Layout,Me=i.Structure;var se=i.UInt;var ae=i.blob;var ue=class extends ie{constructor(e,r,o){super(e,o);this.blob=ae(e),this.signed=r}decode(e,r=0){let o=new J.default(this.blob.decode(e,r),10,"le");return this.signed?o.fromTwos(this.span*8).clone():o}encode(e,r,o=0){return typeof e=="number"&&(e=new J.default(e)),this.signed&&(e=e.toTwos(this.span*8)),this.blob.encode(e.toArrayLike(Buffer,"le",this.span),r,o)}};function pe(n){return new se(1,n)}function le(n){return new se(4,n)}function ve(n){return new ue(8,!1,n)}var ce=class extends ie{constructor(e,r,o,s){super(e.span,s);this.layout=e,this.decoder=r,this.encoder=o}decode(e,r){return this.decoder(this.layout.decode(e,r))}encode(e,r,o){return this.layout.encode(this.encoder(e),r,o)}getSpan(e,r){return this.layout.getSpan(e,r)}};function de(n){return new ce(ae(32),t=>new Ie.PublicKey(t),t=>t.toBuffer(),n)}var me=class extends Me{decode(t,e){return super.decode(t,e)}};function Ce(n,t,e){return new me(n,t,e)}var at=Ce([le("mintAuthorityOption"),de("mintAuthority"),ve("supply"),pe("decimals"),pe("isInitialized"),le("freezeAuthorityOption"),de("freezeAuthority")]);function Fe(n,t){return n.sort((e,r)=>{let{official:o,unOfficial:s}=t,l=new Set(o),u=new Set(s),m=y=>l.has(y.mint)?1:u.has(y.mint)?2:3,g=m(e)-m(r),p=y=>!/^[a-zA-Z]/.test(y);if(g===0){let y=p(e.symbol),W=p(r.symbol);return y&&!W?1:!y&&W?-1:e.symbol.localeCompare(r.symbol)}else return g})}var $=class extends F{constructor(e){super(e);this._tokens=[];this._tokenMap=new Map;this._tokenPrice=new Map;this._mintList={official:[],unOfficial:[],unNamed:[]}}async load(e){this.checkDisabled(),await this.scope.fetchTokens(e==null?void 0:e.forceUpdate),this._mintList={official:[],unOfficial:[],unNamed:[]},this._tokens=[],this._tokenMap=new Map;let{data:r}=this.scope.apiData.tokens||{data:{official:[],unOfficial:[],unNamed:[],blacklist:[]}},o=new Set(r.blacklist);[r.official,r.unOfficial,r.unNamed].forEach((s,l)=>{s.forEach(u=>{let m=["official","unOfficial","unNamed"][l];!o.has(u.mint)&&u.mint!==k.toBase58()&&(this._tokens.push(x(P({},u),{symbol:u.symbol||"",name:u.name||""})),this._mintList[m].push(u.mint))})}),this._mintList.official.push(I.mint.toBase58()),this._tokens=Fe(this._tokens,this._mintList),this._tokens.push(x(P({},I),{mint:k.toBase58()})),this._tokens.forEach(s=>{this._tokenMap.set(s.mint,x(P({},s),{id:s.mint}))}),this._tokenMap.set(L.mint,x(P({},L),{icon:I.icon,id:"wsol"})),this._tokenMap.set(k.toBase58(),x(P({},I),{mint:k.toBase58()}))}get allTokens(){return this._tokens}get allTokenMap(){return this._tokenMap}get tokenMints(){return this._mintList}get tokenPrices(){return this._tokenPrice}async fetchTokenPrices(e){let r=this.allTokens.filter(g=>{var p;return!!((p=g.extensions)!=null&&p.coingeckoId)&&g.mint!==Ke.PublicKey.default.toBase58()}),o=r.map(g=>g.extensions.coingeckoId),s=await this.scope.api.getCoingeckoPrice(o),l=r.reduce((g,p)=>s[p.extensions.coingeckoId].usd?x(P({},g),{[p.mint]:re({token:this._tokenMap.get(p.mint),numberPrice:s[p.extensions.coingeckoId].usd,decimalDone:!0})}):g,{}),u=e||await this.scope.api.getRaydiumTokenPrice(),m=Object.keys(u).reduce((g,p)=>this._tokenMap.get(p)?x(P({},g),{[p]:re({token:this._tokenMap.get(p),numberPrice:u[p],decimalDone:!0})}):g,{});return this._tokenPrice=new Map([...Object.entries(l),...Object.entries(m)]),this._tokenPrice}mintToToken(e){let r=v({publicKey:e,transformSol:!0}),o=this.allTokenMap.get(r.toBase58());o||this.logAndCreateError("token not found, mint:",r.toBase58());let{decimals:s,name:l,symbol:u}=o;return new S({mint:e,decimals:s,name:l,symbol:u})}mintToTokenAmount({mint:e,amount:r,decimalDone:o}){let s=this.mintToToken(e);return o?new w(s,b(r)):new w(s,this.decimalAmount({mint:e,amount:r,decimalDone:o}))}decimalAmount({mint:e,amount:r}){let o=C(r),s=this.mintToToken(e);return Oe(new a(o.numerator,o.denominator).mul(new ge.default(10**s.decimals)))}uiAmount({mint:e,amount:r}){let o=C(r),s=this.mintToToken(e);return s?new a(o.numerator,o.denominator).div(new ge.default(10**s.decimals)).toSignificant(s.decimals):""}};0&&(module.exports={});
//# sourceMappingURL=token.js.map