export function getAssetUrl(assentUrl: string): string {
  const baseUrl = window.__BASE_URL__;
  const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(assentUrl);
  if (isAbsolute) {
    return assentUrl;
  }
  if (!window.__POWERED_BY_QIANKUN__) {
    return assentUrl;
  }
  return `${baseUrl}${assentUrl}`;
}

export function getApiUrl(url: string): string {
  const baseUrl = window.__BASE_URL__;
  const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(url);
  if (isAbsolute) {
    return url;
  }
  if (!window.__POWERED_BY_QIANKUN__) {
    return url;
  }

  return `${baseUrl}${url}`;
}
