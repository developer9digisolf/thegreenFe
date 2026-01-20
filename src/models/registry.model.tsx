'use client'
import { registerModels } from './main.provider'
import { useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { IModelDefinitions } from '@afx/interfaces/global.iface'

let globalPath: string | null = null
let indexModelSubscriptions: Array<string> = []

export function useModel<T = any>(
  Components: (props: any) => JSX.Element,
  models: () => Array<IModelDefinitions<any, any>>
): React.FunctionComponent<T> {
  return props => {
    const pathname = usePathname()

    useMemo(() => {
      if (globalPath !== pathname) {
        globalPath = pathname
        indexModelSubscriptions = []
      }

      registerModels(models, (model, subscriptions) => {
        if (
          typeof subscriptions === 'function' &&
          indexModelSubscriptions.indexOf(model) === -1
        ) {
          indexModelSubscriptions.push(model)
          return subscriptions({ pathname })
        }
      })
    }, [pathname])

    return <Components {...props} />
  }
}