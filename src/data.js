const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData() {
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,

      seller: sellers ? sellers[item.seller_id] : item.seller_id,
      customer: customers ? customers[item.customer_id] : item.customer_id,
      total: item.total_amount,
    }));

  const getIndexes = async () => {
    if (!sellers || !customers) {
      const [sellersData, customersData] = await Promise.all([
        fetch(`${BASE_URL}/sellers`)
          .then((res) => res.json())
          .catch(() => ({})),
        fetch(`${BASE_URL}/customers`)
          .then((res) => res.json())
          .catch(() => ({})),
      ]);

      sellers = sellersData;
      customers = customersData;
    }

    return {
      seller: sellers,
      customer: customers,
    };
  };

  const getRecords = async (query, isUpdated = false) => {
    if (!sellers || !customers) {
      await getIndexes();
    }

    const cleanQuery = {};
    if (query) {
      Object.keys(query).forEach((key) => {
        if (
          query[key] !== undefined &&
          query[key] !== null &&
          query[key] !== ""
        ) {
          cleanQuery[key] = String(query[key]);
        }
      });
    }

    const qs = new URLSearchParams(cleanQuery);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    try {
      const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const records = await response.json();

      lastQuery = nextQuery;
      lastResult = {
        total: records.total ?? (records.items ? records.items.length : 0),
        items: mapRecords(records.items || []),
      };

      return lastResult;
    } catch (error) {
      console.error("Failed to fetch records:", error);

      return { total: 0, items: [] };
    }
  };

  return {
    getIndexes,
    getRecords,
  };
}
