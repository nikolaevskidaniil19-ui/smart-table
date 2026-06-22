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

  const getRecords = async () => {
    return {
      total: data.length,
      items: data,
    };
  };

  return {
    getIndexes,
    getRecords,
  };
}
