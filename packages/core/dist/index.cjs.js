"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var t,e=require("rxjs"),i=require("uuid");!function(t){t[t.change=0]="change",t[t.mount=1]="mount",t[t.unmount=2]="unmount",t[t.treeUpdate=3]="treeUpdate"}(t||(t={}));class s{constructor(t,s){this.initiator=null,this.mounted=!1,this.subscriptions=[],this.eventObserver=new e.Subject,this.parent=null,this.childKeys=new e.BehaviorSubject([]),this.history={enabled:!0,__batch:!1,__ignoreNextUpdate:!1},this.userData={},Object.defineProperties(this,{initiator:{value:s||null,writable:!1,configurable:!1,enumerable:!1},id:{value:t.id||i.v4(),writable:!1,configurable:!1},name:{value:t.name,writable:!1,configurable:!1}}),this.data=new e.BehaviorSubject({attrs:t.attrs,children:[]})}__initialize(){const i=this.data.pipe(e.map((({children:t})=>t)),e.distinctUntilChanged()).subscribe((t=>{this.childKeys.next(t.map((t=>t.id)))})),s=this.eventObserver.pipe(e.filter((({type:e})=>e===t.treeUpdate))).subscribe((t=>{this.history.enabled&&!this.history.__batch||t.tag!==this&&(t.tag.history.__ignoreNextUpdate=!0),this.parent&&this.parent.eventObserver.next(t)})),r=this.data.pipe(e.pairwise()).subscribe((e=>{const i={type:t.change,prev:e[0],next:e[1]};this.eventObserver.next(i),this.eventObserver.next({type:t.treeUpdate,tag:this,event:i})}));this.addSubscription(i),this.addSubscription(s),this.addSubscription(r)}get historyBatch(){return this.history.__batch}set historyBatch(t){if(this.historyBatch!==t){if(t){const t={attrs:this.attrs,children:this.children};this.data.next(t)}if(this.history.__batch=t,!t){const t={attrs:this.attrs,children:this.children};this.data.next(t)}}}get path(){return this.isMounted?this.parent?[...this.parent.path,this.id]:[]:null}get isMounted(){return this.mounted}set isMounted(e){if(e!==this.mounted){for(const t of this.children)t.isMounted=e;if(e)this.__initialize(),this.initiator&&this.initiator(this),this.eventObserver.next({type:t.mount});else{this.eventObserver.next({type:t.unmount});for(const t of this.subscriptions)t.unsubscribe();this.subscriptions.splice(0,this.subscriptions.length),this.userData={}}this.mounted=e}}get attrs(){return this.data.value.attrs}get children(){return this.data.value.children}get rx(){return this.data}get events(){return this.eventObserver}findByPath(t){if(0===t.length)return this;const e=t[0];for(const i of this.children)if(i.id===e)return i.findByPath(t.slice(1));return null}findById(t,e=!1){let i;for(const s of this.children){if(s.id===t)return s;if(e&&(i=s.findById(t)))return i}return null}findByName(t,e=!1){let i;for(const s of this.children){if(s.name===t)return s;if(e&&(i=s.findByName(t)))return i}return null}find(t,e=!1){let i;for(const s of this.children){if(t(s))return s;if(e&&(i=s.find(t)))return i}return null}getRoot(){return this.parent?this.parent.getRoot():null}get subscriptionsSize(){return this.subscriptions.length}addSubscription(t){this.subscriptions.push(t)}removeSubscription(t){this.subscriptions=this.subscriptions.filter((e=>e!==t||(t.unsubscribe(),!1)))}onUnmount(i){return this.eventObserver.pipe(e.filter((({type:e})=>e===t.unmount))).subscribe(i)}onChange(i){return this.eventObserver.pipe(e.filter((({type:e})=>e===t.change))).subscribe(i)}onTreeUpdate(i){return this.eventObserver.pipe(e.filter((({type:e})=>e===t.treeUpdate))).subscribe(i)}setAttr(t,e){const i={attrs:{...this.attrs,[t]:e},children:this.children};this.data.next(i)}setAttrs(t){const e={attrs:{...t},children:this.children};this.data.next(e)}addChild(...t){const e=[...this.children];for(const i of t)i.parent&&i.parent!==this&&i.parent.removeChild(i),i.parent&&i.parent===this||(e.push(i),i.parent=this,i.isMounted=this.isMounted);const i={attrs:this.attrs,children:e};this.data.next(i)}removeChild(t){const e=(Array.isArray(t)?t:[t]).filter((t=>t.parent&&t.parent===this)).map((t=>(t.parent=null,t.isMounted=!1,t.id)));if(!e.length)return!1;const i=this.children.filter((t=>-1===e.indexOf(t.id))),s={attrs:this.attrs,children:i};return this.data.next(s),!0}filterChild(t){const e=[],i=this.children.filter((i=>!!t(i)||(e.push(i),!1))),s={attrs:this.attrs,children:i};for(const t of e)t.parent=null,t.isMounted=!1;this.data.next(s)}remove(){return!!this.parent&&this.parent.removeChild(this)}traverse(t){for(const e of this.children)t(e),e.traverse(t)}get vdom(){return{name:this.name,id:this.id,attrs:this.attrs,children:this.children.map((t=>t.vdom))}}toJSON(){return this.vdom}}const r={current:null,get:function(){return this.current},set:function(t){this.current=t}},n={},h=t=>{const e=[];for(const i of t.children){const t=h(i);t&&e.push(t)}return t.name in n?n[t.name](t.id,t.attrs,e):null},o=(t,e,i=!1)=>{if(t.name!==e.name)return null;t.history.__ignoreNextUpdate=i;const s=[],r=[],n=[],a=t.childKeys.value;for(const i of e.children){const e=a.indexOf(i.id);if(-1!==e){const r=o(t.children[e],i,!0);n.push(e),s.push(r)}else{const e=h(i);if(e){const n=o(e,i,!0);r.push(n),s.push(n),n.parent=t}}}for(let e=0;e<t.children.length;e++){if(-1!==n.indexOf(e))continue;const i=t.children[e];i.isMounted=!1,i.parent=null}const u={attrs:e.attrs,children:s};t.data.next(u);for(const e of r)e.isMounted=t.isMounted;return t};class a{constructor(t){this.stack=[],this.pointer=0,this.size=256,this.owner=t,this.stack.push({path:t.path,vdom:t.vdom})}push(t){t.tag.history.enabled&&!t.tag.historyBatch&&(t.tag.history.__ignoreNextUpdate?t.tag.history.__ignoreNextUpdate=!1:(this.stack.splice(this.pointer+1,this.stack.length-this.pointer),this.stack.push({path:t.tag.path,vdom:t.tag.vdom}),this.stack.length>this.size&&(this.stack=this.stack.slice(this.stack.length-this.size)),this.pointer=this.stack.length-1))}undo(){if(this.pointer<=0)return!1;const t=this.stack[--this.pointer],e=this.owner.findByPath(t.path);return e&&o(e,t.vdom,!0),!0}redo(){if(this.pointer>=this.stack.length-1)return!1;const t=this.stack[++this.pointer],e=this.owner.findByPath(t.path);return e&&o(e,t.vdom,!0),!0}clear(){this.stack.splice(0,this.stack.length),this.pointer=0}jump(t){const e=t<0?-t:t,i=t<0?this.undo.bind(this):this.redo.bind(this);for(let t=0;t<=e;t++)i()}}exports.Document=class extends s{constructor(i,s){super({name:i||"Document",id:s||"root",attrs:{}}),this.__initialize(),this.historyManager=new a(this),this.eventObserver.pipe(e.filter((({type:e})=>e===t.treeUpdate))).subscribe((t=>this.historyManager.push(t)))}get isMounted(){return!0}getRoot(){return this}},exports.Tag=s,exports.attrOp=function(){return e.map((t=>t.attrs))},exports.childOp=function(){return e.map((t=>t.children))},exports.clearRegistry=()=>{for(const t in n)delete n[t]},exports.create=h,exports.def=(t,e)=>{if(t in n)throw new Error(`Name ${t} already registered. Name should be a uniq string`);const i=(i=null,n={},h=[])=>{const o=e&&(t=>{r.set(t),e(t),r.set(null)}),a=new s({id:i||"",name:t,attrs:n},o);return h.length&&a.addChild(...h),a};return n[t]=i,i},exports.fromVDOM=o,exports.rxChange=e=>{const i=r.get();if(!i)throw new Error("rxMount hook is out of the component");const s=i.events.subscribe((i=>{i.type===t.change&&e(i)}));i.addSubscription(s)},exports.rxMount=e=>{const i=r.get();if(!i)throw new Error("rxMount hook is out of the component");const s={current:null},n=i.events.subscribe((i=>{i.type===t.mount?s.current=e():i.type===t.unmount&&s.current&&(s.current(),s.current=null)}));i.addSubscription(n)};
//# sourceMappingURL=index.cjs.js.map