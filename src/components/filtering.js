export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      elements[elementName].innerHTML = "";

      elements[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const el = document.createElement("option");
          el.textContent = name;
          el.value = name;
          return el;
        }),
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    const filteredState = { ...state };

    if (action && action.name === "clear") {
      const parent = action.parentElement;
      const input = parent.querySelector("input");
      const field = action.dataset.field;
      if (input) {
        input.value = "";
      }
      if (filteredState[field] !== undefined) {
        filteredState[field] = "";
      }

      if (elements[field]) {
        elements[field].value = "";
      }
    }

    const hasTotalFrom =
      typeof filteredState.totalFrom === "string" &&
      filteredState.totalFrom.trim() !== "";
    const hasTotalTo =
      typeof filteredState.totalTo === "string" &&
      filteredState.totalTo.trim() !== "";

    const filter = {};

    if (hasTotalFrom || hasTotalTo) {
      const from = hasTotalFrom
        ? parseFloat(filteredState.totalFrom)
        : undefined;
      const to = hasTotalTo ? parseFloat(filteredState.totalTo) : undefined;
      delete filteredState.totalFrom;
      delete filteredState.totalTo;
      filteredState.total = [from, to];

      if (from !== undefined) filter["filter[totalFrom]"] = from;
      if (to !== undefined) filter["filter[totalTo]"] = to;
    }

    Object.keys(elements).forEach((key) => {
      if (elements[key]) {
        if (
          ["INPUT", "SELECT"].includes(elements[key].tagName) &&
          elements[key].value
        ) {
          filter[`filter[${elements[key].name}]`] = elements[key].value;
        }
      }
    });

    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
