import { SizeType } from "antd/es/config-provider/SizeContext";
import Select, { DefaultOptionType } from "antd/es/select";

export type TOptionItems = Array<DefaultOptionType>;
export interface IAutoCompleteCustom {
  options: TOptionItems;
  placeholder?: string;
  loading: boolean;
  disabled?: boolean;
  onSelect?: (value: string | number | undefined, option: DefaultOptionType) => void;
  /**
   * - tags -> we can entri multiple label/data and can entri new data
   * - multiple -> we can entri multiple label/data from avaliable data on list
   */
  mode?: "tags" | "multiple";
  size?: SizeType;
  showSearch?: boolean;
  className?: string;
  style?: React.CSSProperties;
  defaultValue?: string | number;
  onChange?: (value: string | string[] | number | undefined) => void;
  onSearch?: (value: string) => void;
  filterOption?: (
    input: string,
    option?: DefaultOptionType
  ) => boolean;
  surfixIcon?: "hide";
  allowClear?: boolean;
  value?: any;
  onClear?: () => void;
  selected?: Array<number>;
  removeIcon?: React.JSX.Element | React.FC | string;
}

/**
 * REQUIRED
 * - option -> data in array object "change name or another to view to label"
 * - loading -> boolean
 * OPTIONAL
 * - placeholder -> string
 * - size -> large | middle | small
 */
export function UseSelect(props: IAutoCompleteCustom): React.JSX.Element {
  const selecteds = Array.isArray(props.selected) ? props.selected : [];
  const newOptions = props?.options?.map((item) => {
    return { ...item, disabled: selecteds.indexOf(item?.value as any) !== -1 };
  });

  const filterOption = (
    input: string,
    option?: DefaultOptionType
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <Select
      {...props}
      onSearch={props.onSearch}
      aria-disabled
      mode={props.mode}
      placeholder={props.placeholder ? props.placeholder : "input here"}
      options={newOptions}
      style={{ ...props.style }}
      size={props.size || "middle"}
      className={`${props.className} `}
      showSearch={props.showSearch}
      onSelect={
        typeof props.onSelect === "function" ? props.onSelect : undefined
      }
      loading={props.loading}
      disabled={props.loading || props.disabled}
      filterOption={typeof filterOption === "function" ? filterOption : false}
      suffixIcon={props?.surfixIcon === "hide" ? null : undefined}
      allowClear={props.allowClear}
      onClear={props.onClear}
      removeIcon={props?.removeIcon}
    />
  );
}
