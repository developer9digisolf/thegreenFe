import React, { useState } from "react";
import { Input, Select, Space } from "antd";
import { SizeType } from "antd/es/config-provider/SizeContext";

const { Option } = Select;

interface IPropInputPhoneNumber {
  size?: SizeType;
}

export default function UseInputPhoneNumber(props: IPropInputPhoneNumber) {
  const [phonePrefix, setPhonePrefix] = useState("+62"); // Default Indonesia
  const [phoneNumber, setPhoneNumber] = useState("");

  const onPrefixChange = (value: string) => {
    setPhonePrefix(value);
  };

  const onNumberChange = (e: any) => {
    setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
  };

  const prefixSelector = (
    <Select value={phonePrefix} onChange={onPrefixChange} style={{ width: 90 }}>
      <Option value="+62">🇮🇩 +62</Option>
      <Option value="+1">🇺🇸 +1</Option>
      <Option value="+44">🇬🇧 +44</Option>
    </Select>
  );

  return (
    <Space.Compact className="w-full">
      {prefixSelector}
      <Input
        value={phoneNumber}
        onChange={onNumberChange}
        style={{ width: "100%" }}
        placeholder="Masukkan nomor telepon Anda"
        maxLength={15}
        size={props?.size || "large"}
      />
    </Space.Compact>
  );
}
