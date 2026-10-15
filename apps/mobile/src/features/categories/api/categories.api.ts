import { api } from '../../../services/http/client';
import { categoriesResponseSchema } from '../schemas/category.schema';

export async function fetchCategories() {
  const res = await api.get('/categories');
  const parsed = categoriesResponseSchema.parse(res.data);
  return parsed.success ? parsed.data : [];
}
