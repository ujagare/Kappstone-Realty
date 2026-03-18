(function () {
  const titleEl = document.getElementById("property-title");
  const taglineEl = document.getElementById("property-tagline");
  const sectionsEl = document.getElementById("property-sections");
  const summaryEl = document.getElementById("property-summary");
  const slidesEl = document.getElementById("property-slides");
  const mapEl = document.getElementById("property-map");
  const statusEl = document.getElementById("property-status");
  const typeEl = document.getElementById("property-type");
  const amenitiesEl = document.getElementById("amenities-list");
  const specsEl = document.getElementById("specs-list");

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get("id");

  const setEmptyState = () => {
    if (titleEl) titleEl.textContent = "Property Details";
    if (taglineEl)
      taglineEl.textContent =
        "Please select a property from the listings page.";
  };

  if (!propertyId) {
    setEmptyState();
    return;
  }

  const mapEmbedUrl = (item) => {
    if (item.map && item.map.includes("output=embed")) return item.map;
    if (item.map && item.map.includes("google.com/maps?q=")) {
      return item.map + "&output=embed";
    }
    if (item.map && item.map.includes("maps.app.goo.gl")) {
      return `https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`;
    }
    return `https://www.google.com/maps?q=${encodeURIComponent(item.location)}&output=embed`;
  };

  fetch("assets/data/properties.json")
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

      if (titleEl) titleEl.textContent = item.name;
      if (taglineEl) taglineEl.textContent = item.tagline || "";
      if (statusEl) statusEl.textContent = item.status || "Available";
      if (typeEl) typeEl.textContent = item.type || "Property";

      // Render sections in Overview tab
      if (sectionsEl) {
        sectionsEl.innerHTML = (item.sections || [])
          .map(
            (section) => `
              <div class="property-section">
                <h3>${section.title}</h3>
                <ul>
                  ${section.items.map((i) => `<li>${i}</li>`).join("")}
                </ul>
              </div>
            `,
          )
          .join("");
      }

      // Render amenities
      if (amenitiesEl) {
        const amenitiesSection = item.sections?.find((s) =>
          s.title.toLowerCase().includes("amenities"),
        );
        if (amenitiesSection) {
          amenitiesEl.innerHTML = amenitiesSection.items
            .map(
              (amenity) => `
              <div class="amenity-item">
                <i class="bi bi-check-circle"></i>
                <p>${amenity}</p>
              </div>
            `,
            )
            .join("");
        }
      }

      // Render specifications
      if (specsEl) {
        const specsSection = item.sections?.find((s) =>
          s.title.toLowerCase().includes("specifications"),
        );
        if (specsSection) {
          specsEl.innerHTML = specsSection.items
            .map(
              (spec) => `
              <div class="spec-item">
                <span class="label">Feature</span>
                <span class="value">${spec}</span>
              </div>
            `,
            )
            .join("");
        } else {
          // Fallback: show key specs
          specsEl.innerHTML = `
            <div class="spec-item">
              <span class="label">Property Type</span>
              <span class="value">${item.type}</span>
            </div>
            <div class="spec-item">
              <span class="label">Area</span>
              <span class="value">${item.area_display}</span>
            </div>
            <div class="spec-item">
              <span class="label">Status</span>
              <span class="value">${item.status}</span>
            </div>
          `;
        }
      }

      // Render summary
      if (summaryEl) {
        const summaryItems = [
          ["Project Name", item.name],
          ["Location", item.location],
          ["Property Type", item.type],
          ["Status", item.status],
          ["Area", item.area_display],
          ["Price", item.price_display],
          ["Possession", item.possession],
        ].filter(([, value]) => value);

        summaryEl.innerHTML = summaryItems
          .map(
            ([label, value]) => `
            <li>
              <span class="label">${label}</span>
              <span class="value">${value}</span>
            </li>
          `,
          )
          .join("");
      }

      // Render slides
      if (slidesEl) {
        const imgs =
          item.images && item.images.length
            ? item.images
            : ["assets/img/properties/featured-1.jpg"];
        slidesEl.innerHTML = imgs
          .map(
            (img, index) =>
              `<div class="swiper-slide"><img src="${img}" alt="${item.name} image ${index + 1}"></div>`,
          )
          .join("");
      }

      // Set map
      if (mapEl) {
        mapEl.src = mapEmbedUrl(item);
      }

      // Initialize Swiper with delay to ensure DOM is ready
      setTimeout(() => {
        const swiperEl = document.getElementById("property-slider");
        if (
          swiperEl &&
          swiperEl.querySelector(".swiper-config") &&
          window.Swiper
        ) {
          try {
            const config = JSON.parse(
              swiperEl.querySelector(".swiper-config").innerHTML.trim(),
            );
            if (swiperEl.swiper) {
              swiperEl.swiper.destroy(true, true);
            }
            new Swiper(swiperEl, config);
          } catch (error) {
            console.error("Swiper initialization error:", error);
          }
        }
      }, 100);
    })
    .catch(() => {
      setEmptyState();
    });
})();
