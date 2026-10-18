type Pump = { model: string; family: string };

export function visiblePcpModels<T extends Pump>(
  models: T[], query: string, family: string, selected: string[], compare: boolean,
): T[] {
  if (compare) return models.filter(model => selected.includes(model.model));
  const search = query.trim().toLowerCase();
  return models.filter(model => (!family || model.family === family) && model.model.toLowerCase().includes(search));
}
