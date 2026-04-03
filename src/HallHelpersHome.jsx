export default function HallHelpersHome({ title, groups, onOpenHelper }) {
    return (
      <div className="hall-page">
        <div className="wrap">
          <div className="container">
            <header className="hall-home-header">
              <h1 className="hall-home-title">{title}</h1>
            </header>
  
            <div className="hall-groups-grid">
              {groups.map((group) => (
                <fieldset key={group.id} className="hall-group">
                  <legend>{group.title}</legend>
  
                  <div className="hall-group-list">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="hall-tool-button"
                        onClick={() => onOpenHelper(item.id)}
                      >
                        <span className="hall-tool-button-title">{item.title}</span>
                        {item.description ? (
                          <span className="hall-tool-button-description">
                            {item.description}
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>
        </div>
  
        <footer className="footer">
          <div className="container hall-footer-inner">
            <p>Помощники по залу</p>
          </div>
        </footer>
      </div>
    );
  }