import { notification } from 'antd'
import { shortDecrypt, shortEncrypt } from './encryption.util'
import { StoragesProperties as StorageKeys } from './consts.util'

interface IUseStorages {
  setItem: (
    key: (typeof StorageKeys)[number],
    dataString: string,
    encrypt?: boolean
  ) => IUseStorages & { data: Array<string> }
  getItem: (
    key: (typeof StorageKeys)[number],
    decrypt?: boolean,
    parse?: boolean
  ) => IUseStorages & { data: Array<string> }
}

export default abstract class UseStorages {
  static dropAll() {
    globalThis?.window?.localStorage?.clear()
    return true
  }
  static dropItem(
    key:
      | (typeof StorageKeys)[number]
      | Array<(typeof StorageKeys)[number]>
  ) {
    const keys: Array<string> = Array.isArray(key) ? key : [key]

    for (const a in keys) {
      globalThis?.window?.localStorage?.removeItem?.(keys[a])
    }
    return true
  }
  static setItem(
    key: (typeof StorageKeys)[number],
    dataString: string,
    encrypt: boolean = false,
    continousData: Array<string> = []
  ): IUseStorages & { data: Array<string> } {
    try {
      let tmpData: string = dataString
      if (encrypt)
        tmpData = shortEncrypt(
          process.env.STORAGE_ENCRYPTION_KEY as string,
          dataString
        ).encrypted

      global?.localStorage?.setItem?.(key, tmpData)

      return {
        data: continousData,
        getItem: (
          key: (typeof StorageKeys)[number],
          decrypt: boolean = false
        ) => (this.getItem as any)(key, decrypt, continousData),
        setItem: (key: (typeof StorageKeys)[number], dataString, encrypt) =>
          (this.setItem as any)(key, dataString, encrypt, continousData)
      }
    } catch (er: any) {
      throw new Error(er.message)
    }
  }

  static getItem(
    key: (typeof StorageKeys)[number],
    decrypt: boolean = false,
    parse: boolean = false,
    continousData: Array<string> = []
  ): IUseStorages & { data: Array<string> } {
    try {
      let tmpData: any | null = global?.localStorage?.getItem?.(key) || null

      if (decrypt && typeof tmpData === 'string')
        tmpData = shortDecrypt({
          key: process.env.STORAGE_ENCRYPTION_KEY as string,
          encrypted: tmpData
        })

      if (parse && typeof tmpData === 'string') tmpData = JSON.parse(tmpData)

      continousData.push(tmpData as any)
      return {
        data: continousData,
        getItem: (key, decrypt, parse = false) =>
          (this.getItem as any)(key, decrypt, parse, continousData),
        setItem: (key, dataString, encrypt) =>
          (this.setItem as any)(key, dataString, encrypt, continousData)
      }
    } catch (er: any) {
      throw new Error(er.message)
    }
  }
}