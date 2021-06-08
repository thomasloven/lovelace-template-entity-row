import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";
import { hasTemplate } from "card-tools/src/templates";
import { bindActionHandler } from "card-tools/src/action";
import pjson from "../package.json";
import { bind_template } from "./templates";

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
];

const LOCALIZE_PATTERN = /_\([^)]*\)/g;

class TemplateEntityRow extends LitElement {
  @property() config;
  @property() hass;
  @property() state;
  @property() _action;

  setConfig(config) {
    this.config = { ...config };
    this.state = { ...this.config };

    let entity_ids = this.config.entity_ids;
    if (!entity_ids && this.config.entity && !hasTemplate(this.config.entity))
      entity_ids = [this.config.entity];
    for (const k of OPTIONS) {
      if (this.config[k] && hasTemplate(this.config[k])) {
        bind_template(
          (res) => {
            const state = { ...this.state };
            if (typeof res === "string")
              res = res.replace(
                LOCALIZE_PATTERN,
                (key) =>
                  this.hass.localize(key.substring(2, key.length - 1)) || key
              );
            state[k] = res;
            this.state = state;
          },
          this.config[k],
          { config }
        );
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
      hasHold: this.config.hold_action?.action !== undefined,
      hasDoubleClick: this.config.hold_action?.action !== undefined,
    };
    bindActionHandler(this.shadowRoot.querySelector("state-badge"), options);
    bindActionHandler(this.shadowRoot.querySelector(".info"), options);
  }

  _actionHandler(ev) {
    if (this._action) return this._action(ev);
  }

  render() {
    const base = this.hass.states[this.state.entity];
    const entity = (base && JSON.parse(JSON.stringify(base))) || {
      entity_id: "light.",
      attributes: { icon: "no:icon" },
    };

    const icon =
      this.state.icon !== undefined ? this.state.icon || "no:icon" : undefined;
    const image = this.state.image;
    const name =
      this.state.name !== undefined
        ? this.state.name
        : base?.attributes?.friendly_name || base?.entity_id;
    const secondary = this.state.secondary;
    const state =
      this.state.state !== undefined ? this.state.state : entity?.state;
    const active = this.state.active;
    if (active !== undefined) {
      entity.attributes.brightness = 255;
    }

    const thisStyles = window.getComputedStyle(this);
    const color =
      this.state.color !== undefined || active !== undefined
        ? this.state.color ??
          (active !== undefined && active
            ? thisStyles.getPropertyValue("--paper-item-icon-active-color")
            : thisStyles.getPropertyValue("--paper-item-icon-color"))
        : undefined;
    return html`
      <div
        id="wrapper"
        class="${this.state.condition !== undefined &&
        String(this.state.condition).toLowerCase() !== "true"
          ? "hidden"
          : ""}"
      >
        <state-badge
          .hass=${this.hass}
          .stateObj=${entity}
          @action=${this._actionHandler}
          style="${color
            ? `--paper-item-icon-color: ${color}; --paper-item-icon-active-color: ${color};`
            : ``}"
          .overrideIcon=${icon}
          .overrideImage=${image}
          class="pointer"
        ></state-badge>
        <div class="info pointer" @action="${this._actionHandler}">
          ${name}
          <div class="secondary">${secondary}</div>
        </div>
        <div class="state">${state}</div>
      </div>
      <div id="staging">
        <hui-generic-entity-row .hass=${this.hass} .config=${this.config}>
        </hui-generic-entity-row>
      </div>
    `;
  }

  static get styles() {
    return [
      customElements.get("hui-generic-entity-row").styles,
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
