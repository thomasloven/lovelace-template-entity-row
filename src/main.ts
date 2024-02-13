import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { bindActionHandler } from "./helpers/action";
import pjson from "../package.json";
import { bind_template, hasTemplate } from "./helpers/templates";
import { hass } from "./helpers/hass";

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

const translate = (hass, text: String) => {
  return text.replace(LOCALIZE_PATTERN, (key) => {
    const params = key
      .substring(2, key.length - 1)
      .split(new RegExp(/\s*,\s*/));
    return hass.localize.apply(null, params) || key;
  });
};

class TemplateEntityRow extends LitElement {
  @property() _config;
  @property() hass;
  @property() config; // Rendered configuration of the row to display
  @property() _action;

  setConfig(config) {
    this._config = { ...config };
    this.config = { ...this._config };

    this.bind_templates();
  }

  async bind_templates() {
    const hs = await hass();
    for (const k of OPTIONS) {
      if (!this._config[k]) continue;
      if (hasTemplate(this._config[k])) {
        bind_template(
          (res) => {
            const state = { ...this.config };
            if (typeof res === "string") res = translate(hs, res);
            state[k] = res;
            this.config = state;
          },
          this._config[k],
          { config: this._config }
        );
      } else if (typeof this._config[k] === "string") {
        this.config[k] = translate(hs, this._config[k]);
      }
    }
    this.requestUpdate();
  }

  async firstUpdated() {
    // Hijack the action handler from the hidden generic entity row in the #staging area
    // Much easier than trying to implement all of this ourselves
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
    if (
      this.config.entity ||
      this.config.tap_action ||
      this.config.hold_action ||
      this.config.double_tap_action
    ) {
      bindActionHandler(this.shadowRoot.querySelector("state-badge"), options);
      bindActionHandler(this.shadowRoot.querySelector(".info"), options);
    }
  }

  _actionHandler(ev) {
    return this._action?.(ev);
  }

  render() {
    const base = this.hass.states[this.config.entity];
    const entity = (base && JSON.parse(JSON.stringify(base))) || {
      entity_id: "binary_sensor.",
      attributes: { icon: "no:icon", friendly_name: "" },
      state: "off",
    };

    const icon =
      this.config.icon !== undefined
        ? this.config.icon || "no:icon"
        : undefined;
    const image = this.config.image;
    let color = this.config.color;

    const name =
      this.config.name ??
      entity?.attributes?.friendly_name ??
      entity?.entity_id;
    const secondary = this.config.secondary;
    const state = this.config.state ?? base?.state;
    let stateColor = true;

    const active = this.config.active ?? false;
    if (active) {
      entity.attributes.brightness = 255;
      entity.state = "on";
    }
    if (this.config.active === false) {
      entity.state = "off";
      stateColor = false;
    }

    const hidden =
      this.config.condition !== undefined &&
      String(this.config.condition).toLowerCase() !== "true";
    const show_toggle = this.config.toggle && this.config.entity;
    const has_action =
      this.config.entity ||
      this.config.tap_action ||
      this.config.hold_action ||
      this.config.double_tap_action;

    return html`
      <div id="wrapper" class="${hidden ? "hidden" : ""}">
        <state-badge
          .hass=${this.hass}
          .stateObj=${entity}
          @action=${this._actionHandler}
          .overrideIcon=${icon}
          .overrideImage=${image}
          .color=${color}
          class=${classMap({ pointer: has_action })}
          ?stateColor=${stateColor}
        ></state-badge>
        <div
          class=${classMap({ info: true, pointer: has_action })}
          @action="${this._actionHandler}"
        >
          ${name}
          <div class="secondary">${secondary}</div>
        </div>
        <div class="state">
          ${show_toggle
            ? html`<ha-entity-toggle .hass=${this.hass} .stateObj=${entity}>
              </ha-entity-toggle>`
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
        #wrapper .info.pointer .secondary {
          white-space: pre;
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
