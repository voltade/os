import { factory } from '#server/factory.ts';
import { route as getProductTemplatesRoute } from './get-product-templates.ts';

export const route = factory.createApp().route('/', getProductTemplatesRoute);
