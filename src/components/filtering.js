export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
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
    if (action && action.name === "clear") {
      const parent = action.parentElement;
      const input = parent.querySelector("input");
      const field = action.dataset.field;

      if (input) {
        input.value = "";
      }

      if (state[field] !== undefined) {
        state[field] = "";
      }
    }

    const filteredState = { ...state };
    const hasTotalFrom =
      typeof state.totalFrom === "string" && state.totalFrom.trim() !== "";
    const hasTotalTo =
      typeof state.totalTo === "string" && state.totalTo.trim() !== "";

    if (hasTotalFrom || hasTotalTo) {
      const from = hasTotalFrom ? parseFloat(state.totalFrom) : undefined;
      const to = hasTotalTo ? parseFloat(state.totalTo) : undefined;

      delete filteredState.totalFrom;
      delete filteredState.totalTo;

      filteredState.total = [from, to];
    }

    // @todo: #4.5
    const filter = {};
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
