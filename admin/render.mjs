
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[character]);

function mediaPath(value, extension) {
  if (typeof value !== 'string') return '';
  const path = value.replace(/^\//, '');
  const parts = path.split('/');
  if (parts[0] !== 'imagens' || parts.length < 2 ||
      parts.some(part => !part || part === '.' || part === '..' || /[\\:%?#\u0000-\u001f]/.test(part)) ||
      !extension.test(path)) return '';
  return '/' + parts.map(encodeURIComponent).join('/');
}

const dateOrder = (a, b) => String(b.data).localeCompare(String(a.data));
const imageTypes = /\.(jpe?g|png|webp)$/i;

export function renderPage(template, data, {asset = path => path, preview = false, origin = ''} = {}) {
  const image = value => {
    const path = mediaPath(value, imageTypes);
    return path && escapeHtml(asset(value, path));
  };
  return template.replace(/<!--cms:([\w]+)-->([\s\S]*?)<!--\/cms-->/g, (_, key, original) => {
    if (key === 'base') return preview ? '<base href="' + escapeHtml(origin) + '/">' : '';
    const value = data[key];
    if (key === 'galeria') {
      const photos = (value ?? []).filter(item => image(item.foto));
      return photos.length ? photos.map(item =>
        '<img src="' + image(item.foto) + '" alt="' + escapeHtml(item.descricao) + '" loading="lazy">').join('\n') : original;
    }
    if (key === 'newsletters') {
      const items = (value ?? []).filter(item => mediaPath(item.pdf, /\.pdf$/i)).sort(dateOrder);
      if (!items.length) return original;
      const links = items.map((item, index) => {
        const pdf = mediaPath(item.pdf, /\.pdf$/i);
        const cover = image(item.capa);
        const href = preview ? '#' : escapeHtml(asset(item.pdf, pdf));
        return (index === 0 && cover ? '<p><img src="' + cover + '" alt="" width="160" loading="lazy"></p>' : '') +
          '<a class="btn" href="' + href + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(item.titulo) + '</a>';
      });
      return links[0] + '<details><summary>Edições anteriores</summary>' +
        links.slice(1).map(link => '<p>' + link + '</p>').join('') + '<p>' + original + '</p></details>';
    }
    if (key === 'momentos') {
      const items = (value ?? []).filter(item => image(item.foto)).sort(dateOrder);
      const slides = items.map(item => ({
        foto1: mediaPath(item.foto, imageTypes),
        titulo: String(item.titulo ?? ''),
        descricao: String(item.descricao ?? ''),
        link: /^https:\/\/[^\s]+$/i.test(item.link ?? '') ? item.link : ''
      }));
      if (!slides.length) return original;
      if (!preview) return '<script type="application/json" id="cms-momentos">' +
        JSON.stringify(slides).replace(/</g, '\\u003c') + '</script>';
      return items.map(item => '<article class="slide-link"><img class="slide-img" src="' +
        image(item.foto) + '" alt=""><div class="slide-info"><h3>' + escapeHtml(item.titulo) +
        '</h3><p>' + escapeHtml(item.descricao) + '</p></div></article>').join('') +
        '<style>.momentos-slider{display:none!important}</style>';
    }
    return typeof value === 'string' ? escapeHtml(value).replace(/\r?\n/g, '<br>') : original;
  });
}
