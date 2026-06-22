export function initSearching() {
  return (query, state, action) => {
    return state.search
      ? Object.assign({}, query, {
          search: state.search,
        })
      : query;
  };
}
