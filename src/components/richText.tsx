import { Icon } from "@blueprintjs/core";
import { Literal, PhrasingContent, RootContent, type Root as RemarkRoot } from "mdast";
import { findAndReplace } from "mdast-util-find-and-replace";
import { Handlers } from "mdast-util-to-hast";
import Markdown, { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { type Plugin } from "unified";

import { useData } from "../site/context";
import { FullEntry } from "../site/types";

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
const ESCAPED_BRACKET = "\uE000";

function restoreEscapes(node: RemarkRoot | RootContent) {
  if ("value" in node) {
    const literal = node.type === "inlineCode" || node.type === "code" || node.type === "html";
    node.value = node.value.replaceAll(ESCAPED_BRACKET, literal ? "\\[" : "[");
  }
  if ("url" in node) node.url = node.url.replaceAll(ESCAPED_BRACKET, "[");
  if ("title" in node && node.title) node.title = node.title.replaceAll(ESCAPED_BRACKET, "[");
  if ("alt" in node && node.alt) node.alt = node.alt.replaceAll(ESCAPED_BRACKET, "[");
  if ("children" in node) node.children.forEach(restoreEscapes);
}

interface RemarkPluginOptions {
  on?: string;
  entries: readonly FullEntry[];
}

const remarkPlugin: Plugin<[RemarkPluginOptions], RemarkRoot> = function ({ on, entries }) {
  return function (tree) {
    findAndReplace(tree, [
      WORD_LINK,
      (m: string, id: string, label: string | undefined) => {
        const entry = entries.find((i) => i.hash === id);
        if (entry === undefined) {
          return { type: "missing", value: m };
        }

        const linkText: PhrasingContent[] = [
          { type: "emphasis", children: [{ type: "text", value: label ?? entry.disp }] },
        ];

        if (id === on) {
          return { type: "strong", children: linkText };
        }

        return { type: "link", url: entry.link, children: linkText };
      },
    ]);
    restoreEscapes(tree);
  };
};

const toHastHandlers: Handlers = {
  missing(_state, node: Missing) {
    return {
      type: "element",
      tagName: "a",
      properties: {
        className: ["missing-link"],
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
    const { node, href, children, ...rest } = props;
    if (href) {
      const url = new URL(href, document.location.href);
      if (url.host !== document.location.host) {
        return <a {...rest} href={href} rel="external nofollow noreferrer" target="_blank">
          {children}
          <Icon icon="share" size={18} />
        </a>;
      }
      return <Link {...rest} to={href}>
        {children}
      </Link>;
    }
    return <a {...rest} href={href}>
      {children}
    </a>;
  },
};

export function RichText({ text, on }: { text: string; on?: string }) {
  const { entries } = useData();
  return <Markdown
    remarkPlugins={[[remarkPlugin, { on, entries }]]}
    remarkRehypeOptions={{ handlers: toHastHandlers }}
    components={components}
  >
    {text.replaceAll("\\[", ESCAPED_BRACKET)}
  </Markdown>;
}
