/*****************************************************************
 *  JSX types
 *****************************************************************/

type JsxChildrenObject = {
  trans: {
    text: string;
    options: any;
  };
};

type JsxChildren =
  | JsxElement
  | JsxChildrenObject
  | string
  | number
  | JsxFragment
  | boolean
  | null
  | undefined;

interface JsxElement<
  P = any,
  T extends string | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>,
> {
  type: T;
  props: P;
  key: Key | null;
}

type JSXElementConstructor<P> = (props: P) => JsxElement<any, any> | null;

type JsxFragment = Iterable<JsxChildren>;

/*****************************************************************
 *  Utils types
 *****************************************************************/

declare function variable(name: string): string;

declare function setSubject(name: string | string[]): void;

declare function addInternalStyles(...styles: string[]): void;

/*****************************************************************
 *  Translation types
 *****************************************************************/

declare function trans(key: string): string;
declare function t(key: string): string;

declare function addTrans(TranslationGroup: any): void;

type TranslationGroup = {
  [key: string]: {
    [key: string]: string;
  };
};
