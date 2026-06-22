import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";
import { initSorting } from "./components/sorting.js";

const api = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
  const state = processFormData(new FormData(sampleTable.container));

  return {
    ...state,
  };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {}; // здесь будут формироваться параметры запроса

  query = applySorting(query, state, action);

  query = applySearching(query, state, action);

  if (applyFiltering) {
    query = applyFiltering(query, state, action);
  }

  query = applyPagination(query, state, action);

  const { total, items } = await api.getRecords(query);

  updatePagination(total, query);

  sampleTable.render(items);
}

// Передаем имена вспомогательных шаблонов для рендеринга до/после таблицы
const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: ["filter"],
    after: ["pagination"],
  },
  render,
);

// Инициализируем пагинацию
const paginationContainer =
  sampleTable.pagination?.container || sampleTable.container;
const { applyPagination, updatePagination } = initPagination({
  fromRow: paginationContainer.querySelector('[data-element="from-row"]'),
  toRow: paginationContainer.querySelector('[data-element="to-row"]'),
  totalRows: paginationContainer.querySelector('[data-element="total-rows"]'),
  pages: paginationContainer.querySelector('[data-element="pages"]'),
});

const applySearching = initSearching();

const applySorting = initSorting(
  sampleTable.columns || sampleTable.elements || {},
);

let applyFiltering, updateIndexes;

async function init() {
  const filterElements =
    sampleTable.filter?.elements ||
    sampleTable.container.querySelector("form")?.elements ||
    {};

  // Инициализируем фильтрацию, передавая элементы формы
  const filtering = initFiltering(filterElements);
  applyFiltering = filtering.applyFiltering;
  updateIndexes = filtering.updateIndexes;

  // Получаем индексы с сервера
  const indexes = await api.getIndexes();

  // Наполняем выпадающий список продавцов
  updateIndexes(filterElements, {
    searchBySeller: indexes.sellers,
  });
}

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

// Запускаем инициализацию, а затем первичный рендер
init().then(render);
