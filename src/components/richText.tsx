import { Literal, PhrasingContent, type Root as RemarkRoot } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { Handlers } from "mdast-util-to-hast";
import Markdown, { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { type Plugin } from "unified";

import { useDictionary } from "../providers/data";

interface Missing extends Literal {
  type: "missing";
}

declare module "mdast" {
  interface RootContentMap {
    missing: Missing;
  }
  interface PhrasingContentMap {
    missing: Missing;
  }
}

const WORD_LINK = /\[([A-Za-z0-9_-]+)(?:\(([^)]+)\))?\]/g;

const remarkPlugin: Plugin<[{ on: string }], RemarkRoot> = function ({ on }) {
  const { entries } = useDictionary();

  return function (tree) {
    findAndReplace(tree, [
      WORD_LINK,
      (m: string, id: string, label: string | undefined) => {
        const entry = entries?.find((i) => i.hash === id);
        if (entry === undefined) {
          return { type: "missing", value: m };
        }

        const linkText: PhrasingContent[] = [
          { type: "emphasis", children: [{ type: "text", value: label ?? entry.sol }] },
        ];

        if (id === on) {
          return { type: "strong", children: linkText };
        }

        return { type: "link", url: entry.link, children: linkText };
      },
    ]);
  };
};

const toHastHandlers: Handlers = {
  missing(_state, node: Missing) {
    return {
      type: "element",
      tagName: "a",
      properties: {
        className: ["missing"],
      },
      children: [
        {
          type: "text",
          value: node.value,
        },
      ],
    };
  },
};

const components: Components = {
  a: function aComponentHandler(props) {
    const { node, href, ...rest } = props;
    return href ? <Link {...rest} to={href} /> : <a href={href} {...rest} />;
  },
};

export function RichText({ text, on }: { text: string; on?: string }) {
  return <Markdown
    children={text}
    remarkPlugins={[[remarkPlugin, { on }]]}
    remarkRehypeOptions={{ handlers: toHastHandlers }}
    components={components}
  />;
}
