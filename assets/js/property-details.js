(function () {
  const titleEl = document.getElementById("property-title");
  const taglineEl = document.getElementById("property-tagline");
  const locationDisplayEl = document.getElementById("property-location-display");
  const priceBigEl = document.getElementById("property-price-big");
  const keyGridEl = document.getElementById("property-key-grid");
  const detailGridEl = document.getElementById("property-detail-grid");
  const keyHighlightsEl = document.getElementById("property-key-highlights");
  const trustListEl = document.getElementById("property-trust-list");
  const reraBadgeEl = document.getElementById("property-rera-badge");
  const sectionsEl = document.getElementById("property-sections");
  const summaryEl = document.getElementById("property-summary");
  const slidesEl = document.getElementById("property-slides");
  const mapEl = document.getElementById("property-map");
  const statusEl = document.getElementById("property-status");
  const typeEl = document.getElementById("property-type");
  const amenitiesEl = document.getElementById("amenities-list");
  const specsEl = document.getElementById("specs-list");
  const modalImageEl = document.getElementById("property-modal-image");
  const modalEl = document.getElementById("propertyGalleryModal");

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

  const extractRera = (item) => {
    const allItems = (item.sections || []).flatMap((section) => section.items || []);
    return (
      allItems.find((entry) => /rera|maharera/i.test(entry)) || ""
    );
  };

  const extractBhk = (item) => {
    const text = `${item.tagline || ""} ${item.area_display || ""} ${item.name || ""}`;
    const match = text.match(/(\d(?:\s*&\s*\d)?(?:\s*,\s*\d+)?(?:\s*to\s*\d+)?)\s*BHK/i);
    return match ? `${match[1].replace(/\s+/g, " ").trim()} BHK` : "Premium Inventory";
  };

  const deriveFloor = (item) => {
    const allItems = (item.sections || []).flatMap((section) => section.items || []);
    const floorInfo = allItems.find((entry) => /floor|tower|building/i.test(entry));
    return floorInfo || item.status || "Available";
  };

  const getAmenityItems = (item) =>
    (item.sections || [])
      .filter((section) => /amenit|feature|usp|lifestyle/i.test(section.title))
      .flatMap((section) => section.items || []);

  const makeInfoCard = (label, value, icon) => `
    <div class="property-info-card">
      <span class="property-info-icon"><i class="bi ${icon}"></i></span>
      <div>
        <small>${label}</small>
        <strong>${value || "On Request"}</strong>
      </div>
    </div>
  `;

  const makeDetailCard = (label, value, icon, accentClass = "") => `
    <article class="property-info-card property-detail-card ${accentClass}">
      <div class="property-detail-card-head">
        <span class="property-info-icon"><i class="bi ${icon}"></i></span>
        <small>${label}</small>
      </div>
      <strong>${value || "On Request"}</strong>
    </article>
  `;

  const makeKeyInfoCard = (label, value, icon, toneClass = "", layoutClass = "") => `
    <article class="property-info-card property-key-card ${toneClass} ${layoutClass}">
      <div class="property-key-card-top">
        <span class="property-info-icon"><i class="bi ${icon}"></i></span>
        <span class="property-key-card-label">${label}</span>
      </div>
      <strong>${value || "On Request"}</strong>
    </article>
  `;

  const makeHighlightPill = (label, value, icon) => `
    <div class="property-key-highlight-pill">
      <span class="property-key-highlight-icon"><i class="bi ${icon}"></i></span>
      <div>
        <small>${label}</small>
        <strong>${value || "Available"}</strong>
      </div>
    </div>
  `;

  const renderSlides = (item) => {
    if (!slidesEl) return;
    if (item.video && item.id === "kingsbay-farmhouse-plotting") {
      slidesEl.innerHTML = `
        <div class="swiper-slide">
          <div class="property-slide-video">
            <video autoplay muted loop playsinline controls preload="metadata" aria-label="${item.name} video">
              <source src="${item.video}" type="video/mp4">
            </video>
          </div>
        </div>`;
      return;
    }

    const imgs =
      item.images && item.images.length
        ? item.images
        : ["assets/img/properties/featured-1.jpg"];
    const videoSlide = item.video
      ? `
          <div class="swiper-slide">
            <div class="property-slide-video">
              <video autoplay muted loop playsinline controls preload="metadata" aria-label="${item.name} video">
                <source src="${item.video}" type="video/mp4">
              </video>
            </div>
          </div>`
      : "";
    const imageSlides = imgs
      .map(
        (img, index) => `
          <div class="swiper-slide">
            <button class="property-slide-trigger" type="button" data-image="${img}" aria-label="Open property image ${index + 1}">
              <img loading="lazy" decoding="async" fetchpriority="low" src="${img}" alt="${item.name} image ${index + 1}">
            </button>
          </div>`,
      )
      .join("");
    slidesEl.innerHTML = `${videoSlide}${imageSlides}`;
  };

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

      document.body.classList.toggle(
        "kingsbay-video-only",
        item.id === "kingsbay-farmhouse-plotting" && Boolean(item.video),
      );

      document.title = `${item.name} - Kappstone Realty`;

      if (titleEl) titleEl.textContent = item.name;
      if (taglineEl) taglineEl.textContent = item.tagline || "";
      if (locationDisplayEl) locationDisplayEl.textContent = item.location || "";
      if (priceBigEl) priceBigEl.textContent = item.price_display || "On Request";
      if (statusEl) statusEl.textContent = item.status || "Available";
      if (typeEl) typeEl.textContent = item.type || "Property";
      if (reraBadgeEl) {
        const rera = extractRera(item);
        reraBadgeEl.textContent = rera ? "RERA Available" : "Verified Details";
      }

      const bhkValue = extractBhk(item);
      const reraValue = extractRera(item);
      const amenityCount = getAmenityItems(item).length;

      if (keyHighlightsEl) {
        keyHighlightsEl.innerHTML = [
          makeHighlightPill("Status", item.status, "bi-patch-check-fill"),
          makeHighlightPill("Possession", item.possession, "bi-calendar-event"),
          makeHighlightPill("Type", item.type, "bi-buildings-fill"),
          makeHighlightPill("RERA", reraValue || "Verified Details", "bi-shield-check"),
        ].join("");
      }

      if (keyGridEl) {
        keyGridEl.innerHTML = [
          makeKeyInfoCard("Starting Price", item.price_display, "bi-currency-rupee", "property-key-card-gold"),
          makeKeyInfoCard("Prime Location", item.location, "bi-geo-alt-fill", "property-key-card-green", "property-key-card-wide"),
          makeKeyInfoCard("Configuration", bhkValue, "bi-house-door-fill", "property-key-card-navy"),
          makeKeyInfoCard("Carpet Area", item.area_display, "bi-aspect-ratio-fill", "property-key-card-amber", "property-key-card-wide"),
        ].join("");
      }

      if (detailGridEl) {
        detailGridEl.innerHTML = [
          makeDetailCard("Property Type", item.type, "bi-building", "property-detail-card-sage"),
          makeDetailCard("Status", item.status, "bi-patch-check", "property-detail-card-gold"),
          makeDetailCard("Floor / Project", deriveFloor(item), "bi-layers", "property-detail-card-ink"),
          makeDetailCard("Amenities", amenityCount ? `${amenityCount}+ Features` : "Available", "bi-stars", "property-detail-card-blush"),
        ].join("");
      }

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

      if (trustListEl) {
        const trustItems = [
          `<div class="summary-trust-item"><i class="bi bi-patch-check-fill"></i><span>Verified listing support</span></div>`,
          reraValue
            ? `<div class="summary-trust-item"><i class="bi bi-shield-check"></i><span>${reraValue}</span></div>`
            : `<div class="summary-trust-item"><i class="bi bi-file-earmark-check-fill"></i><span>Documentation guidance available</span></div>`,
          `<div class="summary-trust-item"><i class="bi bi-calendar2-check-fill"></i><span>Site visit coordination available</span></div>`,
        ];
        trustListEl.innerHTML = trustItems.join("");
      }

      renderSlides(item);

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
            if (propertyId === "kingsbay-farmhouse-plotting") {
              config.loop = false;
              config.allowTouchMove = false;
              delete config.autoplay;
              delete config.navigation;
            }
            if (swiperEl.swiper) {
              swiperEl.swiper.destroy(true, true);
            }
            new Swiper(swiperEl, config);
          } catch (error) {
            console.error("Swiper initialization error:", error);
          }
        }

        if (modalEl && modalImageEl && window.bootstrap) {
          document.querySelectorAll(".property-slide-trigger").forEach((button) => {
            button.addEventListener("click", () => {
              modalImageEl.src = button.dataset.image;
              const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
              modalInstance.show();
            });
          });
        }
      }, 100);
    })
    .catch(() => {
      setEmptyState();
    });
})();
