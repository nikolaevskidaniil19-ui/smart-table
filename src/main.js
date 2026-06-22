import "./fonts/ys-display/fonts.css";
import "./style.css";

import { data as sourceData } from "./data/dataset_1.js";

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";
// Шаг 5: Подключаем инициализацию сортировки
import { initSorting } from "./components/sorting.js";

// Вызов initData(sourceData) присваиваем константе api
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
// Функцию render() делаем асинхронной
async function render(action) {
  let state = collectState(); // состояние полей из таблицы
  let query = {}; // здесь будут формироваться параметры запроса

  // Шаг 5: Применяем сортировку (result заменяем на query)
  query = applySorting(query, state, action);

  // Шаг 4: Применяем поиск
  query = applySearching(query, state, action);

  // Шаг 3: Применяем фильтрацию
  query = applyFiltering(query, state, action);

  // Применяем пагинацию до запроса и обновляем query
  query = applyPagination(query, state, action);

  // Запрашиваем данные с собранными параметрами с сервера (мок-апи)
  const { total, items } = await api.getRecords(query);

  // Перерисовываем пагинатор после получения данных
  updatePagination(total, query);

  // Передаем полученные элементы в таблицу
  sampleTable.render(items);
}

const sampleTable = initTable(
  {
    tableTemplate: "table",
    rowTemplate: "row",
    before: [],
    after: [],
  },
  render,
);

// Инициализируем пагинацию
const { applyPagination, updatePagination } = initPagination({
  fromRow: sampleTable.container.querySelector('[data-element="from-row"]'),
  toRow: sampleTable.container.querySelector('[data-element="to-row"]'),
  totalRows: sampleTable.container.querySelector('[data-element="total-rows"]'),
  pages: sampleTable.container.querySelector('[data-element="pages"]'),
});

// Инициализируем фильтрацию
const { applyFiltering, updateIndexes } = initFiltering(
  sampleTable.filter?.elements ||
    sampleTable.container.forms[0]?.elements ||
    {},
);

// Инициализируем поиск
const applySearching = initSearching();

// Шаг 5: Инициализируем сортировку и получаем функцию applySorting
const applySorting = initSorting(sampleTable.columns);

// Объявляем асинхронную функцию init() в конце файла
async function init() {
  // Получаем индексы с сервера
  const indexes = await api.getIndexes();

  // Обновление индексов внутри init()
  updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers,
  });
}

const appRoot = document.querySelector("#app");
appRoot.appendChild(sampleTable.container);

// Заменяем вызов render на init().then(render)
init().then(render);
