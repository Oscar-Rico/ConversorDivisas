const currencies = {
  USD: { name: "Dólar estadounidense", flag: "us", group: "primary" },
  EUR: { name: "Euro", flag: "eu", group: "primary" },
  GBP: { name: "Libra esterlina", flag: "gb", group: "primary" },
  CHF: { name: "Franco suizo", flag: "ch", group: "primary" },
  CZK: { name: "Corona checa", flag: "cz", group: "primary" },
  DKK: { name: "Corona danesa", flag: "dk", group: "secondary" },
  SEK: { name: "Corona sueca", flag: "se", group: "secondary" },
  NOK: { name: "Corona noruega", flag: "no", group: "secondary" },
  RUB: { name: "Rublo ruso", flag: "ru", group: "secondary" },
  JPY: { name: "Yen japonés", flag: "jp", group: "secondary" },
  MXN: { name: "Peso mexicano", flag: "mx", group: "secondary" },
  HKD: { name: "Dólar de Hong Kong", flag: "hk", group: "secondary" },
  CAD: { name: "Dólar canadiense", flag: "ca", group: "secondary" },
  AUD: { name: "Dólar australiano", flag: "au", group: "secondary" },
  CNY: { name: "Yuan chino", flag: "cn", group: "secondary" },
};

const currencyCodes = Object.keys(currencies);
const apiUrl = "https://open.er-api.com/v6/latest/EUR";
const amountInput = document.querySelector("#amount-input");
const baseCurrency = document.querySelector("#base-currency");
const currencyFlag = document.querySelector("#base-currency-flag");
const currencySymbol = document.querySelector("#input-currency-symbol");
const currencyName = document.querySelector("#base-currency-name");
const form = document.querySelector("#converter-form");
const refreshButton = document.querySelector("#refresh-rates");
const amountError = document.querySelector("#amount-error");
const rateStatus = document.querySelector("#rate-status");
const rateStatusText = document.querySelector("#rate-status-text");
const resultsContent = document.querySelector("#results-content");
const resultsEmpty = document.querySelector("#results-empty");
const resultCount = document.querySelector("#result-count");
const primaryResults = document.querySelector("#primary-results");
const secondaryResults = document.querySelector("#secondary-results");
const primaryCount = document.querySelector("#primary-count");
const secondaryCount = document.querySelector("#secondary-count");
const baseFlag = document.querySelector("#base-currency-flag");
const cardsView = document.querySelector("#cards-view");
const tableView = document.querySelector("#table-view");
const tableResults = document.querySelector("#table-results");
const tableRateHeading = document.querySelector("#table-rate-heading");
const viewButtons = document.querySelectorAll(".view-button");

let rates = null;
let ratesUpdatedAt = null;
let currentView = "cards";

function parseAmount(value) {
  let normalized = value.trim().replace(/[\s\u00a0\u202f]/g, "");
  if (!normalized) return null;

  const commaIndex = normalized.lastIndexOf(",");
  const dotIndex = normalized.lastIndexOf(".");
  if (commaIndex !== -1 && dotIndex !== -1) {
    const decimalSeparator = commaIndex > dotIndex ? "," : ".";
    const groupSeparator = decimalSeparator === "," ? "." : ",";
    const decimalIndex = normalized.lastIndexOf(decimalSeparator);
    const integerPart = normalized.slice(0, decimalIndex);
    const groups = integerPart.split(groupSeparator);
    if (groups.length > 1 && (groups[0].length > 3 || groups.slice(1).some((group) => group.length !== 3))) return null;
    normalized = `${integerPart.replaceAll(groupSeparator, "")}.${normalized.slice(decimalIndex + 1)}`;
  } else {
    const separator = commaIndex !== -1 ? "," : dotIndex !== -1 ? "." : null;
    if (separator) {
      const parts = normalized.split(separator);
      if (parts.length > 2) {
        if (parts[0].length > 3 || parts.slice(1).some((part) => part.length !== 3)) return null;
        normalized = parts.join("");
      } else {
        normalized = parts.join(".");
      }
    }
  }

  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function formatCurrency(value, code, fractionDigits = 2) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function createFlag(flagCode, className) {
  const flag = document.createElement("img");
  flag.className = className;
  flag.src = `https://flagcdn.com/w40/${flagCode}.png`;
  flag.alt = "";
  flag.setAttribute("aria-hidden", "true");
  return flag;
}

function setView(view) {
  currentView = view;
  cardsView.hidden = view !== "cards";
  tableView.hidden = view !== "table";
  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setRateStatus(message, state) {
  rateStatus.classList.toggle("is-ready", state === "ready");
  rateStatus.classList.toggle("is-error", state === "error");
  rateStatusText.textContent = message;
}

function showEmptyMessage(message, isError = false) {
  resultsEmpty.textContent = message;
  resultsEmpty.classList.toggle("is-error", isError);
  resultsEmpty.classList.add("is-visible");
  primaryResults.replaceChildren();
  secondaryResults.replaceChildren();
  primaryCount.textContent = "0";
  secondaryCount.textContent = "0";
  resultCount.textContent = "—";
  cardsView.hidden = true;
  tableView.hidden = true;
}

function createCurrencyCard(code, amount, exchangeRate, baseCode) {
  const currency = currencies[code];
  const card = document.createElement("article");
  const top = document.createElement("div");
  const codeLabel = document.createElement("span");
  const name = document.createElement("p");
  const value = document.createElement("p");
  const rate = document.createElement("p");

  card.className = "currency-card";
  top.className = "currency-card-top";
  codeLabel.className = "card-code";
  codeLabel.textContent = code;
  name.className = "card-name";
  name.textContent = currency.name;
  value.className = "card-value";
  value.textContent = formatCurrency(amount, code);
  rate.className = "card-rate";
  rate.textContent = `1 ${baseCode} = ${formatCurrency(exchangeRate, code, 3)}`;
  top.append(createFlag(currency.flag, "card-flag"), codeLabel);
  card.append(top, name, value, rate);
  return card;
}

function createCurrencyRow(code, amount, exchangeRate, baseCode) {
  const currency = currencies[code];
  const row = document.createElement("tr");
  const currencyCell = document.createElement("th");
  const conversionCell = document.createElement("td");
  const rateCell = document.createElement("td");
  const currencyInfo = document.createElement("span");
  const currencyCode = document.createElement("span");
  const name = document.createElement("span");

  currencyCell.scope = "row";
  currencyInfo.className = "table-currency-info";
  currencyCode.className = "table-currency-code";
  currencyCode.textContent = code;
  name.className = "table-currency-name";
  name.textContent = currency.name;
  currencyInfo.append(createFlag(currency.flag, "table-flag"), currencyCode, name);
  conversionCell.textContent = formatCurrency(amount, code);
  rateCell.textContent = formatCurrency(exchangeRate, code, 3);
  row.append(currencyCell, conversionCell, rateCell);
  currencyCell.append(currencyInfo);
  return row;
}

function updateResults() {
  const baseCode = baseCurrency.value;
  const amount = parseAmount(amountInput.value);
  const base = currencies[baseCode];
  const baseSymbol = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: baseCode,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0).find((part) => part.type === "currency")?.value;

  currencyFlag.replaceChildren(createFlag(base.flag, "select-flag"));
  currencySymbol.textContent = baseSymbol || baseCode;
  currencyName.textContent = base.name;
  amountError.textContent = "";
  amountInput.removeAttribute("aria-invalid");

  if (amount === null || amount < 0) {
    if (amountInput.value.trim()) {
      amountError.textContent = amount < 0 ? "Introduce una cantidad positiva." : "Escribe una cantidad válida, por ejemplo 12,50.";
      amountInput.setAttribute("aria-invalid", "true");
    }
    showEmptyMessage(amountInput.value.trim() ? "Corrige la cantidad para calcular las conversiones." : "Escribe una cantidad para ver su conversión.");
    return;
  }

  if (!rates) {
    showEmptyMessage("Las cotizaciones no están disponibles. Comprueba tu conexión e inténtalo de nuevo.", true);
    return;
  }

  const baseRate = rates[baseCode];
  const primaryCards = [];
  const secondaryCards = [];
  const tableRows = [];

  currencyCodes.forEach((code) => {
    if (code === baseCode) return;
    const exchangeRate = rates[code] / baseRate;
    const convertedAmount = amount * exchangeRate;
    const card = createCurrencyCard(code, convertedAmount, exchangeRate, baseCode);
    tableRows.push(createCurrencyRow(code, convertedAmount, exchangeRate, baseCode));
    (currencies[code].group === "primary" ? primaryCards : secondaryCards).push(card);
  });

  primaryResults.replaceChildren(...primaryCards);
  secondaryResults.replaceChildren(...secondaryCards);
  tableResults.replaceChildren(...tableRows);
  tableRateHeading.textContent = `Cambio (1 ${baseCode})`;
  primaryCount.textContent = String(primaryCards.length);
  secondaryCount.textContent = String(secondaryCards.length);
  resultCount.textContent = `${primaryCards.length + secondaryCards.length} divisas`;
  resultsEmpty.classList.remove("is-visible", "is-error");
  setView(currentView);
}

async function loadRates() {
  refreshButton.disabled = true;
  refreshButton.classList.add("is-loading");
  resultsContent.setAttribute("aria-busy", "true");
  setRateStatus("Cargando cotizaciones actuales…", "loading");

  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`El servicio respondió con el estado ${response.status}.`);
    const data = await response.json();
    if (data.result !== "success" || data.base_code !== "EUR" || !data.rates) {
      throw new Error("El servicio de cotizaciones devolvió una respuesta no válida.");
    }

    const updatedRates = {};
    for (const code of currencyCodes) {
      const value = data.rates[code];
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
        throw new Error(`No hay una cotización válida para ${code}.`);
      }
      updatedRates[code] = value;
    }

    rates = updatedRates;
    ratesUpdatedAt = new Date(data.time_last_update_utc);
    const updatedDate = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(ratesUpdatedAt);
    setRateStatus(`Cotizaciones actualizadas el ${updatedDate}.`, "ready");
    updateResults();
  } catch (error) {
    const details = error instanceof Error ? error.message : "Error desconocido.";
    if (rates && ratesUpdatedAt) {
      const previousDate = new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(ratesUpdatedAt);
      setRateStatus(`No se pudo actualizar (${details}). Se mantienen los datos del ${previousDate}.`, "error");
      updateResults();
    } else {
      setRateStatus(`No se pudieron cargar las cotizaciones: ${details}`, "error");
      showEmptyMessage("Comprueba tu conexión e inténtalo de nuevo con «Actualizar».", true);
    }
  } finally {
    refreshButton.disabled = false;
    refreshButton.classList.remove("is-loading");
    resultsContent.setAttribute("aria-busy", "false");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateResults();
});
amountInput.addEventListener("input", updateResults);
baseCurrency.addEventListener("change", updateResults);
refreshButton.addEventListener("click", loadRates);
viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

updateResults();
loadRates();
