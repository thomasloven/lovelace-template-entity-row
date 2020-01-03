# template-entity-row

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/custom-components/hacs)

Display whatever you want in an entities card row.

For installation instructions [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

Install `template-entity-row.js` as a `module`.

```yaml
resources:
  - url: /local/template-entity-row.js
    type: module
```

## Usage example
![Skärminspelning 2020-01-03 kl  23 03 16 mov](https://user-images.githubusercontent.com/1299821/71752529-b627b000-2e7f-11ea-87ad-3b8f2d2cfe99.gif)
```yaml
type: entities
title: Default
entities:
  - light.bed_light
  - entity: input_boolean.car_home
  - type: custom:template-entity-row
    icon: mdi:lamp
    name: "The light is {{states('light.bed_light')}} but nobody's"
    state: "{% if is_state('input_boolean.car_home', 'on')%} home {% else %} away {% endif %}"
    secondary: "It's {{states('sensor.time')}}"
    active: "{{ is_state('light.bed_light', 'off') }}"
  - type: custom:template-entity-row
    icon: mdi:car
    name: Hi there
    condition: "{{is_state('input_boolean.car_home', 'on')}}"
```

## Options
- `icon`, `name`, `state`, `secondary` selects what icon, name, state and secondary_info text to display respectively
- `active` if this evaluates to "true", the icon gets the color `--paper-item-icon-active-color`. Otherwise `--paper-item-icon-color`
- `condition` if this is set but does not evaluate to "true", the row is not displayed.

All options accept [jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/).

Jinja templates have access to a few special variables. Those are:

- `config` - an object containing the card, entity row or glance button configuration
- `user` - the username of the currently logged in user
- `browser` - the deviceID of the current browser (see [browser_mod](https://github.com/thomasloven/hass-browser_mod)).
- `hash` - the hash part of the current URL.

# FAQ

### Why does this look weird?
Because you're not using it correctly. This is **not** a card. It's an entity row, and is meant to be used *inside* the [entities card](https://www.home-assistant.io/lovelace/entities/)

---
<a href="https://www.buymeacoffee.com/uqD6KHCdJ" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
