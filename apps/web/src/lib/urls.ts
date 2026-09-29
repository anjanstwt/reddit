const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(:\d+)?(\/\S*)?$/i;

export function isUrl(value: string) {
  return urlPattern.test(value.trim());
}

export function withProtocol(url: string) {
  const trimmed = url.trim();
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
