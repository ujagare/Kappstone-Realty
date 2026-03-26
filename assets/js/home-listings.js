(function () {
  const listEl = document.getElementById('home-properties-list');
  if (!listEl) return;

  const renderCard = (item, delay) => {
    const image = item.images && item.images.length ? item.images[0] : 'assets/img/properties/listing-1.jpg';
    const price = item.price_display || 'On Request';
    const area = item.area_display || '';
    const type = item.type || 'Property';

    return `
      <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="properties-card compact">
          <div class="properties-card-media">
            <img loading="lazy" decoding="async" fetchpriority="low" src="${image}" alt="${item.name}" class="img-fluid">
          </div>
          <div class="properties-card-body">
            <span class="properties-price">${price}</span>
            <h3><a href="property-details.html?id=${item.id}">${item.name}</a></h3>
            <p class="properties-location"><i class="bi bi-geo-alt"></i> ${item.location}</p>
            <div class="properties-meta">
              <span><i class="bi bi-house-door"></i> ${type}</span>
              <span><i class="bi bi-aspect-ratio"></i> ${area}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  fetch('assets/data/properties.json')
    .then((res) => res.json())
    .then((data) => {
      if (!data || !Array.isArray(data.properties)) return;
      const items = data.properties.slice(0, 3);
      listEl.innerHTML = items.map((item, index) => renderCard(item, 50 + index * 50)).join('');
    })
    .catch(() => {
      listEl.innerHTML = '';
    });
})();
