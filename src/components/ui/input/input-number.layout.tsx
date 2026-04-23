import React from "react";
import { InputNumber } from "antd";
import type { InputNumberProps } from "antd";
import "./style.scss";

interface IInputNumber extends Omit<InputNumberProps, "size" | "variant"> {
  prefix?: React.ReactNode;
  addOnBefore?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  standart?: boolean;
  maxLength?: number;
  onPressEnter?: (value: any) => void;
  onChange?: (value: number | string | null) => void;
  type?: any;
  value?: number | string | null;
  defaultValue?: number;
  className?: string;
  suffix?: React.ReactNode;
  controls?: boolean;
  max?: number;
  min?: number;
}

export default function UseInputNumber(props: IInputNumber): React.JSX.Element {
  const { standart, className, addOnBefore, suffix, prefix, ...others } = props;

  return (
    <InputNumber
      {...others}
      defaultValue={props.defaultValue}
      value={props.value}
      size="large"
      variant="filled"
      prefix={prefix}
      addonBefore={addOnBefore}
      addonAfter={suffix}
      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      parser={(value) => value!.replace(/\$\s?|(\,*)/g, "")}
      onPressEnter={(e: any) => props.onPressEnter?.(e.target.value)}
      disabled={props.disabled}
      placeholder={props.placeholder}
      className={className || ""}
      style={{
        width: "100%",
      }}
      controls={props?.controls ?? true}
      min={props?.min ?? 0}
      max={props?.max}
      maxLength={props?.maxLength ?? 15}
    />
  );
}
