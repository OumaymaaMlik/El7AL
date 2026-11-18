/** Body of POST /request: where, what and how far to look. */
export const REQUEST_BODY = {
  type: 'object',
  required: ['categoryId', 'pickupLat', 'pickupLng', 'addressText'],
  properties: {
    categoryId: { type: 'string', examples: ['cat-id-plumbing'] },
    pickupLat: { type: 'number', minimum: -90, maximum: 90, examples: [36.8065] },
    pickupLng: { type: 'number', minimum: -180, maximum: 180, examples: [10.1815] },
    addressText: { type: 'string', minLength: 2, maxLength: 300, examples: ['Tunis, Avenue Habib Bourguiba'] },
    description: { type: 'string', maxLength: 1000, examples: ["Fuite d'eau sous l'évier de la cuisine"] },
    radiusKm: { type: 'number', minimum: 1, maximum: 100, examples: [15] },
    selectedProviderIds: { type: 'array', items: { type: 'string' }, maxItems: 20 },
  },
} as const;
