import {
  BlueprintProvider,
  Classes,
  Divider,
  Drawer,
  DrawerSize,
  H1,
  H2,
  Icon,
  NonIdealState,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import { PropsWithChildren, StrictMode, Suspense, useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useMatches,
  useNavigate,
} from "react-router-dom";

import UserOnly from "../components/UserOnly";
import ErrorPage from "../pages/ErrorPage";
import { DataProvider } from "../providers/data";
import { Login, Logout, User, UserProvider } from "../providers/user";
import { SiteContext, useSite } from "./context";
import { SHARED_ROUTES } from "./routes";
import { showError } from "./toast";
import { RouteHandle, Site } from "./types";

export interface SiteVersions {
  readonly webVersion: string;
  readonly cwcVersion: string;
}

function Menu() {
  const { menuLinks, privateMenuLinks } = useSite();
  const [isOpen, setOpen] = useState(false);

  return <>
    <Icon className="header-menu" icon="menu" size={36} onClick={() => setOpen(true)} />
    <Drawer isOpen={isOpen} onClose={() => setOpen(false)} position="left" size={DrawerSize.SMALL}>
      <nav>
        <ul>
          {menuLinks.map(([slug, name]) => <li key={slug}>
            <Link to={slug} onClick={() => setOpen(false)}>
              {name}
            </Link>
          </li>)}
        </ul>
        <UserOnly>
          <Divider />
          <ul>
            {privateMenuLinks.map(([slug, name]) => <li key={slug}>
              <Link to={slug} onClick={() => setOpen(false)}>
                {name}
              </Link>
            </li>)}
          </ul>
        </UserOnly>
      </nav>
    </Drawer>
  </>;
}

function usePageTitle(): string | undefined {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined;
    if (handle?.title !== undefined) {
      return typeof handle.title === "string" ? handle.title : handle.title(matches[i].params);
    }
  }
  return undefined;
}

function App({ children, versions }: PropsWithChildren<{ versions: SiteVersions }>) {
  const { language, api } = useSite();
  const [version, setVersion] = useState<string | null>(null);
  const user = useContext(User);
  const navigate = useNavigate();
  const pageTitle = usePageTitle();
  const title = children ? undefined : pageTitle;

  useEffect(() => {
    api.version().then(setVersion).catch(showError);
  }, [api]);

  // Migrate old paths
  useEffect(() => {
    if (
      document.location.pathname === "/" &&
      document.location.hash.startsWith("#/") &&
      document.location.search === ""
    ) {
      const path = document.location.hash.slice(1);
      history.replaceState(null, "", path);
      navigate(path);
    }
  }, [navigate]);

  return <>
    <title>{title ? `${language} | ${title}` : language}</title>
    <ScrollRestoration getKey={(location) => (location.pathname === "/" ? location.pathname : location.key)} />
    <header className={Classes.DARK}>
      <Menu />
      <H1 className="small-caps">
        <Link to="/">{language}</Link>
      </H1>
      {title && <>
        <Divider></Divider>
        <H2 className="small-caps">{title}</H2>
      </>}
      <div className="header-user">{user.user ? <Logout /> : <Login />}</div>
    </header>
    <main id="main">
      <Suspense fallback={<NonIdealState icon={<Spinner size={SpinnerSize.LARGE} />} />}>
        {children ?? <Outlet />}
      </Suspense>
    </main>
    <footer className={Classes.DARK}>
      <small>
        <p>
          <span className="small-caps">{language}</span> by rymiel, web version {versions.webVersion}, cwc version{" "}
          {versions.cwcVersion}
          {version && `, api version ${version}`}
        </p>
      </small>
    </footer>
  </>;
}

export function renderSite(site: Site, versions: SiteVersions) {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App versions={versions} />,
      errorElement: <App versions={versions}>
        <ErrorPage />
      </App>,
      children: [...SHARED_ROUTES, ...site.routes],
    },
  ]);

  const root = document.getElementById("root")!;
  if (document.location.hostname === "localhost" || document.location.hostname.startsWith("192.168.")) {
    root.classList.add("localhost");
  }

  createRoot(root).render(
    <StrictMode>
      <BlueprintProvider>
        <SiteContext value={site}>
          <UserProvider>
            <DataProvider>
              <RouterProvider router={router} />
            </DataProvider>
          </UserProvider>
        </SiteContext>
      </BlueprintProvider>
    </StrictMode>,
  );
}
