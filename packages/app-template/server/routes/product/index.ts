import { factory } from '#server/factory.ts';
import { route as getProductsRoute } from './get-products.ts';

export const route = factory.createApp().route('/', getProductsRoute);
