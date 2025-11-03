/**
 * Convierte un objeto de filtros a URLSearchParams
 */
export function filtersToQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Convierte URLSearchParams a un objeto de filtros
 */
export function queryStringToFilters<T extends Record<string, any>>(
  searchParams: URLSearchParams,
  defaults: T
): T {
  const filters = { ...defaults } as any;

  Object.keys(defaults).forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null) {
      if (typeof defaults[key] === 'number') {
        filters[key] = parseInt(value, 10) || defaults[key];
      } else {
        filters[key] = value;
      }
    }
  });

  return filters as T;
}

/**
 * Actualiza la URL con nuevos filtros sin recargar la página
 */
export function updateQueryString(
  router: any,
  filters: Record<string, any>,
  options?: { scroll?: boolean }
) {
  const queryString = filtersToQueryString(filters);
  const url = queryString ? `?${queryString}` : window.location.pathname;
  
  router.push(url, { scroll: options?.scroll ?? false });
}

/**
 * Obtiene un parámetro específico de la URL
 */
export function getQueryParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: string = ''
): string {
  return searchParams.get(key) || defaultValue;
}

/**
 * Obtiene un parámetro numérico de la URL
 */
export function getQueryParamAsNumber(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: number = 0
): number {
  const value = searchParams.get(key);
  return value ? parseInt(value, 10) : defaultValue;
}

/**
 * Construye query string para paginación
 */
export function buildPaginationQuery(
  page: number,
  limit: number,
  additionalParams?: Record<string, any>
): string {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
  }

  return params.toString();
}
