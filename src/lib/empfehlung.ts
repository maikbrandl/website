// Amazon Partner Tag an einer Stelle, fuer den empfehlung Baustein. Portiert aus legacy/plattform/js/content-blocks.js.
const AFFILIATE_TAG = 'hybridlog-21';

export function amazonLink(asin: string): string {
  return `https://www.amazon.de/dp/${encodeURIComponent(asin)}?tag=${AFFILIATE_TAG}`;
}
