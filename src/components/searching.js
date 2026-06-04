export function initSearching() {
  return (query, state) => {
    return state.search
      ? Object.assign({}, query, {
          search: state.search,
        })
      : query;
  };
}
