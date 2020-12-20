import {LitElement, html, css } from "card-tools/src/lit-element";
import {subscribeRenderTemplate, hasTemplate} from "card-tools/src/templates";
import { bindActionHandler } from "card-tools/src/action";

const OPTIONS = [
  "icon",
  "active",
  "name",
  "secondary",
  "state",
  "condition",
  "image",
  "entity",
  // Secret option -
  // Set color to a hs-color value ("[<hue>,<saturation>]")
  // with hue in the range 0-360 and saturation 0-100.
  // Works only if entity is unset and active is set.
  "color",
]

class TemplateEntityRow extends LitElement {

  static get properties() {
    return {
      hass: {},
      state: {},
    };
  }

  setConfig(config) {
    this._config = {...config};
    this.config = this._config;
    this.state = {...this._config};

    let entity_ids = this._config.entity_ids;
    if(!entity_ids && this._config.entity && !hasTemplate(this._config.entity))
      entity_ids = [this._config.entity];
    for(const k of OPTIONS) {
      if(this._config[k] && hasTemplate(this._config[k])) {
        subscribeRenderTemplate(null, (res) => {
          this.state[k] = res;
          this.requestUpdate();
        }, {
          template: this._config[k],
          variables: {config: this._config},
          entity_ids,
        });
      }
    }
  }

  async firstUpdated() {
    const gen_row = this.shadowRoot.querySelector("#staging hui-generic-entity-row");
    if(!gen_row) return;
    await gen_row.updateComplete;
    this._action = gen_row._handleAction;
    const options = {
      hasHold: this._config.hold_action !== undefined && this._config.hold_action.action !== undefined,
      hasDoubleClick: this._config.hold_action !== undefined && this._config.hold_action.action !== undefined,
    }
    bindActionHandler(this.shadowRoot.querySelector("state-badge"), options);
    bindActionHandler(this.shadowRoot.querySelector(".info"), options);
  }

  _actionHandler(ev) {
    if(this._action) return this._action(ev);
  }

  render() {
    const base = this.hass.states[this.state.entity];
    const entity = base && JSON.parse(JSON.stringify(base)) || {
      entity_id: "light.",
      attributes: {icon: "no:icon"},
    };

    const icon = this.state.icon !== undefined
      ? this.state.icon || "no:icon"
      : undefined;
    ;
    const image = this.state.image;
    const name = this.state.name !== undefined
      ? this.state.name
      : base ? base.attributes.friendly_name || base.entity_id : undefined
    ;
    const secondary = this.state.secondary;
    const state = this.state.state !== undefined
      ? this.state.state
      : entity ? entity.state : undefined
    ;
    const active = this.state.active !== undefined
      ? String(this.state.active).toLowerCase() === "true"
      : undefined
    ;

    if(active !== undefined) {
      entity.attributes.brightness = 255;
    }

    const color = this.state.color !== undefined
      ? this.state.color
      : active === undefined
        ? undefined
        : active
          ? "var(--paper-item-icon-active-color, #fdd835)"
          : "var(--paper-item-icon-color, #44739e)"
      ;

    return html`
      <div id="wrapper" class="${((this.state.condition !== undefined && String(this.state.condition).toLowerCase() !== "true") || OPTIONS.some(o => hasTemplate(this.state[o]))) ? 'hidden' : ''}">
        <state-badge
          .hass=${this.hass}
          .stateObj=${entity}
          @action=${this._actionHandler}
          style="${color ? `--paper-item-icon-color: ${color}; --paper-item-icon-active-color: ${color};`:``}"
          .overrideIcon=${icon}
          .overrideImage=${image}
          class="pointer"
        ></state-badge>
        <div
          class="info pointer"
          @action=${this._actionHandler};
        >
            ${name}
            <div class="secondary">
              ${secondary}
            </div>
        </div>
        <div class="state">
          ${state}
        </div>
      </div>
      <div id="staging">
        <hui-generic-entity-row
            .hass=${this.hass}
            .config=${this._config}
        >
        </hui-generic-entity-row>
      </div>
    `;
  }

  static get styles() {
    const HuiGenericEntityRow = customElements.get('hui-generic-entity-row');
    let style = HuiGenericEntityRow.styles;
    style.cssText = style.cssText
      .replace(":host", "#wrapper")
      + `
      .state {
        text-align: right;
      }
      #wrapper {
        min-height: 40px;
      }
      #wrapper.hidden {
        display: none;
      }
      #staging {
        display: none;
      }
      `;
    return style;
  }
}

if(!customElements.get("template-entity-row")) {
  customElements.define("template-entity-row", TemplateEntityRow);
  const pjson = require('../package.json');
  console.info(`%cTEMPLATE-ENTITY-ROW ${pjson.version} IS INSTALLED`,
  "color: green; font-weight: bold",
  "");
}
