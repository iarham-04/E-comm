// Refresh the bundled snapshot; checkout never fetches this service at runtime.
import { readFile, writeFile } from 'node:fs/promises';
const source = 'https://chromium-i18n.appspot.com/ssl-address/data';
const read = async (code = '') => {
  const response = await fetch(`${source}${code ? `/${code}` : ''}`);
  if (!response.ok) throw new Error(`Address data ${code}: HTTP ${response.status}`);
  return response.json();
};
let data;
if (process.argv[2]) {
  data = JSON.parse(await readFile(process.argv[2], 'utf8'));
} else {
  const codes = (await read()).countries.split('~');
  data = {};
  // Bound concurrent requests when intentionally refreshing the snapshot.
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (codes.length) {
      const code = codes.pop();
      data[code] = await read(code);
    }
  }));
}
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = Object.keys(data).sort().map((code) => {
  const entry = data[code];
  return {
    code,
    name: names.of(code),
    sourceName: entry.name || names.of(code),
    format: entry.fmt || '%N%n%O%n%A%n%C',
    required: entry.require ?? 'AC',
    regionType: entry.state_name_type || 'province',
    cityType: entry.locality_name_type || 'city',
    postalType: entry.zip_name_type || 'postal',
    postalPattern: entry.zip || '',
    postalExample: (entry.zipex || '').split(',')[0],
  };
});
await writeFile(new URL('./countries.json', import.meta.url), `${JSON.stringify(countries, null, 2)}\n`);
console.log(`Saved address rules for ${countries.length} countries and territories.`);
