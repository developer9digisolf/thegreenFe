import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Button, Input, InputRef, List } from "antd";
import "./style.css";
import {
  usePhoneInput,
  CountryIso2,
  defaultCountries,
  FlagImage,
} from "react-international-phone";
// import "react-international-phone/style.css";
import { DownOutlined } from "@ant-design/icons";
import UseInput from "../input.layout";
import { Icons } from "@afx/components/common/icons";
import UseDrawer from "@afx/components/drawer/main.layout";

export interface IFloatInputPhone {
  label?: string;
  size?: "middle" | "small" | "large";
  required?: boolean;
  value?: string;
  className?: string;
  style?: CSSProperties;
  prefixIcon?: string | React.JSX.Element | React.ReactNode;
  onChange?: (data: any) => void;
  onEnter?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDialcode?: (dialcode: string) => void;
  addonAfter?: React.ReactNode;
  suffix?: React.ReactNode;
  drawerStyleProps?: CSSProperties; // Custom drawer styles
  countryCodeClassName?: string; // Custom country code class
}

export default function UseFloatInputPhone(
  props: IFloatInputPhone & { [P: string]: any },
) {
  const [focus, setFocus] = useState(false);
  const [text, setText] = useState("");
  const [dialcode, setDialcode] = useState<string>();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [countries, setCountries] = useState(defaultCountries);

  let { label, value, placeholder, type, required } = props;

  if (!placeholder) placeholder = label;

  useEffect(() => {
    props.onChangeDialcode?.(dialcode as string);
  }, [dialcode]);

  useEffect(() => {
    setText(value as any);
  }, [value]);

  const isOccupied = focus || (text && text.length !== 0);

  const labelClass = isOccupied ? "label as-label" : "label as-placeholder";

  const requiredMark = required ? <span className="text-danger">*</span> : null;

  const phoneInput = usePhoneInput({
    defaultCountry: "id",
    value: props.value,
    onChange: (data) => {
      if (props.onChange) {
        setDialcode(data.country.dialCode);
        props.onChange(data.phone);
      }
    },
  });

  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (phoneInput.inputRef && inputRef.current?.input) {
      phoneInput.inputRef.current = inputRef.current.input;
    }
  }, [inputRef, phoneInput.inputRef]);

  const transformedCountries = countries.map((country) => ({
    name: country[0],
    iso2: country[1],
    dialCode: country[2],
  }));

  // Filter countries based on search term
  const filteredCountries = transformedCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Handle search input change
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Fetch next set of countries
  // const fetchMoreData = () => {
  //   const newPage = page + 1
  //   const newCountries = defaultCountries.slice(
  //     newPage * 20,
  //     (newPage + 1) * 20
  //   )
  //   setTimeout(() => {
  //     setCountries(prevCountries => [...prevCountries, ...newCountries])
  //     setPage(newPage)
  //   }, 2000)
  // }

  return (
    <div
      className=" float-label w-full"
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
    >
      <Input
        style={props.style}
        className={`float-input ${props.className || ""}`}
        size={props.size}
        autoComplete="off"
        autoCorrect="off"
        autoFocus
        // type="number"
        suffix={props.suffix}
        styles={{
          input: {
            paddingLeft: typeof props.prefixIcon === "string" ? 34 : 12,
          },
        }}
        value={text}
        onPressEnter={props.onEnter as any}
        onChange={(v) => {
          setText(v.target.value as any);
          return typeof props.onChange === "function" ?
              props.onChange(v)
            : null;
        }}
        maxLength={16}
        prefix={
          <>
            <Button
              size="small"
              className="mt-1 h-6 bg-button-country border-none !rounded-md"
              onClick={() => setDrawerVisible(true)}
            >
              <div className="flex justify-center items-center gap-2">
                {phoneInput.country && (
                  <>
                    <FlagImage iso2={phoneInput.country.iso2} />
                    <span>{phoneInput.country.iso2.toUpperCase()}</span>
                    <DownOutlined className="text-[8px] pr-1" />
                  </>
                )}
              </div>
            </Button>
            <UseDrawer
              placement="bottom"
              height={"max(80dvh)"}
              copyright={false}
              className="rounded-t-3xl"
              title={
                <div>
                  <p>Search Country Code</p>
                </div>
              }
              onClose={() => setDrawerVisible(false)}
              open={drawerVisible}
              style={props.drawerStyleProps}
              content={
                <div>
                  <UseInput
                    standart={false}
                    placeholder="Search country name or country code"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={searchTerm}
                  />
                  {/* <div className="custom-drawer">
                  </div> */}

                  <List
                    dataSource={filteredCountries}
                    renderItem={(item) => (
                      <List.Item
                        key={item.iso2}
                        onClick={() => {
                          phoneInput.setCountry(item.iso2 as CountryIso2);
                          setDrawerVisible(false);
                        }}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex justify-start items-center gap-2">
                            <FlagImage iso2={item.iso2} />
                            <p>{item.name}</p>
                          </div>
                          <div className="flex justify-end items-center">
                            <p>+{item.dialCode}</p>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              }
            />
          </>
        }
      />
      <label className="label">
        <span>
          {typeof props.prefixIcon === "string" && (
            <Icons type={props.prefixIcon} size={14} />
          )}
        </span>
      </label>
      <label
        className={`${labelClass} text-float !z-10`}
        style={
          {
            "--lfloat": typeof props.prefixIcon === "string" ? "34px" : "12px",
          } as any
        }
      >
        <span className="text-float">
          {isOccupied ? label : placeholder} {requiredMark}
        </span>
      </label>
    </div>
  );
}
