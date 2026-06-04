import { getPages } from "../lib/utils.js";

export function initPagination(elements) {
  let pageCount;

  const applyPagination = (query, state, action) => {
    const limit = Number(state.rowsPerPage) || 10;
    let page = Number(state.page) || 1;

    if (action && action.name) {
      if (action.name === "first") page = 1;
      if (action.name === "prev" && page > 1) page -= 1;
      if (action.name === "next" && page < pageCount) page += 1;
      if (action.name === "last") page = pageCount;
      if (action.name === "page") page = Number(action.value);
    }

    state.page = page;

    return Object.assign({}, query, { limit, page });
  };

  const updatePagination = (total, { page, limit }) => {
    pageCount = Math.ceil(total / limit) || 1;

    const lowerIndex = (page - 1) * limit;
    const upperIndex = lowerIndex + limit;

    if (elements.fromRow)
      elements.fromRow.textContent = total === 0 ? 0 : lowerIndex + 1;
    if (elements.toRow)
      elements.toRow.textContent = Math.min(upperIndex, total);
    if (elements.totalRows) elements.totalRows.textContent = total;

    if (elements.pages) {
      const container = elements.pages;
      container.innerHTML = "";

      const pagesArray = getPages(page, pageCount, 5);

      pagesArray.forEach((pageNum) => {
        const label = document.createElement("label");
        label.className = "pagination-button";
        if (pageNum === page) label.classList.add("active");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "page";
        input.value = pageNum;
        if (pageNum === page) input.checked = true;

        const span = document.createElement("span");
        span.textContent = pageNum;

        label.appendChild(input);
        label.appendChild(span);
        container.appendChild(label);
      });
    }
  };

  return {
    updatePagination,
    applyPagination,
  };
}
