const ALLOWED_FIELDS = {
  marketSize: "string",
  marketChange: "number",
  marketSub: "string",
  asp: "string",
  aspChange: "number",
  aspSub: "string",
  concentration: "string"
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateHomePatch(payload) {
  if (!isPlainObject(payload)) {
    return {
      valid: false,
      details: "Request body must be a JSON object"
    };
  }

  const keys = Object.keys(payload);
  if (keys.length === 0) {
    return {
      valid: false,
      details: "Request body cannot be empty"
    };
  }

  const invalidField = keys.find(key => !Object.prototype.hasOwnProperty.call(ALLOWED_FIELDS, key));
  if (invalidField) {
    return {
      valid: false,
      details: `Unsupported field: ${invalidField}`
    };
  }

  const invalidTypeField = keys.find(key => typeof payload[key] !== ALLOWED_FIELDS[key]);
  if (invalidTypeField) {
    return {
      valid: false,
      details: `Invalid type for ${invalidTypeField}, expected ${ALLOWED_FIELDS[invalidTypeField]}`
    };
  }

  return {
    valid: true,
    details: null
  };
}

module.exports = {
  validateHomePatch
};
