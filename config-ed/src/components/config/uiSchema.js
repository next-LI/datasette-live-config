export const dbUiSchema = {
  "description": {
    "ui:widget": "textarea",
  },
};

export const metaUiSchema = {
  "description_html": {
    "ui:widget": "textarea",
  },
  "databases": {
    "items": dbUiSchema,
  },
};
