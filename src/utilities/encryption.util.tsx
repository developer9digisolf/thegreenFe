import { notification } from 'antd'
import * as crypto from 'crypto'
import * as cryptoJS from 'crypto-js'

const prefixKey = process.env.ENCRYPTION_PREF_KEY

interface IEncryptors {
  encrypted: string
  key: string
}

/**
 * @param key string key (Length of key must in 12)
 * @param text text to encrypted
 */
export function shortEncrypt(key: string, text: string): IEncryptors {
  try {
    return {
      encrypted: cryptoJS.Rabbit.encrypt(text, key + prefixKey).toString(),
      key
    }
  } catch (er: any) {
    notification.error({
      message: 'Encrypted Error',
      description: er.message,
      key: 'ENC-VAL'
    })
    return {} as any
  }
}

export function shortDecrypt(data: IEncryptors): string {
  try {
    return cryptoJS.Rabbit.decrypt(
      data.encrypted,
      data.key + prefixKey
    ).toString(cryptoJS.enc.Utf8)
  } catch (er: any) {
    notification.error({
      message: 'Decrypted Error',
      description: er.message,
      key: 'DEC-VAL'
    })
    return {} as any
  }
}

export function genRandomString(length: number) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}