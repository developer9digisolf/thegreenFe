export interface IQueryRequestParams {
  _page?: number
  _pageSize?: number
  q?: string
}

export type TModelFn<
  STATE,
  ACTION extends Record<string, (...args: any[]) => any>
> = (
  set: (partial: Partial<STATE>) => void,
  getStates: <REF_STATE = STATE>(
    modelName: string,
    extractor: (state: REF_STATE) => Partial<REF_STATE> | any
  ) => any,
  useActions: <REF_ACTION extends ACTION>(
    modelName: string
  ) => <T extends keyof REF_ACTION = keyof REF_ACTION>(
    action: T,
    execute: Parameters<REF_ACTION[T]> | [],
    useLoading?: boolean
  ) => Promise<void> | void
) => {
  state: STATE
  actions: ACTION
}

export type TSubscriptionFn<
  STATE,
  ACTION extends Record<string, (...args: any[]) => any>
> = (
  getStates: <REF_STATE = STATE>(
    modelName: string,
    extractor: (state: REF_STATE) => Partial<REF_STATE> | any
  ) => any,
  useActions: <REF_ACTION extends ACTION>(
    modelName: string
  ) => <T extends keyof REF_ACTION = keyof REF_ACTION>(
    action: T,
    execute: Parameters<REF_ACTION[T]> | [],
    useLoading?: boolean
  ) => Promise<void> | void
) => (props: { pathname: string }) => void

export interface IModelDefinitions<
  STATE,
  ACTION extends Record<string, (...args: any[]) => any>
> {
  name: string
  model: TModelFn<STATE, ACTION>
  subscriptions?: TSubscriptionFn<STATE, ACTION>
}

export interface IRegisterModelOptions {
  key?: string
  replace?: boolean
}