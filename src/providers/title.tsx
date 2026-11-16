import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

interface TitleData {
  title: string | null;
  setTitle: (s: string | null) => void;
}
export const Title = createContext<TitleData>({
  title: null,
  setTitle: () => {
    throw new Error("No title context provided");
  },
});

export function TitleProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState<string | null>(null);
  return <Title.Provider value={{ title, setTitle }}>{children}</Title.Provider>;
}

export function useTitle(title: string | null) {
  const context = useContext(Title);

  useEffect(() => {
    context.setTitle(title);
  }, [context, title]);
}
