import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
  const { tableTemplate, rowTemplate, before, after } = settings;
  const root = cloneTemplate(tableTemplate);
  let before_reverse = [...before].reverse();
  before_reverse.forEach((key) => {
    root[key] = cloneTemplate(key);
    root.container.prepend(root[key].container);
  });
  after.forEach((key) => {
    root[key] = cloneTemplate(key);
    root.container.append(root[key].container);
  });

  root.container.addEventListener("change", () => onAction());
  root.container.addEventListener("reset", () => {
    setTimeout(() => onAction(), 0);
  });
  root.container.addEventListener("submit", (e) => {
    e.preventDefault();
    onAction(e.submitter);
  });

  // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы

  // @todo: #1.3 —  обработать события и вызвать onAction()

  const render = (data) => {
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);
      Object.keys(item).forEach((key) => {
        if (row.elements[key]) {
          row.elements[key].textContent = item[key];
        }
      });
      return row.container;
    });

    root.elements.rows.replaceChildren(...nextRows);
  };

  return { ...root, render };
}
