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

  // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы

  before
    .slice()
    .reverse()
    .forEach((subTemplate) => {
      const sub = cloneTemplate(subTemplate);

      const name = subTemplate.name || subTemplate.id || String(subTemplate);
      root[name] = sub;
      root.container.prepend(sub.container);
    });

  after.forEach((subTemplate) => {
    const sub = cloneTemplate(subTemplate);
    const name = subTemplate.name || subTemplate.id || String(subTemplate);
    root[name] = sub;
    root.container.append(sub.container);
  });

  // @todo: #1.3 —  обработать события и вызвать onAction()

  root.container.addEventListener("change", (e) => {
    onAction(e.target);
  });

  root.container.addEventListener("reset", (e) => {
    setTimeout(() => onAction(e.target), 0);
  });

  root.container.addEventListener("submit", (e) => {
    e.preventDefault();
    onAction(e.submitter || e.target);
  });

  root.container.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button && button.type === "button") {
      onAction(button);
    }
  });

  const render = (data) => {
    // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
    const nextRows = data.map((item) => {
      const row = cloneTemplate(rowTemplate);

      Object.keys(item).forEach((key) => {
        if (row.elements[key] !== undefined) {
          const el = row.elements[key];

          if (["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)) {
            el.value = item[key];
          } else {
            el.textContent = item[key];
          }
        }
      });

      return row.container;
    });
    root.elements.rows.replaceChildren(...nextRows);
  };

  return { ...root, render };
}
