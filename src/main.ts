import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { hasTemplate } from "card-tools/src/templates";
import { bindActionHandler } from "card-tools/src/action";
import pjson from "../package.json";
import { bind_template } from "./templates";
import { hass } from "card-tools/src/hass";

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
  "toggle",
  "tap_action",
  "hold_action",
  "double_tap_action",
];

const LOCALIZE_PATTERN = /_\([^)]*\)/g;

const translate = (hass, text) => {
  return text.replace(
    LOCALIZE_PATTERN,
    (key) => hass.localize(key.substring(2, key.length - 1)) || key
  );
};

class TemplateEntityRow extends LitElement {
  @property() _config;
  @property() hass;
  @property() config;
  @property() _action;

  setConfig(config) {
    this._config = { ...config };
    this.config = { ...this._config };

    let entity_ids = this._config.entity_ids;
    if (!entity_ids && this._config.entity && !hasTemplate(this._config.entity))
      entity_ids = [this._config.entity];
    for (const k of OPTIONS) {
      if (!this._config[k]) continue;
      if (hasTemplate(this._config[k])) {
        bind_template(
          (res) => {
            const state = { ...this.config };
            if (typeof res === "string") res = translate(hass(), res);
            state[k] = res;
            this.config = state;
          },
          this._config[k],
          { config }
        );
      } else if (typeof this._config[k] === "string") {
        this.config[k] = translate(hass(), this._config[k]);
      }
    }
  }

  async firstUpdated() {
    const gen_row = this.shadowRoot.querySelector(
      "#staging hui-generic-entity-row"
    ) as any;
    if (!gen_row) return;
    await gen_row.updateComplete;
    this._action = gen_row._handleAction;
    const options = {
      hasHold: this._config.hold_action !== undefined,
      hasDoubleClick: this._config.hold_action !== undefined,
    };
    bindActionHandler(this.shadowRoot.querySelector("state-badge"), options);
    bindActionHandler(this.shadowRoot.querySelector(".info"), options);
  }

  _actionHandler(ev) {
    if (this._action) return this._action(ev);
  }

  render() {
    const base = this.hass.states[this.config.entity];
    const entity = (base && JSON.parse(JSON.stringify(base))) || {
      entity_id: "light.",
      attributes: { icon: "no:icon" },
      state: "off",
    };

    const icon =
      this.config.icon !== undefined
        ? this.config.icon || "no:icon"
        : undefined;
    const image = this.config.image;
    const name =
      this.config.name !== undefined
        ? this.config.name
        : base?.attributes?.friendly_name || base?.entity_id;
    const secondary = this.config.secondary;
    const state =
      this.config.state !== undefined ? this.config.state : entity?.state;
    const active = this.config.active ?? false;
    if (active) {
      entity.attributes.brightness = 255;
      entity.state = "on";
    }

    const thisStyles = window.getComputedStyle(this);
    const color =
      this.config.color !== undefined || active
        ? this.config.color ??
          (active
            ? thisStyles.getPropertyValue("--state-active-color")
            : thisStyles.getPropertyValue("--paper-item-icon-color"))
        : undefined;

    const hidden =
      this.config.condition !== undefined &&
      String(this.config.condition).toLowerCase() !== "true";
    return html`
      <div id="wrapper" class="${hidden ? "hidden" : ""}">
        <state-badge
          .hass=${this.hass}
          .stateObj=${entity}
          @action=${this._actionHandler}
          style="${color
            ? `--paper-item-icon-color: ${color}; --state-active-color: ${color}; --state-light-active-color: ${color}`
            : ``}"
          .overrideIcon=${icon}
          .overrideImage=${image}
          class="pointer"
        ></state-badge>
        <div class="info pointer" @action="${this._actionHandler}">
          ${name}
          <div class="secondary">${secondary}</div>
        </div>
        <div class="state">
          ${this.config.toggle && base
            ? html`<ha-entity-toggle
                .hass=${this.hass}
                .stateObj=${entity}
              ></ha-entity-toggle>`
            : state}
        </div>
      </div>
      <div id="staging">
        <hui-generic-entity-row .hass=${this.hass} .config=${this.config}>
        </hui-generic-entity-row>
      </div>
    `;
  }

  static get styles() {
    return [
      (customElements.get("hui-generic-entity-row") as any)?.styles,
      css`
        :host {
          display: inline;
        }
        #wrapper {
          display: flex;
          align-items: center;
          flex-direction: row;
        }
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
      `,
    ];
  }
}

if (!customElements.get("template-entity-row")) {
  customElements.define("template-entity-row", TemplateEntityRow);
  console.info(
    `%cTEMPLATE-ENTITY-ROW ${pjson.version} IS INSTALLED`,
    "color: green; font-weight: bold",
    ""
  );
}
