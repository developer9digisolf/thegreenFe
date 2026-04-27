import { message, notification, Modal, App } from "antd";
import type { MessageInstance } from "antd/es/message/interface";
import type { NotificationInstance } from "antd/es/notification/interface";
import type { ModalStaticFunctions } from "antd/es/modal/confirm";

let messageInstance: MessageInstance = message;
let notificationInstance: NotificationInstance = notification;
let modalInstance: ModalStaticFunctions = Modal;

/**
 * Component to capture Ant Design instances from the App component
 * to make them available globally while staying within the context.
 */
export function AntdGlobalConfig() {
  const {
    message: msg,
    notification: noti,
    modal: mdl,
  } = App.useApp();

  messageInstance = msg;
  notificationInstance = noti;
  modalInstance = mdl;

  return null;
}

export {
  messageInstance as message,
  notificationInstance as notification,
  modalInstance as modal,
};
