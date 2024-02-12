# template-entity-row

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg)](https://github.com/hacs/integration)

Display whatever you want in an entities card row.

For installation instructions [see this guide](https://github.com/thomasloven/hass-config/wiki/Lovelace-Plugins).

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=thomasloven&repository=lovelace-template-entity-row)

Install `template-entity-row.js` as a `module`.

```yaml
resources:
  - url: /local/template-entity-row.js
    type: module
```

## Usage example

**Note:** This is _not_ a card. It's a row for an [entities](https://www.home-assistant.io/lovelace/entities/).

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

- `icon`, `name`, `state`, `secondary`, `image` selects what icon, name, state, secondary_info text and entity_picture to display respectively.
- `active` if this evaluates to "true" or "false", the icon gets will always look active or inactive respectively.
- `entity` if this evaluates to an entity id, `icon`, `name`, `state` and `image` will be taken from that entity unless manually overridden. Specifying an `entity` will also let you use [`action`](https://www.home-assistant.io/lovelace/entities/#options-for-entities).
- `condition` if this is set but does not evaluate to "true", the row is not displayed.
- `toggle` if this evaluates to "true" a toggle is shown instead of the state. The toggle is connected to the `entity`. This will only show a toggle, nothing else. No sliders, no dropdowns, no media controls. `toggle` means Toggle.
- `tap_action`, `hold_action`, `double_tap_action`: see below.
- `color` the CSS color of the icon.

All options accept [jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/).

Jinja templates have access to a few special variables. Those are:

- `config` - an object containing the card configuration
- `user` - the username of the currently logged in user
- `browser` - the deviceID of the current browser (see [browser_mod](https://github.com/thomasloven/hass-browser_mod)).
- `hash` - the hash part of the current URL.

In evaluated templates the function `_(<key>)` (underscore) will localize the `<key>` to the current language.
E.g. `_(state.binary_sensor.motion.off)` will be replaced with `Clear` if your language is set to English.

To find the available keys, open your browsers console, type in the following and press Enter:

```javascript
document.querySelector("home-assistant").hass.resources;
```

Context variables are supported as well, for instance: `_(ui.duration.second, count, 30)` (note there are no quotes around `count`).

### Actions

`tap_action`, `hold_action` and `double_tap_action` can be templated if the template evaluates to a valid [action configuration](https://www.home-assistant.io/lovelace/actions/) in python format. Standard YAML without templates works too.

Eg:

```yaml
type: custom:template-entity-row
entity: light.bed_light
# Standard yaml configuration - No templates allowed
hold_action:
  action: more-info
# JSON return format
tap_action: |
  {
    "action": "toggle",
    "confirmation": {
      "text": "Do you really want to turn {{ state_attr(config.entity, 'friendly_name') }} {% if is_state(config.entity, 'on') %}off{% else %}on{% endif %}?",
    },
  }
double_tap_action:
  action: toggle
```

# FAQ

### Why does this look weird?

Because you're not using it correctly. This is **not** a card. It's an entity row, and is meant to be used _inside_ the [entities card](https://www.home-assistant.io/lovelace/entities/)

### Why doesn't toggle: true make buttons appear to control my blinds?

Because "toggle" means a toggle. It's the simplest possible way to control an entity, and anything beyond that is not in the scope of this row and will not be added.

### Why is my log flooded with template errors?

This may happen if you use the GUI editor to edit a template based value. Since Home Assistant redraws the row every time you make any change to the configuration in the GUI editor, it will try to render the template every time you push a key.
Since the template will be invalid for most of the time while you're editing it, you will get a lot of errors. \
There's unfortunately nothing I can easily do about this behavior.

---

<a href="https://www.buymeacoffee.com/uqD6KHCdJ" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>
