const destructPayload = (payload: any = {}, dataAttr: Array<any> = []) => {
  // const objDataAttr = Object.getOwnPropertyNames(dataAttr)
  const results = {}
  for (const x in dataAttr) {
    if (Array.isArray(dataAttr[x])) {
      const initial: string = (dataAttr[x][0] || null) as string
      const replacer: string = (dataAttr[x][1] || null) as string

        ; (results as any)[replacer] = payload[initial]
    } else {
      ; (results as any)[dataAttr[x] as string] = payload[dataAttr[x]]
    }
  }

  return results
}

export function buildTreeData<T = any>(
  data: Array<T>,
  identifier: keyof T,
  matcher: keyof T,
  attributes: Array<keyof T | [keyof T, string]>
) {
  let newData = []

  const insertChildren = (
    tmpData: any,
    objItems: any,
    identity: any,
    match: any
  ) => {
    const newTmpData = [...tmpData]
    for (const k in tmpData) {
      let found = false
      let items = tmpData[k]
      if (objItems[identity] === items[match]) {
        items.children = [...(items.children || []), objItems]
        found = true
      } else {
        if (Array.isArray(items.children)) {
          items = insertChildren(items.children, objItems, identity, match)
        }
      }

      if (found) {
        newTmpData[k as any] = items
        break
      }
    }

    return newTmpData
  }

  for (const x in data) {
    const items = destructPayload(data[x], attributes)

    if (!(items as any)[identifier as string]) {
      newData.push(items)
    } else {
      newData = insertChildren(newData, items, identifier, matcher)
    }
  }

  return newData
}