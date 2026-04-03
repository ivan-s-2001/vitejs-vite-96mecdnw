export default function HallHelperPage({ helper, onBack }) {
    const ActiveComponent = helper.Component;
  
    return (
      <div className="hall-page">
        <div className="wrap">
          <div className="workspace-container">
            <div className="hall-tool-topbar">
              <div className="hall-tool-topbar-left">
                <button
                  type="button"
                  className="hall-back-button"
                  onClick={onBack}
                >
                  ← Назад
                </button>
  
                <div className="hall-tool-heading">
                  <div className="hall-tool-title">{helper.title}</div>
                  {helper.description ? (
                    <div className="hall-tool-subtitle">{helper.description}</div>
                  ) : null}
                </div>
              </div>
            </div>
  
            <div className="hall-tool-stage">
              <ActiveComponent />
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