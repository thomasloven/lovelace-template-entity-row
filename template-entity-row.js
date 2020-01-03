!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";n.r(t);const r=customElements.get("home-assistant-main")?Object.getPrototypeOf(customElements.get("home-assistant-main")):Object.getPrototypeOf(customElements.get("hui-view")),i=r.prototype.html;r.prototype.css;function o(){return document.querySelector("home-assistant").hass}let s=function(){if(window.fully&&"function"==typeof fully.getDeviceId)return fully.getDeviceId();if(!localStorage["lovelace-player-device-id"]){const e=()=>Math.floor(1e5*(1+Math.random())).toString(16).substring(1);localStorage["lovelace-player-device-id"]=`${e()}${e()}-${e()}${e()}`}return localStorage["lovelace-player-device-id"]}();function a(e,t,n){e||(e=o().connection);let r={user:o().user.name,browser:s,hash:location.hash.substr(1)||" ",...n.variables},i=n.template,a=n.entity_ids;return e.subscribeMessage(e=>t(e.result),{type:"render_template",template:i,variables:r,entity_ids:a})}customElements.define("template-entity-row",class extends r{static get properties(){return{hass:{},_config:{},state:{}}}setConfig(e){this._config=e,this.state={icon:"",active:"",name:"",secondary:"",state:"",...e};for(const t of["icon","active","name","secondary","state","condition"])e[t]&&(String(e[t]).includes("{%")||String(e[t]).includes("{{"))&&a(null,e=>{this.state[t]=e,this.requestUpdate()},{template:e[t],entity_ids:e.entity_ids})}render(){if(this._config.condition&&"true"!==String(this.state.condition).toLowerCase())return i``;const e=String(this.state.active).toLowerCase();return i`
      <div id="wrapper">
        <ha-icon
          .icon=${this.state.icon}
          style="
            color: ${"true"===e?"var(--paper-item-icon-active-color)":"var(--paper-item-icon-color)"};
            "
        ></ha-icon>
        <div class="flex">
          <div
            class="info"
          >
            ${this.state.name}
            <div class="secondary">
              ${this.state.secondary}
            </div>
          </div>
          ${this.state.state}
        </div>
      </div>
    `}static get styles(){let e=customElements.get("hui-generic-entity-row").styles;return e.cssText=e.cssText.replace(":host","#wrapper").replace("state-badge","ha-icon"),e}})}]);