export function countBy(items, field, color = '#1677FF') {
  const counts = items.reduce((result, item) => ({ ...result, [item[field]]: (result[item[field]] || 0) + 1 }), {});
  return Object.entries(counts).map(([label, value]) => ({ label, value, color }));
}
