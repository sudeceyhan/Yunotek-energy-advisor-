const presetDevices = {
  "Akıllı Telefon": 10,
  Bilgisayar: 70,
  Televizyon: 120,
  "Elektrikli Pişirici": 500,
  Ampul: 15,
  Buzdolabı: 150,
  Dron: 70,
  "Elektrikli Matkap": 600,
  "Kahve Makinası": 1300,
  Klima: 1500,
  "Elektrikli Fırın": 2500,
  "Elektrikli Izgara": 1800,
  "Yat Motoru": 4800,
};

const products = [
  {
    id: "mini",
    name: "Yougen Mini",
    maxPower: 600,
    capacity: 577.2,
    panel: 100,
    image: "images/yougen-mini.png",
    link: "https://www.yunotek.com.tr/urun/mini-enerji-paketi-youngenmini-600w-100w-gunes-paneli",
  },
  {
    id: "max2",
    name: "Yougen Max 2",
    maxPower: 2000,
    capacity: 1648.6,
    panel: 400,
    image: "images/yougen-max2.png",
    link: "https://www.yunotek.com.tr/urun/maxi-enerji-2-paketi-youngenmax-2000w-400w-gunes-paneli",
  },
  {
    id: "max3",
    name: "Yougen Max 3",
    maxPower: 3000,
    capacity: 2880,
    panel: 400,
    image: "images/yougen-max3.png",
    link: "https://www.yunotek.com.tr/urun/maxi-enerji-3-paketi-youngenmax-3000w-400w-gunes-paneli",
  },
];

let selectedScenario = null;
let devices = [];
let lockedLightMode = false;

function showView(id) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function setLightMode() {
  document.body.classList.remove("dark-mode");
  document.body.classList.add("light-mode");
}

function lockLightMode() {
  lockedLightMode = true;
  setLightMode();
}

function formatNumber(num) {
  return Math.round(num);
}

function formatDurationFromHours(decimalHours) {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} dakika`;
  if (minutes === 0) return `${hours} saat`;

  return `${hours} saat ${minutes} dakika`;
}

function formatDayEstimate(days) {
  if (days < 1) return "1 günden kısa sürede dolar";
  if (days < 2) return "Yaklaşık 1 günde dolar";
  return `Yaklaşık ${Math.ceil(days)} günde dolar`;
}

function renderDeviceTable() {
  const table = document.getElementById("deviceTable");
  const tbody = document.getElementById("deviceTableBody");
  const empty = document.getElementById("deviceListEmpty");

  if (!table || !tbody || !empty) return;

  if (devices.length === 0) {
    table.classList.add("hidden");
    empty.classList.remove("hidden");
    tbody.innerHTML = "";
    return;
  }

  table.classList.remove("hidden");
  empty.classList.add("hidden");
  tbody.innerHTML = "";

  devices.forEach((device, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${device.name}</td>
      <td>${device.watt} W</td>
      <td>${device.quantity}</td>
      <td>${device.hours}</td>
      <td>${formatNumber(device.energyWh)} Wh</td>
      <td><button class="btn ghost" data-remove="${index}">Sil</button></td>
    `;

    tbody.appendChild(row);
  });

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.remove);
      devices.splice(index, 1);
      renderDeviceTable();
    });
  });
}

function calculateTotals() {
  let totalPower = 0;
  let totalEnergy = 0;

  devices.forEach((device) => {
    totalPower += device.watt * device.quantity;
    totalEnergy += device.energyWh;
  });

  return {
    totalPower,
    totalEnergy,
    safeEnergy: totalEnergy * 1.2,
  };
}

function selectRecommendedProduct(totalPower, safeEnergy) {
  return (
    products.find(
      (product) =>
        product.maxPower >= totalPower && product.capacity >= safeEnergy,
    ) || null
  );
}

function renderRecommendation(product, totalPower) {
  const container = document.getElementById("recommendedProductContainer");
  if (!container) return;

  if (!product) {
    container.innerHTML = `
      <div class="recommended-layout">
        <div>
          <h2>Özel Çözüm Gerekli</h2>
          <p>Seçtiğiniz cihazların güç ihtiyacı mevcut Yougen modellerinin kapasitesini aşıyor.</p>
          <p class="muted">Hesaplanan anlık güç: ${formatNumber(totalPower)} W</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="recommended-layout">
      <div class="recommended-image-area">
        <img src="${product.image}" alt="${product.name}" class="recommended-image" />
      </div>

      <div class="recommended-info">
        <span class="mini-label">En uygun seçenek</span>
        <h2>${product.name}</h2>

        <p>Bu model, hesaplanan güç ihtiyacınızı karşılayan en uygun Yunotek güç istasyonudur.</p>

        <div class="recommended-specs">
          <span>${product.maxPower} W Güç</span>
          <span>${product.capacity} Wh Kapasite</span>
          <span>${product.panel} W Solar Panel</span>
        </div>

        <p class="muted">Hesaplanan anlık güç ihtiyacı: ${formatNumber(totalPower)} W</p>

        <a href="${product.link}" target="_blank" class="btn primary product-detail-btn">
          Ürüne Git
        </a>
      </div>
    </div>
  `;
}

function renderRuntimeCards(totalPower) {
  const container = document.getElementById("runtimeCards");
  if (!container) return;

  container.innerHTML = "";

  products.forEach((product) => {
    const usableCapacity = product.capacity * 0.8;
    const isCompatible = totalPower <= product.maxPower;
    const runtime = totalPower > 0 ? usableCapacity / totalPower : 0;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${product.name}</h3>
      <p class="summary-value">
        ${isCompatible ? formatDurationFromHours(runtime) : "Uygun değil"}
      </p>
      <p class="muted">
        ${
          isCompatible
            ? "Tüm cihazlar aynı anda çalışırsa tahmini çalışma süresi."
            : "Toplam güç ihtiyacı bu modelin maksimum çıkış gücünü aşıyor."
        }
      </p>
    `;

    container.appendChild(card);
  });
}

function renderSolarResults(dailyWh, efficiencyPercent) {
  const dailyEl = document.getElementById("solarDailyWh");
  const summary = document.getElementById("solarSummary");
  const results = document.getElementById("solarProductResults");
  const usageExamples = document.getElementById("solarUsageExamples");
  const efficiencyResult = document.getElementById("solarEfficiencyResult");

  if (!dailyEl || !summary || !results || !usageExamples || !efficiencyResult) {
    return;
  }

  dailyEl.textContent = formatNumber(dailyWh);
  summary.classList.remove("hidden");

  if (efficiencyPercent >= 80) {
    efficiencyResult.innerHTML = `✅ Yüksek üretim verimi: %${efficiencyPercent}`;
  } else if (efficiencyPercent >= 50) {
    efficiencyResult.innerHTML = `🟡 Orta seviye üretim verimi: %${efficiencyPercent}`;
  } else {
    efficiencyResult.innerHTML = `⚠️ Düşük üretim verimi: %${efficiencyPercent}`;
  }

  efficiencyResult.classList.remove("hidden");

  usageExamples.innerHTML = `
    <h3>Bununla Neler Yapabilirsiniz?</h3>

    <div class="usage-grid">
      <div>📱 Akıllı Telefon <strong>${Math.floor(dailyWh / 14)} kez şarj</strong></div>
      <div>💻 Bilgisayar <strong>${formatDurationFromHours(dailyWh / 70)}</strong></div>
      <div>📺 Televizyon <strong>${formatDurationFromHours(dailyWh / 120)}</strong></div>
      <div>💡 LED Ampul <strong>${formatDurationFromHours(dailyWh / 15)}</strong></div>
      <div>🔋 Drone Bataryası <strong>${Math.floor(dailyWh / 70)} kez şarj</strong></div>
    </div>
  `;

  usageExamples.classList.remove("hidden");

  results.innerHTML = "";

  products.forEach((product) => {
    const chargeHours = product.capacity / dailyWh;
    const chargeDays = chargeHours / 24;

    const div = document.createElement("div");
    div.className = "solar-product-card";

    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>${product.capacity} Wh kapasite</p>
      <p><strong>Dolum süresi:</strong> ${formatDurationFromHours(chargeHours)}</p>
      <p class="muted">${formatDayEstimate(chargeDays)}</p>
    `;

    results.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.getElementById("year");
  if (yearElement) yearElement.textContent = new Date().getFullYear();

  showView("landing");

  const heroCta = document.getElementById("heroCta");

  if (heroCta) {
    heroCta.addEventListener("mouseenter", setLightMode);

    heroCta.addEventListener("click", () => {
      lockLightMode();
      showView("scenario");
    });
  }

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      lockLightMode();
      showView(button.dataset.target);
    });
  });

  document.querySelectorAll(".scenario-card").forEach((card) => {
    card.addEventListener("click", () => {
      lockLightMode();

      selectedScenario = card.dataset.scenario;

      const info = document.getElementById("selectedScenarioInfo");

      if (info) {
        info.textContent = `Seçilen kullanım senaryosu: ${selectedScenario}`;
        info.classList.remove("hidden");
      }

      setTimeout(() => {
        showView("devices");
      }, 300);
    });
  });

  const addPresetDeviceBtn = document.getElementById("addPresetDevice");

  if (addPresetDeviceBtn) {
    addPresetDeviceBtn.addEventListener("click", () => {
      const name = document.getElementById("presetDevice").value;
      const quantity = Number(document.getElementById("presetQuantity").value);
      const hours = Number(document.getElementById("presetHours").value);

      if (!name) {
        alert("Lütfen cihaz seçin.");
        return;
      }

      if (quantity <= 0 || hours <= 0) {
        alert("Lütfen adet ve saat değerlerini doğru giriniz.");
        return;
      }

      const watt = presetDevices[name];

      devices.push({
        name,
        watt,
        quantity,
        hours,
        energyWh: watt * quantity * hours,
      });

      renderDeviceTable();
    });
  }

  const addCustomDeviceBtn = document.getElementById("addCustomDevice");

  if (addCustomDeviceBtn) {
    addCustomDeviceBtn.addEventListener("click", () => {
      const name = document.getElementById("customName").value.trim();
      const watt = Number(document.getElementById("customWatt").value);
      const quantity = Number(document.getElementById("customQuantity").value);
      const hours = Number(document.getElementById("customHours").value);

      if (!name || watt <= 0 || quantity <= 0 || hours <= 0) {
        alert("Lütfen tüm alanları doğru şekilde doldurun.");
        return;
      }

      devices.push({
        name,
        watt,
        quantity,
        hours,
        energyWh: watt * quantity * hours,
      });

      document.getElementById("customName").value = "";
      document.getElementById("customWatt").value = "";
      document.getElementById("customQuantity").value = "";
      document.getElementById("customHours").value = "";

      renderDeviceTable();
    });
  }

  const calculateBtn = document.getElementById("calculateBtn");

  if (calculateBtn) {
    calculateBtn.addEventListener("click", () => {
      lockLightMode();

      if (devices.length === 0) {
        alert("Lütfen önce cihaz ekleyin.");
        return;
      }

      const { totalPower, totalEnergy, safeEnergy } = calculateTotals();

      document.getElementById("totalPower").textContent =
        formatNumber(totalPower);
      document.getElementById("totalEnergy").textContent =
        formatNumber(totalEnergy);

      const recommendedProduct = selectRecommendedProduct(
        totalPower,
        safeEnergy,
      );

      renderRecommendation(recommendedProduct, totalPower);
      renderRuntimeCards(totalPower);

      const resultsContent = document.getElementById("resultsContent");
      if (resultsContent) resultsContent.classList.remove("hidden");

      showView("results");
    });
  }

  const solarCalcBtn = document.getElementById("solarCalcBtn");

  if (solarCalcBtn) {
    solarCalcBtn.addEventListener("click", () => {
      lockLightMode();

      const hours = Number(document.getElementById("solarHours").value);
      const panel = Number(document.getElementById("solarPanelSelect").value);
      const sunIntensity = Number(
        document.getElementById("sunIntensity").value,
      );
      const weatherCondition = Number(
        document.getElementById("weatherCondition").value,
      );
      const panelAngle = Number(document.getElementById("panelAngle").value);
      const shading = Number(document.getElementById("shading").value);

      if (hours <= 0 || panel <= 0) {
        alert("Lütfen geçerli değer girin.");
        return;
      }

      const efficiency = sunIntensity * weatherCondition * panelAngle * shading;
      const efficiencyPercent = Math.round(efficiency * 100);
      const dailyWh = hours * panel * efficiency;

      renderSolarResults(dailyWh, efficiencyPercent);
    });
  }
});

function saveToDatabase() {
  const databaseData = {
    selectedScenario: selectedScenario,
    devices: devices,
    totalPower: totalPower,
    totalEnergy: totalEnergy,
    recommendedProduct: recommendedProduct,
    savedDate: new Date().toLocaleString("tr-TR"),
  };

  localStorage.setItem("yunotekDatabase", JSON.stringify(databaseData));
}
