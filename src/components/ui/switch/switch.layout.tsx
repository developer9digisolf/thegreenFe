import { ModalConfirm } from "@afx/components/modal/modal-confirm.layout";
import { Switch } from "antd";

import { useState } from "react";

interface ILynxSwitch {
  loading?: boolean;
  disabled?: boolean;
  checked: boolean;
  handleUpdateStatus: () => void;
  subtitle?: string;
}
export function UseSwitch(props: ILynxSwitch): React.JSX.Element {
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  // () => props?.handleUpdateStatus(record?.is_active, record?.id)

  const handleOnSave = () => {
    try {
      props.handleUpdateStatus();
    } finally {
      setTimeout(() => {
        setOpenConfirm(false);
      }, 0);
    }
  };

  return (
    <>
      <Switch
        disabled={props?.disabled}
        checked={props?.checked}
        // onChange={(e: any) => {
        //   setOpenConfirm(true)
        // }}
        style={{ boxShadow: "0px 6px 8px 3px #0000001A inset" }}
        loading={props?.loading}
        onClick={() => setOpenConfirm(true)}
      />

      <ModalConfirm
        disabled={props?.loading}
        description={
          <div>
            <p>Apakah anda yakin untuk {props?.subtitle}?</p>
          </div>
        }
        onCancel={() => setOpenConfirm(false)}
        onSave={handleOnSave}
        open={openConfirm}
        textSave="Confirm"
      />
    </>
  );
}
