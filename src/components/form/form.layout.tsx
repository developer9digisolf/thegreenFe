import { Form, FormInstance, FormItemProps, FormProps } from "antd";
import { useEffect, useMemo } from "react";

export type TUseFormInstance<V extends { [P: string]: any } = any> =
  FormInstance<V>;

export function UseUseForm<
  T extends { [P: string]: any },
>(): TUseFormInstance<T> {
  return Form.useForm<T>()[0];
}

/**
 *
 * @param forms inject form into the watcher
 * @param deps passing the dependency
 * @param defaults used for default value (if the initial value is unkown)
 * @returns [Current Value: any, updater: Fn]
 */
export function UseFormWatcher<RT extends any>(
  forms: TUseFormInstance,
  deps: string,
  defaults?: RT,
): [value: RT, setter: (value: RT) => void] {
  const currentVal = Form.useWatch(deps, forms) || defaults;
  return [currentVal, (val) => forms?.setFieldValue(deps, val)];
}

export function UseForm(props: FormProps) {
  const { initialValues, ...others } = props;
  const payloads: Array<any> = [];

  for (const a in initialValues) {
    const items = initialValues[a];
    if (Array.isArray(items)) {
      payloads.concat(items);
      continue;
    } else if (typeof items === "object") {
      payloads.push(`${a}::${JSON.stringify(items || {})}`);
      continue;
    }

    payloads.push(`${a}::${items}`);
  }

  useEffect(() => {
    if (payloads.length > 0) props?.form?.setFieldsValue(initialValues);
  }, [payloads]);

  return (
    <Form {...others} component={false}>
      {props?.children as any}
    </Form>
  );
}

export function UseFormItem(props: FormItemProps) {
  return (
    <Form.Item
      {...props}
      style={{ padding: "6px 0px", margin: 0 }}
      label={
        props.label ? (
          <span
            className="font-display font-AndikaReg"
            style={{ fontSize: 13 }}
          >
            {props.label}
          </span>
        ) : null
      }
      className="text-xs"
    >
      {props.children as any}
    </Form.Item>
  );
}

export const standartItemLayout: Pick<
  FormProps,
  "labelCol" | "wrapperCol" | "labelAlign" | "labelWrap"
> = {
  labelCol: { xl: 4, lg: 5, md: 6, xs: 7, sm: 7 },
  wrapperCol: { xl: 10, lg: 12, md: 14, xs: 17, sm: 17 },
};

export const splitBrowseItemLayout: Pick<
  FormProps,
  "labelCol" | "wrapperCol" | "labelAlign" | "labelWrap"
> = {
  labelCol: { xl: 7, lg: 8, md: 6, xs: 7, sm: 7 },
  wrapperCol: { xl: 17, lg: 16, md: 18, xs: 17, sm: 17 },
};
