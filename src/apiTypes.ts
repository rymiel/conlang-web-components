export interface ApiUser {
  name: string;
}

export interface ApiBase {
  hash: string;
  created_at: string;
  updated_at: string;
}

export interface ApiWord extends ApiBase {
  sol: string;
  extra: string;
  tag: string | undefined;
  ex: string | undefined;
  meanings: string[];
  sections: string[];
}

export interface ApiMeaning extends ApiBase {
  eng: string;
  sections: string[];
}

export interface ApiSection extends ApiBase {
  title: string;
  content: string;
}

export interface ApiConfig {
  readonly [key: string]: unknown;
}

export interface ApiData {
  words: ApiWord[];
  meanings: ApiMeaning[];
  sections: ApiSection[];
  etag?: string;
  config?: ApiConfig;
}
