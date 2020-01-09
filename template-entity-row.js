!function(t){var e={};function i(s){if(e[s])return e[s].exports;var n=e[s]={i:s,l:!1,exports:{}};return t[s].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=e,i.d=function(t,e,s){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(s,n,function(e){return t[e]}.bind(null,n));return s},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";i.r(e);const s=customElements.get("home-assistant-main")?Object.getPrototypeOf(customElements.get("home-assistant-main")):Object.getPrototypeOf(customElements.get("hui-view")),n=s.prototype.html;s.prototype.css;function r(){return document.querySelector("home-assistant").hass}let a=function(){if(window.fully&&"function"==typeof fully.getDeviceId)return fully.getDeviceId();if(!localStorage["lovelace-player-device-id"]){const t=()=>Math.floor(1e5*(1+Math.random())).toString(16).substring(1);localStorage["lovelace-player-device-id"]=`${t()}${t()}-${t()}${t()}`}return localStorage["lovelace-player-device-id"]}();function o(t,e,i){t||(t=r().connection);let s={user:r().user.name,browser:a,hash:location.hash.substr(1)||" ",...i.variables},n=i.template,o=i.entity_ids;return t.subscribeMessage(t=>e(t.result),{type:"render_template",template:n,variables:s,entity_ids:o})}customElements.define("template-entity-row",class extends s{static get properties(){return{hass:{},state:{}}}setConfig(t){this._config=t,this.state=t;for(const e of["icon","active","name","secondary","state","condition","image","entity"])t[e]&&(String(t[e]).includes("{%")||String(t[e]).includes("{{"))&&o(null,t=>{this.state[e]=t,this.requestUpdate()},{template:t[e],variables:{config:t},entity_ids:t.entity_ids})}render(){if(this.state.condition&&"true"!==String(this.state.condition).toLowerCase())return n``;const t=this.hass.states[this.state.entity],e=void 0!==this.state.icon?this.state.icon||"no:icon":t?t.attributes.icon:"",i=void 0!==this.state.image?this.state.image:t?t.attributes.state_picture:"",s=void 0!==this.state.name?this.state.name:t?t.attributes.friendly_name||t.entity_id:"",r=this.state.secondary,a=void 0!==this.state.state?this.state.state:t?t.state:"",o="true"===String(this.state.active).toLowerCase();return n`
      <div id="wrapper">
        <state-badge
          .hass=${this.hass}
          .stateObj=${{entity_id:t?t.entity_id:"light.",state:void 0!==this.state.active?o?"on":"off":t?t.state:"off",attributes:{icon:e,entity_picture:i}}}
        ></state-badge>
        <div class="flex">
          <div
            class="info"
          >
            ${s}
            <div class="secondary">
              ${r}
            </div>
          </div>
          <div class="state">
          ${a}
          </div>
        </div>
      </div>
    `}static get styles(){let t=customElements.get("hui-generic-entity-row").styles;return t.cssText=t.cssText.replace(":host","#wrapper")+"\n      .state {\n        text-align: right;\n      }\n      #wrapper {\n        min-height: 40px;\n      }\n      ",t}})}]);