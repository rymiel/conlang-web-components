import { RouteObject } from "react-router-dom";

import UserOnly from "../components/UserOnly";
import ConfigPage from "../pages/ConfigPage";
import DictionaryPage from "../pages/DictionaryPage";
import DocsPage from "../pages/DocsPage";
import EditWordPage from "../pages/EditWordPage";
import GeneratePage from "../pages/GeneratePage";
import IdPage from "../pages/IdPage";
import NewWordPage from "../pages/NewWordPage";
import ReversePage from "../pages/ReversePage";
import SoundChangePage from "../pages/SoundChangePage";
import StatsPage from "../pages/StatsPage";
import TranslationsPage from "../pages/TranslationsPage";
import ValidationPage from "../pages/ValidationPage";
import WordPage from "../pages/WordPage";
import { RouteHandle } from "./types";

export const SHARED_ROUTES: readonly RouteObject[] = [
  {
    path: "/",
    handle: { title: "Home" } satisfies RouteHandle,
    element: <DictionaryPage />,
  },
  {
    path: "/w/:word",
    handle: { title: ({ word }) => word } satisfies RouteHandle,
    element: <WordPage />,
  },
  {
    path: "/w/:word/:num",
    handle: { title: ({ word }) => word } satisfies RouteHandle,
    element: <WordPage />,
  },
  {
    path: "/id/:hash",
    element: <IdPage />,
  },
  {
    path: "/edit/:hash",
    handle: { title: "Edit" } satisfies RouteHandle,
    element: <UserOnly error>
      <EditWordPage />
    </UserOnly>,
  },
  {
    path: "/edit/:hash/:edit",
    handle: { title: "Edit" } satisfies RouteHandle,
    element: <UserOnly error>
      <EditWordPage />
    </UserOnly>,
  },
  {
    path: "/new",
    handle: { title: "New" } satisfies RouteHandle,
    element: <UserOnly error>
      <NewWordPage />
    </UserOnly>,
  },
  {
    path: "/reverse",
    handle: { title: "Reverse" } satisfies RouteHandle,
    element: <ReversePage />,
  },
  {
    path: "/reverse/:query",
    handle: { title: "Reverse" } satisfies RouteHandle,
    element: <ReversePage />,
  },
  {
    path: "/translations",
    handle: { title: "Translations" } satisfies RouteHandle,
    element: <TranslationsPage />,
  },
  {
    path: "/translations/:query",
    handle: { title: "Translations" } satisfies RouteHandle,
    element: <TranslationsPage />,
  },
  {
    path: "/docs",
    handle: { title: "Docs" } satisfies RouteHandle,
    element: <DocsPage />,
  },
  {
    path: "/stats",
    handle: { title: "Stats" } satisfies RouteHandle,
    element: <StatsPage />,
  },
  {
    path: "/validate",
    handle: { title: "Validate" } satisfies RouteHandle,
    element: <UserOnly error>
      <ValidationPage />
    </UserOnly>,
  },
  {
    path: "/sound_changes",
    handle: { title: "Sound changes" } satisfies RouteHandle,
    element: <UserOnly error>
      <SoundChangePage />
    </UserOnly>,
  },
  {
    path: "/generate",
    handle: { title: "Generate" } satisfies RouteHandle,
    element: <UserOnly error>
      <GeneratePage />
    </UserOnly>,
  },
  {
    path: "/config",
    handle: { title: "Config" } satisfies RouteHandle,
    element: <UserOnly error>
      <ConfigPage />
    </UserOnly>,
  },
];
