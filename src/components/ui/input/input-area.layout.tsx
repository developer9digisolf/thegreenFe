import { Input } from "antd";

import "./style.scss";
import { SizeType } from "antd/es/config-provider/SizeContext";

interface IInput {
  prefix?: React.JSX.Element | React.FC;
  placeholder?: string;
  disabled?: boolean;
  standart?: boolean;
  maxLength?: number;
  rows?: number;
  showCount?: boolean;
  size?: SizeType;
  className?: string;
  onChange?: (value: any) => void;
}

/**
 *
 * - prefix -> icon in left of textfield
 * - onPressEnter -> when enter keyboard pressed
 *
 */

const { TextArea } = Input;

export default function UseInputArea(props: IInput): React.JSX.Element {
  const { standart, ...others } = props;

  const standartLayouts = {
    className:
      "form-input text-white bg-white/20 placeholder:text-white max-w-xs ml-3 gap-x-1.5 ",
    style: { border: "1px solid #fefefe" },
  };

  return (
    <TextArea
      {...others}
      {...(typeof standart !== "boolean" || standart ? standartLayouts : {})}
      rows={props.rows || 2}
      disabled={props.disabled}
      prefix={props.prefix as any}
      size="large"
      placeholder={props.placeholder}
      onChange={props.onChange}
    />
  );
}
