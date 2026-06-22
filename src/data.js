import { makeIndex } from "./lib/utils.js";

const BASE_URL = "https://education-services.ru";

export function initData(sourceData) {
  const sellers = makeIndex(
    sourceData.sellers,
    "id",
    (v) => `${v.first_name} ${v.last_name}`,
  );
  const customers = makeIndex(
    sourceData.customers,
    "id",
    (v) => `${v.first_name} ${v.last_name}`,
  );

  const data = sourceData.purchase_records.map((item) => ({
    id: item.receipt_id,
    date: item.date,
    seller: sellers[item.seller_id],
    customer: customers[item.customer_id],
    total: item.total_amount,
  }));

  const getIndexes = async () => {
    return { sellers, customers };
  };

  const getRecords = async (query = {}) => {
    let result = [...data];

    // 1. Текстовый поиск по всей таблице
    if (query.search) {
      const searchStr = query.search.toLowerCase();
      result = result.filter(
        (item) =>
          String(item.id).toLowerCase().includes(searchStr) ||
          String(item.date).toLowerCase().includes(searchStr) ||
          String(item.seller).toLowerCase().includes(searchStr) ||
          String(item.customer).toLowerCase().includes(searchStr),
      );
    }

    // 2. Обработка колоночных фильтров (исправляет проблему работы только одного фильтра)
    Object.keys(query).forEach((key) => {
      if (key.startsWith("filter[")) {
        let fieldName = key.replace("filter[", "").replace("]", "");
        const filterValue = query[key];

        if (filterValue) {
          // Приводим возможные HTML-имена полей к ключам нашего объекта данных
          let targetField = fieldName;
          if (fieldName.toLowerCase().includes("seller"))
            targetField = "seller";
          if (fieldName.toLowerCase().includes("customer"))
            targetField = "customer";
          if (fieldName.toLowerCase().includes("date")) targetField = "date";
          if (fieldName.toLowerCase().includes("id")) targetField = "id";

          // Фильтруем: проверяем точное совпадение или вхождение строки
          result = result.filter((item) => {
            const itemValue = String(item[targetField] || "").toLowerCase();
            const searchVal = String(filterValue).toLowerCase();
            return itemValue === searchVal || itemValue.includes(searchVal);
          });
        }
      }
    });

    // 3. Обработка серверной сортировки
    if (query.sort) {
      const [field, order] = query.sort.split(":");
      result.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (typeof valA === "number" && typeof valB === "number") {
          return order === "up" ? valA - valB : valB - valA;
        }

        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
        if (valA < valB) return order === "up" ? -1 : 1;
        if (valA > valB) return order === "up" ? 1 : -1;
        return 0;
      });
    }

    const total = result.length;

    // 4. Пагинация данных (порционный возврат строк)
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);

    return {
      total: total,
      items: result,
    };
  };

  return {
    getIndexes,
    getRecords,
  };
}
