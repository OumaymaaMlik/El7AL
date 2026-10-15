import { db } from '../../config/db.js';

/** The trades an artisan can pick and a client can request, with how many artisans and missions use each. */
export async function getCategories() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { providers: true, missions: true } } },
  });
  return categories.map((c) => ({ ...c, providerCount: c._count.providers, missionCount: c._count.missions }));
}

export async function createCategory(data: { name: string; icon?: string; description?: string }) {
  return db.category.create({
    data: { name: data.name, icon: data.icon || 'Wrench', description: data.description || null, isActive: true },
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; icon?: string; description?: string; isActive?: boolean },
) {
  return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return db.category.delete({ where: { id } });
}
