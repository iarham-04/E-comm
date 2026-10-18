# Shared checkout data

Country names, address field rules, postal formats, and phone normalization used by both the storefront and API. The country selected for delivery is independent of the two phone-number countries.

`countries.json` is a checked-in English snapshot of Google's libaddressinput country-level address metadata, retrieved on 2026-10-18 from https://chromium-i18n.appspot.com/ssl-address/data. Field names follow https://github.com/google/libaddressinput/wiki/AddressValidationMetadata. Only country-level field rules are included; subdivision/delivery-service availability is not inferred. Upstream license: `LICENSE.address-data` (Apache-2.0). Country display names come from Node's English `Intl.DisplayNames`.

Refresh intentionally with `node packages/checkout-data/update-address-data.mjs`. There are no runtime requests to an external country service. Phone metadata/validation comes from the MIT-licensed `libphonenumber-js` dependency.

This package does not define shipping prices, customs charges, destination availability, or payment settlement currencies. Those remain store/gateway policies.
