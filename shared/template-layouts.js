export const ORIGINAL_TEMPLATE_LAYOUTS = {
  evans: { assetDirectory: 'evans' },
  mark: { assetDirectory: 'mark' },
  patrix: { assetDirectory: 'patrix' },
  iportfolio: { assetDirectory: 'iportfolio' },
  folio: { assetDirectory: 'folio' }
};

export function getOriginalTemplateLayout(layoutId) {
  return ORIGINAL_TEMPLATE_LAYOUTS[layoutId] || null;
}

export function isOriginalTemplateLayout(layoutId) {
  return Boolean(getOriginalTemplateLayout(layoutId));
}
