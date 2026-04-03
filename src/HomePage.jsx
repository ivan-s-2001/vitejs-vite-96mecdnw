import './site-shell.css';
import './home-page.css';

function groupHelpers(helpers) {
  return helpers.reduce((acc, helper) => {
    const category = helper.category || 'Инструменты';

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(helper);
    return acc;
  }, {});
}

export default function HomePage({ helpers, onOpenHelper }) {
  const grouped = groupHelpers(helpers);
  const groups = Object.entries(grouped);

  return (
    <div className="site-page">
      <div className="wrap">
        <nav className="site-topbar">
          <div className="container site-topbar-inner">
            <a className="site-brand" href="#home">
              Quick Service
            </a>

            <div className="site-topbar-links">
              <a className="site-topbar-link" href="#home">
                Главная
              </a>
              <a className="site-topbar-link site-topbar-link-active" href="#home">
                Помощники
              </a>
              <a className="site-topbar-link" href="/projects">
                Проекты
              </a>
            </div>
          </div>
        </nav>

        <div className="container">
          <nav aria-label="breadcrumb" className="site-breadcrumb">
            <ol className="site-breadcrumb-list">
              <li className="site-breadcrumb-item">
                <a href="#home">Главная</a>
              </li>
              <li
                className="site-breadcrumb-item site-breadcrumb-item-current"
                aria-current="page"
              >
                Помощники
              </li>
            </ol>
          </nav>

          <h1 className="site-page-title">Помощники</h1>

          <section className="home-hero site-card">
            <div className="home-hero-main">
              <h2 className="home-hero-title">Главная страница внутренних инструментов</h2>
              <p className="home-hero-text">
                Здесь собраны утилиты для схем, столов, блоков и служебных задач.
              </p>

              <div className="home-hero-actions">
                {helpers[0] ? (
                  <button
                    type="button"
                    className="site-btn-primary"
                    onClick={() => onOpenHelper(helpers[0].id)}
                  >
                    Открыть первый инструмент
                  </button>
                ) : null}
              </div>
            </div>

            <div className="home-hero-stats">
              <div className="home-stat">
                <div className="home-stat-value">{helpers.length}</div>
                <div className="home-stat-label">Инструментов</div>
              </div>
              <div className="home-stat">
                <div className="home-stat-value">{groups.length || 1}</div>
                <div className="home-stat-label">Разделов</div>
              </div>
            </div>
          </section>

          <section className="home-groups">
            {groups.length ? (
              groups.map(([groupName, items]) => (
                <fieldset key={groupName} className="home-fieldset">
                  <legend>{groupName}</legend>

                  <div className="home-tool-list">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="home-tool-button site-btn-light"
                        onClick={() => onOpenHelper(item.id)}
                      >
                        <span className="home-tool-title">{item.title}</span>
                        <span className="home-tool-description">
                          {item.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))
            ) : (
              <div className="site-card home-empty">Инструменты пока не найдены</div>
            )}
          </section>
        </div>
      </div>

      <footer className="footer">
        <div className="container site-footer-inner">
          <p>2011 — 2026 © Quick Service</p>
          <p>
            <a href="#home">Главная</a> | <a href="/contacts">Контакты</a>
          </p>
        </div>
      </footer>
    </div>
  );
}