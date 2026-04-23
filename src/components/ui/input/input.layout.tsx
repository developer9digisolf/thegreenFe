import { Flex, Input, Tooltip } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";
import React from "react";
import "./style.scss";

interface IInput {
  prefix?: React.JSX.Element | React.FC | any;
  suffix?: React.JSX.Element | React.FC;
  addonBefore?: React.JSX.Element | React.FC | any;
  placeholder?: string;
  disabled?: boolean;
  standart?: boolean;
  size?: SizeType;
  maxLength?: number;
  onPressEnter?: (value: any) => void;
  onChange?: (event: any) => void;
  type?: any;
  className?: string;
  defaultValue?: any;
  value?: any;
  allowClear?: boolean;
  exclamation?: string | React.ReactNode;
  variants?: "borderless" | "filled" | "outlined";
  readonly?: boolean;
  onBlur?: (v: any) => void;
}

/**
 *
 * - prefix -> icon in left of textfield
 * - suffix -> icon in right of textfield
 * - onPressEnter -> when enter keyboard pressed
 *
 */

export default function UseInput(props: IInput): React.JSX.Element {
  const { standart, ...others } = props;

  const standartLayouts = {
    className: `${
      props?.disabled ? "custom-disabled-input" : ""
    }' form-input !bg-[#FAFAFA] gap-x-1.5 hover:!bg-[#FAFAFA]' ${
      props.className
    }`,
    style: { fontSize: "17px" },
  };

  return (
    <div className="w-full h-fit relative">
      {props.exclamation && (
        <Tooltip title={props.exclamation}>
          <Flex
            justify="center"
            align="center"
            className="w-[16px] h-[16px] text-yellow-600 bg-yellow-600 bg-opacity-10 absolute p-[6px] rounded-full border-stone-300 border-[0.5px] -top-1.5 -right-1 z-[100]"
          >
            <p className="font-semibold text-[11px]">!</p>
          </Flex>
        </Tooltip>
      )}
      <Input
        {...others}
        {...(typeof standart !== "boolean" || standart ? standartLayouts : {})}
        disabled={props.disabled}
        addonBefore={props.addonBefore as any}
        prefix={props.prefix as any}
        size={props?.size || "large"}
        variant={props.variants}
        placeholder={props.placeholder}
        onPressEnter={(v: any) => props.onPressEnter?.(v.target.value)}
        type={props.type}
        suffix={props.suffix as any}
        allowClear={props.allowClear}
        readOnly={props.readonly}
      />
    </div>
  );
}
