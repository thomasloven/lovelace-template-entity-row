import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
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

const translate = (hass, text: String) => {
  return text.replace(
    LOCALIZE_PATTERN,
    (key) => {
        const params = key.substring(2, key.length - 1).split(new RegExp(/\s*,\s*/));
        return hass.localize.apply(null, params) || key;
    }
  );
};

class TemplateEntityRow extends LitElement {
  @property() _config;
  @property() hass;
  @property() config; // Rendered configuration of the row to display
  @property() _action;

  setConfig(config) {
    this._config = { ...config };
    this.config = { ...this._config };

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
      entity_id: "light.",
      attributes: { icon: "no:icon", friendly_name: "" },
      state: "off",
    };

    const domain =
      entity?.entity_id !== undefined && entity?.entity_id
        ? entity?.entity_id.split(".")[0]
        : 'light';

    const domain_device_class =
      entity?.attributes?.device_class !== undefined && entity?.attributes?.device_class
        ? `${domain}-${entity.attributes.device_class}`
        : domain;

    const state_identifier =
      domain != "sensor"
        ? `${domain_device_class}-`
        : '';

    const icon =
      this.config.icon !== undefined
        ? this.config.icon || "no:icon"
        : undefined;
    const image = this.config.image;
    const name =
      this.config.name ??
      entity?.attributes?.friendly_name ??
      entity?.entity_id;
    const secondary = this.config.secondary;
    const state = this.config.state ?? entity?.state;

    const css_state =
      entity?.state !== undefined ? entity?.state : state;

    const css_active_state =
      (css_state == true || String(css_state).toLowerCase() == 'on')
        ? 'on'
        : 'active';

    const active = this.config.active ?? false;
    if (active) {
      entity.attributes.brightness = 255;
      entity.state = "on";
    }
    if (this.config.active === false) {
      entity.state = "off";
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

    const thisStyles = window.getComputedStyle(this);
    const priorityActiveRule = `--state-${state_identifier}${css_active_state}-color`;
    const secondaryActiveRule = '--state-active-color';
    const priorityActiveColor = thisStyles.getPropertyValue(priorityActiveRule);
    const color =
      this.config.color !== undefined || active !== undefined
        ? this.config.color ??
          (active !== undefined && active
            ? (priorityActiveColor !== undefined
              ? priorityActiveColor
              : thisStyles.getPropertyValue(secondaryActiveRule))
            : (base !== undefined
              ? undefined
              : thisStyles.getPropertyValue("--state-icon-color")))
        : undefined;
    const styleColorString =
      priorityActiveColor !== undefined && priorityActiveRule != secondaryActiveRule
        ? `${priorityActiveRule}: ${color}; ${secondaryActiveRule}: ${color};`
        : `${secondaryActiveRule}: ${color};`;
    return html`
      <div id="wrapper" class="${hidden ? "hidden" : ""}">
        <state-badge
          .hass=${this.hass}
          .stateObj=${entity}
          @action=${this._actionHandler}
          style="${color
            ? `--paper-item-icon-color: ${color}; --state-icon-color: ${color}; ${styleColorString}`
            : ``}"
          .stateColor=${color ? false : true}
          .overrideIcon=${icon}
          .overrideImage=${image}
          class=${classMap({ pointer: has_action })}
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
