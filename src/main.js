import {LitElement, html, css } from "card-tools/src/lit-element";
import {subscribeRenderTemplate} from "card-tools/src/templates";

class TemplateEntityRow extends LitElement {

  static get properties() {
    return {
      hass: {},
      _config: {},
      state: {},
    };
  }

  setConfig(config) {
    this._config = config;
    this.state = {
      icon: "",
      active: "",
      name: "",
      secondary: "",
      state: "",
      ...config,
    };

    for(const k of ["icon", "active", "name", "secondary", "state", "condition"]) {
      if(config[k]
        && (String(config[k]).includes("{%") || String(config[k]).includes("{{"))
        ) {
        subscribeRenderTemplate(null, (res) => {
          this.state[k] = res;
          this.requestUpdate();
        }, {
          template: config[k],
          entity_ids: config.entity_ids,
        });
      }
    }
  }

  render() {
    if (this._config.condition && String(this.state.condition).toLowerCase() !== "true")
      return html``;
    const active = String(this.state.active).toLowerCase();
    return html`
      <div id="wrapper">
        <ha-icon
          .icon=${this.state.icon}
          style="
            color: ${active === "true"
              ? "var(--paper-item-icon-active-color)"
              : "var(--paper-item-icon-color)"
              };
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
          <div class="state">
          ${this.state.state}
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
