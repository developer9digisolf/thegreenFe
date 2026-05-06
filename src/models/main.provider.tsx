import { IModelDefinitions } from '@afx/interfaces/global.iface'
import { UseBoundStore, create } from 'zustand'

const boundStore: { [modelName: string]: UseBoundStore<any> } = {}

interface IRegisterModelOptions {
  key?: string
  replace?: boolean
}

function getStates(modelName: string, callbackState: (state: any) => any): any {
  const currentState =
    typeof boundStore[modelName] === 'function'
      ? boundStore[modelName].getState()?.state
      : {}
  return callbackState(currentState)
}

function useActions(
  modelName: string
): (
  action: string,
  execute: any[],
  useLoading?: boolean
) => Promise<void> | void {
  const { actions }: any =
    typeof boundStore[modelName] === 'function'
      ? boundStore[modelName].getState()
      : {}

  return async (
    action: string,
    execute: any[] = [],
    useLoading: boolean = false
  ) => {
    const loadingKey: string = `${modelName}/${action}`

    // Loading before action execution
    if (useLoading) {
      const { loadings = [] }: { loadings: string[] } =
        boundStore[modelName].getState()
      await boundStore[modelName].setState({
        loadings: [...loadings, loadingKey]
      })
    }

    // Execute action
    await actions[action](...execute)

    // Loading after action execution
    if (useLoading) {
      const { loadings }: { loadings: string[] } =
        boundStore[modelName].getState()
      const index = loadings.indexOf(loadingKey)
      if (index !== -1) {
        loadings.splice(index, 1)
        await boundStore[modelName].setState({ loadings })
      }
    }
  }
}

export function registerModels<
  STATE,
  ACTION extends Record<string, (...args: any[]) => any>
>(
  models: () => IModelDefinitions<STATE, ACTION>[],
  listener: (model: string, subscriptions: any) => void,
  options?: IRegisterModelOptions
): void {
  const modelDefinitions = models()

  for (const modelDefinition of modelDefinitions) {
    const { name, model, subscriptions } = modelDefinition

    if (!boundStore[name]) {
      boundStore[name] = create((set: any) =>
        model(
          partial =>
            set((currentState: any) => ({
              state: { ...currentState.state, ...partial }
            })),
          getStates,
          useActions as any
        )
      )
    }

    if (typeof subscriptions === 'function' && typeof window !== 'undefined') {
      listener(name, subscriptions(getStates, useActions as any))
    }
  }
}

export function useStore<
  State,
  Action extends { [P: string]: (...args: any) => any }
>(
  model: string
): {
  state: State
  isLoading: (act: keyof Action) => boolean
  useActions: <T extends string = '???'>(
    act: keyof Action,
    execute: Parameters<Action[T]> | [],
    useLoading?: boolean
  ) => void
} {
  try {
    let store: any = boundStore[model]
    store = store((state: any) => state)
    // if (!store) throw new Error()
    return {
      state: store.state,
      isLoading(act: keyof Action) {
        const { loadings }: { loadings: Array<string> } = store
        return (loadings || []).indexOf(`${model}/${act as string}`) !== -1
      },
      async useActions<T extends string = '???'>(
        act: keyof Action,
        executes: Parameters<Action[T]> | [],
        useLoading: boolean = false
      ) {
        useActions(model)(act as string, executes, useLoading)
      }
    }
  } catch (er: any) {
    // notification.error({
    //   key: 'MODEL-NF',
    //   message: 'FAILER TO LOAD MODELS',
    //   description: er.message
    // })
    return { state: {}, isLoading: () => false, useActions: () => {} } as any
  }
}