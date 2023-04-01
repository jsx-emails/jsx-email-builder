function HtmlComment(props: Props) {
  // Note: the body of the function is just a placeholder,
  // it will be overridden by the jsx parser
  return null;
}

type Props =
  | {
      comment: string;
    }
  | {
      children: any;
      startComment?: string;
      endComment?: string;
    }
  | {
      children: any;
      condition?: string;
    };

export default HtmlComment;
