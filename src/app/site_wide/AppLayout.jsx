function AppLayout({ children, ...props }) {
  return (
    <div id="app-layout" {...props}>
      {children}
    </div>
  );
}

function AppLayoutHeader({ children, ...props }) {
  return (
    <header id="app-header" {...props}>
      {children}
    </header>
  );
}

function AppLayoutSidebar({ children, ...props }) {
  return (
    <aside id="app-sidebar" {...props}>
      {children}
    </aside>
  );
}

function AppLayoutMain({ children, ...props }) {
  return (
    <aside id="app-main" {...props}>
      {children}
    </aside>
  );
}

function AppLayoutMainPanel({ children, ...props }) {
  return (
    <article id="app-main-panel" {...props}>
      {children}
    </article>
  );
}

function AppLayoutPanelHeader({ children, ...props }) {
  return (
    <header id="panel-header" {...props}>
      {children}
    </header>
  );
}

function AppLayoutPanelMain({ children, ...props }) {
  return (
    <div id="panel-main" {...props}>
      {children}
    </div>
  );
}

export {
  AppLayout,
  AppLayoutHeader,
  AppLayoutSidebar,
  AppLayoutMain,
  AppLayoutMainPanel,
  AppLayoutPanelHeader,
  AppLayoutPanelMain,
};
