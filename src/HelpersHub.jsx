import '/src/helpers-hub.css';

<header className="helpers-header">
  <div>
    <div className="helpers-title">Помощники</div>
    <div className="helpers-subtitle">
      Внутренние инструменты для схем, столов и блоков
    </div>
  </div>

  <div className="helpers-menu-row helpers-menu-row-desktop">
    {helpers.map((item) => (
      <button
        key={item.id}
        type="button"
        className={
          activeId === item.id ? 'helpers-chip is-active' : 'helpers-chip'
        }
        onClick={() => setActiveId(item.id)}
      >
        {item.title}
      </button>
    ))}
  </div>

  <div className="helpers-menu-row-mobile">
    <select
      className="helpers-select"
      value={activeId}
      onChange={(e) => setActiveId(e.target.value)}
    >
      {helpers.map((item) => (
        <option key={item.id} value={item.id}>
          {item.title}
        </option>
      ))}
    </select>
  </div>
</header>;
