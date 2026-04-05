(function () {
  const listEl = document.getElementById("properties-list");
  if (!listEl) return;
  const locationSelect = document.getElementById("propertyLocation");
  const typeSelect = document.getElementById("propertyType");
  const budgetSelect = document.getElementById("propertyBudget");

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
            <img loading="lazy" decoding="async" fetchpriority="low" src="${image}" alt="${item.name}" class="img-fluid">
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
    if (range === "all") return true;
    const priceValue = getPriceValue(price);
    if (range === "10l-50l")
      return priceValue >= 1000000 && priceValue <= 5000000;
    if (range === "50l-1cr")
      return priceValue >= 5000000 && priceValue <= 10000000;
    if (range === "1cr-3cr")
      return priceValue >= 10000000 && priceValue <= 30000000;
    if (range === "3cr-plus") return priceValue >= 30000000;
    return true;
  };

  const normalizeSelects = () => {
    if (locationSelect) {
      [...locationSelect.options].forEach((option, index) => {
        if (!option.value) {
          option.value = index === 0 ? "all" : option.textContent.trim();
        }
      });
    }

    if (typeSelect) {
      [...typeSelect.options].forEach((option, index) => {
        if (!option.value) {
          option.value = index === 0 ? "all" : option.textContent.trim();
        }
      });
    }

    if (budgetSelect) {
      const budgetOptions = [
        ["all", "Price Range"],
        ["10l-50l", "Rs.10L - Rs.50L"],
        ["50l-1cr", "Rs.50L - Rs.1Cr"],
        ["1cr-3cr", "Rs.1Cr - Rs.3Cr"],
        ["3cr-plus", "Rs.3Cr+"],
      ];

      [...budgetSelect.options].forEach((option, index) => {
        const config = budgetOptions[index];
        if (!config) return;
        option.value = config[0];
        option.textContent = config[1];
      });
    }
  };

  const syncSelectState = (selectEl) => {
    if (!selectEl) return;
    const isActive = selectEl.value && selectEl.value !== "all";
    selectEl.classList.toggle("has-selection", isActive);
    selectEl.title = selectEl.options[selectEl.selectedIndex]?.textContent || "";
  };

  const syncAllSelectStates = () => {
    syncSelectState(locationSelect);
    syncSelectState(typeSelect);
    syncSelectState(budgetSelect);
  };

  const filterProperties = () => {
    syncAllSelectStates();

    const location = locationSelect?.value || "all";
    const type = typeSelect?.value || "all";
    const priceRange = budgetSelect?.value || "all";

    const filtered = allProperties.filter((item) => {
      const matchesLocation =
        location === "all" ||
        item.location.toLowerCase().includes(location.toLowerCase());
      const matchesType = type === "all" || item.type === type;
      const matchesPrice = matchesPriceRange(item.price_display, priceRange);
      return matchesLocation && matchesType && matchesPrice;
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
      normalizeSelects();
      filterProperties();

      locationSelect?.addEventListener("change", filterProperties);
      typeSelect?.addEventListener("change", filterProperties);
      budgetSelect?.addEventListener("change", filterProperties);
    })
    .catch(() => {
      listEl.innerHTML = "";
    });
})();
