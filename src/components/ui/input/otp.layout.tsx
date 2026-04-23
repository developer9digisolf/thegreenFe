import { Input } from "antd";
import React from "react";

interface IInputOtp {
  hideOtp?: boolean;
  onChange: (event: any) => void;
  length?: number;
  separator?: React.JSX.Element | string;
  disabled?: boolean;
  className?: string;
}

export default function UseInputOtp(props: IInputOtp): React.JSX.Element {
  return (
    <Input.OTP
      autoFocus
      inputMode="numeric"
      mask={props?.hideOtp ? "🔒" : ""}
      onChange={(v) => props?.onChange(v)}
      length={props?.length || 6}
      separator={props?.separator}
      disabled={props?.disabled}
      className={props?.className}
    />
  );
}
