import * as React from "react";
import { Header } from "./Header.jsx";
import { Navbar } from "./Navbar.jsx";
import { LangWidget } from "./LangWidget.jsx";
import { TimeWidget } from "./TimeWidget.jsx";

function Sidebar() {
  return (
    <div id="sidebar-root">
      <header id="sidebar-header">
        <Header />
      </header>
      <hr id="sidebar-line" />
      <nav id="sidebar-navbar">
        <Navbar />
      </nav>
      <div id="sidebar-lang-widget">
        <LangWidget />
      </div>
      <div id="sidebar-time-widget">
        <TimeWidget />
      </div>
    </div>
  );
}

export { Sidebar };
