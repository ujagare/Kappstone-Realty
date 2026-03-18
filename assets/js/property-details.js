(function () {
  const titleEl = document.getElementById('property-title');
  const taglineEl = document.getElementById('property-tagline');
  const sectionsEl = document.getElementById('property-sections');
  const noteEl = document.getElementById('property-note');
  const summaryEl = document.getElementById('property-summary');
  const slidesEl = document.getElementById('property-slides');
  const mapEl = document.getElementById('property-map');

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id');

  const setEmptyState = () => {
    if (titleEl) titleEl.textContent = 'Property Details';
    if (taglineEl) taglineEl.textContent = 'Please select a property from the listings page.';
    if (noteEl) noteEl.textContent = '';
  };

  if (!propertyId) {
    setEmptyState();
    return;
  }

  const mapEmbedUrl = (item) => {
    if (item.map && item.map.includes('output=embed')) return item.map;
    if (item.map && item.map.includes('google.com/maps?q=')) {
      return item.map + '&output=embed';
    }
    if (item.map && item.map.includes('maps.app.goo.gl')) {
      return `https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`;
  };

  fetch('assets/data/properties.json')
    .then((res) => res.json())
    .then((data) => {
      if (!data || !Array.isArray(data.properties)) {
        setEmptyState();
        return;
      }

      const item = data.properties.find((p) => p.id === propertyId);
      if (!item) {
        setEmptyState();
        return;
      }

      document.title = `${item.name} - Kappstone Realty`;

      if (titleEl) titleEl.textContent = `${item.name} - ${item.location}`;
      if (taglineEl) taglineEl.textContent = item.tagline || '';

      if (sectionsEl) {
        sectionsEl.innerHTML = (item.sections || [])
          .map(
            (section) => `
              <div class="property-detail-block">
                <h3>${section.title}</h3>
                <ul class="property-detail-list">
                  ${section.items.map((i) => `<li>${i}</li>`).join('')}
                </ul>
              </div>
            `
          )
          .join('');
      }

      if (noteEl) {
        noteEl.textContent = `For more details & site visit please call. ${item.price_display ? 'Pricing: ' + item.price_display + '.' : ''}`;
      }

      if (summaryEl) {
        const summaryItems = [
          ['Project', item.name],
          ['Location', item.location],
          ['Property Type', item.type],
          ['Status', item.status],
          ['Area', item.area_display],
          ['Price', item.price_display],
          ['Possession', item.possession]
        ].filter(([, value]) => value);

        summaryEl.innerHTML = summaryItems
          .map(([label, value]) => `<li><strong>${label}:</strong> ${value}</li>`)
          .join('');
      }

      if (slidesEl) {
        const imgs = item.images && item.images.length ? item.images : ['assets/img/property-slide/property-slide-1.jpg'];
        slidesEl.innerHTML = imgs
          .map((img, index) => `<div class="swiper-slide"><img src="${img}" alt="${item.name} image ${index + 1}"></div>`)
          .join('');
      }

      if (mapEl) {
        mapEl.src = mapEmbedUrl(item);
      }

      const swiperEl = document.getElementById('property-slider');
      if (swiperEl && swiperEl.querySelector('.swiper-config') && window.Swiper) {
        const config = JSON.parse(swiperEl.querySelector('.swiper-config').innerHTML.trim());
        if (swiperEl.swiper) {
          swiperEl.swiper.destroy(true, true);
        }
        new Swiper(swiperEl, config);
      }
    })
    .catch(() => {
      setEmptyState();
    });
})();
