import {LitElement, html, css } from "card-tools/src/lit-element";
import {subscribeRenderTemplate} from "card-tools/src/templates";

class TemplateEntityRow extends LitElement {

  static get properties() {
    return {
      hass: {},
      state: {},
    };
  }

  setConfig(config) {
    this._config = config;
    this.state = config;

    for(const k of ["icon", "active", "name", "secondary", "state", "condition", "image", "entity"]) {
      if(config[k]
        && (String(config[k]).includes("{%") || String(config[k]).includes("{{"))
        ) {
        subscribeRenderTemplate(null, (res) => {
          this.state[k] = res;
          this.requestUpdate();
        }, {
          template: config[k],
          variables: {config},
          entity_ids: config.entity_ids,
        });
      }
    }
  }

  render() {
    if (this.state.condition && String(this.state.condition).toLowerCase() !== "true")
      return html``;

    const entity = this.hass.states[this.state.entity];
    const icon = this.state.icon !== undefined
      ? this.state.icon || "no:icon"
      : entity ? entity.attributes.icon : ""
    ;
    const entity_picture = this.state.image !== undefined
      ? this.state.image
      : entity ? entity.attributes.state_picture : ""
    ;
    const name = this.state.name !== undefined
      ? this.state.name
      : entity ? entity.attributes.friendly_name || entity.entity_id : ""
    ;
    const secondary = this.state.secondary;
    const state = this.state.state !== undefined
      ? this.state.state
      : entity ? entity.state : ""
    ;
    const active = String(this.state.active).toLowerCase() === "true";

    return html`
      <div id="wrapper">
        <state-badge
          .hass=${this.hass}
          .stateObj=${
            {
              entity_id: entity ? entity.entity_id : "light.",
              state: this.state.active !== undefined
                ? active ? "on" : "off"
                : entity ? entity.state : "off"
              ,
              attributes: {
                icon,
                entity_picture
              }
            }
          }
        ></state-badge>
        <div class="flex">
          <div
            class="info"
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
      </div>
    `;
  }

  static get styles() {
    const HuiGenericEntityRow = customElements.get('hui-generic-entity-row');
    let style = HuiGenericEntityRow.styles;
    style.cssText = style.cssText
      .replace(":host", "#wrapper")
      .replace("state-badge", "ha-icon")
      + `
      .state {
        text-align: right;
      }
      #wrapper {
        min-height: 40px;
      }
      `;
    return style;
  }
}

customElements.define("template-entity-row", TemplateEntityRow);
