(function () {
  const listEl = document.getElementById("properties-list");
  if (!listEl) return;

  let allProperties = [];

  const renderCard = (item, delay) => {
    const image =
      item.images && item.images.length
        ? item.images[0]
        : "assets/img/properties/featured-1.jpg";
    const price = item.price_display || "On Request";
    const area = item.area_display || "On Request";
    const type = item.type || "Property";
    const badge = (item.name || "P").substring(0, 2).toUpperCase();

    return `
      <div class="col-xl-4 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
        <article class="featured-card">
          <div class="featured-media">
            <img loading="lazy" src="${image}" alt="${item.name}" class="img-fluid">
            <div class="featured-overlay">
              <div class="featured-brand">
                <div class="featured-logo">${badge}</div>
                <div>
                  <h3><a href="property-details.html?id=${item.id}">${item.name}</a></h3>
                  <p><i class="bi bi-geo-alt"></i> ${item.location}</p>
                </div>
                <span class="featured-verified"><i class="bi bi-patch-check-fill"></i></span>
              </div>
              <div class="featured-meta">
                <div>
                  <span>Type</span>
                  <strong>${type}</strong>
                </div>
                <div>
                  <span>Area</span>
                  <strong>${area}</strong>
                </div>
                <div>
                  <span>Price</span>
                  <strong>${price}</strong>
                </div>
              </div>
            </div>
          </div>
          <div class="featured-tabs">
            <button class="active" type="button">All</button>
            <button type="button">${type}</button>
            <button type="button">${area}</button>
          </div>
          <div class="featured-price-row">
            <div>${type}</div>
            <div>${area}</div>
            <div>${item.status || "Available"}</div>
            <div class="featured-price">${price}</div>
          </div>
          <div class="featured-actions">
            <a href="property-details.html?id=${item.id}"><i class="bi bi-arrow-right"></i> Know More</a>
            <a href="contact.html"><i class="bi bi-telephone"></i> Enquire Now</a>
          </div>
        </article>
      </div>
    `;
  };

  const getPriceValue = (priceStr) => {
    if (!priceStr || priceStr === "On Request") return Infinity;
    const match = priceStr.match(/[\d.]+/);
    if (!match) return Infinity;
    const value = parseFloat(match[0]);
    if (priceStr.includes("Cr")) return value * 10000000;
    if (priceStr.includes("L")) return value * 100000;
    return value;
  };

  const matchesPriceRange = (price, range) => {
    if (range === "Price Range") return true;
    const priceValue = getPriceValue(price);
    if (range === "?10L - ?50L")
      return priceValue >= 1000000 && priceValue <= 5000000;
    if (range === "?50L - ?1Cr")
      return priceValue >= 5000000 && priceValue <= 10000000;
    if (range === "?1Cr - ?3Cr")
      return priceValue >= 10000000 && priceValue <= 30000000;
    if (range === "?3Cr+") return priceValue >= 30000000;
    return true;
  };

  const filterProperties = () => {
    const searchTerm =
      document.getElementById("propertySearch")?.value.toLowerCase() || "";
    const location =
      document.getElementById("propertyLocation")?.value || "All Locations";
    const type =
      document.getElementById("propertyType")?.value || "Property Type";
    const priceRange =
      document.getElementById("propertyBudget")?.value || "Price Range";

    const filtered = allProperties.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm);
      const matchesLocation =
        location === "All Locations" ||
        item.location.toLowerCase().includes(location.toLowerCase());
      const matchesType = type === "Property Type" || item.type === type;
      const matchesPrice = matchesPriceRange(item.price_display, priceRange);
      return matchesSearch && matchesLocation && matchesType && matchesPrice;
    });

    listEl.innerHTML = filtered.length
      ? filtered
          .map((item, index) => renderCard(item, 50 + index * 50))
          .join("")
      : '<p class="col-12 text-center">No properties found matching your criteria.</p>';
  };

  fetch("assets/data/properties.json")
    .then((res) => res.json())
    .then((data) => {
      if (!data || !Array.isArray(data.properties)) return;
      allProperties = data.properties;
      filterProperties();

      document
        .getElementById("propertySearch")
        ?.addEventListener("input", filterProperties);
      document
        .getElementById("propertyLocation")
        ?.addEventListener("change", filterProperties);
      document
        .getElementById("propertyType")
        ?.addEventListener("change", filterProperties);
      document
        .getElementById("propertyBudget")
        ?.addEventListener("change", filterProperties);
    })
    .catch(() => {
      listEl.innerHTML = "";
    });
})();
