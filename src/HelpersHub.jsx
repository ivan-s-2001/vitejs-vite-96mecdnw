import './site-shell.css';
import './helpers-hub.css';

export default function HelpersHub({
  helpers,
  activeId,
  onOpenHelper,
  onGoHome,
}) {
  const activeHelper =
    helpers.find((item) => item.id === activeId) || helpers[0] || null;

  const ActiveComponent = activeHelper?.Component || null;

  return (
    <div className="site-page">
      <div className="wrap">
        <nav className="site-topbar">
          <div className="container site-topbar-inner">
            <a className="site-brand" href="#home" onClick={onGoHome}>
              Quick Service
            </a>

            <div className="site-topbar-links">
              <a className="site-topbar-link" href="#home" onClick={onGoHome}>
                Главная
              </a>
              <a
                className="site-topbar-link site-topbar-link-active"
                href={`#helper/${activeHelper?.id || ''}`}
              >
                Помощники
              </a>
            </div>
          </div>
        </nav>

        <div className="container">
          <nav aria-label="breadcrumb" className="site-breadcrumb">
            <ol className="site-breadcrumb-list">
              <li className="site-breadcrumb-item">
                <a href="#home" onClick={onGoHome}>
                  Главная
                </a>
              </li>
              <li className="site-breadcrumb-item">
                <a href="#home" onClick={onGoHome}>
                  Помощники
                </a>
              </li>
              <li
                className="site-breadcrumb-item site-breadcrumb-item-current"
                aria-current="page"
              >
                {activeHelper?.title || 'Инструмент'}
              </li>
            </ol>
          </nav>

          <h1 className="site-page-title">{activeHelper?.title || 'Инструмент'}</h1>

          <div className="helpers-layout">
            <aside className="helpers-sidebar site-card">
              <div className="helpers-sidebar-title">Инструменты</div>

              <div className="helpers-sidebar-list">
                {helpers.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      activeId === item.id
                        ? 'helpers-sidebar-button is-active'
                        : 'helpers-sidebar-button'
                    }
                    onClick={() => onOpenHelper(item.id)}
                  >
                    <span className="helpers-sidebar-button-title">
                      {item.title}
                    </span>
                    <span className="helpers-sidebar-button-description">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            <main className="helpers-main">
              {ActiveComponent ? (
                <div className="helpers-tool-surface">
                  <ActiveComponent />
                </div>
              ) : (
                <div className="site-card helpers-empty">Инструмент не найден</div>
              )}
            </main>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container site-footer-inner">
          <p>2011 — 2026 © Quick Service</p>
          <p>
            <a href="#home" onClick={onGoHome}>
              Главная
            </a>{' '}
            | <a href="/contacts">Контакты</a>
          </p>
        </div>
      </footer>
    </div>
  );
}