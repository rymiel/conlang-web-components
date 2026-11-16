import { RouteObject } from "react-router-dom";

import UserOnly from "../components/UserOnly";
import ConfigPage from "./pages/ConfigPage";
import DictionaryPage from "./pages/DictionaryPage";
import EditWordPage from "./pages/EditWordPage";
import GeneratePage from "./pages/GeneratePage";
import IdPage from "./pages/IdPage";
import NewWordPage from "./pages/NewWordPage";
import ReversePage from "./pages/ReversePage";
import SoundChangePage from "./pages/SoundChangePage";
import StatsPage from "./pages/StatsPage";
import TranslationsPage from "./pages/TranslationsPage";
import ValidationPage from "./pages/ValidationPage";
import WordPage from "./pages/WordPage";

export const SHARED_ROUTES: readonly RouteObject[] = [
  {
    path: "/",
    element: <DictionaryPage />,
  },
  {
    path: "/w/:word",
    element: <WordPage />,
  },
  {
    path: "/w/:word/:num",
    element: <WordPage />,
  },
  {
    path: "/id/:hash",
    element: <IdPage />,
  },
  {
    path: "/edit/:hash",
    element: <UserOnly error>
      <EditWordPage />
    </UserOnly>,
  },
  {
    path: "/edit/:hash/:edit",
    element: <UserOnly error>
      <EditWordPage />
    </UserOnly>,
  },
  {
    path: "/new",
    element: <UserOnly error>
      <NewWordPage />
    </UserOnly>,
  },
  {
    path: "/reverse",
    element: <ReversePage />,
  },
  {
    path: "/reverse/:query",
    element: <ReversePage />,
  },
  {
    path: "/translations",
    element: <TranslationsPage />,
  },
  {
    path: "/translations/:query",
    element: <TranslationsPage />,
  },
  {
    path: "/stats",
    element: <StatsPage />,
  },
  {
    path: "/validate",
    element: <UserOnly error>
      <ValidationPage />
    </UserOnly>,
  },
  {
    path: "/sound_changes",
    element: <UserOnly error>
      <SoundChangePage />
    </UserOnly>,
  },
  {
    path: "/generate",
    element: <UserOnly error>
      <GeneratePage />
    </UserOnly>,
  },
  {
    path: "/config",
    element: <UserOnly error>
      <ConfigPage />
    </UserOnly>,
  },
];
