/* изменения */
import { sortMap } from "../lib/sort.js"; // sortCollection больше не нужен

export function initSorting(columns) {
  return (query, state, action) => {
    if (action && action.name === "sort") {
      const clickedColumn = action.dataset.field;
      if (state.sort === clickedColumn) {
        state.order = state.order === "up" ? "down" : "up";
      } else {
        state.sort = clickedColumn;
        state.order = "up";
      }

      Object.keys(columns).forEach((columnName) => {
        const col = columns[columnName];
        if (col) {
          const direction =
            col.dataset.field === state.sort ? state.order : "none";
          col.dataset.value = direction;
        }
      });
    }

    const sort =
      state.sort && state.order !== "none"
        ? `${state.sort}:${state.order}`
        : null;
    return sort ? Object.assign({}, query, { sort }) : query;
  };
}
