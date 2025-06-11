import { Button, Classes, InputGroup, Intent, Popover } from "@blueprintjs/core";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import { ApiUser } from "../apiTypes";
import { useApi, useErrorHandler } from "./api";

interface UserData {
  user: ApiUser | null;
  update: () => Promise<void>;
}

export const User = createContext<UserData>({
  user: null,
  update: () => {
    throw new Error("No user context provided");
  },
});

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const api = useApi();
  const error = useErrorHandler();

  const update = async () => {
    try {
      const u = await api.general<ApiUser | null>("/me");
      setUser(u);

      try {
        localStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        if (err instanceof DOMException) {
          error(new Error(`Failed to sync: ${err.name}: ${err.message}`));
        } else {
          throw err;
        }
      }
    } catch (err) {
      error(err);
    }
  };

  useEffect(() => {
    update();

    const id = setInterval(() => update(), 1_000 * 60 * 10);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handle = (e: StorageEvent) => {
      if (e.key === "user" && e.newValue !== null) {
        const user = JSON.parse(e.newValue) as ApiUser | null;
        console.log("Synced user:", user);
        setUser(user);
      }
    };
    addEventListener("storage", handle);
    return () => removeEventListener("storage", handle);
  }, []);

  return <User.Provider value={{ user, update }}>{children}</User.Provider>;
}

export function Login() {
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const user = useContext(User);
  const api = useApi();

  const login = () => {
    api.general("/login", "POST", { username, secret }).then(() => user.update());
  };

  return <Popover
    interactionKind="click"
    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
    content={
      <form
        onSubmit={(e) => {
          login();
          e.preventDefault();
        }}
      >
        <InputGroup onValueChange={(v) => setUsername(v)} placeholder="Username" />
        <InputGroup onValueChange={(v) => setSecret(v)} placeholder="Password" type="password" />
        <Button fill intent="success" text="Log in" type="submit" />
      </form>
    }
  >
    <a>Not logged in.</a>
  </Popover>;
}

export function Logout() {
  const user = useContext(User);
  const api = useApi();

  const signout = () => {
    api.general("/logout", "POST").then(() => user.update());
  };

  return <Popover
    interactionKind="click"
    popoverClassName={Classes.POPOVER_CONTENT_SIZING}
    content={<Button intent={Intent.DANGER} text="Sign out" onClick={signout} />}
  >
    <a>{user.user?.name}</a>
  </Popover>;
}
